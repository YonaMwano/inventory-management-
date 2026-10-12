import { query } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ShoppingCart } from "@/components/icons";
import { NewSaleForm } from "./new-sale-form";

export const dynamic = "force-dynamic";

type SaleRow = {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  paymentStatus: string;
  orderDate: Date;
  customerName: string | null;
};

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: string;
  quantity: number;
};

async function getSales() {
  const result = await query<SaleRow>(`
    SELECT so.id, so."orderNumber", so.total, so.status, so."paymentStatus", so."orderDate",
           c.name as "customerName"
    FROM sales_orders so
    LEFT JOIN customers c ON c.id = so."customerId"
    ORDER BY so."orderDate" DESC
    LIMIT 50
  `);
  return result.rows;
}

async function getProducts() {
  const result = await query<ProductOption>(`
    SELECT p.id, p.name, p.sku, p."sellingPrice",
           COALESCE(SUM(ii.quantity), 0)::int as quantity
    FROM products p
    LEFT JOIN inventory_items ii ON ii."productId" = p.id
    WHERE p."isActive" = true
    GROUP BY p.id
    HAVING COALESCE(SUM(ii.quantity), 0) > 0
    ORDER BY p.name
  `);
  return result.rows;
}

export default async function SalesPage() {
  let sales: SaleRow[] = [];
  let products: ProductOption[] = [];
  try {
    [sales, products] = await Promise.all([getSales(), getProducts()]);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Sales Orders</h2>
          <p className="text-sm text-slate-500">
            Create sales and automatically reduce stock
          </p>
        </div>
        <NewSaleForm products={products} />
      </div>

      {sales.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No sales orders yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add products with stock first, then create a sale
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                      {s.orderNumber}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {s.customerName || "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {formatDateTime(s.orderDate)}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {formatCurrency(Number(s.total))}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
