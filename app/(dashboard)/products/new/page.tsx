import ProductForm from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Add Product
        </h1>

        <p className="text-gray-500 mt-2">
          Create a new product and add it to your inventory.
        </p>

      </div>

      <ProductForm />

    </div>
  );
}