"use client";

import { useActionState, useState } from "react";
import { createWarehouseAction, type ActionState } from "@/app/actions/settings";
import { Plus, X, Loader2 } from "@/components/icons";

const initial: ActionState = {};

export function AddWarehouseForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const r = await createWarehouseAction(prev, fd);
      if (r.success) setOpen(false);
      return r;
    },
    initial
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Plus className="h-4 w-4" /> Add
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">New warehouse</h3>
              <button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form action={formAction} className="space-y-3">
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <input name="name" placeholder="Name *" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="code" placeholder="Code * (e.g. WH-02)" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="address" placeholder="Address" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white disabled:opacity-60">
                {pending && <Loader2 className="h-4 w-4" />} Save
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
