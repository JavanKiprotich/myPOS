import { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea(props: Props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${
        props.className || ""
      }`}
    />
  );
}