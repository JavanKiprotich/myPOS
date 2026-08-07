"use client";

"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";



import { useSearchParams } from "next/navigation";
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



function POSContent() {
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

const [showRunningBills, setShowRunningBills] = useState(false);
const [showNewBill, setShowNewBill] = useState(false);
const [runningBills, setRunningBills] = useState<any[]>([]);
const [runningBillName, setRunningBillName] = useState("");
const [runningBillPhone, setRunningBillPhone] = useState("");
const [activeRunningBillId, setActiveRunningBillId] = useState<string | null>(null);

const [runningBillOriginalItems, setRunningBillOriginalItems] = useState<
  Record<string, number>
>({});

const searchParams = useSearchParams();

const [showCloseBill, setShowCloseBill] = useState(false);
const [closingBill, setClosingBill] = useState<any>(null);
const [closingPaymentMethod, setClosingPaymentMethod] =
  useState<"CASH" | "MPESA" | "CREDIT">("CASH");
const [closingBillLoading, setClosingBillLoading] =
  useState(false);

const [pendingSaleId, setPendingSaleId] = useState(null);

const [toast, setToast] = useState({
  show: false,
  message: "",
  type: "success" as "success" | "error",
});

const [showScanner, setShowScanner] = useState(false);


const [checkoutRequestId, setCheckoutRequestId] =
  useState<string | null>(null);

const [waitingForMpesa, setWaitingForMpesa] =
  useState(false);




 useEffect(() => {
  loadUser();
  loadProducts();
  loadSettings();
}, []);

useEffect(() => {
  barcodeRef.current?.focus();
}, []);


useEffect(() => {
  if (
    searchParams.get("runningBills") === "open"
  ) {
    loadRunningBills();
    setShowRunningBills(true);
  }
}, [searchParams]);

useEffect(() => {
  if (settings?.defaultPaymentMethod) {
    setPaymentMethod(settings.defaultPaymentMethod);
  }
}, [settings]);

 async function loadProducts() {
  try {
    const response = await fetch("/api/products", {
      cache: "no-store",
    });

    const text = await response.text();

    console.log("Products API status:", response.status);
    console.log("Products API response:", text);

    if (!response.ok) {
      console.error(
        "Products API failed:",
        response.status,
        text
      );
      setProducts([]);
      return;
    }

    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      console.error(
        "Products API returned something other than an array:",
        data
      );
      setProducts([]);
      return;
    }

    setProducts(data);
  } catch (error) {
    console.error("Failed to load products:", error);
    setProducts([]);
  }
}

async function loadRunningBills() {
  try {
    const response = await fetch("/api/running-bills", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load running bills");
    }

    const data = await response.json();

    setRunningBills(
      Array.isArray(data) ? data : []
    );
  } catch (error) {
    console.error(error);

    showToast(
      "Failed to load running bills.",
      "error"
    );
  }
}


async function createRunningBill() {
  const name = runningBillName.trim();

  if (!name) {
    showToast(
      "Enter a name for the running bill.",
      "error"
    );
    return;
  }

  if (cart.length === 0) {
    showToast(
      "Add at least one product to the cart before starting a running bill.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      "/api/running-bills",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone:
            runningBillPhone.trim() || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error || "Failed to create bill.",
        "error"
      );
      return;
    }

    // New bill starts with no previously saved items
    setActiveRunningBillId(data.id);
    setRunningBillOriginalItems({});

    // Add the current cart to the new running bill
    await saveCartToRunningBill(data.id);

    // Refresh the list
    await loadRunningBills();

    setRunningBillName("");
    setRunningBillPhone("");
    setShowNewBill(false);

    showToast(
      `${name}'s bill opened and cart saved.`,
      "success"
    );

  } catch (error) {
    console.error(error);

    showToast(
      "Failed to create running bill.",
      "error"
    );
  }
}

