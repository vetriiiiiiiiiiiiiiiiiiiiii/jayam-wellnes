import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllAdminReviews, updateAdminReview, deleteAdminReview } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await getAllAdminReviews();
    if (res.success) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const res = await deleteAdminReview(id);
      if (res.success) {
        fetchReviews();
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateAdminReview(editingReview.id, {
      title: editingReview.title,
      content: editingReview.content,
      rating: editingReview.rating,
      author: editingReview.author,
    });
    if (res.success) {
      setEditingReview(null);
      fetchReviews();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pt-32 min-h-screen flex gap-8">
      
      {/* Sidebar for navigation */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-8">
         <h2 className="text-2xl font-serif text-brand-forest-700 mb-8">Admin</h2>
         <nav className="space-y-4">
            <Link to="/admin" className="block text-gray-500 hover:text-brand-dark transition-colors">Dashboard</Link>
            <Link to="/admin/orders" className="block text-gray-500 hover:text-brand-dark transition-colors">Orders</Link>
            <Link to="/admin/products" className="block text-gray-500 hover:text-brand-dark transition-colors">Products</Link>
            <Link to="/admin/users" className="block text-gray-500 hover:text-brand-dark transition-colors">Users</Link>
            <Link to="/admin/reviews" className="block text-brand-dark font-bold transition-colors">Reviews</Link>
         </nav>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Manage Reviews</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Product</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Author</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Rating</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Title</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{r.productId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500">{r.author}</td>
                      <td className="px-6 py-4 text-gray-500">{r.rating} / 5</td>
                      <td className="px-6 py-4 text-gray-500">{r.title}</td>
                      <td className="px-6 py-4 font-medium">
                        <button onClick={() => setEditingReview(r)} className="text-brand-green-600 font-semibold text-xs uppercase tracking-wider hover:underline mr-4">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-500 font-semibold text-xs uppercase tracking-wider hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Edit Review</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={editingReview.author}
                  onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={editingReview.rating}
                  onChange={(e) => setEditingReview({ ...editingReview, rating: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={editingReview.title}
                  onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  rows="4"
                  value={editingReview.content}
                  onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
