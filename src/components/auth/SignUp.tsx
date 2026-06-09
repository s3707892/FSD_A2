import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword, validateName, validatePhone } from '../../utils/validation';
import Toast from '../shared/Toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'hirer' | 'vendor'>('hirer');
  const [form, setForm] = useState({ firstName: '', lastName: '', businessName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState<Partial<typeof form & { form: string }>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    const phoneErr = validatePhone(form.phone);

    if (emailErr) e.email = emailErr;
    if (passErr) e.password = passErr;
    if (phoneErr) e.phone = phoneErr;
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';

    if (role === 'hirer') {
      const fErr = validateName(form.firstName);
      const lErr = validateName(form.lastName);
      if (fErr) e.firstName = fErr;
      if (lErr) e.lastName = lErr;
    } else {
      if (!form.businessName.trim()) e.businessName = 'Business name is required.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const body: Record<string, any> = {
        email: form.email,
        password: form.password,
        phone: form.phone,
        roleId: role === 'hirer' ? 1 : 2,
      };
      if (role === 'hirer') { body.firstName = form.firstName; body.lastName = form.lastName; }
      else { body.businessName = form.businessName; }

      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.status === 409) throw new Error('This email is already registered. Please sign in.');
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setToast('Account created! Redirecting to sign in...');
      setTimeout(() => navigate('/signin'), 1500);
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof typeof errors) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-10">
      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🏛</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Venue Vendors today</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          {(['hirer', 'vendor'] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${role === r ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {r === 'hirer' ? '👤 Hirer' : '🏢 Vendor'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.form && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{errors.form}</div>}

          {role === 'hirer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                <input value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputClass('firstName')} placeholder="Alex" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                <input value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputClass('lastName')} placeholder="Smith" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Business Name *</label>
              <input value={form.businessName} onChange={e => set('businessName', e.target.value)} className={inputClass('businessName')} placeholder="Your Venue Pty Ltd" />
              {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass('phone')} placeholder="0412 345 678" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className={inputClass('password') + ' pr-12'} placeholder="Min 6 chars, 1 upper, 1 lower, 1 special" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">{showPassword ? '🙈' : '👁'}</button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={inputClass('confirmPassword') + ' pr-12'} placeholder="Re-enter your password" />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">{showConfirm ? '🙈' : '👁'}</button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          Already have an account? <Link to="/signin" className="text-indigo-700 font-medium hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
