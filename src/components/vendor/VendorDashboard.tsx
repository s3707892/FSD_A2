import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StarRating from '../shared/StarRating';
import Toast from '../shared/Toast';
import VenueBlocker from './VenueBlocker';
import ApplicantChart from './ApplicantChart';
import VenueManager from './VenueManager';
import { getBookings, updateBookingStatus, ApiBooking } from '../../api/Booking';


const TABS = [
  { id: 'applications', label: '📋 Applications' },
  { id: 'venues', label: '🏛 My Venues' },
  { id: 'chart', label: '📊 Analytics' },
  { id: 'block', label: '🚫 Blockouts' },
] as const;

type TabId = (typeof TABS)[number]['id'];



const complianceScore = (b: ApiBooking): number => {
  let score = 0;
  if (b.abn?.length === 10) score++;
  if (b.licensePhoto) score += 2;
  if (b.liabilityDoc) score++;
  if (b.abnDoc) score++;
  return Math.min(score, 5);
};

const openBase64 = (data: string, type: string) => {
  try {
    const base64Data = data.split(',')[1];
    const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type });
    window.open(URL.createObjectURL(blob));
  } catch { alert('Unable to open document.'); }
};

const VendorDashboard = ()  => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('applications');
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'reputation'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const loadBookings = async () => {
      if (!currentUser) return;

      try {
        const data = await getBookings(currentUser.id);
        console.log("Bookings returned:", data);
        setBookings(data);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentUser]);

  const updateStatus = async (bookingId: number, statusName: string) => {
    const success = await updateBookingStatus(bookingId, statusName);
    if (success) {
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: statusName } : b));
      setToast({ msg: `Booking ${statusName.toLowerCase()} successfully.`, type: 'success' });
    }
  };

  const getReputation = (b: ApiBooking): number => b.review?.rating || 0;

  const sorted = [...bookings].sort((a, b) => {
    const diff = sortBy === 'reputation'
      ? getReputation(b) - getReputation(a)
      : new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
    return sortDir === 'desc' ? diff : -diff;
  });

  const statusBadge: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your venues, review booking applications and track analytics.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'applications' && (
        <>
          {loading ? <p className="text-gray-400 py-10 text-center">Loading bookings...</p> : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">{sorted.length} booking{sorted.length !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Sort by:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="date">Most recent</option>
                    <option value="reputation">Reputation</option>
                  </select>
                  <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                    {sortDir === 'desc' ? '↓ Desc' : '↑ Asc'}
                  </button>
                </div>
              </div>

              {sorted.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p>No booking applications yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {sorted.map(app => {
                    const rep = getReputation(app);
                    const compliance = complianceScore(app);
                    return (
                      <div key={app.bookingId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{app.hirerName}</h3>
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge[app.status] || 'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{app.hirerEmail}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Reputation:</span>
                              <StarRating rating={Math.round(rep)} size="sm" />
                              <span className="text-xs text-gray-500">({rep.toFixed(1)})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Compliance:</span>
                              <span className="text-xs font-medium text-indigo-700">{'⭐'.repeat(compliance) || '☆☆☆☆☆'} ({compliance}/5)</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                          <div><p className="text-xs text-gray-400 mb-0.5">Venue</p><p className="font-medium text-gray-800">{app.venueName}</p></div>
                          <div><p className="text-xs text-gray-400 mb-0.5">Event</p><p className="font-medium text-gray-800">{app.eventName}</p></div>
                          <div><p className="text-xs text-gray-400 mb-0.5">Date & Time</p><p className="font-medium text-gray-800">{new Date(app.startDateTime).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                          <div><p className="text-xs text-gray-400 mb-0.5">Guests / Duration</p><p className="font-medium text-gray-800">{app.guests} guests · {app.duration}h</p></div>
                        </div>

                        {(app.licensePhoto || app.liabilityDoc || app.abnDoc) && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Compliance Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {app.licensePhoto && (
                                <button onClick={() => openBase64(app.licensePhoto, 'image/jpeg')}
                                  className="text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
                                  🪪 View Driver's License
                                </button>
                              )}
                              {app.liabilityDoc && (
                                <button onClick={() => openBase64(app.liabilityDoc, 'application/pdf')}
                                  className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                                  📄 View Liability Insurance
                                </button>
                              )}
                              {app.abnDoc && (
                                <button onClick={() => openBase64(app.abnDoc, 'application/pdf')}
                                  className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100">
                                  🏢 View ABN Certificate
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Vendor comment</label>
                          <textarea value={comments[app.bookingId] ?? ''} rows={2}
                            onChange={e => setComments(prev => ({ ...prev, [app.bookingId]: e.target.value }))}
                            placeholder="Add a note about this applicant..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        {app.status === 'Pending' && (
                          <div className="flex gap-3">
                            <button onClick={() => updateStatus(app.bookingId, 'Approved')}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                              ✓ Approve
                            </button>
                            <button onClick={() => updateStatus(app.bookingId, 'Rejected')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'venues' && <VenueManager />}
      {activeTab === 'chart' && <ApplicantChart />}
      {activeTab === 'block' && <VenueBlocker />}
    </div>
  );
};

export default VendorDashboard;
