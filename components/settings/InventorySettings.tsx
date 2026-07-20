"use client";

import { useState } from "react";

import { useSettings } from "@/hooks/useSettings";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Switch from "../ui/Switch";
import Toast from "../ui/Toast";

export default function InventorySettings() {
  const {
    settings,
    setSettings,
    saving,
    hasChanges,
    saveSettings,
  } = useSettings();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  async function handleSave() {
    const ok = await saveSettings();

    setToast({
      show: true,
      message: ok
        ? "Inventory settings saved."
        : "Failed to save inventory settings.",
      type: ok ? "success" : "error",
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  }

  return (
    <div className="space-y-6">

        <Card
  title="Inventory Settings"
  description="Configure how inventory is managed."
>
  <div className="space-y-6">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Low Stock Alert
      </label>

      <Input
        type="number"
        value={settings.lowStockAlert}
        onChange={(e) =>
          setSettings({
            ...settings,
            lowStockAlert: Number(e.target.value),
          })
        }
      />
    </div>

    <div className="flex items-center justify-between">
      <span>Allow Negative Stock</span>

      <Switch
        checked={settings.allowNegativeStock}
        onChange={(checked) =>
          setSettings({
            ...settings,
            allowNegativeStock: checked,
          })
        }
      />
    </div>

    <div className="flex items-center justify-between">
      <span>Automatically Deduct Stock After Sale</span>

      <Switch
        checked={settings.autoDeductStock}
        onChange={(checked) =>
          setSettings({
            ...settings,
            autoDeductStock: checked,
          })
        }
      />
    </div>

    <div className="flex items-center justify-between">
      <span>Track Inventory</span>

      <Switch
        checked={settings.trackInventory}
        onChange={(checked) =>
          setSettings({
            ...settings,
            trackInventory: checked,
          })
        }
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Stock Valuation Method
      </label>

      <Select
        value={settings.stockValuation}
        onChange={(e) =>
          setSettings({
            ...settings,
            stockValuation: e.target.value,
          })
        }
      >
        <option value="FIFO">FIFO</option>
        <option value="AVERAGE">Average Cost</option>
        <option value="LIFO">LIFO</option>
      </Select>
    </div>

    <div className="flex items-center justify-between">
      <span>Require Barcode Before Sale</span>

      <Switch
        checked={settings.requireBarcode}
        onChange={(checked) =>
          setSettings({
            ...settings,
            requireBarcode: checked,
          })
        }
      />
    </div>

  </div>
</Card>

<div className="flex items-center justify-between border-t pt-6">
  {hasChanges ? (
    <p className="text-sm text-amber-600">
      You have unsaved changes.
    </p>
  ) : (
    <p className="text-sm text-green-600">
      All changes are saved.
    </p>
  )}

  <Button
    onClick={handleSave}
    disabled={saving || !hasChanges}
  >
    {saving ? "Saving..." : "Save Changes"}
  </Button>
</div>

<Toast
  show={toast.show}
  message={toast.message}
  type={toast.type}
/>

    </div>
  );
}