"use client";

import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
};

type Props = {
  product: Product;
  onDelete?: (id: string) => void;
};

export default function ProductCard({
  product,
  onDelete,
}: Props) {
  const profit =
    product.sellingPrice - product.costPrice;

  const badge =
    product.stock === 0
      ? "bg-red-100 text-red-700"
      : product.stock <= 5
      ? "bg-orange-100 text-orange-700"
      : "bg-green-100 text-green-700";

  const badgeText =
    product.stock === 0
      ? "Out of Stock"
      : product.stock <= 5
      ? "Low Stock"
      : "In Stock";

  return (
    <div className="bg-white rounded-xl shadow border p-6 hover:shadow-lg transition">

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-xl font-bold">
            {product.name}
          </h2>

          <p className="text-gray-500">
            {product.category}
          </p>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${badge}`}
        >
          {badgeText}
        </span>

      </div>

      <div className="mt-5 space-y-2 text-sm">

        <div className="flex justify-between">
          <span>Barcode</span>
          <span>{product.barcode || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span>SKU</span>
          <span>{product.sku}</span>
        </div>

        <div className="flex justify-between">
          <span>Buying Price</span>
          <span className="font-medium">
            KES {product.costPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Selling Price</span>
          <span className="font-medium">
            KES {product.sellingPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Profit</span>
          <span className="text-green-600 font-bold">
            KES {profit.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Stock</span>
          <span>
            {product.stock} {product.unit}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">

        <Link
          href={`/products/${product.id}`}
          className="bg-blue-600 text-white rounded-lg py-2 text-center hover:bg-blue-700"
        >
          ✏ Edit
        </Link>

        <Link
          href={`/inventory?product=${product.id}`}
          className="bg-green-600 text-white rounded-lg py-2 text-center hover:bg-green-700"
        >
          📦 Stock
        </Link>

        <button
          onClick={() =>
            onDelete?.(product.id)
          }
          className="bg-red-600 text-white rounded-lg py-2 hover:bg-red-700"
        >
          🗑 Delete
        </button>

      </div>

    </div>
  );
}