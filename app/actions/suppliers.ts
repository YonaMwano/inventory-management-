"use server";

import { revalidatePath } from "next/cache";
import { query, createId } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type ActionState = { error?: string; success?: string };

export async function createSupplierAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const contactName = (formData.get("contactPerson") as string)?.trim() || null;

  if (!name) return { error: "Supplier name is required" };

  try {
    const id = createId();
    await query(
      `INSERT INTO suppliers (id, name, "contactName", email, phone, address, "leadTimeDays", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 7, true, NOW(), NOW())`,
      [id, name, contactName, email, phone, address]
    );
    revalidatePath("/suppliers");
    revalidatePath("/purchasing");
    return { success: "Supplier added" };
  } catch (e) {
    console.error("createSupplierAction:", e);
    const msg = e instanceof Error ? e.message : "Failed to add supplier";
    return { error: msg };
  }
}
