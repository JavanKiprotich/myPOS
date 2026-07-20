"use client";

import { useState } from "react";

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
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Configure your liquor POS system."
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 rounded-xl border p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer rounded-lg px-4 py-3 transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab}
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <main className="col-span-9 rounded-xl border p-6">
          <h2 className="mb-6 text-2xl font-semibold">
            {activeTab} Settings
          </h2>

          {activeTab === "Store" && <StoreSettings />}

          {activeTab === "Receipt" && <ReceiptSettings />}

          {activeTab === "Payments" && <PaymentSettings />}

          {activeTab === "Inventory" && <InventorySettings />}

          {activeTab === "Users" && <UserSettings />}

          {activeTab === "Security" && <SecuritySettings />}

          {activeTab === "Backup" && (
            <p className="text-gray-500">
              Backup & Restore coming soon...
            </p>
          )}

          {activeTab === "About" && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Liquor POS
              </h3>

              <p className="text-gray-600">
                Version 1.0.0
              </p>

              <p className="text-gray-600">
                Built with Next.js, Prisma & PostgreSQL.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}