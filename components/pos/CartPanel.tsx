"use client";

interface CartPanelProps {
  cart: any[];
  total: number;

  customers: any[];
  customerId: string;
  setCustomerId: (id: string) => void;

  paymentMethod: string;
  setPaymentMethod: (method: string) => void;

  settings: any;

  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  removeItem: (id: string) => void;

  completeSale: () => void;
}

export default function CartPanel({
  cart,
  total,
  customers,
  customerId,
  setCustomerId,
  paymentMethod,
  setPaymentMethod,
  settings,
  increaseQty,
  decreaseQty,
  removeItem,
  completeSale,
}: CartPanelProps) {
  return (
    <div className="lg:col-span-3 flex flex-col">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-2xl font-bold">
          Current Sale
        </h2>

        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
          {cart.length} Item{cart.length !== 1 ? "s" : ""}
        </span>

      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto">

        {cart.length === 0 ? (

          <div className="border-2 border-dashed rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              🛒
            </div>

            <h3 className="font-semibold text-lg">
              Cart is Empty
            </h3>

            <p className="text-gray-500 mt-2">
              Scan or search a product to begin.
            </p>

          </div>

        ) : (

          cart.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-xl border p-4 shadow-sm"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    KES {Number(item.price).toLocaleString()} each
                  </p>

                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600"
                >
                  ✕
                </button>

              </div>

              <div className="flex justify-between items-center mt-4">

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    −
                  </button>

                  <span className="font-bold text-lg">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    +
                  </button>

                </div>

                <div className="font-bold text-lg">
                  KES {(Number(item.price) * item.quantity).toLocaleString()}
                </div>

              </div>

            </div>

          ))

        )}

      </div>

      <div className="mt-6 bg-white rounded-xl border p-5">

        <label className="block font-medium mb-2">
          Customer
        </label>

        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full border rounded-lg p-3"
        >

          <option value="">
            Walk-in Customer
          </option>

          {customers.map((customer) => (

            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </option>

          ))}

        </select>

      </div>

      <div className="mt-5 bg-white rounded-xl border p-5">

        <label className="block font-medium mb-3">
          Payment Method
        </label>

        <div className="grid grid-cols-3 gap-3">

          {settings?.enableCash && (
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`rounded-xl p-3 ${
                paymentMethod === "CASH"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              💵
              <div>Cash</div>
            </button>
          )}

          {settings?.enableMpesa && (
            <button
              onClick={() => setPaymentMethod("MPESA")}
              className={`rounded-xl p-3 ${
                paymentMethod === "MPESA"
                  ? "bg-green-700 text-white"
                  : "bg-slate-100"
              }`}
            >
              📱
              <div>M-Pesa</div>
            </button>
          )}

          {settings?.enableCredit && (
            <button
              onClick={() => setPaymentMethod("CREDIT")}
              className={`rounded-xl p-3 ${
                paymentMethod === "CREDIT"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              💳
              <div>Credit</div>
            </button>
          )}

        </div>

      </div>

      <div className="mt-6 bg-slate-900 rounded-2xl p-6 text-white">

        <div className="flex justify-between text-slate-300">

          <span>Total</span>

          <span>KES {total.toLocaleString()}</span>

        </div>

        <button
          onClick={completeSale}
          disabled={cart.length === 0}
          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-xl py-4 font-bold text-lg transition"
        >
          Complete Sale
        </button>

      </div>

    </div>
  );
}