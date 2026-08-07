"use client";

type Props = {
  show: boolean;
  amount: number;
  code: string;
  setCode: (v: string) => void;
  onVerify: () => void;
  onCancel: () => void;
};

export default function ManualMpesaModal({
  show,
  amount,
  code,
  setCode,
  onVerify,
  onCancel,
}: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-xl p-6 w-96">

        <h2 className="text-xl font-bold mb-4">
          Manual M-PESA Payment
        </h2>

        <p className="mb-4">
          Amount:
          <strong>
            KES {amount.toLocaleString()}
          </strong>
        </p>

        <input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.toUpperCase())
          }
          placeholder="e.g. TGH56JK89P"
          className="border rounded-lg p-3 w-full mb-5"
        />

        <div className="flex gap-3">

          <button
            onClick={onCancel}
            className="flex-1 border rounded-lg py-3"
          >
            Cancel
          </button>

          <button
            onClick={onVerify}
            className="flex-1 bg-green-600 text-white rounded-lg py-3"
          >
            Verify Payment
          </button>

        </div>

      </div>

    </div>
  );
}