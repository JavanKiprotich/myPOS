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

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="text-gray-500">
            Manage your inventory.
          </p>

        </div>

        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </Link>

      </div>

      <input
        type="text"
        placeholder="Search by name, SKU or barcode..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="border rounded-xl p-4 w-full"
      />

      {loading ? (
        <div className="text-center py-20">
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">

          <div className="text-6xl mb-4">
            📦
          </div>

          <h2 className="text-xl font-semibold">
            No products found
          </h2>

          <p className="text-gray-500 mt-2">
            Start by adding your first product.
          </p>

          <Link
            href="/products/new"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Add Product
          </Link>

        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

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