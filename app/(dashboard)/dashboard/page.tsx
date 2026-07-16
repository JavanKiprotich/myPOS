"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const response = await fetch("/api/dashboard");
    const data = await response.json();
    setDashboard(data);
  }

  if (!dashboard) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      {/* QUICK ACTIONS */}

      <div className="grid grid-cols-4 gap-4 mb-8">

        <Link
          href="/pos"
          className="bg-blue-600 text-white rounded-lg p-5 hover:bg-blue-700 transition"
        >
          <div className="text-3xl mb-2">🛒</div>
          <div className="font-semibold">
            New Sale
          </div>
        </Link>

        <Link
          href="/products"
          className="bg-green-600 text-white rounded-lg p-5 hover:bg-green-700 transition"
        >
          <div className="text-3xl mb-2">🍾</div>
          <div className="font-semibold">
            Add Product
          </div>
        </Link>

        <Link
          href="/inventory"
          className="bg-orange-500 text-white rounded-lg p-5 hover:bg-orange-600 transition"
        >
          <div className="text-3xl mb-2">📦</div>
          <div className="font-semibold">
            Stock In
          </div>
        </Link>

        <Link
          href="/expenses"
          className="bg-red-600 text-white rounded-lg p-5 hover:bg-red-700 transition"
        >
          <div className="text-3xl mb-2">🧾</div>
          <div className="font-semibold">
            Record Expense
          </div>
        </Link>

      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <Card
          title="Today's Sales"
          value={`KES ${dashboard.todaySales}`}
          color="bg-green-500"
        />

        <Card
          title="Products"
          value={dashboard.totalProducts}
          color="bg-blue-500"
        />

        <Card
          title="Customers"
          value={dashboard.totalCustomers}
          color="bg-purple-500"
        />

        <Card
          title="Outstanding Credit"
          value={`KES ${dashboard.outstandingCredit}`}
          color="bg-red-500"
        />

      </div>

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Recent Sales
          </h2>

          {dashboard.recentSales.map((sale: any) => (
            <div
              key={sale.id}
              className="flex justify-between border-b py-3"
            >
              <span>
                {sale.customer?.name || "Walk-in"}
              </span>

              <span className="font-semibold">
                KES {sale.total}
              </span>
            </div>
          ))}

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Low Stock
          </h2>

          {dashboard.lowStock.length === 0 ? (
            <p>No low stock products.</p>
          ) : (
            dashboard.lowStock.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between border-b py-3"
              >
                <span>{item.product.name}</span>

                <span className="text-red-600 font-bold">
                  {item.quantity}
                </span>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
}: any) {
  return (
    <div
      className={`${color} rounded-xl shadow text-white p-6`}
    >
      <div className="text-sm opacity-90">
        {title}
      </div>

      <div className="text-3xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}