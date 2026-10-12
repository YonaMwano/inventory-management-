import { Truck } from "@/components/icons";

export default function PurchasingPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Purchase Orders</h2>
          <p className="text-sm text-slate-500">Create POs and receive stock</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          + New PO
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <Truck className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 font-medium text-slate-900">No purchase orders yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Receiving a PO will create stock-in movements automatically
        </p>
      </div>
    </div>
  );
}
