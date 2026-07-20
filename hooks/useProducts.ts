"use client";

import { useEffect, useMemo, useState } from "react";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: number;
  inventory: {
    quantity: number;
  }[];
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      setLoading(true);

      const res = await fetch("/api/products");

      const data = await res.json();

      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    const q = search.toLowerCase();

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  return {
    products: filteredProducts,
    loading,
    search,
    setSearch,
    refresh: loadProducts,
  };
}