"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);

  const [category, setCategory] =
    useState("Electricity");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const response = await fetch("/api/expenses");

    const data = await response.json();

    setExpenses(data);
  }

  async function saveExpense() {
    if (!description || !amount) {
      alert("Fill all fields");
      return;
    }

    const response = await fetch(
      "/api/expenses",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          category,
          description,
          amount,
        }),
      }
    );

    if (response.ok) {
      alert("Expense saved");

      setDescription("");
      setAmount("");

      loadExpenses();
    } else {
      alert("Failed to save expense");
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Expenses
        </h1>

        <p className="mt-1 text-slate-500">
          Record and monitor business expenses.
        </p>

      </div>

      {/* Expense Form */}

      <Card className="p-6">

        <h2 className="text-xl font-semibold mb-6">
          Record Expense
        </h2>

        <div className="space-y-4">

          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option>
              Electricity
            </option>

            <option>
              Miscellaneous
            </option>

          </select>

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
          />

          <button
            onClick={saveExpense}
            className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Save Expense
          </button>

        </div>

      </Card>

      {/* Expense History */}

      <Card className="overflow-hidden">

        <div className="border-b border-slate-200 p-6">

          <h2 className="text-xl font-semibold">
            Expense History
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left font-semibold text-slate-700">
                Date
              </th>

              <th className="px-6 py-4 text-left font-semibold text-slate-700">
                Category
              </th>

              <th className="px-6 py-4 text-left font-semibold text-slate-700">
                Description
              </th>

              <th className="px-6 py-4 text-left font-semibold text-slate-700">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {expenses.map((expense) => (

              <tr
                key={expense.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >

                <td className="px-6 py-4 text-slate-600">
                  {new Date(
                    expense.createdAt
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {expense.category}
                  </span>

                </td>

                <td className="px-6 py-4">
                  {expense.description}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-900">
                  KES{" "}
                  {Number(
                    expense.amount
                  ).toLocaleString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </Card>

    </div>
  );
}