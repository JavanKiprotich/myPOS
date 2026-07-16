"use client";

import { useEffect, useState } from "react";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Customers
      </h1>

      <form
        onSubmit={addCustomer}
        className="space-y-3 mb-8"
      >
        <input
          className="border p-2 w-full"
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          type="submit"
        >
          Add Customer
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Credit Balance</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer: any) => (
            <tr key={customer.id}>
             <td className="p-2">
  <a
    href={`/customers/${customer.id}`}
    className="text-blue-600 underline"
  >
    {customer.name}
  </a>
</td>
              <td className="p-2">{customer.phone}</td>
              <td className="p-2">
                KES {customer.creditAccount?.balance ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}