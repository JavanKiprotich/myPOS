"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import UserModal from "@/components/users/UserModal";
import PinVerificationModal from "@/components/modals/PinVerificationModal";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showPinModal, setShowPinModal] =
    useState(false);

  const [verifyingPin, setVerifyingPin] =
    useState(false);

  useEffect(() => {
    loadUsers();
    loadStores();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to load users.");
        setUsers([]);
        return;
      }

      const data = await response.json();

      setUsers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    }
  }

  async function loadStores() {
    try {
      const response = await fetch("/api/stores", {
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to load stores.");
        setStores([]);
        return;
      }

      const data = await response.json();

      setStores(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load stores:",
        error
      );

      setStores([]);
    }
  }

  function handleDelete(id: string) {
    const user = users.find(
      (item) => item.id === id
    );

    if (!user) return;

    const confirmed = window.confirm(
      user.active
        ? `Deactivate ${user.name}?`
        : `Activate ${user.name}?`
    );

    if (!confirmed) return;

    setSelectedUserId(id);
    setShowPinModal(true);
  }

  async function verifyPin(pin: string) {
    try {
      setVerifyingPin(true);

      const response = await fetch(
        "/api/security/verify-pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "PIN verification failed."
        );
        return;
      }

      if (!selectedUserId) {
        alert("No user selected.");
        return;
      }

      const deleteResponse = await fetch(
        `/api/users/${selectedUserId}`,
        {
          method: "DELETE",
        }
      );

      const deleteData =
        await deleteResponse.json();

      if (!deleteResponse.ok) {
        alert(
          deleteData.error ||
            "Failed to update user."
        );
        return;
      }

      setShowPinModal(false);
      setSelectedUserId(null);

      await loadUsers();

      alert(
        deleteData.message ||
          "User status updated."
      );
    } catch (error) {
      console.error(error);
      alert("Failed to verify PIN.");
    } finally {
      setVerifyingPin(false);
    }
  }

  const filteredUsers = users.filter(
    (user) => {
      const term = search.toLowerCase().trim();

      if (!term) return true;

      return (
        user.name
          .toLowerCase()
          .includes(term) ||
        user.email
          .toLowerCase()
          .includes(term) ||
        user.role
          .toLowerCase()
          .includes(term) ||
        user.store?.name
          ?.toLowerCase()
          .includes(term)
      );
    }
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">

        <PageHeader
          title="Users"
          description="Manage system users and store assignments."
        />

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800"
        >
          + New User
        </button>

      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search users, roles or stores..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

      {/* Users Table */}
      <Card className="overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Name
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Email
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Role
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Store
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Status
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >

                    {/* Name */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user.name}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-slate-600">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : user.role ===
                              "MANAGER"
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {user.role}
                      </span>

                    </td>

                    {/* Store */}
                    <td className="px-6 py-4">

                      {user.store ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.store.name}
                          </div>

                          {user.store.location && (
                            <div className="text-xs text-slate-500">
                              {user.store.location}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          Unassigned
                        </span>
                      )}

                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          user.active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.active
                          ? "Active"
                          : "Disabled"}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setShowModal(true);
                          }}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(user.id)
                          }
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            user.active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {user.active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>

      </Card>

      {/* User Modal */}
      <UserModal
        open={showModal}
        user={editingUser}
        stores={stores}
        onClose={() => {
          setEditingUser(null);
          setShowModal(false);
        }}
        onSaved={() => {
          loadUsers();
          setEditingUser(null);
          setShowModal(false);
        }}
      />

      {/* PIN Verification */}
      <PinVerificationModal
        open={showPinModal}
        loading={verifyingPin}
        onCancel={() => {
          setShowPinModal(false);
          setSelectedUserId(null);
        }}
        onVerify={verifyPin}
      />

    </div>
  );
}