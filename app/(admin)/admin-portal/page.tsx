import db from "@/lib/db"

export default async function AdminDashboard() {
  const totalOrders = await db.order.count()
  const totalProducts = await db.product.count()
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-black">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
        </div>
      </div>
    </div>
  )
}
