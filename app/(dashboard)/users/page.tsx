"use client";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
  active: boolean;
};

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import UserModal from "@/components/users/UserModal";
import PinVerificationModal from "@/components/modals/PinVerificationModal";

export default function UsersPage() {
 const [users, setUsers] = useState<User[]>([]);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  

  
const [showModal, setShowModal] = useState(false);
const [showPinModal, setShowPinModal] = useState(false);

const [verifyingPin, setVerifyingPin] = useState(false);


  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch("/api/users");

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

function handleDelete(id: string) {
  const user = users.find((u) => u.id === id);

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
      alert(data.error);
      return;
    }

    const deleteResponse = await fetch(
      `/api/users/${selectedUserId}`,
      {
        method: "DELETE",
      }
    );

    const deleteData = await deleteResponse.json();

    if (!deleteResponse.ok) {
      alert(deleteData.error);
      return;
    }

    setShowPinModal(false);
    setSelectedUserId(null);

    loadUsers();

    alert(deleteData.message);

  } catch (error) {
    console.error(error);
    alert("Failed to verify PIN.");
  } finally {
    setVerifyingPin(false);
  }
}

  const filteredUsers = users.filter((user: User) => {
    const term = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <PageHeader
          title="Users"
          description="Manage system users."
        />

        <button
  onClick={() => {
  setEditingUser(null);
  setShowModal(true);
}}
  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
>
  + New User
</button>

      </div>

      {/* Search */}

      <div className="my-6">

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">

            <tr>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Email</th>

              <th className="p-4 text-left">Role</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  No users found.
                </td>

              </tr>

            ) : (

              filteredUsers.map((user) => (

                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4 font-medium">
                    {user.name}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : user.role === "MANAGER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>

                  </td>

                  <td className="p-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.active ? "Active" : "Disabled"}
                    </span>

                  </td>

                  <td className="p-4">

                    <div className="flex gap-4">

                     <button
  onClick={() => {
    setEditingUser(user);
    setShowModal(true);
  }}
  className="font-medium text-blue-600 hover:text-blue-800"
>
  Edit
</button>

<button
  onClick={() => handleDelete(user.id)}
  className={`ml-3 font-medium ${
    user.active
      ? "text-red-600 hover:text-red-800"
      : "text-green-600 hover:text-green-800"
  }`}
>
  {user.active ? "Deactivate" : "Activate"}
</button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

<UserModal
  open={showModal}
  user={editingUser}
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