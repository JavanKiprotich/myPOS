"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReceiptPage() {
  const params = useParams();
  const id = params.id as string;

  const [sale, setSale] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadSale();
    }
  }, [id]);

  async function loadSale() {
    try {
      const response = await fetch(`/api/sales/${id}`);
      const data = await response.json();
      setSale(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
  if (sale?.store?.settings?.autoPrint) {
    setTimeout(() => {
      window.print();
    }, 500);
  }
}, [sale]);

  function formatMoney(value: number) {
    return Number(value).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (!sale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">
          Loading Receipt...
        </div>
      </div>
    );
  }

const settings = sale.store?.settings;

const paperWidth =
  settings?.paperWidth === "58mm" ? "58mm" : "80mm";

  const receiptNumber = sale.id
    .slice(-8)
    .toUpperCase();

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-10">

        <div
          id="receipt"
          style={{ width: paperWidth }}
className="bg-white mx-auto shadow-xl rounded-lg p-5 text-sm"
        >

          {/* ===========================
              STORE HEADER
          ============================ */}

          <div className="text-center">

  {/* Logo (until image upload is implemented) */}
  <div className="text-5xl mb-2">
    🥃
  </div>

  <h1 className="text-2xl font-extrabold tracking-widest">
    {settings?.businessName || sale.store?.name}
  </h1>

  {settings?.receiptHeader && (
    <p className="text-xs text-gray-600 mt-1">
      {settings.receiptHeader}
    </p>
  )}

  {settings?.address && (
    <p className="text-xs text-gray-500 mt-3">
      {settings.address}
    </p>
  )}

  {settings?.phone && (
    <p className="text-xs text-gray-500">
      Tel: {settings.phone}
    </p>
  )}

</div>
          <hr className="my-4 border-dashed" />

          {/* ===========================
              RECEIPT DETAILS
          ============================ */}

          <div className="space-y-2 text-xs">

            <div className="flex justify-between">
              <span className="font-medium">
                Receipt No.
              </span>

              <span className="font-bold">
                {receiptNumber}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Date</span>

              <span>
                {new Date(
                  sale.createdAt
                ).toLocaleString()}
              </span>
            </div>

            {settings?.showCashier !== false && (
  <div className="flex justify-between">
    <span>Cashier</span>

    <span>{sale.cashier?.name}</span>
  </div>
)}

            {settings?.showCustomer !== false && (
  <div className="flex justify-between">
    <span>Customer</span>

    <span>{sale.customer?.name ?? "Walk-in"}</span>
  </div>
)}

            <div className="flex justify-between">
              <span>Payment</span>

              <span>
                {sale.payments?.[0]?.method}
              </span>
            </div>

          </div>

          <hr className="my-4 border-dashed" />

          {/* ===========================
              ITEMS
          ============================ */}

          <div className="grid grid-cols-12 font-bold text-xs pb-2 border-b">

            <div className="col-span-5">
              Item
            </div>

            <div className="col-span-2 text-center">
              Qty
            </div>

            <div className="col-span-2 text-right">
              Price
            </div>

            <div className="col-span-3 text-right">
              Total
            </div>

          </div>

          {sale.items?.map((item: any) => (

            <div
              key={item.id}
              className="grid grid-cols-12 py-2 text-xs border-b"
            >

              <div className="col-span-5 pr-2">
                {item.product.name}
              </div>

              <div className="col-span-2 text-center">
                {item.quantity}
              </div>

              <div className="col-span-2 text-right">
                {formatMoney(item.unitPrice)}
              </div>

              <div className="col-span-3 text-right font-medium">
                {formatMoney(item.subtotal)}
              </div>

            </div>

          ))}
                    {/* ===========================
              TOTAL
          ============================ */}

          <div className="mt-4">

            <div className="flex justify-between text-lg font-extrabold border-t-2 border-b-2 py-3">

              <span>TOTAL</span>

              <span>
                KES {formatMoney(sale.total)}
              </span>

            </div>

          </div>

          {/* ===========================
              FOOTER
          ============================ */}

          <div className="mt-6 text-center text-xs space-y-2">

  <p>Thank you for choosing</p>

  <p className="font-bold text-base tracking-wider">
    {settings?.businessName || sale.store?.name}
  </p>

  {settings?.receiptFooter && (
    <p>{settings.receiptFooter}</p>
  )}

  <p className="font-semibold">
    🍻 Drink Responsibly 🍻
  </p>

  <p className="text-gray-500">
    Please keep this receipt as proof of purchase.
  </p>

  <p className="text-gray-400 mt-3">
    Powered by SHOTO'CLOCK POS
  </p>

</div>

        </div>

        {/* PRINT BUTTON */}

        <div className="w-[80mm] mx-auto mt-6 print:hidden">

          <button
            onClick={() => window.print()}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
          >
            🖨 Print Receipt
          </button>

        </div>

      </div>

      {/* PRINT STYLES */}

      <style jsx global>{`
        @media print {

          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #receipt,
          #receipt * {
            visibility: visible;
          }

          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 10px;
            border-radius: 0;
            box-shadow: none;
          }

          button {
            display: none !important;
          }

          @page {
            size: 80mm auto;
            margin: 5mm;
          }

        }
      `}</style>

    </>
  );
}