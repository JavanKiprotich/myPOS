"use client";

import { Product } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
}

export default function ProductGrid({
  products,
  onAdd,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}