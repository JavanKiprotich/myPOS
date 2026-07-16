"use client";

import { useState } from "react";
import StoreSettings from "@/components/settings/StoreSettings";
import PageHeader from "@/components/ui/PageHeader";
import ReceiptSettings from "@/components/settings/ReceiptSettings";

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
        <aside className="col-span-3 border rounded-xl p-4">
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
        <main className="col-span-9 border rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {activeTab} Settings
          </h2>

          {activeTab === "Store" && <StoreSettings />}

          {activeTab === "Receipt" && <ReceiptSettings />}

          {activeTab === "Payments" && (
            <p className="text-gray-500">
              Payment settings coming soon...
            </p>
          )}

          {activeTab === "Inventory" && (
            <p className="text-gray-500">
              Inventory settings coming soon...
            </p>
          )}

          {activeTab === "Users" && (
            <p className="text-gray-500">
              User management coming soon...
            </p>
          )}

          {activeTab === "Security" && (
            <p className="text-gray-500">
              Security settings coming soon...
            </p>
          )}

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