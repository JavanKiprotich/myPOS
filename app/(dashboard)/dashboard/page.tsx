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
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-500 text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome back. Here's today's business summary.
          </p>

        </div>

        <div className="text-gray-500 mt-3 lg:mt-0">
          {new Date().toLocaleDateString()}
        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <QuickAction
          href="/pos"
          color="bg-blue-600"
          icon="🛒"
          title="New Sale"
        />

        <QuickAction
          href="/inventory"
          color="bg-orange-500"
          icon="📦"
          title="Inventory"
        />

        <QuickAction
          href="/products"
          color="bg-green-600"
          icon="🍾"
          title="Products"
        />

        <QuickAction
          href="/customers"
          color="bg-purple-600"
          icon="👥"
          title="Customers"
        />

      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">

        <StatCard
          title="Today's Sales"
          value={`KES ${dashboard.todaySales}`}
          color="bg-green-500"
        />

        <StatCard
          title="Transactions"
          value={dashboard.todayTransactions ?? 0}
          color="bg-blue-500"
        />

        <StatCard
          title="Products"
          value={dashboard.totalProducts}
          color="bg-indigo-500"
        />

        <StatCard
          title="Customers"
          value={dashboard.totalCustomers}
          color="bg-purple-500"
        />

        <StatCard
          title="Outstanding Credit"
          value={`KES ${dashboard.outstandingCredit}`}
          color="bg-red-500"
        />

        <StatCard
          title="Inventory Value"
          value={`KES ${dashboard.inventoryValue ?? 0}`}
          color="bg-amber-500"
        />

      </div>

      {/* CHART + PAYMENT */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-5">
            Weekly Sales
          </h2>

          <div className="h-72 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">
            Sales chart coming soon
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-5">
            Payment Breakdown
          </h2>

          <div className="space-y-4">

            <PaymentRow
              label="Cash"
              value={dashboard.cashSales ?? 0}
            />

            <PaymentRow
              label="M-Pesa"
              value={dashboard.mpesaSales ?? 0}
            />

            <PaymentRow
              label="Credit"
              value={dashboard.creditSales ?? 0}
            />

          </div>

        </div>

      </div>

      {/* RECENT SALES */}

      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-bold">
            Recent Sales
          </h2>

          <Link
            href="/sales"
            className="text-blue-600 hover:underline"
          >
            View All
          </Link>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left py-3">
                  Receipt
                </th>

                <th className="text-left py-3">
                  Customer
                </th>

                <th className="text-left py-3">
                  Payment
                </th>

                <th className="text-right py-3">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {dashboard.recentSales.map((sale: any) => (

                <tr
                  key={sale.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="py-3 font-semibold">
                    #{sale.id.slice(-6)}
                  </td>

                  <td>
                    {sale.customer?.name ||
                      "Walk-in"}
                  </td>

                  <td>
                   {sale.payments?.[0]?.method ?? "N/A"}
                  </td>

                  <td className="text-right font-bold">
                    KES {sale.total}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-5">
            Low Stock Alerts
          </h2>

          {dashboard.lowStock.length === 0 ? (

            <p className="text-green-600">
              ✅ All products sufficiently stocked.
            </p>

          ) : (

            dashboard.lowStock.map((item: any) => (

              <div
                key={item.id}
                className="flex justify-between border-b py-3"
              >

                <span>
                  {item.product.name}
                </span>

                <span className="font-bold text-red-600">
                  {item.quantity}
                </span>

              </div>

            ))

          )}

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-5">
            Top Selling Products
          </h2>

          {(dashboard.topProducts ?? []).length ===
          0 ? (

            <p className="text-gray-500">
              No sales yet.
            </p>

          ) : (

            dashboard.topProducts.map(
              (product: any) => (

                <div
                  key={product.productId}
                  className="flex justify-between border-b py-3"
                >

                  <span>
                    {product.product.name}
                  </span>

                  <span className="font-bold">
                    {product.quantity}
                  </span>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

function QuickAction({
  href,
  title,
  icon,
  color,
}: any) {
  return (
    <Link
      href={href}
      className={`${color} text-white rounded-xl p-5 hover:opacity-90 transition shadow`}
    >
      <div className="text-4xl mb-3">
        {icon}
      </div>

      <div className="font-semibold text-lg">
        {title}
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  color,
}: any) {
  return (
    <div
      className={`${color} rounded-xl shadow text-white p-6`}
    >
      <div className="opacity-90 text-sm">
        {title}
      </div>

      <div className="text-3xl font-bold mt-3">
        {value}
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
}: any) {
  return (
    <div className="flex justify-between border-b pb-3">

      <span>{label}</span>

      <span className="font-bold">
        KES {value}
      </span>

    </div>
  );
}