async function saveCartToRunningBill(
  billId: string,
  clearCartAfterSave = true
) {
  if (cart.length === 0) {
    if (clearCartAfterSave) {
      showToast(
        "Cart is empty.",
        "error"
      );
    }

    return true;
  }

  try {
    for (const item of cart) {
      const originalQuantity =
        runningBillOriginalItems[item.id] ?? 0;

      const newQuantity = Math.max(
        0,
        item.quantity - originalQuantity
      );

      // Nothing new was added for this product.
      if (newQuantity === 0) {
        continue;
      }

      const response = await fetch(
        `/api/running-bills/${billId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(
          data.error ||
            `Failed to save ${item.name} to running bill.`,
          "error"
        );

        return false;
      }
    }

    if (clearCartAfterSave) {
      setCart([]);
      setActiveRunningBillId(null);
      setRunningBillOriginalItems({});
      setShowRunningBills(false);

      showToast(
        "Running bill updated successfully.",
        "success"
      );

      focusBarcode();
    }

    // Refresh the running-bill list.
    await loadRunningBills();

    return true;
  } catch (error) {
    console.error(
      "Save running bill error:",
      error
    );

    showToast(
      "Failed to save running bill.",
      "error"
    );

    return false;
  }
}



async function closeRunningBill() {
  if (!closingBill) return;

  if (!user?.id) {
    showToast(
      "Unable to identify cashier.",
      "error"
    );
    return;
  }

  setClosingBillLoading(true);

  try {
    const response = await fetch(
      `/api/running-bills/${closingBill.id}/close`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cashierId: user.id,
          method: closingPaymentMethod,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error || "Failed to close bill.",
        "error"
      );
      return;
    }

    setShowCloseBill(false);
    setClosingBill(null);

    await loadRunningBills();

    showToast(
      data.message || "Running bill closed successfully.",
      "success"
    );

    // Cash / credit already completed the sale.
    if (data.closed && data.saleId) {
      setTimeout(() => {
        window.location.href = `/receipt/${data.saleId}`;
      }, 500);
    }
  } catch (error) {
    console.error(error);

    showToast(
      "Failed to close running bill.",
      "error"
    );
  } finally {
    setClosingBillLoading(false);
  }
}



async function resumeRunningBill(billId: string) {
  try {
    const response = await fetch(
      `/api/running-bills/${billId}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error || "Failed to open running bill.",
        "error"
      );
      return;
    }

    const originalItems: Record<string, number> = {};

    const resumedCart = data.items.map((item: any) => {
      originalItems[item.productId] = item.quantity;

      return {
        id: item.productId,
        name: item.productName,
        price: Number(item.unitPrice),
        sellingPrice: Number(item.unitPrice),
        unit: item.unit,
        stock: Number(item.stock ?? 0),
        quantity: item.quantity,
      };
    });

    setActiveRunningBillId(billId);
    setRunningBillOriginalItems(originalItems);
    setCart(resumedCart);
    setShowRunningBills(false);

    showToast(
      `${data.name}'s bill loaded.`,
      "success"
    );

    focusBarcode();
  } catch (error) {
    console.error(error);

    showToast(
      "Failed to resume running bill.",
      "error"
    );
  }
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
  const stock = Number(product.stock ?? 0);
  const price = Number(
    product.sellingPrice ?? product.price ?? 0
  );

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

    setCart((currentCart) =>
      currentCart.map((item) =>
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

  setCart((currentCart) => [
    ...currentCart,
    {
      ...product,
      price,
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

      const stock = Number(item.stock ?? 0);

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
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    product.sku
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    product.barcode?.includes(search)
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



async function checkPaymentStatus(
  checkoutRequestId: string
) {
  const response = await fetch(
    `/api/mpesa/status/${checkoutRequestId}`
  );

  return await response.json();
}



useEffect(() => {
  if (!checkoutRequestId) {
    return;
  }

  let stopped = false;

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `/api/mpesa/status/${checkoutRequestId}`,
        {
          cache: "no-store",
        }
      );

      const payment = await response.json();

      console.log(
        "M-Pesa payment status:",
        payment
      );

      if (stopped) {
        return;
      }

      if (payment.verified) {
        stopped = true;

        playSuccess();

        showToast(
          "Payment received.",
          "success"
        );

        setWaitingForMpesa(false);
        setCheckoutRequestId(null);
        setShowMpesaModal(false);
        setCart([]);

        window.location.href =
          `/receipt/${payment.saleId}`;

        return;
      }

      if (payment.failed) {
        stopped = true;

        playError();

        showToast(
          payment.resultDesc ||
            "M-Pesa payment was cancelled.",
          "error"
        );

        setWaitingForMpesa(false);
        setCheckoutRequestId(null);
        setShowMpesaModal(false);

        return;
      }

    } catch (error) {
      console.error(
        "M-Pesa status check failed:",
        error
      );
    }
  };

  // Check immediately
  checkStatus();

  // Then every 3 seconds
  const interval = setInterval(
    checkStatus,
    3000
  );

  return () => {
    stopped = true;
    clearInterval(interval);
  };

}, [checkoutRequestId]);

















  async function completeSale() {

 if (activeRunningBillId) {
    // Save any newly added items first.
    if (cart.length > 0) {
      await saveCartToRunningBill(activeRunningBillId);
    }

    // Refresh bills so the close dialog has the latest total.
    await loadRunningBills();

    const response = await fetch(
      `/api/running-bills/${activeRunningBillId}`,
      {
        cache: "no-store",
      }
    );

    const bill = await response.json();

    if (!response.ok) {
      showToast(
        bill.error || "Unable to load running bill.",
        "error"
      );
      return;
    }

    setClosingBill(bill);
    setClosingPaymentMethod("CASH");
    setShowCloseBill(true);

    return;
  }


  if (paymentMethod === "MPESA") {

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
        paymentMethod: "MPESA",
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error || "Failed to create sale.",
        "error"
      );
      return;
    }

    setPendingSaleId(data.id);

    setShowMpesaModal(true);

    return;

  } catch (error) {
    console.error(error);

    showToast(
      "Could not start M-Pesa payment.",
      "error"
    );

    return;
  }
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

async function createSaleBeforeMpesa() {
  const response = await fetch("/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: cart,
      total,
      paymentMethod: "MPESA",
    }),
  });

  const sale = await response.json();

  return sale;
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
      saleId: pendingSaleId,
      phone,
      amount: total,
    }),
  });

  const data = await response.json();

  alert(JSON.stringify(data, null, 2));
}


