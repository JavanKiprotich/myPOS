import { AlertTriangle } from "lucide-react";

interface LowStockProps {
  items: any[];
}

export default function LowStock({
  items,
}: LowStockProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-200 p-6">

        <div className="rounded-xl bg-red-100 p-3">
          <AlertTriangle
            size={22}
            className="text-red-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Low Stock
          </h2>

          <p className="text-sm text-slate-500">
            Products needing attention
          </p>
        </div>

      </div>

      <div className="p-6">

        {items.length === 0 ? (

          <div className="rounded-xl bg-emerald-50 p-5 text-center text-emerald-700">
            ✅ All products are sufficiently stocked.
          </div>

        ) : (

          <div className="space-y-4">

            {items.map((item) => (

              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
              >

                <div>

                  <p className="font-semibold text-slate-900">
                    {item.product.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    SKU: {item.product.sku}
                  </p>

                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  {item.quantity} Left
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}