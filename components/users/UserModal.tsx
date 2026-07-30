"use client";

import { useEffect, useState } from "react";

type Store = {
  id: string;
  name: string;
  location?: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
  active: boolean;
  storeId: string;
  store?: Store | null;
};

type UserModalProps = {
  open: boolean;
  user: User | null;
  stores: Store[];
  onClose: () => void;
  onSaved: () => void;
};

export default function UserModal({
  open,
  user,
  stores,
  onClose,
  onSaved,
}: UserModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    role: "CASHIER" as User["role"],
    active: true,
    storeId: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        pin: "",
        confirmPin: "",
        role: user.role,
        active: user.active,
        storeId:
          user.storeId ||
          user.store?.id ||
          stores[0]?.id ||
          "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        pin: "",
        confirmPin: "",
        role: "CASHIER",
        active: true,
        storeId: stores[0]?.id || "",
      });
    }
  }, [open, user, stores]);

  if (!open) return null;

  async function handleSave() {
    if (!form.name.trim()) {
      return alert("Name is required.");
    }

    if (!form.email.trim()) {
      return alert("Email is required.");
    }

    if (!form.storeId) {
      return alert("Please select a store.");
    }

    if (!user && !form.password) {
      return alert("Password is required.");
    }

    if (
      form.password &&
      form.password !== form.confirmPassword
    ) {
      return alert("Passwords do not match.");
    }

    if (
      form.pin &&
      form.pin !== form.confirmPin
    ) {
      return alert("PINs do not match.");
    }

    if (
      form.pin &&
      (form.pin.length < 4 ||
        form.pin.length > 6)
    ) {
      return alert("PIN must be 4-6 digits.");
    }

    if (
      form.pin &&
      !/^\d+$/.test(form.pin)
    ) {
      return alert("PIN must contain numbers only.");
    }

    try {
      setSaving(true);

      const response = await fetch(
        user
          ? `/api/users/${user.id}`
          : "/api/users",
        {
          method: user ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            pin: form.pin,
            role: form.role,
            active: form.active,
            storeId: form.storeId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save user."
        );
        return;
      }

      onSaved();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {user ? "Edit User" : "New User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {user
                ? "Update user account and store assignment."
                : "Create a user and assign them to a store."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full Name
            </label>

            <input
              className="w-full rounded-lg border p-3"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="Full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              className="w-full rounded-lg border p-3"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="user@example.com"
            />
          </div>

          {/* Store */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Store
            </label>

            <select
              value={form.storeId}
              onChange={(e) =>
                setForm({
                  ...form,
                  storeId: e.target.value,
                })
              }
              className="w-full rounded-lg border p-3 bg-white"
              disabled={stores.length === 0}
            >
              <option value="">
                Select store
              </option>

              {stores.map((store) => (
                <option
                  key={store.id}
                  value={store.id}
                >
                  {store.name}
                  {store.location
                    ? ` — ${store.location}`
                    : ""}
                </option>
              ))}
            </select>

            {stores.length === 0 && (
              <p className="mt-1 text-xs text-red-500">
                No stores available.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                className="w-full rounded-lg border p-3"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder={
                  user
                    ? "Leave blank to keep current"
                    : "Password"
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Confirm Password
              </label>

              <input
                type="password"
                className="w-full rounded-lg border p-3"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword:
                      e.target.value,
                  })
                }
                placeholder="Confirm password"
              />
            </div>
          </div>

          {/* PIN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Manager PIN
              </label>

              <input
                type="password"
                maxLength={6}
                inputMode="numeric"
                className="w-full rounded-lg border p-3"
                value={form.pin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pin: e.target.value.replace(
                      /\D/g,
                      ""
                    ),
                  })
                }
                placeholder={
                  user
                    ? "Leave blank to keep current"
                    : "4-6 digits"
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Confirm PIN
              </label>

              <input
                type="password"
                maxLength={6}
                inputMode="numeric"
                className="w-full rounded-lg border p-3"
                value={form.confirmPin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPin:
                      e.target.value.replace(
                        /\D/g,
                        ""
                      ),
                  })
                }
                placeholder="Confirm PIN"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Role
            </label>

            <select
              className="w-full rounded-lg border p-3"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as User["role"],
                })
              }
            >
              <option value="ADMIN">
                Administrator
              </option>

              <option value="MANAGER">
                Manager
              </option>

              <option value="CASHIER">
                Cashier
              </option>
            </select>
          </div>

          {/* Active */}
          {user && (
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />

              <div>
                <div className="text-sm font-medium">
                  Active User
                </div>

                <div className="text-xs text-slate-500">
                  Allow this user to sign in.
                </div>
              </div>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-5 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || stores.length === 0}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : user
              ? "Update User"
              : "Save User"}
          </button>
        </div>

      </div>
    </div>
  );
}