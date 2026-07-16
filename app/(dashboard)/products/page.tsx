"use client";

import { useState } from "react";

export default function ProductsPage() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    price: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    if (response.ok) {
      alert("Product added successfully");

      setForm({
        name: "",
        sku: "",
        category: "",
        unit: "",
        price: "",
      });
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Add Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          className="border p-2 w-full"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="SKU"
          value={form.sku}
          onChange={(e) =>
            setForm({
              ...form,
              sku: e.target.value,
            })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Unit"
          value={form.unit}
          onChange={(e) =>
            setForm({
              ...form,
              unit: e.target.value,
            })
          }
        />

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          type="submit"
        >
          Save Product
        </button>
      </form>
    </div>
  );
}