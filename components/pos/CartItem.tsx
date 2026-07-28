"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: any;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const price = Number(item.product.price);
  const total = price * item.quantity;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">

      <div className="flex justify-between items-start">

        <div>

          <h3 className="font-semibold text-slate-900">
            {item.product.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            KES {price.toLocaleString()} each
          </p>

        </div>

        <button
          onClick={onRemove}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
        >
          <Trash2 size={18} />
        </button>

      </div>

      <div className="mt-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <button
            onClick={onDecrease}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            <Minus size={16} />
          </button>

          <span className="w-8 text-center font-semibold">
            {item.quantity}
          </span>

          <button
            onClick={onIncrease}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            <Plus size={16} />
          </button>

        </div>

        <span className="text-lg font-bold text-slate-900">
          KES {total.toLocaleString()}
        </span>

      </div>

    </div>
  );
}