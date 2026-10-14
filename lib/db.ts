import { neon } from "@neondatabase/serverless";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Netlify → Site settings → Environment variables."
    );
  }
  return neon(connectionString);
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
) {
  const sql = getSql();
  const result = await (sql as unknown as (
    queryText: string,
    params?: unknown[]
  ) => Promise<T[]>)(text, params);
  const rows = Array.isArray(result) ? result : [];
  return { rows };
}

export function createId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `c${ts}${rand}`;
}

export type Role =
  | "ADMIN"
  | "INVENTORY_MANAGER"
  | "SALES_STAFF"
  | "PURCHASING_OFFICER"
  | "ACCOUNTANT";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  isActive: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  costPrice: string;
  sellingPrice: string;
  reorderLevel: number;
  unit: string;
  isActive: boolean;
  categoryName?: string | null;
  quantity?: number;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reference: string | null;
  reason: string | null;
  createdAt: Date;
  productName?: string;
  userName?: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  productName?: string;
  productSku?: string;
  reorderLevel?: number;
};

