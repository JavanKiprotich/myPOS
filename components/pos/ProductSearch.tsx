"use client";

interface ProductSearchProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function ProductSearch({
  search,
  setSearch,
}: ProductSearchProps) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search product, SKU or scan barcode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
    </div>
  );
}