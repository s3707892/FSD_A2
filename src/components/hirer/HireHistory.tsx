// shows a hirer their past bookings and lets them leave a star rating and comment
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StarRating from '../shared/StarRating';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

interface Booking {
  bookingId: number;
  venueName: string;
  eventName: string;
  startDateTime: string;
  status: string;
  guests: number;
  duration: number;
  review: { rating: number; comment: string } | null;
}

const HireHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API}/bookings/user/${currentUser.id}`)
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentUser]);

  const avgRating = (() => {
    const reviewed = bookings.filter(b => b.review);
    if (!reviewed.length) return null;
    return (reviewed.reduce((sum, b) => sum + (b.review?.rating || 0), 0) / reviewed.length).toFixed(1);
  })();

  const submitReview = async (bookingId: number) => {
    const rating = ratings[bookingId];
    if (!rating) return;
    await fetch(`${API}/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment: comments[bookingId] || '' }),
    });
    setSubmitted(prev => ({ ...prev, [bookingId]: true }));
    setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, review: { rating, comment: comments[bookingId] || '' } } : b));
  };

  const statusBadge: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  if (loading) return <p className="text-center text-gray-400 py-10">Loading history...</p>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Hire History & Reputation</h2>
        {avgRating && (
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
            <span className="text-amber-500 text-sm">★</span>
            <span className="text-sm font-semibold text-amber-700">{avgRating} avg rating</span>
          </div>
        )}
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.bookingId} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.venueName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.eventName} · {new Date(b.startDateTime).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-500">{b.guests} guests · {b.duration}h</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge[b.status] || 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
              </div>

              {b.review ? (
                <div className="mt-2 bg-indigo-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 mb-1">Your review:</p>
                  <StarRating rating={b.review.rating} size="sm" />
                  {b.review.comment && <p className="text-xs text-gray-600 mt-1 italic">"{b.review.comment}"</p>}
                </div>
              ) : b.status === 'Approved' && !submitted[b.bookingId] ? (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <p className="text-xs font-medium text-gray-500 mb-2">Rate this hire:</p>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setRatings(p => ({ ...p, [b.bookingId]: n }))}
                        className={`text-xl ${(ratings[b.bookingId] || 0) >= n ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Comment (optional)" value={comments[b.bookingId] || ''}
                    onChange={e => setComments(p => ({ ...p, [b.bookingId]: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button onClick={() => submitReview(b.bookingId)} disabled={!ratings[b.bookingId]}
                    className="text-xs bg-indigo-700 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-800 disabled:opacity-50">
                    Submit Review
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HireHistory;
