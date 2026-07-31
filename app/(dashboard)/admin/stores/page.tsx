"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Toast from "@/components/ui/Toast";

type Store = {
  id: string;
  name: string;
  location: string | null;
  active: boolean;
  createdAt: string;
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>(
    []
  );

  const [name, setName] = useState("");
  const [location, setLocation] =
    useState("");

  const [editingStore, setEditingStore] =
    useState<Store | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as
      | "success"
      | "error",
  });

  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({
      show: true,
      message,
      type,
    });

    window.setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2500);
  }

  async function loadStores() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/stores",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            "Failed to load stores.",
          "error"
        );

        setStores([]);
        return;
      }

      setStores(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setStores([]);

      showToast(
        "Failed to load stores.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  function openNewStore() {
    setEditingStore(null);
    setName("");
    setLocation("");
  }

  function openEditStore(store: Store) {
    setEditingStore(store);
    setName(store.name);
    setLocation(store.location || "");
  }

  async function saveStore() {
    const cleanName = name.trim();
    const cleanLocation =
      location.trim();

    if (!cleanName) {
      showToast(
        "Store name is required.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        editingStore
          ? `/api/stores/${editingStore.id}`
          : "/api/stores",
        {
          method: editingStore
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            location:
              cleanLocation || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            "Failed to save store.",
          "error"
        );
        return;
      }

      setName("");
      setLocation("");
      setEditingStore(null);

      await loadStores();

      showToast(
        editingStore
          ? "Store updated successfully."
          : "Store created successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Failed to save store.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStore(store: Store) {
    const nextActive = !store.active;

    if (
      store.active &&
      !window.confirm(
        `Deactivate ${store.name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/stores/${store.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            active: nextActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            "Failed to update store status.",
          "error"
        );
        return;
      }

      setStores((current) =>
        current.map((item) =>
          item.id === store.id
            ? data
            : item
        )
      );

      showToast(
        nextActive
          ? "Store activated."
          : "Store deactivated.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Failed to update store status.",
        "error"
      );
    }
  }

  return (
    <div className="space-y-8">

      <PageHeader
        title="Stores"
        description="Create and manage stores for your POS system."
      />

      {/* Store Form */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {editingStore
                ? "Edit Store"
                : "Add Store"}
            </h2>

            {editingStore && (
              <p className="mt-1 text-sm text-slate-500">
                Update the store details below.
              </p>
            )}
          </div>

          {editingStore && (
            <button
              type="button"
              onClick={openNewStore}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          <input
            type="text"
            placeholder="Store Name"
            value={name}
            disabled={saving}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            disabled={saving}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          <button
            type="button"
            onClick={saveStore}
            disabled={
              saving || !name.trim()
            }
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving
              ? "Saving..."
              : editingStore
              ? "Update Store"
              : "+ Add Store"}
          </button>

        </div>
      </Card>

      {/* Store List */}
      <Card className="overflow-hidden">

        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-semibold">
            Store List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {stores.length} store
            {stores.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Store
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Location
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
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >
                    No stores found.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr
                    key={store.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {store.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {store.location || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          store.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {store.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditStore(store)
                          }
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleStore(store)
                          }
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                            store.active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {store.active
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

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}