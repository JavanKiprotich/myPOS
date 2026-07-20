"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/types/settings";



const defaultSettings: Settings = {
  businessName: "",
  phone: "",
  email: "",
  address: "",

  currency: "KES",
  timezone: "Africa/Nairobi",

  enableCash: true,
  enableMpesa: true,
  enableCredit: true,

  receiptHeader: "",
  receiptFooter: "",

  paperWidth: "80mm",

  showCashier: true,
  showCustomer: true,
  showLogo: false,
  autoPrint: false,
  printDuplicate: false,

  defaultPaymentMethod: "CASH",

requireFullPayment: true,

mpesaEnvironment: "sandbox",

mpesaShortcode: "",

mpesaTillNumber: "",

mpesaConsumerKey: "",

mpesaConsumerSecret: "",

mpesaPasskey: "",

mpesaCallbackUrl: "",

mpesaAutoVerify: true,

// Inventory Settings
lowStockAlert: 5,

allowNegativeStock: false,

autoDeductStock: true,

trackInventory: true,

stockValuation: "AVERAGE",

requireBarcode: false,

// User & Role Settings
sessionTimeout: 30,

managerRefund: true,
managerPriceOverride: true,
managerCancelSale: true,

cashierSell: true,
cashierPrintReceipt: true,
cashierDeleteSale: false,
cashierChangePrice: false,

// Security Settings
requirePinRefund: true,
requirePinVoidSale: true,
requirePinDiscount: true,
requirePinCashDrawer: false,

minimumPasswordLength: 8,
autoLogoutMinutes: 30,

enableAuditLog: true,

// Backup Settings
autoBackup: false,

backupFrequency: "DAILY",

retainBackups: 30,

backupSales: true,

backupInventory: true,

backupCustomers: true,

backupSettings: true,
};

export function useSettings() {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [initialSettings, setInitialSettings] =
    useState<Settings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    JSON.stringify(settings) !==
    JSON.stringify(initialSettings);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();

      const loadedSettings = {
        ...defaultSettings,
        ...data,
      };

      setSettings(loadedSettings);
      setInitialSettings(loadedSettings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      // Reset the "original" values after a successful save
      setInitialSettings(settings);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    setSettings,
    loading,
    saving,
    hasChanges,
    saveSettings,
    reload: loadSettings,
  };
}