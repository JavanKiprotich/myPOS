"use client";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import Spinner from "../ui/Spinner";
import Toast from "../ui/Toast";

import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";

export default function ReceiptSettings() {
 const {
  settings,
  setSettings,
  loading,
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
        ? "Receipt settings saved."
        : "Failed to save receipt settings.",
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

  if (loading) {
    return (
      <Card title="Loading Receipt Settings">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      <Card
        title="Receipt Layout"
        description="Configure printed receipts."
      >

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Receipt Header
            </label>

            <Input
              value={settings.receiptHeader}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  receiptHeader: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Receipt Footer
            </label>

            <Input
              value={settings.receiptFooter}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  receiptFooter: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Paper Width
            </label>

            <Select
              value={settings.paperWidth}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  paperWidth: e.target.value,
                })
              }
            >
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </Select>
          </div>

        </div>

      </Card>

      <Card
        title="Receipt Options"
        description="Control what appears on receipts."
      >

        <div className="space-y-4">

          <div className="flex items-center justify-between">
            <span>Show Logo</span>

            <Switch
              checked={settings.showLogo}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  showLogo: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Show Cashier</span>

            <Switch
              checked={settings.showCashier}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  showCashier: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Show Customer</span>

            <Switch
              checked={settings.showCustomer}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  showCustomer: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Auto Print</span>

            <Switch
              checked={settings.autoPrint}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  autoPrint: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Print Duplicate</span>

            <Switch
              checked={settings.printDuplicate}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  printDuplicate: checked,
                })
              }
            />
          </div>

        </div>

      </Card>

      <div className="flex justify-end">
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