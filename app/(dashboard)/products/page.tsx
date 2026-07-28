"use client";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
};

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch("/api/products");
      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.sku
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (product.barcode || "").includes(search)
      );
    });
  }, [products, search]);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-slate-500">
            Manage your inventory.
          </p>

        </div>

        <Link
          href="/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          + Add Product
        </Link>

      </div>

      {/* Search */}

      <input
        type="text"
        placeholder="Search by name, SKU or barcode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

      {/* Content */}

      {loading ? (

        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">

          <p className="text-slate-500 text-lg">
            Loading products...
          </p>

        </div>

      ) : filteredProducts.length === 0 ? (

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <div className="mb-4 text-6xl">
            📦
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">
            No products found
          </h2>

          <p className="mt-2 text-slate-500">
            Start by adding your first product.
          </p>

          <Link
            href="/products/new"
            className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Add Product
          </Link>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={deleteProduct}
            />
          ))}

        </div>

      )}

    </div>
  );
}