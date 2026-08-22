import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
          withCredentials: true
        });
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/account'); // Not authorized as admin
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) return <div className="p-8 text-center pt-32 min-h-screen">Loading dashboard...</div>;
  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto pt-32 min-h-screen flex gap-8">
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-8">
         <h2 className="text-2xl font-serif text-brand-forest-700 mb-8">Admin</h2>
         <nav className="space-y-4">
            <Link to="/admin" className="block text-brand-dark font-bold transition-colors">Dashboard</Link>
            <Link to="/admin/orders" className="block text-gray-500 hover:text-brand-dark transition-colors">Orders</Link>
            <Link to="/admin/products" className="block text-gray-500 hover:text-brand-dark transition-colors">Products</Link>
            <Link to="/admin/users" className="block text-gray-500 hover:text-brand-dark transition-colors">Users</Link>
            <Link to="/admin/reviews" className="block text-gray-500 hover:text-brand-dark transition-colors">Reviews</Link>
         </nav>
      </div>

      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">₹{data.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Order</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">₹{(data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">{data.totalOrders}</h3>
          <Link to="/admin/orders" className="text-sm text-brand-green-600 hover:underline mt-2 inline-block">Manage orders →</Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Products</p>
          <h3 className="text-3xl font-serif text-gray-900 mt-2">{data.totalProducts}</h3>
          <Link to="/admin/products" className="text-sm text-brand-green-600 hover:underline mt-2 inline-block">Manage catalog →</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-brand-green-600 hover:text-brand-green-700">View All</Link>
        </div>
        {data.recentOrders.length === 0 ? (
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
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-600">#{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{order.name || "Guest"}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-900">₹{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                        order.status === "COMPLETED" ? "bg-green-50 text-green-700 border border-green-200" :
                        "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
