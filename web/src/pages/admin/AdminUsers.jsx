import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/all`, {
        withCredentials: true
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/account');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/role/${userId}`, { role: newRole }, {
        withCredentials: true
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  if (loading) return <div className="p-8 text-center pt-32 min-h-screen">Loading users...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pt-32 min-h-screen flex gap-8">
      
      {/* Sidebar for navigation */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-8">
         <h2 className="text-2xl font-serif text-brand-forest-700 mb-8">Admin</h2>
         <nav className="space-y-4">
            <Link to="/admin" className="block text-gray-500 hover:text-brand-dark transition-colors">Dashboard</Link>
            <Link to="/admin/orders" className="block text-gray-500 hover:text-brand-dark transition-colors">Orders</Link>
            <Link to="/admin/products" className="block text-gray-500 hover:text-brand-dark transition-colors">Products</Link>
            <Link to="/admin/users" className="block text-brand-dark font-bold transition-colors">Users</Link>
            <Link to="/admin/reviews" className="block text-gray-500 hover:text-brand-dark transition-colors">Reviews</Link>
            <Link to="/admin/enquiries" className="block text-gray-500 hover:text-brand-dark transition-colors">Enquiries</Link>
         </nav>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Manage Users</h1>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Avatar</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Joined</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                       {user.profilePicture ? (
                           <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL}${user.profilePicture}`} 
                                alt={user.fullname} 
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100" />
                       ) : (
                           <div className="w-10 h-10 rounded-full bg-brand-forest-700 text-white flex items-center justify-center font-bold">
                             {(user.fullname || user.username || 'U').charAt(0).toUpperCase()}
                           </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{user.fullname || user.username}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" || user.role === "SUPER_ADMIN" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {user.role === 'user' ? (
                         <button onClick={() => handleRoleUpdate(user.id, 'admin')} className="text-brand-green-600 font-semibold text-xs uppercase tracking-wider hover:underline">
                           Make Admin
                         </button>
                      ) : (
                         <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                           Admin
                         </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
