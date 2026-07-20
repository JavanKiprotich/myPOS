"use client";

import { Product } from "@/hooks/useProducts";

interface Props {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAdd,
}: Props) {
  const stock = product.inventory[0]?.quantity ?? 0;

  return (
    <div
      className="rounded-xl border p-4 hover:shadow-md transition cursor-pointer"
      onClick={() => onAdd(product)}
    >
      <h3 className="font-semibold text-lg">
        {product.name}
      </h3>

      <p className="text-sm text-gray-500">
        {product.category}
      </p>

      <p className="mt-2 text-blue-600 font-bold">
        KES {Number(product.price).toFixed(2)}
      </p>

      <p
        className={`mt-2 text-sm ${
          stock > 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        Stock: {stock}
      </p>

      <button
        className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
      >
        Add to Cart
      </button>
    </div>
  );
}