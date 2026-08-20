import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { navigate('/login'); return; }
    setUser(JSON.parse(stored));

    axios.get(`${import.meta.env.VITE_API_URL}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setOrders(res.data)).catch(() => {});
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-pearl pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-serif text-brand-forest-700 mb-8">My Orders</h1>
          {orders.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-brand-green-100 rounded-3xl">
              <p className="text-xl font-serif text-brand-dark mb-2">No orders yet.</p>
              <p className="text-brand-dark/60 mb-6">Explore our collection to get started.</p>
              <a href="/shop" className="px-6 py-3 bg-brand-dark text-white rounded-full text-sm">Shop Now</a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold block">{order.orderNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-medium">₹{order.total?.toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                        <span className="font-mono text-gray-500">₹{item.unitPrice?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-fit border border-gray-200 p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="font-bold text-xl mb-4 text-brand-forest-700 font-serif">Account Info</h3>
          <div className="space-y-2 mb-6">
            <p className="text-gray-800 font-medium">{user.name}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="text-sm text-red-600 underline">Sign out</button>
        </div>
      </div>
    </div>
  );
}
