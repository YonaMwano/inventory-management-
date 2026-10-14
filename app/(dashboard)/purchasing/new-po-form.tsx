"use client";

import { useActionState, useState } from "react";
import { createPurchaseOrderAction, type ActionState } from "@/app/actions/purchasing";
import { Plus, X, Loader2 } from "@/components/icons";

type Option = { id: string; name: string; sku?: string; costPrice?: string };
const initial: ActionState = {};

export function NewPOForm({ suppliers, products }: { suppliers: Option[]; products: Option[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const r = await createPurchaseOrderAction(prev, fd);
      if (r.success) setOpen(false);
      return r;
    },
    initial
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={suppliers.length === 0 || products.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        <Plus className="h-4 w-4" /> New PO
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold">New Purchase Order</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form action={formAction} className="space-y-4 p-5">
              {state?.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
              <div>
                <label className="mb-1 block text-sm font-medium">Supplier *</label>
                <select name="supplierId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Product *</label>
                <select name="productId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) — cost {p.costPrice}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Quantity *</label>
                <input name="quantity" type="number" min={1} defaultValue={1} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Unit cost *</label>
                <input name="unitCost" type="number" step="0.01" min={0} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                  {pending && <Loader2 className="h-4 w-4" />} {pending ? "Saving..." : "Create PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
