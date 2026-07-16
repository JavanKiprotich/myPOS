import { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select(props: Props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${
        props.className || ""
      }`}
    >
      {props.children}
    </select>
  );
}