"use client";

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/ui/Toast";
import ProductPanel from "./components/ProductPanel";
import MpesaModal from "./components/MpesaModal";
import CameraScanner from "./components/CameraScanner";


import {
  playBeep,
  playError,
  playSuccess,
} from "@/lib/sounds";



export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
const [mpesaPhone, setMpesaPhone] = useState("");
const [settings, setSettings] = useState<any>(null);
const [barcode, setBarcode] = useState("");
const barcodeRef = useRef<HTMLInputElement>(null);

const [toast, setToast] = useState({
  show: false,
  message: "",
  type: "success" as "success" | "error",
});

const [showScanner, setShowScanner] = useState(false);


 useEffect(() => {
  loadUser();
  loadProducts();
  loadSettings();
}, []);

useEffect(() => {
  barcodeRef.current?.focus();
}, []);

useEffect(() => {
  if (settings?.defaultPaymentMethod) {
    setPaymentMethod(settings.defaultPaymentMethod);
  }
}, [settings]);

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(data);
  }

  async function loadCustomers() {
    const response = await fetch("/api/customers");
    const data = await response.json();
    setCustomers(data);
  }

  async function loadUser() {
  const response = await fetch("/api/auth/me");

  if (response.ok) {
    const data = await response.json();
    setUser(data);
  }
}

async function loadSettings() {
  try {
    const response = await fetch("/api/settings");

    if (response.ok) {
      const data = await response.json();
      setSettings(data);
    }
  } catch (error) {
    console.error(error);
  }
}

  async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  window.location.href = "/login";
}
  function addToCart(product: any) {
  const stock = product.inventory?.[0]?.quantity ?? 0;

  if (stock <= 0) {
    playError();

    showToast(
      `${product.name} is out of stock.`,
      "error"
    );

    return;
  }

  const existing = cart.find(
    (item) => item.id === product.id
  );

  if (existing) {

    if (existing.quantity >= stock) {
      playError();

      showToast(
        `Only ${stock} ${product.name} available.`,
        "error"
      );

      return;
    }

    setCart(
      cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );

    return;
  }

  setCart([
    ...cart,
    {
      ...product,
      quantity: 1,
    },
  ]);

  playSuccess();
}


 function playBeep() {
  new Audio("/sounds/beep.mp3").play().catch(() => {});
}

function playError() {
  new Audio("/sounds/error.mp3").play().catch(() => {});
}

function playSuccess() {
  new Audio("/sounds/success.mp3").play().catch(() => {});
}


function focusBarcode() {
  setTimeout(() => {
    barcodeRef.current?.focus();
  }, 100);
}





