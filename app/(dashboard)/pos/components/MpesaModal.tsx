"use client";

type MpesaModalProps = {
  show: boolean;
  total: number;
  mpesaPhone: string;
  setMpesaPhone: (phone: string) => void;
  onCancel: () => void;
  onSend: () => void;
waitingForMpesa: boolean;


};

export default function MpesaModal({
  show,
  total,
  mpesaPhone,
  setMpesaPhone,
  onCancel,
  onSend,
  waitingForMpesa
}: MpesaModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-96 max-w-[95vw] p-6">

        <h2 className="text-2xl font-bold mb-4">
          M-PESA Payment
        </h2>

        <label className="block mb-2 font-medium">
          Customer Phone Number
        </label>

        <input
          type="text"
          value={mpesaPhone}
          onChange={(e) => setMpesaPhone(e.target.value)}
          placeholder="07XXXXXXXX"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <div className="font-semibold text-lg mb-6">
          Amount: KES {total.toLocaleString()}
        </div>



{waitingForMpesa && (
  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
    Waiting for customer payment...
  </div>
)}




        <div className="flex gap-3">








          <button
            onClick={onCancel}
            className="flex-1 border rounded-lg py-3"
          >
            Cancel
          </button>

          <button
            onClick={onSend}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3"
          >
            Send STK Push
          </button>

        </div>

      </div>

    </div>
  );
}