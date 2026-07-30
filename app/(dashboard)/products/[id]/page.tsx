"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "../components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      const response = await fetch(
        `/api/products/${productId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load product:",
          data
        );

        router.push("/products");
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error(
        "Product loading error:",
        error
      );

      router.push("/products");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-slate-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-500">
          Product not found.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Edit Product
        </h1>

        <p className="mt-2 text-slate-500">
          Update {product.name}.
        </p>
      </div>

      <ProductForm
        product={product}
        mode="edit"
      />

    </div>
  );
}