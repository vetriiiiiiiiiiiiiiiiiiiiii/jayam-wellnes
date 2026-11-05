import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';
import { shortName } from '../storefront/ProductCard';

// Home page reviews: the overall rating, the newest reviews from every product,
// and a form so any visitor can review the product they bought.
const API = import.meta.env.VITE_API_URL;

const Stars = ({ rating, size = 16 }) => (
  <span className="hr-stars" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => (
      <Star key={index} size={size} aria-hidden="true" fill={index < Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={1.6} />
    ))}
  </span>
);

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function ReviewForm({ products, onPosted, onCancel }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/api/products/${form.get('productId')}/reviews`, {
        author: form.get('author'),
        rating,
        title: form.get('title'),
        content: form.get('content'),
        website: form.get('website'),
      });
      onPosted(data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'We couldn’t post your review. Please try again.');
      setBusy(false);
    }
  };

  return (
    <form className="hr-form" onSubmit={submit}>
      <h3>Write a review</h3>
      <label className="pg-field">Product
        <select name="productId" required defaultValue="">
          <option value="" disabled>Choose the product you tried</option>
          {products.map((product) => <option key={product.id} value={product.id}>{shortName(product)}</option>)}
        </select>
      </label>
      <fieldset className="hr-rate">
        <legend>Your rating</legend>
        <div onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={(hover || rating) >= value ? 'is-on' : ''}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              aria-pressed={rating === value}
            >
              <Star size={28} aria-hidden="true" fill="currentColor" strokeWidth={1.4} />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="pg-row">
        <label className="pg-field">Your name
          <input type="text" name="author" required maxLength={80} autoComplete="given-name" />
        </label>
        <label className="pg-field">Title <small>(optional)</small>
          <input type="text" name="title" maxLength={120} />
        </label>
      </div>
      <label className="pg-field">Your review
        <textarea name="content" rows={4} required minLength={10} maxLength={2000} placeholder="How has it fitted into your day?" />
      </label>
      {/* Hidden from people; bots that fill it are ignored */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hr-trap" aria-hidden="true" />
      {error && <p className="pg-error" role="alert">{error}</p>}
      <div className="hr-form-actions">
        <button type="submit" className="ap-pill ap-pill--accent" disabled={busy}>{busy ? 'Posting…' : 'Post review'}</button>
        <button type="button" className="ap-link" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function HomeReviews({ products }) {
  const [data, setData] = useState(null);
  const [writing, setWriting] = useState(false);
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/products/reviews/latest`)
      .then(({ data: result }) => setData(result))
      .catch(() => setData({ average: 0, count: 0, reviews: [] }));
  }, []);

  const posted = (review) => {
    setWriting(false);
    setThanks(true);
    if (!review?.id) return;
    setData((current) => {
      const count = current.count + 1;
      return { count, average: Math.round(((current.average * current.count + review.rating) / count) * 10) / 10, reviews: [review, ...current.reviews].slice(0, 9) };
    });
  };

  if (!data) return null;
  const { reviews, average, count } = data;

  return (
    <section className="hr" aria-labelledby="hr-title">
      <div className="hr-head" data-reveal>
        <p className="wl-kicker">Reviews</p>
        <h2 id="hr-title">What people <em>are saying.</em></h2>
        {count > 0 ? (
          <p className="hr-summary"><Stars rating={average} size={20} /> <b>{average.toFixed(1)}</b> from {count} {count === 1 ? 'review' : 'reviews'}</p>
        ) : (
          <p className="hr-summary">No reviews yet. Tried Jayam? Be the first to share how it went.</p>
        )}
        {!writing && <button type="button" className="ap-pill ap-pill--accent" onClick={() => { setWriting(true); setThanks(false); }}>Write a review</button>}
        {thanks && <p className="hr-thanks" role="status">Thank you, your review is posted.</p>}
      </div>

      {writing && <ReviewForm products={products} onPosted={posted} onCancel={() => setWriting(false)} />}

      {reviews.length > 0 && (
        <ul className="hr-list">
          {reviews.map((review) => (
            <li key={review.id} className="hr-card">
              <Stars rating={review.rating} />
              {review.title && <h3>{review.title}</h3>}
              <p>{review.content}</p>
              <footer>
                <b>{review.author || 'Customer'}</b>
                <span>{formatDate(review.createdAt)}</span>
                {review.product && <Link to={`/products/${review.product.slug}`}>{review.product.name.replace(/^Organic\s+/i, '').split(' — ')[0]}</Link>}
              </footer>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
