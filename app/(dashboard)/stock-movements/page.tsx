import { query } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeftRight } from "@/components/icons";

export const dynamic = "force-dynamic";

type MovementRow = {
  id: string;
  type: string;
  quantity: number;
  reference: string | null;
  createdAt: Date;
  productName: string;
  userName: string;
};

async function getMovements() {
  const result = await query<MovementRow>(`
    SELECT
      sm.id, sm.type, sm.quantity, sm.reference, sm."createdAt",
      p.name as "productName",
      u.name as "userName"
    FROM stock_movements sm
    JOIN products p ON p.id = sm."productId"
    JOIN users u ON u.id = sm."userId"
    ORDER BY sm."createdAt" DESC
    LIMIT 100
  `);
  return result.rows;
}

export default async function StockMovementsPage() {
  let movements: MovementRow[] = [];
  try {
    movements = await getMovements();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Stock Movements</h2>
        <p className="text-sm text-slate-500">
          Full audit trail of every stock change
        </p>
      </div>

      {movements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <ArrowLeftRight className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No movements yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Stock movements appear when you add products, make sales, or receive purchases
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">User</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
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
                    <td className="px-5 py-3 font-medium">{m.quantity}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {m.reference || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{m.userName}</td>
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
