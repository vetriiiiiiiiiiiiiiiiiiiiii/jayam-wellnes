import React, { useState, useEffect } from 'react';
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Reviews</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{r.productId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{r.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{r.rating} / 5</td>
                  <td className="px-6 py-4 whitespace-nowrap">{r.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setEditingReview(r)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
