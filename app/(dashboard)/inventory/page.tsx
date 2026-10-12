import { query } from "@/lib/db";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Package } from "@/components/icons";
import { AddProductForm } from "./add-product-form";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  costPrice: string;
  sellingPrice: string;
  reorderLevel: number;
  quantity: number;
  categoryName: string | null;
};

async function getProducts() {
  const result = await query<ProductRow>(`
    SELECT
      p.id, p.sku, p.name, p."costPrice", p."sellingPrice", p."reorderLevel",
      COALESCE(SUM(ii.quantity), 0)::int as quantity,
      c.name as "categoryName"
    FROM products p
    LEFT JOIN inventory_items ii ON ii."productId" = p.id
    LEFT JOIN categories c ON c.id = p."categoryId"
    WHERE p."isActive" = true
    GROUP BY p.id, c.name
    ORDER BY p."createdAt" DESC
  `);
  return result.rows;
}

export default async function InventoryPage() {
  let products: ProductRow[] = [];
  try {
    products = await getProducts();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Inventory / Products</h2>
          <p className="text-sm text-slate-500">
            Manage products, stock levels and reorder points
          </p>
        </div>
        <AddProductForm />
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No products yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first product to start tracking inventory
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const status = getStockStatus(p.quantity, p.reorderLevel);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">
                        {p.sku}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {p.categoryName || "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">{p.quantity}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatCurrency(Number(p.costPrice))}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatCurrency(Number(p.sellingPrice))}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
