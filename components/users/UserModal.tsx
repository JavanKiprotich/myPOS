"use client";

import { useEffect, useState } from "react";

export default function UserModal({
  open,
  user,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    role: "CASHIER",
    active: true,
  });

  useEffect(() => {
  if (!open) return;

  if (user) {
    // Editing an existing user
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      pin: "",
      confirmPin: "",
      role: user.role,
      active: user.active,
    });
  } else {
    // Creating a new user
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      pin: "",
      confirmPin: "",
      role: "CASHIER",
      active: true,
    });
  }
}, [open, user]);

  if (!open) return null;


  async function handleSave() {
  if (!form.name.trim()) {
    return alert("Name is required.");
  }

  if (!form.email.trim()) {
    return alert("Email is required.");
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
  (form.pin.length < 4 || form.pin.length > 6)
) {
  return alert("PIN must be 4-6 digits.");
}

  try {
   const response = await fetch(
  user ? `/api/users/${user.id}` : "/api/users",
  {
    method: user ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  }
);

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to create user.");
      return;
    }

    onSaved();

  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
  {user ? "Edit User" : "New User"}
</h2>

        <div className="space-y-4">

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
    />
  </div>

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
    />
  </div>

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
            confirmPassword: e.target.value,
          })
        }
      />
    </div>

  </div>

  <div className="grid grid-cols-2 gap-4">

    <div>
      <label className="mb-1 block text-sm font-medium">
        Manager PIN
      </label>

      <input
        type="password"
        maxLength={6}
        className="w-full rounded-lg border p-3"
        value={form.pin}
        onChange={(e) =>
          setForm({
            ...form,
            pin: e.target.value,
          })
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
        className="w-full rounded-lg border p-3"
        value={form.confirmPin}
        onChange={(e) =>
          setForm({
            ...form,
            confirmPin: e.target.value,
          })
        }
      />
    </div>

  </div>

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
          role: e.target.value,
        })
      }
    >
      <option value="ADMIN">Administrator</option>
      <option value="MANAGER">Manager</option>
      <option value="CASHIER">Cashier</option>
    </select>
  </div>

</div>

<div className="mt-8 flex justify-end gap-3">

  <button
    onClick={onClose}
    className="rounded-lg border px-5 py-2"
  >
    Cancel
  </button>

  <button
  onClick={handleSave}
  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
>
 {user ? "Update User" : "Save User"}
</button>

</div>

      </div>

    </div>
  );
}