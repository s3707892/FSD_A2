// lets a hirer view and edit their personal profile details
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateName, validatePhone } from '../../utils/validation';
import Toast from '../shared/Toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const HirerProfile = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; phone?: string }>({});
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    const fnErr = validateName(firstName);
    const lnErr = validateName(lastName);
    const phErr = validatePhone(phone);
    if (fnErr) e.firstName = fnErr;
    if (lnErr) e.lastName = lnErr;
    if (phErr) e.phone = phErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      if (!res.ok) throw new Error('Update failed');
      updateCurrentUser({ firstName, lastName, phone });
      setToast('Profile updated successfully!');
      setEditing(false);
    } catch {
      setToast('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const joinDate = currentUser?.joinedAt
    ? new Date(currentUser.joinedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const inputCls = (err?: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${err ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-indigo-700 hover:underline ml-auto">Edit</button>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-700">
            {(currentUser?.firstName?.[0] || currentUser?.email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
            <p className="text-sm text-gray-500">{currentUser?.role}</p>
            {joinDate && <p className="text-xs text-gray-400 mt-0.5">Member since {joinDate}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{currentUser?.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
              {editing ? <>
                <input value={firstName} onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: undefined })); }} className={inputCls(errors.firstName)} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </> : <p className="text-sm text-gray-800">{firstName || '—'}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
              {editing ? <>
                <input value={lastName} onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: undefined })); }} className={inputCls(errors.lastName)} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </> : <p className="text-sm text-gray-800">{lastName || '—'}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
            {editing ? <>
              <input value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }} className={inputCls(errors.phone)} placeholder="e.g. 0412 345 678" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </> : <p className="text-sm text-gray-800">{phone || '—'}</p>}
          </div>
          {editing && (
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={loading}
                className="bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-800 disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setErrors({}); }} className="text-sm text-gray-500 px-3 py-2">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HirerProfile;
