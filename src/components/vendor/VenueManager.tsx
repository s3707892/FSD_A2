import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../shared/Toast';
import { ApiVenue } from '../../api/Venue';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const SUITABILITY_OPTIONS = ['wedding', 'birthday', 'corporate', 'conference', 'concert', 'exhibition', 'dinner', 'tennis', 'rock concert', 'classical music'];
const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
const STATE_ID_MAP: Record<string, number> = { NSW: 8, VIC: 9, QLD: 10, WA: 11, SA: 12, TAS: 13, ACT: 14, NT: 15 };

const emptyForm = { name: '', addressLine1: '', addressLine2: '', suburb: '', postcode: '', state: '', capacity: '', description: '', hourlyPrice: '', imageUrl: '', suitabilityNames: [] as string[] };

const VenueManager = () => {
  const { currentUser } = useAuth();
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVenue, setEditVenue] = useState<ApiVenue | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadVenues = () => {
    if (!currentUser) return;
    fetch(`${API}/venues/vendor/${currentUser.id}`)
      .then(r => r.json())
      .then(data => { setVenues(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadVenues(); }, [currentUser]);

  const openCreate = () => {
    setEditVenue(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (v: ApiVenue) => {
    setEditVenue(v);
    setForm({
      name: v.name,
      addressLine1: v.addressLine1,
      addressLine2: v.addressLine2 || '',
      suburb: v.suburb,
      postcode: v.postcode,
      state: v.state || '',
      capacity: String(v.capacity),
      description: v.description,
      hourlyPrice: String(v.hourlyPrice),
      imageUrl: v.imageUrl || '',
      suitabilityNames: v.suitabilities.map(s => s.toLowerCase()),
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required.';
    if (!form.suburb.trim()) e.suburb = 'Suburb is required.';
    if (!form.postcode.trim()) e.postcode = 'Postcode is required.';
    if (!form.capacity || isNaN(parseInt(form.capacity)) || parseInt(form.capacity) <= 0) e.capacity = 'Valid capacity required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.hourlyPrice || isNaN(parseFloat(form.hourlyPrice)) || parseFloat(form.hourlyPrice) <= 0) e.hourlyPrice = 'Valid price required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !currentUser) return;
    setSaving(true);
    try {
      const body = { ...form, vendorId: currentUser.id, stateId: STATE_ID_MAP[form.state] };
      const url = editVenue ? `${API}/venues/${editVenue.venueId}` : `${API}/venues`;
      const method = editVenue ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setToast({ msg: editVenue ? 'Venue updated!' : 'Venue created!', type: 'success' });
      setShowForm(false);
      loadVenues();
    } catch {
      setToast({ msg: 'Failed to save venue.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (venueId: number) => {
    if (!window.confirm('Deactivate this venue?')) return;
    const res = await fetch(`${API}/venues/${venueId}`, { method: 'DELETE' });
    if (res.ok) {
      setToast({ msg: 'Venue deactivated.', type: 'success' });
      loadVenues();
    }
  };

  const toggleSuitability = (s: string) => {
    setForm(prev => ({
      ...prev,
      suitabilityNames: prev.suitabilityNames.includes(s)
        ? prev.suitabilityNames.filter(x => x !== s)
        : [...prev.suitabilityNames, s],
    }));
  };

  const inputCls = (field: keyof typeof emptyForm) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${(errors as any)[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  if (loading) return <p className="text-center text-gray-400 py-10">Loading venues...</p>;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">My Venues ({venues.length})</h2>
        <button onClick={openCreate} className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Add Venue
        </button>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏛</p>
          <p>No venues yet. Create your first venue!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {venues.map(v => (
            <div key={v.venueId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {v.imageUrl && <img src={v.imageUrl} alt={v.name} className="w-full h-36 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{v.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{v.active ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">📍 {v.suburb}{v.state ? ', ' + v.state : ''} · 👥 {v.capacity}</p>
                <p className="text-xs text-gray-500 mb-3">${v.hourlyPrice}/hr</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {v.suitabilities.map(s => <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(v)} className="flex-1 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-lg font-medium">Edit</button>
                  <button onClick={() => handleDelete(v.venueId)} className="flex-1 text-sm text-red-700 bg-red-50 hover:bg-red-100 py-1.5 rounded-lg font-medium">Deactivate</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">{editVenue ? 'Edit Venue' : 'Add New Venue'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Venue Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls('name')} placeholder="e.g. The Grand Ballroom" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address Line 1 *</label>
                  <input value={form.addressLine1} onChange={e => setForm(p => ({ ...p, addressLine1: e.target.value }))} className={inputCls('addressLine1')} placeholder="123 Collins St" />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address Line 2</label>
                  <input value={form.addressLine2} onChange={e => setForm(p => ({ ...p, addressLine2: e.target.value }))} className={inputCls('addressLine2')} placeholder="Suite 4 (optional)" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Suburb *</label>
                  <input value={form.suburb} onChange={e => setForm(p => ({ ...p, suburb: e.target.value }))} className={inputCls('suburb')} placeholder="Melbourne" />
                  {errors.suburb && <p className="text-red-500 text-xs mt-1">{errors.suburb}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Postcode *</label>
                  <input value={form.postcode} onChange={e => setForm(p => ({ ...p, postcode: e.target.value }))} className={inputCls('postcode')} placeholder="3000" />
                  {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                  <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className={inputCls('state') + ' bg-white'}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Capacity *</label>
                  <input type="number" min="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} className={inputCls('capacity')} placeholder="200" />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price per Hour ($) *</label>
                  <input type="number" min="0" step="0.01" value={form.hourlyPrice} onChange={e => setForm(p => ({ ...p, hourlyPrice: e.target.value }))} className={inputCls('hourlyPrice')} placeholder="150" />
                  {errors.hourlyPrice && <p className="text-red-500 text-xs mt-1">{errors.hourlyPrice}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description *</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputCls('description')} placeholder="Describe your venue..." />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                  <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className={inputCls('imageUrl')} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Suitability Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {SUITABILITY_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => toggleSuitability(s)}
                        className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${form.suitabilityNames.includes(s) ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm">
                  {saving ? 'Saving...' : editVenue ? 'Update Venue' : 'Create Venue'}
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueManager;
