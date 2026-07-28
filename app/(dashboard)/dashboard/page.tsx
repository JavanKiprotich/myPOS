"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";

import QuickAction from "@/components/dashboard/QuickAction";
import RecentSales from "@/components/dashboard/RecentSales";
import LowStock from "@/components/dashboard/LowStock";
import TopProducts from "@/components/dashboard/TopProducts";
import WeeklySalesChart from "@/components/dashboard/WeeklySalesChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

import {
  CircleDollarSign,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Boxes,
} from "lucide-react";

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

      <DashboardHeader
  userName="Javan"
/>

      {/* QUICK ACTIONS */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
  <QuickAction
    href="/pos"
    title="New Sale"
    description="Start a new transaction"
    icon={<ShoppingCart size={24} />}
  />

  <QuickAction
    href="/inventory"
    title="Inventory"
    description="Manage stock levels"
    icon={<Package size={24} />}
  />

  <QuickAction
    href="/products/new"
    title="Products"
    description="Add new products"
    icon={<Boxes size={24} />}
  />

  <QuickAction
    href="/customers"
    title="Customers"
    description="Manage customer records"
    icon={<Users size={24} />}
  />
</div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">

      <StatCard
  title="Today's Sales"
  value={`KES ${dashboard.todaySales}`}
  subtitle="Today's revenue"
  icon={<CircleDollarSign size={22} />}
  iconBg="bg-emerald-100"
  iconColor="text-emerald-700"
/>

<StatCard
  title="Transactions"
  value={dashboard.todayTransactions ?? 0}
  subtitle="Completed today"
  icon={<ShoppingCart size={22} />}
  iconBg="bg-sky-100"
  iconColor="text-sky-700"
/>

<StatCard
  title="Products"
  value={dashboard.totalProducts}
  subtitle="Available products"
  icon={<Package size={22} />}
  iconBg="bg-violet-100"
  iconColor="text-violet-700"
/>

<StatCard
  title="Customers"
  value={dashboard.totalCustomers}
  subtitle="Registered customers"
  icon={<Users size={22} />}
  iconBg="bg-indigo-100"
  iconColor="text-indigo-700"
/>

<StatCard
  title="Outstanding Credit"
  value={`KES ${dashboard.outstandingCredit}`}
  subtitle="Pending payments"
  icon={<CreditCard size={22} />}
  iconBg="bg-rose-100"
  iconColor="text-rose-700"
/>

<StatCard
  title="Inventory Value"
  value={`KES ${dashboard.inventoryValue ?? 0}`}
  subtitle="Current stock value"
  icon={<Boxes size={22} />}
  iconBg="bg-amber-100"
  iconColor="text-amber-700"
/>
      </div>

      {/* CHART + PAYMENT */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-5">
            Weekly Sales
          </h2>

          
           <WeeklySalesChart
  data={dashboard.weeklySales}
/>
          

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

      <RecentSales
  sales={dashboard.recentSales}
/>

      {/* BOTTOM */}

      
<div className="grid gap-6 xl:grid-cols-2">

  <LowStock
    items={dashboard.lowStock}
  />

  <TopProducts
    products={dashboard.topProducts ?? []}
  />

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