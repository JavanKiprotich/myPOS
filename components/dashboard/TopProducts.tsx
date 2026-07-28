import { Trophy } from "lucide-react";

interface TopProductsProps {
  products: any[];
}

export default function TopProducts({
  products,
}: TopProductsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-200 p-6">

        <div className="rounded-xl bg-amber-100 p-3">
          <Trophy
            size={22}
            className="text-amber-700"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Top Selling Products
          </h2>

          <p className="text-sm text-slate-500">
            Best performers today
          </p>
        </div>

      </div>

      <div className="p-6">

        {products.length === 0 ? (

          <p className="text-slate-500">
            No sales yet.
          </p>

        ) : (

          <div className="space-y-5">

            {products.map(
              (product: any, index: number) => (

                <div key={product.productId}>

                  <div className="mb-2 flex justify-between">

                    <span className="font-medium text-slate-800">
                      #{index + 1} {product.product.name}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {product.quantity} sold
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-slate-100">

                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          product.quantity * 10,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}