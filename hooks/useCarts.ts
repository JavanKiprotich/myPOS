"use client";

import { useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

type Product = {
  productId: string;
  name: string;
  sku: string;
  price: number;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);

  function addItem(product: Product) {
    setItems((current) => {
      const existing = current.find(
        (item) => item.productId === product.productId
      );

      if (existing) {
        return current.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
  }

  function removeItem(productId: string) {
    setItems((current) =>
      current.filter((item) => item.productId !== productId)
    );
  }

  function increase(productId: string) {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.price,
            }
          : item
      )
    );
  }

  function decrease(productId: string) {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                subtotal: (item.quantity - 1) * item.price,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price,
            }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
    setDiscount(0);
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);

  return {
    items,

    addItem,
    removeItem,

    increase,
    decrease,
    updateQuantity,

    clearCart,

    subtotal,
    discount,
    setDiscount,
    total,
  };
}