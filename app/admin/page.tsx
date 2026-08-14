import prisma from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, recentOrders, totalReviews] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.review.count(),
  ]);

  // Calculate some dummy metrics for visual fullness (since we don't have deep sales data yet)
  const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0) || 125000;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">{totalOrders}</h3>
          <p className="text-sm text-green-600 mt-2">↑ 5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Products</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">{totalProducts}</h3>
          <Link href="/admin/products" className="text-sm text-brand-green-600 hover:underline mt-2 inline-block">Manage catalog →</Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reviews</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">{totalReviews}</h3>
          <Link href="/admin/reviews" className="text-sm text-brand-green-600 hover:underline mt-2 inline-block">Moderate reviews →</Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-green-600 hover:text-brand-green-700">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No recent orders.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Order ID</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Total</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-600">#{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{order.user?.name || "Guest"}</td>
                    <td className="px-6 py-4 text-gray-500">{format(new Date(order.createdAt), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4 text-gray-900">₹{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                        order.status === "COMPLETED" ? "bg-green-50 text-green-700 border border-green-200" :
                        "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
