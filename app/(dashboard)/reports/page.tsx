import { BarChart3, FileText } from "@/components/icons";

const reports = [
  "Inventory Valuation",
  "Low Stock / Reorder",
  "Sales by Period",
  "Product Performance",
  "Stock Movement Audit",
  "Dead / Slow-moving Stock",
  "Profit & Margin",
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">
          Inventory valuation, sales, stock movement audit, and more
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div
            key={r}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{r}</p>
              <p className="mt-0.5 text-xs text-slate-500">Export CSV / PDF</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
