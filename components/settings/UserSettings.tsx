"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Switch from "../ui/Switch";
import Toast from "../ui/Toast";

export default function UserSettings() {
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
        ? "User settings saved successfully."
        : "Failed to save user settings.",
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
        title="User & Role Settings"
        description="Configure user permissions and session settings."
      >
        <div className="space-y-6">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Session Timeout (minutes)
            </label>

            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: Number(e.target.value),
                })
              }
            />
          </div>

          <hr />

          <h3 className="text-lg font-semibold">
            Manager Permissions
          </h3>

          <div className="flex items-center justify-between">
            <span>Allow Refunds</span>

            <Switch
              checked={settings.managerRefund}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  managerRefund: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Allow Price Override</span>

            <Switch
              checked={settings.managerPriceOverride}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  managerPriceOverride: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Allow Sale Cancellation</span>

            <Switch
              checked={settings.managerCancelSale}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  managerCancelSale: checked,
                })
              }
            />
          </div>

          <hr />

          <h3 className="text-lg font-semibold">
            Cashier Permissions
          </h3>

          <div className="flex items-center justify-between">
            <span>Allow Sales</span>

            <Switch
              checked={settings.cashierSell}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  cashierSell: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Allow Receipt Printing</span>

            <Switch
              checked={settings.cashierPrintReceipt}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  cashierPrintReceipt: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Allow Sale Deletion</span>

            <Switch
              checked={settings.cashierDeleteSale}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  cashierDeleteSale: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Allow Price Changes</span>

            <Switch
              checked={settings.cashierChangePrice}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  cashierChangePrice: checked,
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