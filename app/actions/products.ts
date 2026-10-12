"use server";

import { revalidatePath } from "next/cache";
import { query, createId } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type ProductState = {
  error?: string;
  success?: string;
};

export async function createProductAction(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const sku = (formData.get("sku") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "10", 10);
  const unit = (formData.get("unit") as string)?.trim() || "pcs";
  const initialQty = parseInt((formData.get("initialQty") as string) || "0", 10);

  if (!sku) return { error: "SKU is required" };
  if (!name) return { error: "Name is required" };
  if (isNaN(costPrice) || costPrice < 0) return { error: "Invalid cost price" };
  if (isNaN(sellingPrice) || sellingPrice < 0) return { error: "Invalid selling price" };

  try {
    const existing = await query(`SELECT id FROM products WHERE sku = $1`, [sku]);
    if (existing.rows.length > 0) return { error: "SKU already exists" };

    let warehouse = await query<{ id: string }>(
      `SELECT id FROM warehouses WHERE code = 'MAIN' LIMIT 1`
    );
    let warehouseId: string;
    if (warehouse.rows.length === 0) {
      warehouseId = createId();
      await query(
        `INSERT INTO warehouses (id, name, code, "isActive", "createdAt", "updatedAt")
         VALUES ($1, 'Main Warehouse', 'MAIN', true, NOW(), NOW())`,
        [warehouseId]
      );
    } else {
      warehouseId = warehouse.rows[0].id;
    }

    const productId = createId();
    await query(
      `INSERT INTO products (id, sku, name, description, unit, "costPrice", "sellingPrice", "reorderLevel", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
      [productId, sku, name, description, unit, costPrice, sellingPrice, reorderLevel]
    );

    const invId = createId();
    await query(
      `INSERT INTO inventory_items (id, "productId", "warehouseId", quantity, "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [invId, productId, warehouseId, initialQty || 0]
    );

    if (initialQty > 0) {
      const movId = createId();
      await query(
        `INSERT INTO stock_movements (id, "productId", type, quantity, "toWarehouseId", reference, reason, "userId", "createdAt")
         VALUES ($1, $2, 'STOCK_IN', $3, $4, $5, 'Initial stock', $6, NOW())`,
        [movId, productId, initialQty, warehouseId, `INIT-${sku}`, session.id]
      );
    }

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/stock-movements");
    return { success: "Product created successfully" };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create product. Check that tables exist in Neon." };
  }
}
