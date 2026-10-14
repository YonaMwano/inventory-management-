import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, FileText, AlertTriangle, TrendingUp, Boxes, DollarSign } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getReportData() {
  const [valuation, lowStock, salesSummary, topProducts, movements] = await Promise.all([
    query<{ total_cost: string; total_retail: string; sku_count: string }>(`
      SELECT
        COALESCE(SUM(ii.quantity * p."costPrice"), 0)::text as total_cost,
        COALESCE(SUM(ii.quantity * p."sellingPrice"), 0)::text as total_retail,
        COUNT(DISTINCT p.id)::text as sku_count
      FROM products p
      LEFT JOIN inventory_items ii ON ii."productId" = p.id
      WHERE p."isActive" = true
    `),
    query<{ name: string; sku: string; quantity: number; reorderLevel: number }>(`
      SELECT p.name, p.sku, COALESCE(SUM(ii.quantity),0)::int as quantity, p."reorderLevel"
      FROM products p
      LEFT JOIN inventory_items ii ON ii."productId" = p.id
      WHERE p."isActive" = true
      GROUP BY p.id
      HAVING COALESCE(SUM(ii.quantity),0) <= p."reorderLevel"
      ORDER BY quantity ASC
      LIMIT 20
    `),
    query<{ total_sales: string; order_count: string }>(`
      SELECT COALESCE(SUM(total),0)::text as total_sales, COUNT(*)::text as order_count
      FROM sales_orders WHERE status != 'CANCELLED'
    `),
    query<{ name: string; sku: string; qty_sold: string; revenue: string }>(`
      SELECT p.name, p.sku,
        COALESCE(SUM(soi.quantity),0)::text as qty_sold,
        COALESCE(SUM(soi.total),0)::text as revenue
      FROM products p
      LEFT JOIN sales_order_items soi ON soi."productId" = p.id
      GROUP BY p.id
      ORDER BY COALESCE(SUM(soi.quantity),0) DESC
      LIMIT 10
    `),
    query<{ type: string; cnt: string; qty: string }>(`
      SELECT type, COUNT(*)::text as cnt, COALESCE(SUM(quantity),0)::text as qty
      FROM stock_movements
      GROUP BY type
      ORDER BY cnt DESC
    `),
  ]);

  return {
    valuation: valuation.rows[0],
    lowStock: lowStock.rows,
    sales: salesSummary.rows[0],
    topProducts: topProducts.rows,
    movements: movements.rows,
  };
}

export default async function ReportsPage() {
  let data = {
    valuation: { total_cost: "0", total_retail: "0", sku_count: "0" },
    lowStock: [] as { name: string; sku: string; quantity: number; reorderLevel: number }[],
    sales: { total_sales: "0", order_count: "0" },
    topProducts: [] as { name: string; sku: string; qty_sold: string; revenue: string }[],
    movements: [] as { type: string; cnt: string; qty: string }[],
  };
  try {
    data = await getReportData();
  } catch (e) {
    console.error(e);
  }

  const cards = [
    { label: "Inventory cost value", value: formatCurrency(Number(data.valuation.total_cost)), icon: DollarSign, color: "text-indigo-600 bg-indigo-50" },
    { label: "Retail value", value: formatCurrency(Number(data.valuation.total_retail)), icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Active SKUs", value: data.valuation.sku_count, icon: Boxes, color: "text-blue-600 bg-blue-50" },
    { label: "Total sales", value: formatCurrency(Number(data.sales.total_sales)), icon: BarChart3, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">Live inventory, sales, and movement insights</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{c.label}</p>
                <div className={`rounded-lg p-2 ${c.color}`}><Icon className="h-4 w-4" /></div>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low stock */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900">Low / reorder stock</h3>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No low-stock items</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-5 py-2 font-medium">Product</th>
                  <th className="px-5 py-2 font-medium">Qty</th>
                  <th className="px-5 py-2 font-medium">Reorder</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((r) => (
                  <tr key={r.sku} className="border-b border-slate-50">
                    <td className="px-5 py-2"><span className="font-medium">{r.name}</span> <span className="text-xs text-slate-400">({r.sku})</span></td>
                    <td className="px-5 py-2 text-red-600 font-medium">{r.quantity}</td>
                    <td className="px-5 py-2 text-slate-500">{r.reorderLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <FileText className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900">Product performance</h3>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No sales data yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-5 py-2 font-medium">Product</th>
                  <th className="px-5 py-2 font-medium">Sold</th>
                  <th className="px-5 py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((r) => (
                  <tr key={r.sku} className="border-b border-slate-50">
                    <td className="px-5 py-2 font-medium">{r.name}</td>
                    <td className="px-5 py-2">{r.qty_sold}</td>
                    <td className="px-5 py-2">{formatCurrency(Number(r.revenue))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Movement summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900">Stock movement summary</h3>
          </div>
          {data.movements.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No movements recorded</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              {data.movements.map((m) => (
                <div key={m.type} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="text-xs font-medium uppercase text-slate-500">{m.type.replace("_", " ")}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{m.cnt}</p>
                  <p className="text-xs text-slate-500">{m.qty} units</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