async function handleMpesaPayment() {

console.log("Pending Sale ID:", pendingSaleId);

  try {
    const phone = formatMpesaPhone(mpesaPhone);

    if (!phone) {
      showToast("Enter a valid Kenyan phone number.", "error");
      return;
    }

    if (!pendingSaleId) {
      showToast("No sale available for payment.", "error");
      return;
    }

    const response = await fetch("/api/mpesa/stkpush", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        saleId: pendingSaleId,
        phone,
        amount: total,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error ||
        data.message ||
        "Failed to send STK Push",
        "error"
      );
      return;
    }

    // Start polling only after the STK request was accepted
    setCheckoutRequestId(data.checkoutRequestId);
    setWaitingForMpesa(true);

    showToast(
      "STK Push sent successfully. Waiting for customer payment...",
      "success"
    );

    setShowMpesaModal(false);

  } catch (error) {
    console.error(error);

    showToast(
      "Failed to send STK Push.",
      "error"
    );
  }
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

  onOpenRunningBills={() => {
    loadRunningBills();
    setShowRunningBills(true);
  }}

  onSaveRunningBill={() => {
    if (activeRunningBillId) {
      saveCartToRunningBill(activeRunningBillId);
    }
  }}

  activeRunningBillId={activeRunningBillId}
/>



      </div>

     
{showNewBill && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <h2 className="text-xl font-bold">
        Start Running Bill
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Give this customer's tab a name.
      </p>

      <input
        value={runningBillName}
        onChange={(e) =>
          setRunningBillName(e.target.value)
        }
        placeholder="Customer / Tab name"
        className="mt-4 w-full rounded-lg border p-3"
      />

      <input
        value={runningBillPhone}
        onChange={(e) =>
          setRunningBillPhone(e.target.value)
        }
        placeholder="Phone (optional)"
        className="mt-3 w-full rounded-lg border p-3"
      />

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() =>
            setShowNewBill(false)
          }
          className="flex-1 rounded-lg border py-3"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={createRunningBill}
          className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Start Bill
        </button>
      </div>

    </div>
  </div>
)}


