"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";

import StoreSettings from "@/components/settings/StoreSettings";
import ReceiptSettings from "@/components/settings/ReceiptSettings";
import PaymentSettings from "@/components/settings/PaymentSettings";
import InventorySettings from "@/components/settings/InventorySettings";
import UserSettings from "@/components/settings/UserSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";

const tabs = [
  "Store",
  "Receipt",
  "Payments",
  "Inventory",
  "Users",
  "Security",
  "Backup",
  "About",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Store");

  return (
    <div className="space-y-8">

      <PageHeader
        title="Settings"
        description="Configure your store, inventory, payments and security."
      />

      <div className="grid gap-8 lg:grid-cols-12">

        {/* Sidebar */}

        <Card className="lg:col-span-3 p-4 h-fit">

          <nav className="space-y-2">

            {tabs.map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl px-4 py-3 text-left font-medium transition ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>

            ))}

          </nav>

        </Card>

        {/* Content */}

        <Card className="lg:col-span-9 p-8">

          <div className="mb-8 border-b border-slate-200 pb-5">

            <h2 className="text-2xl font-semibold text-slate-900">
              {activeTab} Settings
            </h2>

            <p className="mt-1 text-slate-500">
              Configure your {activeTab.toLowerCase()} preferences.
            </p>

          </div>

          {activeTab === "Store" && <StoreSettings />}

          {activeTab === "Receipt" && <ReceiptSettings />}

          {activeTab === "Payments" && <PaymentSettings />}

          {activeTab === "Inventory" && <InventorySettings />}

          {activeTab === "Users" && <UserSettings />}

          {activeTab === "Security" && <SecuritySettings />}

          {activeTab === "Backup" && (

            <div className="rounded-xl bg-slate-50 p-8 text-center">

              <div className="text-5xl mb-3">
                💾
              </div>

              <h3 className="text-xl font-semibold">
                Backup & Restore
              </h3>

              <p className="mt-2 text-slate-500">
                This feature will be available in a future update.
              </p>

            </div>

          )}

          {activeTab === "About" && (

            <div className="space-y-4">

              <h3 className="text-2xl font-semibold">
                Liquor POS
              </h3>

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex justify-between border-b border-slate-200 py-3">

                  <span className="text-slate-500">
                    Version
                  </span>

                  <span className="font-medium">
                    1.0.0
                  </span>

                </div>

                <div className="flex justify-between py-3">

                  <span className="text-slate-500">
                    Built With
                  </span>

                  <span className="font-medium">
                    Next.js • Prisma • PostgreSQL
                  </span>

                </div>

              </div>

            </div>

          )}

        </Card>

      </div>

    </div>
  );
}