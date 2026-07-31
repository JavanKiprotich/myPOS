"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number | string;
  createdAt: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(
    []
  );

  const [category, setCategory] =
    useState("Electricity");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

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

  async function loadExpenses() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/expenses",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            "Failed to load expenses.",
          "error"
        );

        setExpenses([]);
        return;
      }

      setExpenses(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load expenses:",
        error
      );

      setExpenses([]);

      showToast(
        "Failed to load expenses.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function saveExpense() {
    const cleanDescription =
      description.trim();

    const numericAmount =
      Number(amount);

    if (!cleanDescription) {
      showToast(
        "Enter an expense description.",
        "error"
      );
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      showToast(
        "Enter a valid expense amount.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

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
            description:
              cleanDescription,
            amount: numericAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            "Failed to save expense.",
          "error"
        );
        return;
      }

      setDescription("");
      setAmount("");

      await loadExpenses();

      showToast(
        "Expense saved successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Something went wrong while saving the expense.",
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
          Expenses
        </h1>

        <p className="mt-1 text-slate-500">
          Record and monitor business expenses.
        </p>
      </div>

      {/* Expense Form */}
      <Card className="p-6">

        <h2 className="mb-6 text-xl font-semibold">
          Record Expense
        </h2>

        <div className="space-y-4">

          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            value={category}
            disabled={saving}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="Electricity">
              Electricity
            </option>

            <option value="Rent">
              Rent
            </option>

            <option value="Transport">
              Transport
            </option>

            <option value="Salaries">
              Salaries
            </option>

            <option value="Supplies">
              Supplies
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

            <option value="Miscellaneous">
              Miscellaneous
            </option>
          </select>

          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            placeholder="Description"
            value={description}
            disabled={saving}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            placeholder="Amount"
            value={amount}
            disabled={saving}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

          <button
            type="button"
            onClick={saveExpense}
            disabled={
              saving ||
              !description.trim() ||
              !amount
            }
            className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving
              ? "Saving..."
              : "Save Expense"}
          </button>

        </div>
      </Card>

      {/* Expense History */}
      <Card className="overflow-hidden">

        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-semibold">
            Expense History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {expenses.length} expense
            {expenses.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
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

              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
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
                ))
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