function showToast(
  message: string,
  type: "success" | "error" = "success"
) {
  setToast({
    show: true,
    message,
    type,
  });

  setTimeout(() => {
    setToast({
      show: false,
      message: "",
      type: "success",
    });
  }, 2500);
}

  async function scanBarcode(code: string) {
  const cleanCode = code.trim();

  if (!cleanCode) return;

  try {
    const response = await fetch(
      `/api/products/barcode/${encodeURIComponent(cleanCode)}`
    );

    if (!response.ok) {
      showToast(
        `Unknown barcode: ${cleanCode}`,
        "error"
      );

      setBarcode("");
      barcodeRef.current?.focus();

      return;
    }

    const product = await response.json();

    addToCart(product);

    playBeep();

    setBarcode("");

    barcodeRef.current?.focus();

    focusBarcode();

  } catch (error) {
    console.error(error);

    showToast(
      "Barcode scan failed.",
      "error"
    );

    playError();

  }
}
  function increaseQty(id: string) {
  setCart((currentCart) =>
    currentCart.map((item) => {

      if (item.id !== id) return item;

      const stock =
        item.inventory?.[0]?.quantity ?? 0;

      if (item.quantity >= stock) {
        playError();

        showToast(
          `Only ${stock} ${item.name} available.`,
          "error"
        );

        return item;
      }

      return {
        ...item,
        quantity: item.quantity + 1,
      };

    })
  );
}

  function decreaseQty(id: string) {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity - 1
              ),
            }
          : item
      )
    );
  }

  function removeItem(id: string) {
    setCart(
      cart.filter((item) => item.id !== id)
    );
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) * item.quantity,
    0
  );

  const filteredProducts = products.filter(
    (product: any) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

function formatMpesaPhone(phone: string) {
  let formatted = phone.trim();

  if (formatted.startsWith("+254")) {
    formatted = formatted.substring(1);
  }

  if (formatted.startsWith("0")) {
    formatted = "254" + formatted.substring(1);
  }

  if (!/^254(7|1)\d{8}$/.test(formatted)) {
    return null;
  }

  return formatted;
}


  async function completeSale() {

  if (paymentMethod === "MPESA") {
    setShowMpesaModal(true);
    return;
  }

  if (
    paymentMethod === "CREDIT" &&
    !customerId
  ) {
    playError();

    showToast(
      "Select a customer before making a credit sale.",
      "error"
    );

    return;
  }

  if (cart.length === 0) {
    playError();

    showToast(
      "Cart is empty.",
      "error"
    );

    return;
  }

  try {

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId: user.storeId,
        cashierId: user.id,
        customerId: customerId || null,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      playError();

      showToast(
        data.error || "Failed to complete sale.",
        "error"
      );

      return;
    }

    playSuccess();

    showToast(
      "Sale completed successfully.",
      "success"
    );

    setCart([]);

    setTimeout(() => {
      window.location.href = `/receipt/${data.id}`;
    }, 500);

  } catch (error) {
    console.error(error);

    playError();

    showToast(
      "Failed to complete sale.",
      "error"
    );
  }
}
async function sendStkPush() {
  const phone = formatMpesaPhone(mpesaPhone);

  if (!phone) {
    alert("Enter a valid Kenyan phone number.");
    return;
  }

  const response = await fetch("/api/mpesa/stkpush", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      amount: total,
    }),
  });

  const data = await response.json();

 alert(JSON.stringify(data, null, 2));
}
  
  return (
    <div className="min-h-screen bg-gray-50 p-3 lg:p-6">

      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        Liquor POS
      </h1>
       {user && (
      <p className="text-sm lg:text-base text-gray-600 mb-4">
        Welcome, {user.name} ({user.role})
      </p>
    )}
    

      <div className="grid grid-cols-2 gap-6">

       <ProductPanel
  barcode={barcode}
  setBarcode={setBarcode}
  barcodeRef={barcodeRef}
  scanBarcode={scanBarcode}
  search={search}
  setSearch={setSearch}
  filteredProducts={filteredProducts}
  addToCart={addToCart}
  focusBarcode={focusBarcode}

   onOpenCamera={() => setShowScanner(true)}
/>

{/* CART */}

              

         

       {/* CART */}

<div className="lg:col-span-3 flex flex-col">

          <h2 className="font-bold text-xl mb-4">
            Cart
          </h2>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">

            {cart.map((item: any) => (

              <div
                key={item.id}
               className="border rounded-lg px-4 py-2 text-lg"
              >

                <div className="font-semibold">
                  {item.name}
                </div>

                <div className="flex items-center gap-2 mt-2">

                  <button
                    onClick={() =>
                      decreaseQty(item.id)
                    }
                    className="border rounded-lg px-4 py-2 text-lg"
                  >
                    -
                  </button>

                  <span>
                    Qty: {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQty(item.id)
                    }
                    className="border rounded-lg px-4 py-2 text-lg"
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      removeItem(item.id)
                    }
                    className="border rounded-lg px-4 py-2 ml-auto text-red-600"
                  >
                    Remove
                  </button>

                </div>

                <div className="mt-2 font-medium">
                  KES{" "}
                  {(
                    Number(item.price) *
                    item.quantity
                  ).toLocaleString()}
                </div>

              </div>

            ))}

          </div>

          <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">

            <label className="block mb-2 font-medium">
              Customer
            </label>

            <select
              className="w-full border rounded-lg p-3"
              value={customerId}
              onChange={(e) =>
                setCustomerId(
                  e.target.value
                )
              }
            >

              <option value="">
                Walk-in Customer
              </option>

              {customers.map(
                (customer: any) => (

                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>

                )
              )}

            </select>

          </div>

          <div className="mt-6">

            <label className="block mb-2 font-medium">
              Payment Method
            </label>

            <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  className="w-full border rounded-lg p-3"
>
  {settings?.enableCash && (
    <option value="CASH">Cash</option>
  )}

  {settings?.enableMpesa && (
    <option value="MPESA">M-Pesa</option>
  )}

  {settings?.enableCredit && (
    <option value="CREDIT">Credit</option>
  )}
</select>

          </div>

         <div className="mt-6">
           <div className="text-gray-500">
  TOTAL
</div>

<div className="text-4xl lg:text-5xl font-bold">
  KES {total.toLocaleString()}
</div>

<MpesaModal
  show={showMpesaModal}
  total={total}
  mpesaPhone={mpesaPhone}
  setMpesaPhone={setMpesaPhone}
  onCancel={() => setShowMpesaModal(false)}
  onSend={sendStkPush}
/>

{showScanner && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl p-6 w-full max-w-md">

      <CameraScanner
  onScan={(barcode) => {
    scanBarcode(barcode);
  }}
/>

      <button
        onClick={() => setShowScanner(false)}
        className="w-full mt-4 border rounded-lg py-3"
      >
        Cancel
      </button>

    </div>

  </div>
)}


          </div>

          <button
            onClick={completeSale}
           className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-xl font-bold"
          >
            Complete Sale
          </button>

   {/*
   <button
  onClick={logout}
  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded fixed bottom-4 right-4"
>
  Logout
</button>
*/}
        </div>

      </div>

      {showScanner && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl p-6 w-full max-w-md">

     <CameraScanner
  onScan={(barcode) => {
    scanBarcode(barcode);
  }}
/>

      <button
        onClick={() => setShowScanner(false)}
        className="w-full mt-4 border rounded-lg py-3"
      >
        Cancel
      </button>

    </div>

  </div>
)}

 <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}