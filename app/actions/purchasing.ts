"use server";

import { revalidatePath } from "next/cache";
import { query, createId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export type ActionState = { error?: string; success?: string };

export async function createPurchaseOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const supplierId = formData.get("supplierId") as string;
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const unitCost = parseFloat(formData.get("unitCost") as string);

  if (!supplierId) return { error: "Select a supplier" };
  if (!productId) return { error: "Select a product" };
  if (!quantity || quantity < 1) return { error: "Quantity must be at least 1" };
  if (isNaN(unitCost) || unitCost < 0) return { error: "Invalid unit cost" };

  try {
    const wh = await query<{ id: string }>(
      `SELECT id FROM warehouses WHERE "isActive" = true ORDER BY "createdAt" ASC LIMIT 1`
    );
    const warehouseId = wh.rows[0]?.id;
    if (!warehouseId) return { error: "No warehouse found. Seed database first." };

    const total = unitCost * quantity;
    const orderNumber = generateOrderNumber("PO");
    const orderId = createId();
    const itemId = createId();

    await query(
      `INSERT INTO purchase_orders (
        id, "orderNumber", "supplierId", "warehouseId", "orderDate",
        status, subtotal, "taxAmount", "shippingCost", total, "createdById", "createdAt", "updatedAt"
      ) VALUES ($1,$2,$3,$4,NOW(),'ORDERED',$5,0,0,$5,$6,NOW(),NOW())`,
      [orderId, orderNumber, supplierId, warehouseId, total, session.id]
    );

    await query(
      `INSERT INTO purchase_order_items (id, "purchaseOrderId", "productId", quantity, "unitCost", "receivedQty", total)
       VALUES ($1,$2,$3,$4,$5,0,$6)`,
      [itemId, orderId, productId, quantity, unitCost, total]
    );

    revalidatePath("/purchasing");
    return { success: `PO ${orderNumber} created` };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create purchase order" };
  }
}

export async function receivePurchaseOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const orderId = formData.get("orderId") as string;
  if (!orderId) return { error: "Missing order" };

  try {
    const orderRes = await query<{
      id: string;
      orderNumber: string;
      warehouseId: string;
      status: string;
    }>(`SELECT id, "orderNumber", "warehouseId", status FROM purchase_orders WHERE id = $1`, [
      orderId,
    ]);
    const order = orderRes.rows[0];
    if (!order) return { error: "Order not found" };
    if (order.status === "RECEIVED") return { error: "Already received" };

    const items = await query<{
      id: string;
      productId: string;
      quantity: number;
      unitCost: string;
    }>(
      `SELECT id, "productId", quantity, "unitCost" FROM purchase_order_items WHERE "purchaseOrderId" = $1`,
      [orderId]
    );

    for (const item of items.rows) {
      const inv = await query<{ id: string }>(
        `SELECT id FROM inventory_items WHERE "productId" = $1 AND "warehouseId" = $2`,
        [item.productId, order.warehouseId]
      );
      if (inv.rows[0]) {
        await query(
          `UPDATE inventory_items SET quantity = quantity + $1, "updatedAt" = NOW() WHERE id = $2`,
          [item.quantity, inv.rows[0].id]
        );
      } else {
        await query(
          `INSERT INTO inventory_items (id, "productId", "warehouseId", quantity, "updatedAt")
           VALUES ($1,$2,$3,$4,NOW())`,
          [createId(), item.productId, order.warehouseId, item.quantity]
        );
      }

      await query(
        `UPDATE purchase_order_items SET "receivedQty" = quantity WHERE id = $1`,
        [item.id]
      );

      await query(
        `INSERT INTO stock_movements (id, "productId", type, quantity, "toWarehouseId", reference, reason, "userId", "createdAt")
         VALUES ($1,$2,'STOCK_IN',$3,$4,$5,'PO receive',$6,NOW())`,
        [createId(), item.productId, item.quantity, order.warehouseId, order.orderNumber, session.id]
      );
    }

    await query(
      `UPDATE purchase_orders SET status = 'RECEIVED', "receivedDate" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
      [orderId]
    );

    revalidatePath("/purchasing");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/stock-movements");
    return { success: `PO ${order.orderNumber} received — stock updated` };
  } catch (e) {
    console.error(e);
    return { error: "Failed to receive order" };
  }
}
