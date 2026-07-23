"use client";

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/ui/Toast";

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
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Liquor POS
      </h1>
       {user && (
      <p className="text-gray-600">
        Welcome, {user.name} ({user.role})
      </p>
    )}
    

      <div className="grid grid-cols-2 gap-6">

        {/* PRODUCTS */}

        <div>

          <h2 className="font-bold text-xl mb-4">
  Products
</h2>

<input
  ref={barcodeRef}
  type="text"
  placeholder="Scan barcode..."
  value={barcode}
  onChange={(e) => {
    const value = e.target.value;
    setBarcode(value);

    if (value.length >= 8) {
      setTimeout(() => {
        scanBarcode(value);
      }, 50);
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      scanBarcode(barcode);
    }
  }}
  className="border p-2 rounded w-full mb-3"
/>



          <input
            type="text"
            placeholder="Search product..."
            className="border p-2 rounded w-full mb-4"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          

           {search.trim() !== "" && (

  <div className="border rounded-lg max-h-96 overflow-y-auto">

    {filteredProducts.length === 0 ? (

      <div className="p-4 text-gray-500">
        No matching products
      </div>

    ) : (

      filteredProducts.map((product: any) => (

        <button
          key={product.id}
          disabled={
            (product.inventory?.[0]?.quantity ?? 0) <= 0
          }
          onClick={() => {
  addToCart(product);
  setSearch("");
  focusBarcode();
}}
          className={`w-full border-b p-3 text-left ${
            (product.inventory?.[0]?.quantity ?? 0) <= 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          <div className="font-semibold">
            {product.name}
          </div>

          <div>
            KES {Number(product.price).toLocaleString()}
          </div>

          <div
            className={`text-sm ${
              (product.inventory?.[0]?.quantity ?? 0) <= 5
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            Stock: {product.inventory?.[0]?.quantity ?? 0}
          </div>

        </button>

      ))

    )}

  </div>

)}

              
</div>
                 

               

              

         

        {/* CART */}

        <div>

          <h2 className="font-bold text-xl mb-4">
            Cart
          </h2>

          <div className="space-y-3">

            {cart.map((item: any) => (

              <div
                key={item.id}
                className="border p-3 rounded"
              >

                <div className="font-semibold">
                  {item.name}
                </div>

                <div className="flex items-center gap-2 mt-2">

                  <button
                    onClick={() =>
                      decreaseQty(item.id)
                    }
                    className="border px-3 py-1"
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
                    className="border px-3 py-1"
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      removeItem(item.id)
                    }
                    className="border px-3 py-1 ml-auto text-red-600"
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

          <div className="mt-6">

            <label className="block mb-2 font-medium">
              Customer
            </label>

            <select
              className="border p-2 w-full"
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

          <div className="mt-6 text-3xl font-bold">
            Total: KES{" "}
            {total.toLocaleString()}

{showMpesaModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-lg shadow-xl w-96 p-6">

      <h2 className="text-2xl font-bold mb-4">
        M-PESA Payment
      </h2>

      <label className="block mb-2 font-medium">
        Customer Phone Number
      </label>

      <input
        type="text"
        placeholder="07XXXXXXXX"
        value={mpesaPhone}
        onChange={(e) => setMpesaPhone(e.target.value)}
        className="w-full border rounded p-3 mb-4"
      />

      <div className="text-lg font-semibold mb-6">
        Amount: KES {total.toLocaleString()}
      </div>

      <div className="flex gap-3">

        <button
          onClick={() => setShowMpesaModal(false)}
          className="flex-1 border rounded py-3"
        >
          Cancel
        </button>

        <button
  onClick={sendStkPush}
  className="flex-1 bg-green-600 text-white rounded py-3"
>
  Send STK Push
</button>

      </div>

    </div>

  </div>
)}

          </div>

          <button
            onClick={completeSale}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
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

 <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}