"use server";

import { revalidatePath } from "next/cache";
import { query, createId } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type ActionState = { error?: string; success?: string };

export async function updateCompanyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const companyName = (formData.get("companyName") as string)?.trim();
  const currency = (formData.get("currency") as string)?.trim() || "USD";
  const taxRate = parseFloat((formData.get("taxRate") as string) || "0");

  if (!companyName) return { error: "Company name is required" };

  try {
    const existing = await query<{ id: string }>(`SELECT id FROM company_settings LIMIT 1`);
    if (existing.rows[0]) {
      await query(
        `UPDATE company_settings SET "companyName" = $1, currency = $2, "taxRate" = $3, "updatedAt" = NOW() WHERE id = $4`,
        [companyName, currency, taxRate, existing.rows[0].id]
      );
    } else {
      await query(
        `INSERT INTO company_settings (id, "companyName", currency, "taxRate", "updatedAt")
         VALUES ($1,$2,$3,$4,NOW())`,
        [createId(), companyName, currency, taxRate]
      );
    }
    revalidatePath("/settings");
    return { success: "Company settings saved" };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save settings" };
  }
}

export async function createWarehouseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const address = (formData.get("address") as string)?.trim() || null;

  if (!name || !code) return { error: "Name and code are required" };

  try {
    await query(
      `INSERT INTO warehouses (id, name, code, address, "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,true,NOW(),NOW())`,
      [createId(), name, code, address]
    );
    revalidatePath("/settings");
    return { success: "Warehouse added" };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add warehouse (code may already exist)" };
  }
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Category name is required" };

  try {
    await query(
      `INSERT INTO categories (id, name, "createdAt", "updatedAt") VALUES ($1,$2,NOW(),NOW())`,
      [createId(), name]
    );
    revalidatePath("/settings");
    revalidatePath("/inventory");
    return { success: "Category added" };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add category (may already exist)" };
  }
}
