"use client";

import { useState } from "react";

import { useSettings } from "@/hooks/useSettings";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import Select from "../ui/Select";
import Switch from "../ui/Switch";
import Toast from "../ui/Toast";

export default function StoreSettings() {
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
        ? "Settings saved successfully."
        : "Failed to save settings.",
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
      <Card title="Loading Settings">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  
  return (
    <div className="space-y-6">

      <Card
  title="Store Information"
  description="Information shown on receipts and reports."
>
  <div className="space-y-4">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Business Name
      </label>

      <Input
        value={settings.businessName}
        onChange={(e) =>
          setSettings({
            ...settings,
            businessName: e.target.value,
          })
        }
      />
    </div>

    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="mb-2 block text-sm font-medium">
          Phone
        </label>

        <Input
          value={settings.phone}
          onChange={(e) =>
            setSettings({
              ...settings,
              phone: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
        </label>

        <Input
          value={settings.email}
          onChange={(e) =>
            setSettings({
              ...settings,
              email: e.target.value,
            })
          }
        />
      </div>

    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Address
      </label>

      <Textarea
        rows={3}
        value={settings.address}
        onChange={(e) =>
          setSettings({
            ...settings,
            address: e.target.value,
          })
        }
      />
    </div>

  </div>
</Card>

      <Card
  title="Regional Settings"
  description="Currency and timezone."
>
  <div className="grid grid-cols-2 gap-4">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Currency
      </label>

      <Select
        value={settings.currency}
        onChange={(e) =>
          setSettings({
            ...settings,
            currency: e.target.value,
          })
        }
      >
        <option value="KES">KES</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </Select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Timezone
      </label>

      <Input
        value={settings.timezone}
        onChange={(e) =>
          setSettings({
            ...settings,
            timezone: e.target.value,
          })
        }
      />
    </div>

  </div>
</Card>

      <Card
  title="Payment Methods"
  description="Choose available payment methods."
>
  <div className="space-y-4">

    <div className="flex items-center justify-between">
      <span>Cash</span>

      <Switch
        checked={settings.enableCash}
        onChange={(checked) =>
          setSettings({
            ...settings,
            enableCash: checked,
          })
        }
      />
    </div>

    <div className="flex items-center justify-between">
      <span>M-Pesa</span>

      <Switch
        checked={settings.enableMpesa}
        onChange={(checked) =>
          setSettings({
            ...settings,
            enableMpesa: checked,
          })
        }
      />
    </div>

    <div className="flex items-center justify-between">
      <span>Credit</span>

      <Switch
        checked={settings.enableCredit}
        onChange={(checked) =>
          setSettings({
            ...settings,
            enableCredit: checked,
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