import Link from "next/link";

interface RecentSalesProps {
  sales: any[];
}

function PaymentBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    CASH: "bg-emerald-100 text-emerald-700",
    MPESA: "bg-sky-100 text-sky-700",
    CREDIT: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[method] || "bg-slate-100 text-slate-700"
      }`}
    >
      {method}
    </span>
  );
}

export default function RecentSales({
  sales,
}: RecentSalesProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-200 p-6">

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Sales
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest completed transactions
          </p>
        </div>

        <Link
          href="/sales"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All →
        </Link>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Receipt
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Payment
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {sales.length === 0 ? (

              <tr>

                <td
                  colSpan={4}
                  className="py-10 text-center text-slate-500"
                >
                  No sales yet.
                </td>

              </tr>

            ) : (

              sales.map((sale) => (

                <tr
                  key={sale.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-semibold text-slate-900">
                    #{sale.id.slice(-6)}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {sale.customer?.name || "Walk-in"}
                  </td>

                  <td className="px-6 py-4">
                    <PaymentBadge
                      method={
                        sale.payments?.[0]?.method ?? "N/A"
                      }
                    />
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    KES {sale.total}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}