import React, { useState } from 'react';
import axios from 'axios';

export default function ReviewSection({ productId, reviews: initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    const formData = new FormData(e.currentTarget);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, {
        author: formData.get('author'),
        rating: parseInt(formData.get('rating')),
        title: formData.get('title'),
        content: formData.get('content'),
      });
      setReviews(prev => [res.data, ...prev]);
      setSuccess('Review submitted successfully!');
      e.currentTarget.reset();
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-24 pt-16 border-t border-gray-200">
      <h2 className="text-3xl font-serif mb-12">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Review Form */}
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest mb-6 text-gray-500">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded">{error}</div>}
            {success && <div className="text-green-600 text-sm p-3 bg-green-50 rounded">{success}</div>}

            <div className="flex gap-4">
              <div className="flex-1">
                <input type="text" name="author" placeholder="Your Name" className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-brand-dark transition-colors" required />
              </div>
              <div className="w-24">
                <select name="rating" className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-brand-dark transition-colors" defaultValue="5">
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            <input type="text" name="title" placeholder="Review Title" className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-brand-dark transition-colors" required />

            <textarea name="content" placeholder="Share your experience..." rows={4} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-brand-dark transition-colors resize-none" required />

            <button type="submit" disabled={isSubmitting} className="mt-4 px-8 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Review List */}
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">Be the first to review this product.</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="pb-8 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.content}</p>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-mono">— {review.author || 'Guest User'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}