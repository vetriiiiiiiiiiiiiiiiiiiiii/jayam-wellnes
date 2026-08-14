import db from "@/lib/db"
import Link from "next/link"

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Products</h1>
        <Link href="/admin-portal/products/new" className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800">
          Add New Product
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden">
                    {product.images[0] && <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="p-4 font-medium text-black">{product.name}</td>
                <td className="p-4 text-gray-600">₹{product.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin-portal/products/${product.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No products found. Create one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
