"use server";

import { revalidatePath } from "next/cache";
import { query, createId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export type SaleState = {
  error?: string;
  success?: string;
};

export async function createSaleAction(
  _prev: SaleState,
  formData: FormData
): Promise<SaleState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const customerName = (formData.get("customerName") as string)?.trim() || "Walk-in";

  if (!productId) return { error: "Select a product" };
  if (!quantity || quantity < 1) return { error: "Quantity must be at least 1" };

  try {
    // Product + price
    const productRes = await query<{
      id: string;
      name: string;
      sellingPrice: string;
      sku: string;
    }>(`SELECT id, name, "sellingPrice", sku FROM products WHERE id = $1 AND "isActive" = true`, [
      productId,
    ]);
    const product = productRes.rows[0];
    if (!product) return { error: "Product not found" };

    // Available stock
    const stockRes = await query<{ id: string; quantity: number; warehouseId: string }>(
      `SELECT id, quantity, "warehouseId" FROM inventory_items WHERE "productId" = $1 ORDER BY quantity DESC LIMIT 1`,
      [productId]
    );
    const stock = stockRes.rows[0];
    if (!stock || stock.quantity < quantity) {
      return { error: `Insufficient stock. Available: ${stock?.quantity ?? 0}` };
    }

    const unitPrice = parseFloat(product.sellingPrice);
    const total = unitPrice * quantity;
    const orderNumber = generateOrderNumber("SO");
    const orderId = createId();
    const itemId = createId();
    const movId = createId();

    // Ensure customer (simple walk-in style)
    let customerId: string | null = null;
    const custRes = await query<{ id: string }>(
      `SELECT id FROM customers WHERE name = $1 LIMIT 1`,
      [customerName]
    );
    if (custRes.rows[0]) {
      customerId = custRes.rows[0].id;
    } else {
      customerId = createId();
      await query(
        `INSERT INTO customers (id, name, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, true, NOW(), NOW())`,
        [customerId, customerName]
      );
    }

    // Sales order
    await query(
      `INSERT INTO sales_orders (
        id, "orderNumber", "customerId", "warehouseId", "orderDate",
        status, "paymentStatus", "fulfillmentStatus",
        subtotal, "taxAmount", "discountAmount", total, "createdById", "createdAt", "updatedAt"
      ) VALUES ($1,$2,$3,$4,NOW(),'CONFIRMED','PAID','FULFILLED',$5,0,0,$5,$6,NOW(),NOW())`,
      [orderId, orderNumber, customerId, stock.warehouseId, total, session.id]
    );

    await query(
      `INSERT INTO sales_order_items (id, "salesOrderId", "productId", quantity, "unitPrice", discount, total)
       VALUES ($1,$2,$3,$4,$5,0,$6)`,
      [itemId, orderId, productId, quantity, unitPrice, total]
    );

    // Reduce stock
    await query(
      `UPDATE inventory_items SET quantity = quantity - $1, "updatedAt" = NOW() WHERE id = $2`,
      [quantity, stock.id]
    );

    // Stock out movement
    await query(
      `INSERT INTO stock_movements (id, "productId", type, quantity, "fromWarehouseId", reference, reason, "userId", "createdAt")
       VALUES ($1,$2,'STOCK_OUT',$3,$4,$5,'Sale',$6,NOW())`,
      [movId, productId, quantity, stock.warehouseId, orderNumber, session.id]
    );

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    revalidatePath("/inventory");
    revalidatePath("/stock-movements");
    return { success: `Sale ${orderNumber} created` };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create sale" };
  }
}
