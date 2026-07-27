"use client";

import { useMemo, useState } from "react";
import CameraScanner from "../../pos/components/CameraScanner";
import Toast from "@/components/ui/Toast";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
} from "@/lib/constants/product";

export default function ProductForm() {
  const [showScanner, setShowScanner] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: PRODUCT_CATEGORIES[0],
    unit: PRODUCT_UNITS[0],
    costPrice: "",
    sellingPrice: "",
  });

  function showToast(
    message: string,
    type: "success" | "error"
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

  const cost = Number(form.costPrice || 0);
  const selling = Number(form.sellingPrice || 0);

  const profit = selling - cost;

  const margin = useMemo(() => {
    if (!cost) return 0;

    return ((profit / cost) * 100).toFixed(2);
  }, [cost, profit]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error,
          "error"
        );

        setLoading(false);

        return;
      }

      showToast(
        "Product added successfully.",
        "success"
      );

      setForm({
        name: "",
        sku: "",
        barcode: "",
        category: PRODUCT_CATEGORIES[0],
        unit: PRODUCT_UNITS[0],
        costPrice: "",
        sellingPrice: "",
      });

    } catch {
      showToast(
        "Something went wrong.",
        "error"
      );
    }

    setLoading(false);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-5"
      >

        <div>

          <label className="font-medium">
            Product Name
          </label>

          <input
            className="border rounded-lg p-3 w-full mt-1"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="font-medium">
            Barcode
          </label>

          <div className="flex gap-2 mt-1">

            <input
              className="border rounded-lg p-3 flex-1"
              value={form.barcode}
              onChange={(e) =>
                setForm({
                  ...form,
                  barcode:
                    e.target.value,
                })
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowScanner(true)
              }
              className="bg-blue-600 text-white px-5 rounded-lg"
            >
              📷
            </button>

          </div>

        </div>

        <div>

          <label className="font-medium">
            SKU
          </label>

          <input
            className="border rounded-lg p-3 w-full mt-1"
            value={form.sku}
            onChange={(e) =>
              setForm({
                ...form,
                sku: e.target.value,
              })
            }
          />

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div>

            <label className="font-medium">
              Category
            </label>

            <select
              className="border rounded-lg p-3 w-full mt-1"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >

              {PRODUCT_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

          <div>

            <label className="font-medium">
              Unit
            </label>

            <select
              className="border rounded-lg p-3 w-full mt-1"
              value={form.unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  unit: e.target.value,
                })
              }
            >

              {PRODUCT_UNITS.map(
                (unit) => (
                  <option
                    key={unit}
                  >
                    {unit}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div>

            <label className="font-medium">
              Buying Price
            </label>

            <input
              type="number"
              className="border rounded-lg p-3 w-full mt-1"
              value={form.costPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  costPrice:
                    e.target.value,
                })
              }
            />

          </div>

          <div>

            <label className="font-medium">
              Selling Price
            </label>

            <input
              type="number"
              className="border rounded-lg p-3 w-full mt-1"
              value={form.sellingPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  sellingPrice:
                    e.target.value,
                })
              }
            />

          </div>

        </div>

        <div className="bg-gray-100 rounded-lg p-4">

          <div className="flex justify-between">

            <span>Profit</span>

            <span className="font-bold text-green-700">
              KES {profit.toFixed(2)}
            </span>

          </div>

          <div className="flex justify-between mt-2">

            <span>Margin</span>

            <span className="font-bold">
              {margin}%
            </span>

          </div>

        </div>

        <button
          disabled={loading}
          className="bg-black text-white w-full rounded-lg py-3"
        >
          {loading
            ? "Saving..."
            : "Save Product"}
        </button>

      </form>

      {showScanner && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <CameraScanner
              onScan={(barcode) => {
                setForm((prev) => ({
                  ...prev,
                  barcode,
                }));

                setShowScanner(false);
              }}
            />

            <button
              onClick={() =>
                setShowScanner(false)
              }
              className="w-full border rounded-lg py-3 mt-4"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}