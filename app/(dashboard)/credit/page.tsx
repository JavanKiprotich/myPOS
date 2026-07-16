"use client";

import { useEffect, useState } from "react";

export default function CreditPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  }

  async function repayCredit() {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid repayment amount.");
      return;
    }

    const response = await fetch("/api/credit/repay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        amount: Number(amount),
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Repayment recorded successfully.");

      setAmount("");
      loadCustomers();
    } else {
      alert(result.error || "Repayment failed.");
    }
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId
  );

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Credit Repayment
      </h1>

      <div className="mb-5">
        <label className="block mb-2 font-medium">
          Customer
        </label>

        <select
          className="border rounded p-2 w-full"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">
            Select Customer
          </option>

          {customers.map((customer) => (
            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer && (
        <div className="mb-5 rounded border bg-yellow-50 p-4">
          <p className="text-lg">
            Outstanding Balance:
          </p>

          <p className="text-2xl font-bold text-red-600">
            KES{" "}
            {Number(
              selectedCustomer.creditAccount?.balance || 0
            ).toFixed(2)}
          </p>
        </div>
      )}

      <div className="mb-5">
        <label className="block mb-2 font-medium">
          Repayment Amount
        </label>

        <input
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="border rounded p-2 w-full"
          placeholder="Enter amount"
        />
      </div>

      <button
        onClick={repayCredit}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
      >
        Record Repayment
      </button>
    </div>
  );
}