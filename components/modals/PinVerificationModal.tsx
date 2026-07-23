"use client";

import { useEffect, useState } from "react";

interface PinVerificationModalProps {
  open: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onCancel: () => void;
  onVerify: (pin: string) => void;
}

export default function PinVerificationModal({
  open,
  title = "Manager Authorization",
  message = "Enter your PIN to continue.",
  loading = false,
  onCancel,
  onVerify,
}: PinVerificationModalProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (open) {
      setPin("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold">{title}</h2>

        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-8 flex justify-center gap-3">
  {[0, 1, 2, 3, 4, 5].map((i) => (
    <div
      key={i}
      className={`h-4 w-4 rounded-full border-2 transition-all ${
        pin.length > i
          ? "bg-blue-600 border-blue-600"
          : "border-gray-300"
      }`}
    />
  ))}
</div>

<div className="mt-8 grid grid-cols-3 gap-3">

  {[1,2,3,4,5,6,7,8,9].map((n)=>(
    <button
      key={n}
      onClick={()=>{
        if(pin.length<6){
          setPin(pin+n);
        }
      }}
      className="rounded-xl border p-5 text-2xl font-bold hover:bg-gray-100 active:scale-95 transition"
    >
      {n}
    </button>
  ))}

  <button
    onClick={()=>
      setPin(pin.slice(0,-1))
    }
    className="rounded-xl border p-5 text-xl hover:bg-red-50"
  >
    ⌫
  </button>

  <button
    onClick={()=>{
      if(pin.length<6){
        setPin(pin+"0");
      }
    }}
    className="rounded-xl border p-5 text-2xl font-bold hover:bg-gray-100"
  >
    0
  </button>

  <button
    disabled={loading || pin.length<4}
    onClick={()=>onVerify(pin)}
    className="rounded-xl bg-green-600 text-white text-2xl disabled:opacity-40"
  >
    ✓
  </button>

</div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onCancel}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            disabled={loading || pin.length < 4}
            onClick={() => onVerify(pin)}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}