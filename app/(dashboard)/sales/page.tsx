"use client";

import { useEffect, useState } from "react";

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

  if (loading) {
    return (
      <div className="p-6">
        Loading sales...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Sales History
      </h1>

      {sales.length === 0 ? (
        <div>No sales found.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Receipt</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="border-b"
              >
                <td className="p-2">
                  {new Date(
                    sale.createdAt
                  ).toLocaleString()}
                </td>

                <td className="p-2">
                  {sale.customer?.name ||
                    "Walk-in"}
                </td>

                <td className="p-2">
                  KES {Number(sale.total)}
                </td>

                <td className="p-2">
                  <a
                    href={`/receipt/${sale.id}`}
                    className="text-blue-600 underline"
                  >
                    View Receipt
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}