"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";

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
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  const badgeText =
    product.stock === 0
      ? "Out of Stock"
      : product.stock <= 5
      ? "Low Stock"
      : "In Stock";

  return (
    <Card className="p-6">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-semibold text-slate-900">
            {product.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {product.category}
          </p>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}
        >
          {badgeText}
        </span>

      </div>

      {/* Details */}

      <div className="mt-6 space-y-3 text-sm">

        <InfoRow
          label="Barcode"
          value={product.barcode || "-"}
        />

        <InfoRow
          label="SKU"
          value={product.sku}
        />

        <InfoRow
          label="Buying Price"
          value={`KES ${product.costPrice.toFixed(2)}`}
        />

        <InfoRow
          label="Selling Price"
          value={`KES ${product.sellingPrice.toFixed(2)}`}
        />

        <InfoRow
          label="Profit"
          value={`KES ${profit.toFixed(2)}`}
          valueClass="text-emerald-600 font-semibold"
        />

        <InfoRow
          label="Stock"
          value={`${product.stock} ${product.unit}`}
        />

      </div>

      {/* Actions */}

      <div className="grid grid-cols-3 gap-3 mt-8">

        <Link
          href={`/products/${product.id}`}
          className="rounded-xl border border-slate-300 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Edit
        </Link>

        <Link
          href={`/inventory?product=${product.id}`}
          className="rounded-xl bg-slate-900 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Stock
        </Link>

        <button
          onClick={() => onDelete?.(product.id)}
          className="rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>

      </div>

    </Card>
  );
}

function InfoRow({
  label,
  value,
  valueClass = "text-slate-900 font-medium",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">

      <span className="text-slate-500">
        {label}
      </span>

      <span className={valueClass}>
        {value}
      </span>

    </div>
  );
}