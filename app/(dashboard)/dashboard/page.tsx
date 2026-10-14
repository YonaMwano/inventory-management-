import { query } from "@/lib/db";
import { formatCurrency, formatDateTime, getStockStatus } from "@/lib/utils";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  Boxes,
} from "@/components/icons";

export const dynamic = "force-dynamic";

type LowStockRow = {
  id: string;
  quantity: number;
  sku: string;
  name: string;
  reorderLevel: number;
};

type MovementRow = {
  id: string;
  type: string;
  quantity: number;
  createdAt: Date;
  productName: string;
};

async function getDashboardData() {
  const [productCountRes, valueRes, lowStockRes, outOfStockRes, movementsRes, salesTodayRes, salesMonthRes] =
    await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*)::text as count FROM products WHERE "isActive" = true`),
      query<{ total: string }>(`
        SELECT COALESCE(SUM(ii.quantity * p."costPrice"), 0)::text as total
        FROM inventory_items ii
        JOIN products p ON p.id = ii."productId"
        WHERE p."isActive" = true
      `),
      query<LowStockRow>(`
        SELECT ii.id, ii.quantity, p.sku, p.name, p."reorderLevel"
        FROM inventory_items ii
        JOIN products p ON p.id = ii."productId"
        WHERE p."isActive" = true AND ii.quantity > 0 AND ii.quantity <= p."reorderLevel"
        ORDER BY ii.quantity ASC
        LIMIT 8
      `),
      query<{ count: string }>(`
        SELECT COUNT(*)::text as count
        FROM inventory_items ii
        JOIN products p ON p.id = ii."productId"
        WHERE p."isActive" = true AND ii.quantity <= 0
      `),
      query<MovementRow>(`
        SELECT sm.id, sm.type, sm.quantity, sm."createdAt", p.name as "productName"
        FROM stock_movements sm
        JOIN products p ON p.id = sm."productId"
        ORDER BY sm."createdAt" DESC
        LIMIT 8
      `),
      query<{ total: string; count: string }>(`
        SELECT COALESCE(SUM(total), 0)::text as total, COUNT(*)::text as count
        FROM sales_orders
        WHERE "orderDate" >= CURRENT_DATE AND status != 'CANCELLED'
      `),
      query<{ total: string }>(`
        SELECT COALESCE(SUM(total), 0)::text as total
        FROM sales_orders
        WHERE "orderDate" >= date_trunc('month', CURRENT_DATE) AND status != 'CANCELLED'
      `),
    ]);

  return {
    productCount: parseInt(productCountRes.rows[0]?.count || "0", 10),
    totalValue: parseFloat(valueRes.rows[0]?.total || "0"),
    lowStock: lowStockRes.rows,
    outOfStockCount: parseInt(outOfStockRes.rows[0]?.count || "0", 10),
    recentMovements: movementsRes.rows,
    salesToday: parseFloat(salesTodayRes.rows[0]?.total || "0"),
    salesThisMonth: parseFloat(salesMonthRes.rows[0]?.total || "0"),
  };
}

export default async function DashboardPage() {
  let data = {
    productCount: 0,
    totalValue: 0,
    lowStock: [] as LowStockRow[],
    outOfStockCount: 0,
    recentMovements: [] as MovementRow[],
    salesToday: 0,
    salesThisMonth: 0,
  };

  try {
    data = await getDashboardData();
  } catch (e) {
    console.error("Dashboard data error:", e);
  }

  const kpis = [
    {
      label: "Inventory Value",
      value: formatCurrency(data.totalValue),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total SKUs",
      value: String(data.productCount),
      icon: Boxes,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Low Stock",
      value: String(data.lowStock.length),
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Out of Stock",
      value: String(data.outOfStockCount),
      icon: XCircle,
      color: "text-red-600 bg-red-50",
    },
    {
      label: "Sales Today",
      value: formatCurrency(data.salesToday),
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Sales This Month",
      value: formatCurrency(data.salesThisMonth),
      icon: Package,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Real-time overview of inventory, sales and stock movement
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                <div className={`rounded-lg p-1.5 ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h3 className="font-semibold text-slate-900">Low Stock Alerts</h3>
            {data.lowStock.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                {data.lowStock.length} items
              </span>
            )}
          </div>
          {data.lowStock.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No low stock items. All good!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-5 py-2.5 font-medium">SKU</th>
                    <th className="px-5 py-2.5 font-medium">Product</th>
                    <th className="px-5 py-2.5 font-medium">Qty</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStock.map((item) => {
                    const status = getStockStatus(item.quantity, item.reorderLevel);
                    return (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-mono text-xs text-slate-600">
                          {item.sku}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-5 py-3">{item.quantity}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
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
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-3">
            <h3 className="font-semibold text-slate-900">Recent Stock Movements</h3>
          </div>
          {data.recentMovements.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No stock movements yet. Add a product to see activity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-5 py-2.5 font-medium">Date</th>
                    <th className="px-5 py-2.5 font-medium">Product</th>
                    <th className="px-5 py-2.5 font-medium">Type</th>
                    <th className="px-5 py-2.5 font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentMovements.map((m) => (
                    <tr key={m.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {m.productName}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.type === "STOCK_IN"
                              ? "bg-green-100 text-green-800"
                              : m.type === "STOCK_OUT"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {m.type.replace("_", " ")}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3 font-medium ${
                          m.type === "STOCK_IN" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {m.type === "STOCK_IN" ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
