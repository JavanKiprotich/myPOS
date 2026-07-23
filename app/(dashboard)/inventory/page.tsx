"use client";

import { useEffect, useState } from "react";

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
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Inventory Management
      </h1>

      <div className="border rounded p-4 mb-6">

        <h2 className="text-xl font-semibold mb-4">
          Stock Adjustment
        </h2>

        <select
          className="border p-2 w-full mb-3"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">
            Select Product
          </option>

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
          className="border p-2 w-full mb-3"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={stockIn}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Stock In
          </button>

          <button
            onClick={stockOut}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Stock Out
          </button>
        </div>

      </div>

      <div className="border rounded p-4 mb-6 bg-gray-100">

        <h2 className="text-xl font-semibold">
          Total Stock Value
        </h2>

        <p className="text-2xl font-bold">
          KES {totalValue.toLocaleString()}
        </p>

      </div>

      <h2 className="text-xl font-semibold mb-3">
        Current Inventory
      </h2>

      <table className="w-full border mb-8">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-2">Product</th>

            <th className="border p-2">Quantity</th>

            <th className="border p-2">Unit Price</th>

            <th className="border p-2">Value</th>

          </tr>

        </thead>

        <tbody>

          {inventory.map((item: any) => (

            <tr key={item.id}>

              <td className="border p-2">
                {item.product.name}
              </td>

              <td className="border p-2">

                <span
                  className={`px-3 py-1 rounded-full text-white font-bold ${
                    item.quantity <= 5
                      ? "bg-red-600"
                      : "bg-green-600"
                  }`}
                >
                  {item.quantity}
                </span>

              </td>

              <td className="border p-2">
                KES {Number(item.product.price)}
              </td>

              <td className="border p-2">
                KES {(item.quantity * Number(item.product.price)).toLocaleString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <h2 className="text-xl font-semibold mb-3">
        Inventory Movement History
      </h2>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-2">Date</th>

            <th className="border p-2">Product</th>

            <th className="border p-2">Type</th>

            <th className="border p-2">Quantity</th>

            <th className="border p-2">Reason</th>

          </tr>

        </thead>

        <tbody>

          {movements.map((movement: any) => (

            <tr key={movement.id}>

              <td className="border p-2">
                {new Date(movement.createdAt).toLocaleString()}
              </td>

              <td className="border p-2">
                {movement.product.name}
              </td>

              <td className="border p-2">
                {movement.type}
              </td>

              <td className="border p-2">
                {movement.quantity}
              </td>

              <td className="border p-2">
                {movement.reason}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}