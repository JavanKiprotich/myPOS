"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Switch from "../ui/Switch";
import Toast from "../ui/Toast";

export default function SecuritySettings() {
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
        ? "Security settings saved successfully."
        : "Failed to save security settings.",
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
        title="Security Settings"
        description="Configure security policies for your POS."
      >
        <div className="space-y-6">

          <h3 className="text-lg font-semibold">
            PIN Protection
          </h3>

          <div className="flex items-center justify-between">
            <span>Require PIN for Refunds</span>

            <Switch
              checked={settings.requirePinRefund}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  requirePinRefund: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Require PIN for Void Sale</span>

            <Switch
              checked={settings.requirePinVoidSale}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  requirePinVoidSale: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Require PIN for Discounts</span>

            <Switch
              checked={settings.requirePinDiscount}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  requirePinDiscount: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Require PIN to Open Cash Drawer</span>

            <Switch
              checked={settings.requirePinCashDrawer}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  requirePinCashDrawer: checked,
                })
              }
            />
          </div>

          <hr />

          <h3 className="text-lg font-semibold">
            Authentication
          </h3>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Minimum Password Length
            </label>

            <Input
              type="number"
              value={settings.minimumPasswordLength}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minimumPasswordLength: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Auto Logout (minutes)
            </label>

            <Input
              type="number"
              value={settings.autoLogoutMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  autoLogoutMinutes: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Enable Audit Log</span>

            <Switch
              checked={settings.enableAuditLog}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  enableAuditLog: checked,
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