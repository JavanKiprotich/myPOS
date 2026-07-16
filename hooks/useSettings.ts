"use client";

import { useEffect, useState } from "react";

export type Settings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;

  currency: string;
  timezone: string;

  enableCash: boolean;
  enableMpesa: boolean;
  enableCredit: boolean;

  receiptHeader: string;
  receiptFooter: string;
  paperWidth: string;

  showCashier: boolean;
  showCustomer: boolean;
  showLogo: boolean;
  autoPrint: boolean;
  printDuplicate: boolean;
};

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