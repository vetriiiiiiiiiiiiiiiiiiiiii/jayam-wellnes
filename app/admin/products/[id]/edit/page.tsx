import db from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export const metadata = {
  title: 'Edit Product | Miracle Tree Admin',
};

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-tight">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update details for {product.name}.</p>
        </div>
      </div>
      <EditProductForm product={product} />
    </div>
  );
}
