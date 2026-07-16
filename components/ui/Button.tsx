import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: Props) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50 ${
        props.className || ""
      }`}
    />
  );
}