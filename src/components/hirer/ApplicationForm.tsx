// form for hirers to apply for a venue booking with optional compliance documents
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateRequired, validateExpectedGuests, validateFutureDate, validateDuration, validateABN } from '../../utils/validation';
import Toast from '../shared/Toast';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { ApiVenue, getVenues } from '../../api/Venue';
import { createBooking } from '../../api/Booking';

const ApplicationForm = ({ selectedVenueId }: { selectedVenueId?: string }) => {
  const { currentUser } = useAuth();
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [form, setForm] = useState({ venueId: selectedVenueId || '', eventName: '', expectedGuests: '', eventDate: '', startTime: '', duration: '', eventABN: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);
  const liabilityInputRef = useRef<HTMLInputElement | null>(null);
  const abnInputRef = useRef<HTMLInputElement | null>(null);
  const [licenseFileName, setLicenseFileName] = useState('');
  const [liabilityFileName, setLiabilityFileName] = useState('');
  const [abnCertFileName, setAbnCertFileName] = useState('');

  useEffect(() => {
    getVenues()
      .then(data => setVenues(Array.isArray(data) ? data.filter((v: ApiVenue) => !isVenueBlocked(v)) : []))
      .catch(() => {});
  }, []);

  const isVenueBlocked = (v: ApiVenue) => {
    const today = new Date();
    return v.blockouts.some(b => new Date(b.startDate) <= today && today <= new Date(b.endDate));
  };

  useEffect(() => {
    if (selectedVenueId) setForm(prev => ({ ...prev, venueId: selectedVenueId }));
  }, [selectedVenueId]);

  const set = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.venueId) e.venueId = 'Please select a venue.';
    const venue = venues.find(v => String(v.venueId) === form.venueId);
    const eventErr = validateRequired(form.eventName, 'Event name');
    const guestsErr = validateExpectedGuests(form.expectedGuests, 'Expected guests', venue?.capacity || 9999);
    const dateErr = validateFutureDate(form.eventDate);
    const timeErr = validateRequired(form.startTime, 'Start time');
    const durErr = validateDuration(form.duration);
    const abnErr = validateABN(form.eventABN);
    if (eventErr) e.eventName = eventErr;
    if (guestsErr) e.expectedGuests = guestsErr;
    if (dateErr) e.eventDate = dateErr;
    if (timeErr) e.startTime = timeErr;
    if (durErr) e.duration = durErr;
    if (abnErr) e.eventABN = abnErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateStars = (abnValue?: string) => {
    let count = 0;
    const abnToCheck = abnValue !== undefined ? abnValue : form.eventABN;
    if (abnToCheck.length === 10) count++;
    if (localStorage.getItem('licenseFile')) count += 2;
    if (localStorage.getItem('liabilityFile')) count++;
    if (localStorage.getItem('abnFile')) count++;
    setStars(Math.min(count, 5));
  };

  const readFile = (file: File, key: string, setName: (n: string) => void) => {
    if (file.size === 0) { alert('File is empty.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('File must be under 2MB.'); return; }
    setName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => { localStorage.setItem(key, reader.result as string); updateStars(); };
  };

  const removeFile = (key: string, setName: (n: string) => void, ref: React.RefObject<HTMLInputElement | null>) => {
    localStorage.removeItem(key);
    setName('');
    if (ref.current) ref.current.value = '';
    updateStars();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !currentUser) return;
    setLoading(true);
    try {
      const startDateTime = `${form.eventDate}T${form.startTime}:00`;
      const body = {
        userId: currentUser.id,
        venueId: parseInt(form.venueId),
        startDateTime,
        eventName: form.eventName,
        guests: parseInt(form.expectedGuests),
        duration: parseFloat(form.duration),
        abn: form.eventABN || null,
        licensePhoto: localStorage.getItem('licenseFile') || null,
        liabilityDoc: localStorage.getItem('liabilityFile') || null,
        abnDoc: localStorage.getItem('abnFile') || null,
      };

      const success = await createBooking(body);
      if (!success) throw new Error('Failed to submit');
      setToast('Application submitted successfully!');
      setForm({ venueId: '', eventName: '', expectedGuests: '', eventDate: '', startTime: '', duration: '', eventABN: '' });
      localStorage.removeItem('licenseFile');
      localStorage.removeItem('liabilityFile');
      localStorage.removeItem('abnFile');
      setLicenseFileName('');
      setLiabilityFileName('');
      setAbnCertFileName('');
      updateStars('');
    } catch {
      setToast('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof typeof form) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Apply for a Venue</h2>
      <hr /><br />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Select Venue *</label>
          <select value={form.venueId} id="venueId" onChange={e => set('venueId', e.target.value)} className={inputClass('venueId') + ' bg-white'}>
            <option value="">Choose a venue...</option>
            {venues.map(v => <option key={v.venueId} value={String(v.venueId)}>{v.name} — {v.suburb}{v.state ? ', ' + v.state : ''}</option>)}
          </select>
          {errors.venueId && <p className="text-red-500 text-xs mt-1">{errors.venueId}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Event Name *</label>
          <input type="text" value={form.eventName} onChange={e => set('eventName', e.target.value)} className={inputClass('eventName')} placeholder="e.g. Annual Awards Night" />
          {errors.eventName && <p className="text-red-500 text-xs mt-1">{errors.eventName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Expected Guests *</label>
            <input type="number" min="1" value={form.expectedGuests} onChange={e => set('expectedGuests', e.target.value)} className={inputClass('expectedGuests')} placeholder="e.g. 150" />
            {errors.expectedGuests && <p className="text-red-500 text-xs mt-1">{errors.expectedGuests}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (hours) *</label>
            <input type="number" min="1" max="24" step="0.5" value={form.duration} onChange={e => set('duration', e.target.value)} className={inputClass('duration')} placeholder="e.g. 4" />
            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Event Date *</label>
            <input type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} className={inputClass('eventDate')} min={new Date().toISOString().split('T')[0]} />
            {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Time *</label>
            <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className={inputClass('startTime')} />
            {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
          </div>
        </div>
        <hr />
        <h1>Compliance Documents</h1>
        <hr />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Driver's License (JPG only)</label>
            <input ref={licenseInputRef} type="file" accept="image/jpeg" id="license-btn" onChange={e => e.currentTarget.files?.[0] && readFile(e.currentTarget.files[0], 'licenseFile', setLicenseFileName)} hidden />
            <label htmlFor="license-btn" className="inline-block bg-indigo-500 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-lg text-sm cursor-pointer mt-2">Choose File</label>
            {licenseFileName && <div><p className="text-xs text-gray-500 mt-1">{licenseFileName}</p><button type="button" onClick={() => removeFile('licenseFile', setLicenseFileName, licenseInputRef)} className="text-xs text-red-500 hover:underline">Remove</button></div>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Public Liability Insurance (PDF only)</label>
            <input ref={liabilityInputRef} type="file" accept="application/pdf" id="liability-btn" onChange={e => e.currentTarget.files?.[0] && readFile(e.currentTarget.files[0], 'liabilityFile', setLiabilityFileName)} hidden />
            <label htmlFor="liability-btn" className="inline-block bg-indigo-500 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-lg text-sm cursor-pointer mt-2">Choose File</label>
            {liabilityFileName && <div><p className="text-xs text-gray-500 mt-1">{liabilityFileName}</p><button type="button" onClick={() => removeFile('liabilityFile', setLiabilityFileName, liabilityInputRef)} className="text-xs text-red-500 hover:underline">Remove</button></div>}
          </div>
        </div>

        <button type="button" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-100 hover:bg-gray-50">
          Expand for business documents
          <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
        </button>

        {isOpen && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ABN (10 characters)</label>
              <input type="text" value={form.eventABN} onChange={e => { set('eventABN', e.target.value); updateStars(e.target.value); }} className={inputClass('eventABN')} placeholder="e.g. AB45243523" />
              {errors.eventABN && <p className="text-red-500 text-xs mt-1">{errors.eventABN}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Certificate of Registration for Business Name (PDF only)</label>
              <input ref={abnInputRef} type="file" accept="application/pdf" id="abnCert-btn" onChange={e => e.currentTarget.files?.[0] && readFile(e.currentTarget.files[0], 'abnFile', setAbnCertFileName)} hidden />
              <label htmlFor="abnCert-btn" className="inline-block bg-indigo-500 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-lg text-sm cursor-pointer mt-2">Choose File</label>
              {abnCertFileName && <div><p className="text-xs text-gray-500 mt-1">{abnCertFileName}</p><button type="button" onClick={() => removeFile('abnFile', setAbnCertFileName, abnInputRef)} className="text-xs text-red-500 hover:underline">Remove</button></div>}
            </div>
          </div>
        )}

        <br /><hr />
        <p className="text-sm">Current Compliance Rating: {['☆☆☆☆☆','★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★'][stars]}</p>
        <hr /><br />
        <button type="submit" disabled={loading} data-testid="submit-btn" className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
