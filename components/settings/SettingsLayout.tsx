"use client";

import { ReactNode, useState } from "react";

import { useSettings } from "@/hooks/useSettings";

import Button from "../ui/Button";
import Toast from "../ui/Toast";

interface Props {
  children: ReactNode;
  successMessage?: string;
}

export default function SettingsLayout({
  children,
  successMessage = "Settings saved successfully.",
}: Props) {
  const {
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
        ? successMessage
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

  return (
    <div className="space-y-6">
      {children}

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