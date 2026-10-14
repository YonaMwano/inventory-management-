"use client";

import { useActionState } from "react";
import { receivePurchaseOrderAction, type ActionState } from "@/app/actions/purchasing";
import { Loader2 } from "@/components/icons";

const initial: ActionState = {};

export function ReceivePOButton({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(receivePurchaseOrderAction, initial);

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60">
        {pending && <Loader2 className="h-3 w-3" />}
        {pending ? "..." : "Receive"}
      </button>
      {state?.error && <span className="ml-2 text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
