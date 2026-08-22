import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { adminUpdateOrderStatus } from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders/all`, {
        withCredentials: true
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/account');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await adminUpdateOrderStatus(orderId, newStatus);
      if (res.success) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleRefund = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel and refund this order?")) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/refund`, {}, {
        withCredentials: true
      });
      if (res.data.success) {
        alert('Order refunded successfully');
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to refund order');
    }
  };

  if (loading) return <div className="p-8 text-center pt-32 min-h-screen">Loading orders...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pt-32 min-h-screen flex gap-8">
      
      {/* Sidebar for navigation */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-8">
         <h2 className="text-2xl font-serif text-brand-forest-700 mb-8">Admin</h2>
         <nav className="space-y-4">
            <Link to="/admin" className="block text-gray-500 hover:text-brand-dark transition-colors">Dashboard</Link>
            <Link to="/admin/orders" className="block text-brand-dark font-bold transition-colors">Orders</Link>
            <Link to="/admin/products" className="block text-gray-500 hover:text-brand-dark transition-colors">Products</Link>
            <Link to="/admin/users" className="block text-gray-500 hover:text-brand-dark transition-colors">Users</Link>
            <Link to="/admin/reviews" className="block text-gray-500 hover:text-brand-dark transition-colors">Reviews</Link>
         </nav>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Manage Orders</h1>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Order ID</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Total</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-600">#{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {order.name}<br/>
                      <span className="text-xs text-gray-500 font-normal">{order.email}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">₹{order.total?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                        order.status === "DELIVERED" ? "bg-green-50 text-green-700 border border-green-200" :
                        order.status === "CANCELLED" ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedOrder(order)} className="text-brand-green-600 font-semibold text-xs uppercase tracking-wider hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-serif mb-6">Order #{selectedOrder.orderNumber}</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Customer Details</h3>
                <p className="text-gray-900 font-medium">{selectedOrder.name}</p>
                <p className="text-gray-500 text-sm">{selectedOrder.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Shipping Address</h3>
                <p className="text-gray-600 text-sm">
                  {selectedOrder.address.street}<br/>
                  {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode}<br/>
                  {selectedOrder.address.country}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Transaction History</h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Payment Method:</span>
                    <span className="text-gray-900 font-mono">{selectedOrder.paymentMethod || 'RAZORPAY'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Payment Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                      selectedOrder.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedOrder.paymentStatus || 'PENDING'}
                    </span>
                 </div>
                 {selectedOrder.razorpayOrderId && (
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Transaction ID:</span>
                      <span className="text-gray-900 font-mono text-xs">{selectedOrder.razorpayOrderId}</span>
                   </div>
                 )}
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Items</h3>
            <div className="space-y-4 mb-8">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                     {item.productId && item.productId.images && item.productId.images.length > 0 ? (
                       <img src={item.productId.images[0]} alt={item.productName || item.productId.name} className="w-12 h-12 rounded object-cover" />
                     ) : item.image ? (
                       <img src={item.image} alt={item.productName} className="w-12 h-12 rounded object-cover" />
                     ) : (
                       <div className="w-12 h-12 rounded bg-gray-200" />
                     )}
                     <div>
                       <p className="font-medium text-gray-900">{item.productName || (item.productId && item.productId.name)}</p>
                       <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                     </div>
                  </div>
                  <p className="font-mono text-gray-900">₹{((item.price || (item.productId && item.productId.price) || 0) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 items-center">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mr-2 self-center">Update Status:</h3>
                 {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(status => (
                   <button
                     key={status}
                     onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                     disabled={selectedOrder.status === status || selectedOrder.status === 'CANCELLED'}
                     className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                       selectedOrder.status === status ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-brand-green-100 text-brand-forest-700 hover:bg-brand-green-50'
                     }`}
                   >
                     {status}
                   </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-4 self-end lg:self-auto flex-wrap">
                 {selectedOrder.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleRefund(selectedOrder.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      {selectedOrder.paymentStatus === 'PAID' ? 'Cancel & Refund' : 'Cancel Order'}
                    </button>
                 )}
                 <p className="text-xl font-serif font-bold text-brand-forest-700 ml-0 lg:ml-4 whitespace-nowrap">
                   Total: ₹{selectedOrder.total?.toFixed(2)}
                 </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
