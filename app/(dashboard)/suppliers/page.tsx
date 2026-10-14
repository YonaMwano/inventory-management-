import { query } from "@/lib/db";
import { Users } from "@/components/icons";
import { AddSupplierForm } from "./add-supplier-form";

export const dynamic = "force-dynamic";

type SupplierRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contactName: string | null;
  isActive: boolean;
};

async function getSuppliers() {
  const result = await query<SupplierRow>(`
    SELECT id, name, email, phone, "contactName", "isActive"
    FROM suppliers ORDER BY name ASC
  `);
  return result.rows;
}

export default async function SuppliersPage() {
  let suppliers: SupplierRow[] = [];
  try {
    suppliers = await getSuppliers();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Suppliers</h2>
          <p className="text-sm text-slate-500">Manage suppliers for purchase orders</p>
        </div>
        <AddSupplierForm />
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No suppliers yet</p>
          <p className="mt-1 text-sm text-slate-500">Add a supplier to create purchase orders</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-5 py-3 text-slate-600">{s.contactName || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{s.email || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{s.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
