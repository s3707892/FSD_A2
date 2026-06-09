import { Link } from 'react-router-dom';

// bottom of every page quick links and contact details
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">🏛 VenueVendors</h3>
          <p className="text-sm leading-relaxed">
            Connecting hirers and vendors across Melbourne. Find and book the perfect venue for your next event.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/signin" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📍 Melbourne, Australia</li>
            <li>📧 business@venuevendors.com.au</li>
            <li>📞 (03) 3333 1111</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
        © {new Date().getFullYear()} VenueVendors. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;