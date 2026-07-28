import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className,
  value,
  ...props
}: Props) {
  return (
    <input
      {...props}
      value={value ?? ""}
      className={`w-full rounded-lg border border-slate-300 px-3 py-2
      focus:border-slate-500 focus:ring-2 focus:ring-slate-200
      outline-none ${className ?? ""}`}
    />
  );
}