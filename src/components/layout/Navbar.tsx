import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AccountMenu from './AccountMenu';
import React from 'react';

// top nav shows different links depending on login state and role
const Navbar = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // hirers go to browse page, vendors go to their dashboard
  const dashboardPath = currentUser?.role === 'hirer' ? '/hirer' : '/vendor';
  const dashboardText = currentUser?.role === 'hirer' ? 'Browse Venues' : 'Vendor Dashboard';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-700 hover:bg-gray-300 transition-colors p-2 rounded-lg">
            <span className="text-2xl">🏛</span>
            <span>Venue<span className="text-gray-800">Vendors</span></span>
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-gray-600 hover:text-indigo-700 transition-colors">Home</Link>
            {isAuthenticated && (
              <Link to={dashboardPath} className="text-gray-600 hover:text-indigo-700 transition-colors">
                {dashboardText}
              </Link>
            )}
            {isAuthenticated && currentUser && (
              <span className="text-indigo-700 font-semibold hidden sm:inline">
                Welcome, {currentUser.firstName || currentUser.businessName || currentUser.email.split('@')[0]}
              </span>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/signup" className="text-gray-600 hover:text-indigo-700 transition-colors">Sign Up</Link>
                <Link to="/signin" className="bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors">Sign In</Link>
              </>
            )}
            {isAuthenticated && <AccountMenu />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;