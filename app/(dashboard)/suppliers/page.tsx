import { Users } from "@/components/icons";

export default function SuppliersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Suppliers</h2>
          <p className="text-sm text-slate-500">Manage suppliers and their products</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          + Add Supplier
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <Users className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 font-medium text-slate-900">No suppliers yet</p>
        <p className="mt-1 text-sm text-slate-500">Add suppliers to link them to products and POs</p>
      </div>
    </div>
  );
}
