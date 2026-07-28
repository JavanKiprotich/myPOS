"use client";

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/ui/Toast";
import ProductPanel from "./components/ProductPanel";
import MpesaModal from "./components/MpesaModal";
import CameraScanner from "./components/CameraScanner";
import CartItem from "@/components/pos/CartItem";
import CartPanel from "@/components/pos/CartPanel";

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

<CartPanel
  cart={cart}
  total={total}
  customers={customers}
  customerId={customerId}
  setCustomerId={setCustomerId}
  paymentMethod={paymentMethod}
  setPaymentMethod={setPaymentMethod}
  settings={settings}
  increaseQty={increaseQty}
  decreaseQty={decreaseQty}
  removeItem={removeItem}
  completeSale={completeSale}
/>

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