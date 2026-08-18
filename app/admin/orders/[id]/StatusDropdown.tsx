'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/app/admin/actions';

export default function StatusDropdown({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error(error);
      setStatus(currentStatus); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <span className="text-xs text-brand-green-500 animate-pulse">Updating...</span>}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-full border appearance-none outline-none cursor-pointer pr-8 bg-no-repeat bg-[right_1rem_center] ${
          status === "PENDING" ? "bg-yellow-50 text-yellow-800 border-yellow-200 focus:border-yellow-400" :
          status === "COMPLETED" || status === "DELIVERED" ? "bg-green-50 text-green-800 border-green-200 focus:border-green-400" :
          status === "SHIPPED" ? "bg-blue-50 text-blue-800 border-blue-200 focus:border-blue-400" :
          "bg-gray-50 text-gray-800 border-gray-200 focus:border-gray-400"
        }`}
        style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundSize: '0.65em auto' }}
      >
        <option value="PENDING">Pending</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
