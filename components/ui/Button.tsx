"use client";

import { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-700 text-white hover:bg-slate-800 shadow-sm",

        secondary:
          "border border-gray-300 bg-white text-slate-700 hover:bg-gray-50",

        success:
          "bg-emerald-600 text-white hover:bg-emerald-700",

        danger:
          "bg-rose-600 text-white hover:bg-rose-700",

        warning:
          "bg-amber-500 text-white hover:bg-amber-600",

        ghost:
          "text-slate-600 hover:bg-slate-100",
      },

      size: {
        sm: "h-9 px-3 text-sm",

        md: "h-11 px-5",

        lg: "h-12 px-6 text-lg",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}