"use client";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  show: boolean;
};

export default function Toast({
  message,
  type = "success",
  show,
}: ToastProps) {
  if (!show) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 rounded-lg px-5 py-3 text-white shadow-lg transition ${
        type === "success"
          ? "bg-green-600"
          : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}