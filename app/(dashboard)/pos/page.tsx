"use client";

import { useEffect, useState } from "react";


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

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadUser();
  }, []);

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
  async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  window.location.href = "/login";
}
  function addToCart(product: any) {
    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {
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
  }

  function increaseQty(id: string) {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
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
      alert(
        "Select a customer before making a credit sale."
      );
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          storeId:
            "cmrj98gz70000mneof8jfrrlv",
          cashierId:
            "cmrjcz4t90001mneol7a33day",
          customerId:
            customerId || null,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to complete sale"
        );
      }

      const sale = await response.json();

      setCart([]);

      window.location.href = `/receipt/${sale.id}`;
    } catch (error) {
      console.error(error);
      alert("Failed to complete sale");
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
            type="text"
            placeholder="Search product..."
            className="border p-2 rounded w-full mb-4"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <div className="space-y-2">

            {filteredProducts.length === 0 && (
              <div className="text-gray-500 text-center border rounded p-4">
                No products found
              </div>
            )}

            {filteredProducts.map(
              (product: any) => (

                <button
                  key={product.id}
                  onClick={() =>
                    addToCart(product)
                  }
                  className="w-full border p-3 rounded text-left hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    {product.name}
                  </div>

                  <div>
                    KES{" "}
                    {Number(
                      product.price
                    ).toLocaleString()}
                  </div>

                </button>

              )
            )}

          </div>

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
              className="border p-2 w-full"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            >

              <option value="CASH">
                Cash
              </option>

              <option value="MPESA">
                M-Pesa
              </option>

              <option value="CREDIT">
                Credit
              </option>

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

    </div>
  );
}