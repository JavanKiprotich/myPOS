"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const STORE_ID = "cmrj98gz70000mneof8jfrrlv";

  useEffect(() => {
    loadProducts();
    loadInventory();
    loadMovements();
  }, []);

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(data);
  }

  async function loadInventory() {
    const response = await fetch("/api/inventory");
    const data = await response.json();
    setInventory(data);
  }

  async function loadMovements() {
    const response = await fetch("/api/inventory/movements");
    const data = await response.json();
    setMovements(data);
  }

  async function stockIn() {
    if (!selectedItem || !quantity) {
      alert("Select a product and enter quantity");
      return;
    }

    const response = await fetch("/api/inventory/stock-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId: STORE_ID,
        productId: selectedItem,
        quantity: Number(quantity),
        reason,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Stock added successfully");

      setSelectedItem("");
      setQuantity("");
      setReason("");

      loadInventory();
      loadMovements();
    } else {
      alert(result.error);
    }
  }

  async function stockOut() {
    if (!selectedItem || !quantity) {
      alert("Select a product and enter quantity");
      return;
    }

    const response = await fetch("/api/inventory/stock-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId: STORE_ID,
        productId: selectedItem,
        quantity: Number(quantity),
        reason,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Stock removed successfully");

      setSelectedItem("");
      setQuantity("");
      setReason("");

      loadInventory();
      loadMovements();
    } else {
      alert(result.error);
    }
  }

  const totalValue = inventory.reduce(
    (sum: number, item: any) =>
      sum + item.quantity * Number(item.product.price),
    0
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Inventory
        </h1>

        <p className="mt-1 text-slate-500">
          Manage stock levels and inventory movements.
        </p>

      </div>

      {/* Top Cards */}

      <div className="grid lg:grid-cols-3 gap-6">

        <Card className="p-6 lg:col-span-2">

          <h2 className="text-xl font-semibold mb-6">
            Stock Adjustment
          </h2>

          <select
            className="w-full rounded-xl border border-slate-300 p-3 mb-4"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">Select Product</option>

            {products.map((product: any) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 p-3 mb-4"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-slate-300 p-3 mb-6"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="flex gap-3">

            <button
              onClick={stockIn}
              className="rounded-xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800"
            >
              Stock In
            </button>

            <button
              onClick={stockOut}
              className="rounded-xl border border-red-200 px-5 py-3 text-red-600 hover:bg-red-50"
            >
              Stock Out
            </button>

          </div>

        </Card>

        <Card className="p-6 flex flex-col justify-center">

          <p className="text-slate-500">
            Total Inventory Value
          </p>

          <h2 className="text-4xl font-bold mt-2">
            KES {totalValue.toLocaleString()}
          </h2>

        </Card>

      </div>

      {/* Inventory */}

      <Card className="overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-semibold">
            Current Inventory
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Value</th>

            </tr>

          </thead>

          <tbody>

            {inventory.map((item: any) => (

              <tr
                key={item.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >

                <td className="p-4 font-medium">
                  {item.product.name}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      item.quantity <= 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.quantity}
                  </span>

                </td>

                <td className="p-4">
                  KES {Number(item.product.price).toLocaleString()}
                </td>

                <td className="p-4 font-medium">
                  KES {(item.quantity * Number(item.product.price)).toLocaleString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </Card>

      {/* History */}

      <Card className="overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-semibold">
            Inventory Movement History
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Quantity</th>
              <th className="text-left p-4">Reason</th>

            </tr>

          </thead>

          <tbody>

            {movements.map((movement: any) => (

              <tr
                key={movement.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >

                <td className="p-4">
                  {new Date(movement.createdAt).toLocaleString()}
                </td>

                <td className="p-4">
                  {movement.product.name}
                </td>

                <td className="p-4 font-medium">
                  {movement.type}
                </td>

                <td className="p-4">
                  {movement.quantity}
                </td>

                <td className="p-4 text-slate-500">
                  {movement.reason || "-"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </Card>

    </div>
  );
}