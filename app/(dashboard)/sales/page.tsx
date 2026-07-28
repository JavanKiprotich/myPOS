"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const response = await fetch("/api/sales/history");
      const data = await response.json();

      console.log("RAW RESPONSE:", data);

      if (Array.isArray(data)) {
        setSales(data);
      } else if (data?.sales && Array.isArray(data.sales)) {
        setSales(data.sales);
      } else {
        console.error("Unexpected response:", data);
        setSales([]);
      }
    } catch (error) {
      console.error(error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Sales History
        </h1>

        <p className="mt-1 text-slate-500">
          View completed sales and receipts.
        </p>

      </div>

      {loading ? (

        <Card className="p-12 text-center">

          <p className="text-slate-500 text-lg">
            Loading sales...
          </p>

        </Card>

      ) : sales.length === 0 ? (

        <Card className="p-12 text-center">

          <div className="text-6xl mb-4">
            🧾
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">
            No Sales Found
          </h2>

          <p className="mt-2 text-slate-500">
            Sales will appear here after checkout.
          </p>

        </Card>

      ) : (

        <Card className="overflow-hidden">

          <div className="border-b border-slate-200 p-6">

            <h2 className="text-xl font-semibold">
              Recent Sales
            </h2>

          </div>

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Date
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Customer
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Total
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Receipt
                </th>

              </tr>

            </thead>

            <tbody>

              {sales.map((sale) => (

                <tr
                  key={sale.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >

                  <td className="px-6 py-4 text-slate-600">

                    {new Date(
                      sale.createdAt
                    ).toLocaleString()}

                  </td>

                  <td className="px-6 py-4 font-medium text-slate-900">

                    {sale.customer?.name ||
                      "Walk-in"}

                  </td>

                  <td className="px-6 py-4">

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">

                      KES{" "}
                      {Number(sale.total).toLocaleString()}

                    </span>

                  </td>

                  <td className="px-6 py-4">

                   <Link
  href={`/receipt/${sale.id}`}
  className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800"
>
  View Receipt
</Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </Card>

      )}

    </div>
  );
}