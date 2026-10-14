import { query } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Truck } from "@/components/icons";
import { NewPOForm } from "./new-po-form";
import { ReceivePOButton } from "./receive-po-button";

export const dynamic = "force-dynamic";

type PORow = {
  id: string;
  poNumber: string;
  status: string;
  total: string;
  orderDate: Date;
  supplierName: string;
};

type Option = { id: string; name: string; sku?: string; costPrice?: string };

async function getPOs() {
  const r = await query<PORow>(`
    SELECT po.id, po."poNumber", po.status, po.total, po."orderDate", s.name as "supplierName"
    FROM purchase_orders po
    JOIN suppliers s ON s.id = po."supplierId"
    ORDER BY po."orderDate" DESC LIMIT 50
  `);
  return r.rows;
}

async function getSuppliers() {
  const r = await query<Option>(`SELECT id, name FROM suppliers WHERE "isActive" = true ORDER BY name`);
  return r.rows;
}

async function getProducts() {
  const r = await query<Option>(`
    SELECT id, name, sku, "costPrice" FROM products WHERE "isActive" = true ORDER BY name
  `);
  return r.rows;
}

export default async function PurchasingPage() {
  let pos: PORow[] = [];
  let suppliers: Option[] = [];
  let products: Option[] = [];
  try {
    [pos, suppliers, products] = await Promise.all([getPOs(), getSuppliers(), getProducts()]);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Purchase Orders</h2>
          <p className="text-sm text-slate-500">Create POs and receive stock into inventory</p>
        </div>
        <NewPOForm suppliers={suppliers} products={products} />
      </div>

      {pos.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <Truck className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No purchase orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Add suppliers and products first, then create a PO</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">PO #</th>
                <th className="px-5 py-3 font-medium">Supplier</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{po.poNumber}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{po.supplierName}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(po.orderDate)}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(Number(po.total))}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      po.status === "RECEIVED" ? "bg-green-100 text-green-800" :
                      po.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                    }`}>{po.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {po.status !== "RECEIVED" && <ReceivePOButton orderId={po.id} />}
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
