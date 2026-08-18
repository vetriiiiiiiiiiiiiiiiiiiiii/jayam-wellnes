import db from "@/lib/db";
import InventoryTable from "./InventoryTable";

export const metadata = {
  title: 'Inventory Management | Miracle Tree Admin',
};

export default async function AdminInventoryPage() {
  const products = await db.product.findMany({
    where: { productType: { not: 'BUNDLE' } },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      lowStockThreshold: true,
      images: {
        take: 1,
        select: { url: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Quickly view and update stock levels for all products.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <InventoryTable initialProducts={products} />
      </div>
    </div>
  );
}
