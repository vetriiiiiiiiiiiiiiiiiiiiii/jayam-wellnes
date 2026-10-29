import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi, formatDateTime } from '../../lib/adminApi';
import { useNotice } from './adminBits';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');
  const [notice, notify] = useNotice();

  const load = useCallback(() => {
    adminApi.reviews().then((result) => (result.ok ? setReviews(result.data.data) : setError(result.message)));
  }, []);
  useEffect(load, [load]);

  const remove = async (review) => {
    if (!window.confirm('Delete this review from the product page?')) return;
    const result = await adminApi.deleteReview(review.id);
    if (!result.ok) return notify(result.message, 'error');
    notify('Review deleted');
    load();
  };

  if (error) return <p className="ad-error">{error}</p>;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Reviews</h1>
          <p className="ad-muted">Reviews appear on product pages straight away. Remove anything inappropriate or off-topic.</p>
        </div>
      </div>

      {!reviews ? (
        <p className="ad-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <section className="ad-card"><p className="ad-muted">No reviews yet.</p></section>
      ) : (
        <div className="ad-reviews">
          {reviews.map((review) => (
            <article key={review.id} className="ad-card ad-review">
              <div className="ad-review-head">
                <span className="ad-stars" aria-label={`${review.rating} out of 5`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <button type="button" className="ad-icon-btn ad-icon-btn--danger" onClick={() => remove(review)} aria-label="Delete review"><Trash2 size={16} /></button>
              </div>
              {review.title && <h3>{review.title}</h3>}
              {review.content && <p>{review.content}</p>}
              <p className="ad-muted ad-small">
                {review.author || 'Guest'} · {formatDateTime(review.createdAt)}
                {review.productId?.name ? <> · on <b>{review.productId.name}</b></> : null}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
