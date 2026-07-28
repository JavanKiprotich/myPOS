"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";

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
    <div className="space-y-8 max-w-3xl">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Credit Repayment
        </h1>

        <p className="mt-1 text-slate-500">
          Record customer repayments and manage outstanding balances.
        </p>

      </div>

      <Card className="p-6">

        <div className="space-y-6">

          {/* Customer */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
              Customer
            </label>

            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
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

          {/* Outstanding Balance */}

          {selectedCustomer && (

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

              <p className="text-sm text-slate-600">
                Outstanding Balance
              </p>

              <h2 className="mt-2 text-4xl font-bold text-amber-700">
                KES{" "}
                {Number(
                  selectedCustomer.creditAccount?.balance || 0
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>

            </div>

          )}

          {/* Repayment */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
              Repayment Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
              placeholder="Enter amount"
            />

          </div>

          {/* Button */}

          <button
            onClick={repayCredit}
            className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Record Repayment
          </button>

        </div>

      </Card>

    </div>
  );
}