import db from "@/lib/db";
import Link from "next/link";
import { deleteProduct } from "../actions";

export default async function AdminCollectionsPage() {
  const collections = await db.product.findMany({
    where: { productType: 'BUNDLE' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-gray-900">Collections (Bundles)</h1>
        <Link 
          href="/admin/collections/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Create Collection
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {collections.map((collection) => (
              <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                  <div className="text-xs text-gray-500">{collection.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  ₹{collection.price}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${collection.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {collection.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-4 items-center">
                  {/* Collections Edit can just reuse the generic product edit later, or for now just delete */}
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={collection.id} />
                    <button type="submit" className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No collections found. Create one to bundle your products!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
