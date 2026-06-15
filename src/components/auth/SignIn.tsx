import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import Toast from '../shared/Toast';
import React from 'react';

// sign in page with email and password using hardcoded data
const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignOutToast, setShowSignOutToast] = useState(false);

 // check email and password before trying to sign in
  const validate = (): boolean => {
    const e: typeof errors = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
  
    if (emailErr) e.email = emailErr;
    if (passErr) e.password = passErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  
  // show signed out message if sign out
  useEffect(() => {
    if (location.state?.signedOut) {
      setShowSignOutToast(true);
      window.history.replaceState({}, document.title, '/');
    }
   }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const role = await signIn(email, password);
    if (role) {
      setShowToast(true);
      setTimeout(() => {
        if (role === "Vendor") navigate("/vendor");
        else if (role === "Admin") navigate("/admin");
        else navigate("/hirer");
      }, 1200);
    } else {
      setErrors({ form: 'Invalid email or password. Please try again.' });
    }
  };

  // red border if field has error, normal otherwise
  const inputClass = (err?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm 
     focus:outline-none focus:ring-2 focus:ring-indigo-500 transition 
     ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      {showToast && <Toast message="Signed in successfully!" type="success" onClose={() => setShowToast(false)} />}
      {showSignOutToast && <Toast message="You've been successfully signed out." type="success" onClose={() => setShowSignOutToast(false)} />}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        
        {/* header section with logo and welcome message */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏛</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Welcome back !</h1>
          <p className="text-gray-500 text-sm mt-1">Please sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.form && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{errors.form}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input 
               id="email" 
               type="email" 
               value={email} 
               onChange={e => { 
                setEmail(e.target.value); 
                setErrors(p => ({ ...p, email: undefined, form: undefined })); 
              }}
              className={inputClass(errors.email)} 
              placeholder="you@example.com" 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined, form: undefined })); }}
                className={inputClass(errors.password) + ' pr-12'} placeholder="Your password" />
              <button 
                 type="button" 
                 onClick={() => setShowPassword(v => !v)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                 {showPassword ? 'Hide' : 'Show'}
              </button>
             </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/signup" className="text-indigo-700 font-medium hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;