"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";

type Customer = {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
  creditAccount?: {
    balance: number | string | null;
  } | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(
    []
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
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

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2500);
  }

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/customers",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load customers:",
          data
        );

        setCustomers([]);

        showToast(
          data.error ||
            "Failed to load customers.",
          "error"
        );

        return;
      }

      setCustomers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );

      setCustomers([]);

      showToast(
        "Failed to load customers.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function addCustomer(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      showToast(
        "Customer name is required.",
        "error"
      );
      return;
    }

    if (!cleanPhone) {
      showToast(
        "Phone number is required.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            "Failed to add customer.",
          "error"
        );

        return;
      }

      setName("");
      setPhone("");

      await loadCustomers();

      showToast(
        "Customer added successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Something went wrong while adding the customer.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-1 text-slate-500">
          Manage your customers and their credit accounts.
        </p>
      </div>

      {/* Add Customer */}
      <Card className="p-6">

        <h2 className="mb-6 text-xl font-semibold">
          Add Customer
        </h2>

        <form
          onSubmit={addCustomer}
          className="grid gap-4 md:grid-cols-3"
        >
          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            disabled={saving}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            disabled={saving}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              saving ||
              !name.trim() ||
              !phone.trim()
            }
            className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving
              ? "Adding..."
              : "Add Customer"}
          </button>
        </form>

      </Card>

      {/* Customer List */}
      <Card className="overflow-hidden">

        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-semibold">
            Customer List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {customers.length} customer
            {customers.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Name
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Phone
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Credit Balance
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-slate-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const balance = Number(
                    customer.creditAccount
                      ?.balance ?? 0
                  );

                  return (
                    <tr
                      key={customer.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-medium text-slate-900 hover:text-slate-700"
                        >
                          {customer.name}
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {customer.phone || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            balance > 0
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          KES{" "}
                          {balance.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </Card>

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}