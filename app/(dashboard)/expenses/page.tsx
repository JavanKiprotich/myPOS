"use client";

import { useEffect, useState } from "react";

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
    const response = await fetch(
      "/api/expenses"
    );

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
    <div className="p-6 max-w-4xl">

      <h1 className="text-3xl font-bold mb-6">
        Expenses
      </h1>

      <div className="border rounded p-4 mb-6">

        <h2 className="text-xl font-semibold mb-4">
          Record Expense
        </h2>

        <select
          className="border p-2 w-full mb-3"
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
          className="border p-2 w-full mb-3"
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
          className="border p-2 w-full mb-3"
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
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Expense
        </button>

      </div>

      <h2 className="text-xl font-semibold mb-3">
        Expense History
      </h2>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-2">
              Date
            </th>

            <th className="border p-2">
              Category
            </th>

            <th className="border p-2">
              Description
            </th>

            <th className="border p-2">
              Amount
            </th>

          </tr>

        </thead>

        <tbody>

          {expenses.map((expense) => (

            <tr key={expense.id}>

              <td className="border p-2">
                {new Date(
                  expense.createdAt
                ).toLocaleDateString()}
              </td>

              <td className="border p-2">
                {expense.category}
              </td>

              <td className="border p-2">
                {expense.description}
              </td>

              <td className="border p-2">
                KES{" "}
                {Number(
                  expense.amount
                ).toLocaleString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}