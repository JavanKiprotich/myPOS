"use client";

type ProductPanelProps = {
   barcode: string;
  setBarcode: (value: string) => void;
  barcodeRef: React.RefObject<HTMLInputElement | null>;
  scanBarcode: (barcode: string) => void;
  focusBarcode: () => void;
  search: string;
  setSearch: (value: string) => void;
  filteredProducts: any[];
  addToCart: (product: any) => void;

  onOpenCamera: () => void;
};



export default function ProductPanel({
  barcode,
  setBarcode,
  barcodeRef,
  scanBarcode,
  focusBarcode,
  search,
  setSearch,
  filteredProducts,
  addToCart,

  onOpenCamera,
}: ProductPanelProps) {
  return (
   <div className="lg:col-span-2 flex flex-col min-h-0">

      <h2 className="font-bold text-xl mb-4">
        Products
      </h2>

    <button
  onClick={onOpenCamera}
  className="w-full mb-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-3 font-semibold"
>
  📷 Scan With Camera
</button>

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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 mb-3 outline-none transition
focus:border-slate-500
focus:ring-2
focus:ring-slate-200"
      />

      <input
        type="text"
        placeholder="Search product..."
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 mb-4 outline-none transition
focus:border-slate-500
focus:ring-2
focus:ring-slate-200"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search.trim() !== "" && (
        <div className="border rounded-lg overflow-y-auto max-h-80 lg:max-h-[75vh]">

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
                className={`w-full text-left p-4 border-b border-slate-200 transition-colors ${
  (product.inventory?.[0]?.quantity ?? 0) <= 0
    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
    : "hover:bg-slate-50"
}`}
              >
                <div className="text-base font-semibold text-slate-900">
                  {product.name}
                </div>

                <div className="mt-1 text-slate-700">
                  KES {Number(product.price).toLocaleString()}
                </div>

          <span
  className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-medium ${
    (product.inventory?.[0]?.quantity ?? 0) <= 5
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700"
  }`}
>
  Stock: {product.inventory?.[0]?.quantity ?? 0}
</span>

              </button>

            ))

          )}

        </div>
      )}

    </div>
  );
}