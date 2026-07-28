"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function loadCustomers() {
    const response = await fetch("/api/customers");
    const data = await response.json();
    setCustomers(data);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
      }),
    });

    setName("");
    setPhone("");

    loadCustomers();
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

        <h2 className="text-xl font-semibold mb-6">
          Add Customer
        </h2>

        <form
          onSubmit={addCustomer}
          className="grid gap-4 md:grid-cols-3"
        >

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Add Customer
          </button>

        </form>

      </Card>

      {/* Customer List */}

      <Card className="overflow-hidden">

        <div className="border-b border-slate-200 p-6">

          <h2 className="text-xl font-semibold">
            Customer List
          </h2>

        </div>

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

            {customers.map((customer: any) => (

              <tr
                key={customer.id}
                className="border-t border-slate-100 hover:bg-slate-50"
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

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">

                    KES{" "}
                    {Number(
                      customer.creditAccount?.balance ?? 0
                    ).toLocaleString()}

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </Card>

    </div>
  );
}