"use client";

import { useActionState } from "react";
import { updateCompanyAction, type ActionState } from "@/app/actions/settings";
import { Loader2 } from "@/components/icons";

const initial: ActionState = {};

export function CompanyForm({
  companyName,
  currency,
  taxRate,
}: {
  companyName: string;
  currency: string;
  taxRate: string;
}) {
  const [state, formAction, pending] = useActionState(updateCompanyAction, initial);

  return (
    <form action={formAction} className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
      {state?.error && <div className="sm:col-span-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {state?.success && <div className="sm:col-span-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</div>}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
        <input name="companyName" defaultValue={companyName} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Currency</label>
        <input name="currency" defaultValue={currency} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tax rate %</label>
        <input name="taxRate" type="number" step="0.01" defaultValue={taxRate} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
      </div>
      <div className="sm:col-span-3">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4" />}
          {pending ? "Saving..." : "Save company"}
        </button>
      </div>
    </form>
  );
}
