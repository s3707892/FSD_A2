import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../shared/Toast';
import { ApiVenue } from '../../api/Venue';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

interface Blockout {
  blockoutId: number;
  venueId: number;
  venueName: string;
  startDate: string;
  endDate: string;
}

const VenueBlocker = () => {
  const { currentUser } = useAuth();
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [blockouts, setBlockouts] = useState<Blockout[]>([]);
  const [form, setForm] = useState({ venueId: '', from: '', to: '' });
  const [errors, setErrors] = useState<{ venueId?: string; from?: string; to?: string }>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    fetch(`${API}/venues/vendor/${currentUser.id}`)
      .then(r => r.json())
      .then((data: ApiVenue[]) => {
        if (!Array.isArray(data)) return;
        setVenues(data);
        const allBlockouts: Blockout[] = data.flatMap(v =>
          v.blockouts.map(b => ({ ...b, venueId: v.venueId, venueName: v.name }))
        );
        setBlockouts(allBlockouts);
      })
      .catch(() => {});
  };

  useEffect(() => { loadData(); }, [currentUser]);

  const set = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.venueId) e.venueId = 'Please select a venue.';
    if (!form.from) e.from = 'Start date is required.';
    if (!form.to) e.to = 'End date is required.';
    if (form.from && form.to && form.from > form.to) e.to = 'End date must be after start date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBlock = async () => {
    if (!validate()) return;
    const res = await fetch(`${API}/blockouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId: parseInt(form.venueId), startDate: form.from, endDate: form.to }),
    });
    if (res.ok) {
      const venue = venues.find(v => String(v.venueId) === form.venueId);
      setToast({ msg: `${venue?.name || 'Venue'} blocked from ${form.from} to ${form.to}.`, type: 'success' });
      setForm({ venueId: '', from: '', to: '' });
      loadData();
    } else {
      setToast({ msg: 'Failed to block venue.', type: 'error' });
    }
  };

  const handleUnblock = async (blockoutId: number, venueName: string) => {
    const res = await fetch(`${API}/blockouts/${blockoutId}`, { method: 'DELETE' });
    if (res.ok) {
      setToast({ msg: `${venueName} is now available again.`, type: 'success' });
      setBlockouts(prev => prev.filter(b => b.blockoutId !== blockoutId));
    }
  };

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Block a Timeslot</h2>
        <p className="text-sm text-gray-500 mb-5">Make a venue unavailable for a date range.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Select Venue *</label>
            <select value={form.venueId} onChange={e => set('venueId', e.target.value)} className={inputClass(errors.venueId) + ' bg-white'}>
              <option value="">Choose a venue...</option>
              {venues.map(v => <option key={v.venueId} value={String(v.venueId)}>{v.name}</option>)}
            </select>
            {errors.venueId && <p className="text-red-500 text-xs mt-1">{errors.venueId}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Block From *</label>
            <input type="date" value={form.from} onChange={e => set('from', e.target.value)}
              min={new Date().toISOString().split('T')[0]} className={inputClass(errors.from)} />
            {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Block To *</label>
            <input type="date" value={form.to} onChange={e => set('to', e.target.value)}
              min={form.from || new Date().toISOString().split('T')[0]} className={inputClass(errors.to)} />
            {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
          </div>
        </div>

        <button onClick={handleBlock} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          🚫 Block Timeslot
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Blockouts</h2>
        {blockouts.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No active blockouts.</p>
        ) : (
          <div className="space-y-3">
            {blockouts.map(b => (
              <div key={b.blockoutId} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.venueName}</p>
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    Blocked: {new Date(b.startDate).toLocaleDateString('en-AU')} → {new Date(b.endDate).toLocaleDateString('en-AU')}
                  </p>
                </div>
                <button onClick={() => handleUnblock(b.blockoutId, b.venueName)}
                  className="bg-white border border-gray-200 hover:bg-green-50 hover:border-green-300 text-gray-700 hover:text-green-700 text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                  ✓ Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueBlocker;
