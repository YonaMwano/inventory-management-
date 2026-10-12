import { Settings, Warehouse, Tags, Percent, Users, Bell, Building2 } from "@/components/icons";

const items = [
  { label: "Warehouses & Locations", icon: Warehouse },
  { label: "Categories & Units", icon: Tags },
  { label: "Tax Rates", icon: Percent },
  { label: "Users & Roles", icon: Users },
  { label: "Notifications & Alerts", icon: Bell },
  { label: "Company Profile", icon: Building2 },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">
          Warehouses, categories, users, tax rates, company profile
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-slate-900">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
