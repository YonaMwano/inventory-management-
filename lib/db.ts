import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

function getPool(): Pool {
  if (globalForDb.pool) return globalForDb.pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Cloudflare Pages → Settings → Environment variables (Production + Preview)."
    );
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });

  globalForDb.pool = pool;
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const result = await getPool().query<T>(text, params);
  return result;
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
