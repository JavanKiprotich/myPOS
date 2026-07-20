"use client";


import { useSettings } from "@/hooks/useSettings";
import { useEffect, useState } from "react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Switch from "../ui/Switch";
import Toast from "../ui/Toast";

export default function PaymentSettings() {
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
        ? "Payment settings saved successfully."
        : "Failed to save payment settings.",
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



  useEffect(() => {
  if (
    settings.defaultPaymentMethod === "CREDIT" &&
    !settings.enableCredit
  ) {
    setSettings({
      ...settings,
      defaultPaymentMethod: settings.enableCash
        ? "CASH"
        : "MPESA",
    });
  }

  if (
    settings.defaultPaymentMethod === "MPESA" &&
    !settings.enableMpesa
  ) {
    setSettings({
      ...settings,
      defaultPaymentMethod: settings.enableCash
        ? "CASH"
        : "CREDIT",
    });
  }

  if (
    settings.defaultPaymentMethod === "CASH" &&
    !settings.enableCash
  ) {
    setSettings({
      ...settings,
      defaultPaymentMethod: settings.enableMpesa
        ? "MPESA"
        : "CREDIT",
    });
  }
}, [
  settings.enableCash,
  settings.enableMpesa,
  settings.enableCredit,
]);

  return (
    <div className="space-y-6">


      <Card
  title="Payment Methods"
  description="Enable or disable payment methods available at checkout."
>
  <div className="space-y-4">

    <div className="flex items-center justify-between">
      <span>Cash Payments</span>

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
      <span>M-Pesa Payments</span>

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
      <span>Credit Sales</span>

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

        <Card
  title="Payment Settings"
  description="Configure payment methods."
>
  <div className="space-y-4">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Default Payment Method
      </label>

      <Select
  value={settings.defaultPaymentMethod}
  onChange={(e) =>
    setSettings({
      ...settings,
      defaultPaymentMethod: e.target.value,
    })
  }
>
  {settings.enableCash && (
    <option value="CASH">Cash</option>
  )}

  {settings.enableMpesa && (
    <option value="MPESA">M-Pesa</option>
  )}

  {settings.enableCredit && (
    <option value="CREDIT">Credit</option>
  )}
</Select>
    </div>

    <div className="flex items-center justify-between">
      <span>Require Full Payment</span>

      <Switch
        checked={settings.requireFullPayment}
        onChange={(checked) =>
          setSettings({
            ...settings,
            requireFullPayment: checked,
          })
        }
      />
    </div>

  </div>
</Card>

<Card
  title="M-Pesa Configuration"
  description="Configure Safaricom Daraja API settings."
>
  <div className="space-y-4">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Environment
      </label>

      <Select
        value={settings.mpesaEnvironment}
        onChange={(e) =>
          setSettings({
            ...settings,
            mpesaEnvironment: e.target.value,
          })
        }
      >
        <option value="sandbox">Sandbox</option>
        <option value="production">Production</option>
      </Select>
    </div>

    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="mb-2 block text-sm font-medium">
          Business Shortcode
        </label>

        <Input
          value={settings.mpesaShortcode}
          onChange={(e) =>
            setSettings({
              ...settings,
              mpesaShortcode: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Till Number
        </label>

        <Input
          value={settings.mpesaTillNumber}
          onChange={(e) =>
            setSettings({
              ...settings,
              mpesaTillNumber: e.target.value,
            })
          }
        />
      </div>

    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Consumer Key
      </label>

      <Input
        value={settings.mpesaConsumerKey}
        onChange={(e) =>
          setSettings({
            ...settings,
            mpesaConsumerKey: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Consumer Secret
      </label>

      <Input
        type="password"
        value={settings.mpesaConsumerSecret}
        onChange={(e) =>
          setSettings({
            ...settings,
            mpesaConsumerSecret: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Passkey
      </label>

      <Input
        type="password"
        value={settings.mpesaPasskey}
        onChange={(e) =>
          setSettings({
            ...settings,
            mpesaPasskey: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Callback URL
      </label>

      <Input
        value={settings.mpesaCallbackUrl}
        onChange={(e) =>
          setSettings({
            ...settings,
            mpesaCallbackUrl: e.target.value,
          })
        }
      />
    </div>

    <div className="flex items-center justify-between">
      <span>Automatically Verify Payments</span>

      <Switch
        checked={settings.mpesaAutoVerify}
        onChange={(checked) =>
          setSettings({
            ...settings,
            mpesaAutoVerify: checked,
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