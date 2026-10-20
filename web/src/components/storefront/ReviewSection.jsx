import { useState } from 'react';
import axios from 'axios';

const Stars = ({ rating }) => (
  <span className="rv-stars" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true">{index < rating ? '★' : '☆'}</span>)}
  </span>
);

export default function ReviewSection({ productId, reviews: initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    const formData = new FormData(form);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, {
        author: formData.get('author'),
        rating: parseInt(formData.get('rating'), 10),
        title: formData.get('title'),
        content: formData.get('content'),
      });
      setReviews((prev) => [res.data, ...prev]);
      setSuccess('Thank you — your review has been posted.');
      form.reset();
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rv">
      <div className="rv-list">
        {reviews.length > 0 && (
          <p className="rv-summary">
            <Stars rating={Math.round(average)} />
            <span>{average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </p>
        )}
        {reviews.length === 0 ? (
          <div className="rv-empty">
            <Stars rating={0} />
            <h3>No reviews yet.</h3>
            <p>Be the first to share how Jayam fits into your day.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rv-item">
              <Stars rating={review.rating} />
              <h3>{review.title}</h3>
              <p>{review.content}</p>
              <span className="rv-meta">{review.author || 'Guest'} · {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="rv-form pg-tile">
        <h3>Write a review</h3>
        {error && <p className="pg-error" role="alert">{error}</p>}
        {success && <p className="rv-success" role="status">{success}</p>}
        <div className="pg-row">
          <label className="pg-field">Your name
            <input type="text" name="author" required maxLength={80} />
          </label>
          <label className="pg-field">Rating
            <select name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}
            </select>
          </label>
        </div>
        <label className="pg-field">Title
          <input type="text" name="title" required maxLength={120} />
        </label>
        <label className="pg-field">Your review
          <textarea name="content" rows={4} required maxLength={2000} />
        </label>
        <button type="submit" className="ap-pill" disabled={isSubmitting}>
          {isSubmitting ? 'Posting…' : 'Post review'}
        </button>
      </form>
    </div>
  );
}
