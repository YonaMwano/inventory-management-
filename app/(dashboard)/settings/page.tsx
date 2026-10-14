import { query } from "@/lib/db";
import { Warehouse, Tags, Building2, Users } from "@/components/icons";
import { CompanyForm } from "./company-form";
import { AddWarehouseForm } from "./add-warehouse-form";
import { AddCategoryForm } from "./add-category-form";

export const dynamic = "force-dynamic";

async function getSettingsData() {
  const [company, warehouses, categories, users] = await Promise.all([
    query<{ companyName: string; currency: string; taxRate: string }>(
      `SELECT "companyName", currency, "taxRate"::text FROM company_settings LIMIT 1`
    ),
    query<{ id: string; name: string; code: string; address: string | null; isActive: boolean }>(
      `SELECT id, name, code, address, "isActive" FROM warehouses ORDER BY name`
    ),
    query<{ id: string; name: string }>(
      `SELECT id, name FROM categories ORDER BY name`
    ),
    query<{ id: string; name: string; email: string; role: string; isActive: boolean }>(
      `SELECT id, name, email, role, "isActive" FROM users ORDER BY "createdAt" DESC LIMIT 50`
    ),
  ]);
  return {
    company: company.rows[0] || { companyName: "My Company", currency: "USD", taxRate: "0" },
    warehouses: warehouses.rows,
    categories: categories.rows,
    users: users.rows,
  };
}

export default async function SettingsPage() {
  let data = {
    company: { companyName: "My Company", currency: "USD", taxRate: "0" },
    warehouses: [] as { id: string; name: string; code: string; address: string | null; isActive: boolean }[],
    categories: [] as { id: string; name: string }[],
    users: [] as { id: string; name: string; email: string; role: string; isActive: boolean }[],
  };
  try {
    data = await getSettingsData();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Company, warehouses, categories, and users</p>
      </div>

      {/* Company */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Company profile</h3>
        </div>
        <CompanyForm
          companyName={data.company.companyName}
          currency={data.company.currency}
          taxRate={data.company.taxRate}
        />
      </section>

      {/* Warehouses */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Warehouses</h3>
          </div>
          <AddWarehouseForm />
        </div>
        {data.warehouses.length === 0 ? (
          <p className="text-sm text-slate-500">No warehouses</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Code</th>
                <th className="py-2 font-medium">Address</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.warehouses.map((w) => (
                <tr key={w.id} className="border-b border-slate-50">
                  <td className="py-2 font-medium">{w.name}</td>
                  <td className="py-2 font-mono text-xs">{w.code}</td>
                  <td className="py-2 text-slate-600">{w.address || "—"}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${w.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                      {w.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Categories */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Categories</h3>
          </div>
          <AddCategoryForm />
        </div>
        {data.categories.length === 0 ? (
          <p className="text-sm text-slate-500">No categories</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.categories.map((c) => (
              <span key={c.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {c.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Users */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Users</h3>
        </div>
        {data.users.length === 0 ? (
          <p className="text-sm text-slate-500">No users</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="py-2 font-medium">{u.name}</td>
                  <td className="py-2 text-slate-600">{u.email}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{u.role}</span>
                  </td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
