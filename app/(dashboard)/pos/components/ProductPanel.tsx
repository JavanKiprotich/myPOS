"use client";

type ProductPanelProps = {
  barcode: string;
  setBarcode: (value: string) => void;
  barcodeRef: React.RefObject<HTMLInputElement | null>;
  scanBarcode: (barcode: string) => void;
  search: string;
  setSearch: (value: string) => void;
  filteredProducts: any[];
  addToCart: (product: any) => void;
  focusBarcode: () => void;
};

export default function ProductPanel({
  barcode,
  setBarcode,
  barcodeRef,
  scanBarcode,
  search,
  setSearch,
  filteredProducts,
  addToCart,
  focusBarcode,
}: ProductPanelProps) {
  return (
   <div className="lg:col-span-2 flex flex-col min-h-0">

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
  );
}