{showRunningBills && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Running Bills
          </h2>

          <p className="text-sm text-slate-500">
            Open customer tabs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRunningBills(false)}
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowRunningBills(false);
          setShowNewBill(true);
        }}
        className="mt-5 w-full rounded-lg bg-slate-900 py-3 font-semibold text-white"
      >
        + Start New Bill
      </button>

      <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto">

        {runningBills.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
            No open running bills.
          </div>
        ) : (
          runningBills.map((bill) => (
            <div
              key={bill.id}
              className="rounded-xl border p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">
                    {bill.name}
                  </div>

                  {bill.phone && (
                    <div className="text-sm text-slate-500">
                      {bill.phone}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    KES {Number(bill.total).toLocaleString()}
                  </div>

                  <div className="text-xs text-slate-500">
                    Balance: KES{" "}
                    {Number(
                      bill.balance ?? bill.total
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-sm text-slate-500">
                {bill.items?.length ?? 0} item types
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() => resumeRunningBill(bill.id)}
                  className="rounded-lg border py-2 font-semibold hover:bg-slate-50"
                >
                  Resume
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setClosingBill(bill);
                    setClosingPaymentMethod("CASH");
                    setShowRunningBills(false);
                    setShowCloseBill(true);
                  }}
                  className="rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700"
                >
                  Close Bill
                </button>

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  </div>
)}

{showCloseBill && closingBill && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Close Running Bill
          </h2>

          <p className="text-sm text-slate-500">
            {closingBill.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCloseBill(false);
            setClosingBill(null);
          }}
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex justify-between">
          <span>Total</span>

          <span className="font-bold">
            KES{" "}
            {Number(
              closingBill.total
            ).toLocaleString()}
          </span>
        </div>

        <div className="mt-2 flex justify-between">
          <span>Paid</span>

          <span>
            KES{" "}
            {Number(
              closingBill.paid
            ).toLocaleString()}
          </span>
        </div>

        <div className="mt-2 flex justify-between border-t pt-2">
          <span className="font-semibold">
            Balance
          </span>

          <span className="font-bold text-red-600">
            KES{" "}
            {Number(
              closingBill.balance
            ).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium mb-2">
          Payment Method
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(
            ["CASH", "MPESA", "CREDIT"] as const
          ).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() =>
                setClosingPaymentMethod(method)
              }
              className={`rounded-lg border py-3 text-sm font-semibold ${
                closingPaymentMethod === method
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "hover:bg-slate-50"
              }`}
            >
              {method === "CASH"
                ? "Cash"
                : method === "MPESA"
                ? "M-Pesa"
                : "Credit"}
            </button>
          ))}
        </div>
      </div>

      {closingPaymentMethod === "CREDIT" &&
        !closingBill.customer && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            A customer must be attached to this bill
            before using Credit.
          </div>
        )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={closingBillLoading}
          onClick={() => {
            setShowCloseBill(false);
            setClosingBill(null);
          }}
          className="rounded-lg border py-3 font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            closingBillLoading ||
            (
              closingPaymentMethod === "CREDIT" &&
              !closingBill.customer
            )
          }
          onClick={closeRunningBill}
          className="rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {closingBillLoading
            ? "Processing..."
            : "Close Bill"}
        </button>
      </div>

    </div>
  </div>
)}




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


<MpesaModal
  show={showMpesaModal}
  total={total} // replace with your total variable
  mpesaPhone={mpesaPhone}
  setMpesaPhone={setMpesaPhone}
 waitingForMpesa={waitingForMpesa}

  onCancel={() => setShowMpesaModal(false)}
  onSend={handleMpesaPayment}
/>


 <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<div>Loading POS...</div>}>
      <POSContent />
    </Suspense>
  );
}
