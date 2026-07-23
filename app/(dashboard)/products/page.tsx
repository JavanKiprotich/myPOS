"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";

import {
  playBeep,
  playError,
  playSuccess,
} from "@/lib/sounds";

export default function ProductsPage() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    price: "",
    barcode: "",
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

  const [toast, setToast] = useState({
  show: false,
  message: "",
  type: "success" as "success" | "error",
});

function playBeep() {
  const audio = new Audio("/sounds/beep.mp3");
  audio.play().catch(() => {});
}

function playError() {
  new Audio("/sounds/error.mp3").play().catch(() => {});
}

function playSuccess() {
  new Audio("/sounds/success.mp3").play().catch(() => {});
}

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  try {
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

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error || "Failed to add product.",
        "error"
      );
playError();

      return;
    }

     

    showToast(
      "Product added successfully.",
      "success"
    );

    playSuccess();

    setForm({
      name: "",
      sku: "",
      category: "",
      unit: "",
      price: "",
      barcode: "",
    });

  } catch (error) {
    console.error(error);

    showToast(
      "Something went wrong.",
      "error"
    );
playError();

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


        <div>
  

  <div>
  <label className="mb-1 block text-sm font-medium">
    Barcode
  </label>

  <input
    type="text"
    className="w-full rounded-lg border p-3"
    value={form.barcode}
    onChange={(e) =>
      setForm({
        ...form,
        barcode: e.target.value,
      })
    }
    placeholder="Scan or enter barcode"
    autoComplete="off"
    autoFocus
  />
</div>
</div>
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


      <Toast
  show={toast.show}
  message={toast.message}
  type={toast.type}
/>
    </div>
  );
}