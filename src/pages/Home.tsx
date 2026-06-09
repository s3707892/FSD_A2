import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Introduction to our homepage to guide user what we provide using cards
const functionality = [
  { icon: '🏛', title: 'Browse Venues', desc: 'Find out list of Melbourne best hiring venues — from Consumer friendly to Ultra-luxurious.' },
  { icon: '📋', title: 'Easy Application', desc: 'Just submit event details, headcounts, date of event and you are good to go' },
  { icon: '⭐', title: 'Improved reputation', desc: 'Improve your hiring reputation everytime you hire with our platform.' },
  { icon: '✅', title: 'Fast Confirmation', desc: 'We review your applications, if all good, booking is confirmed.' },
];

// Step by step guidance to becoming our potential client
const guidance = [
  { step: '01', title: 'Create an account', desc: 'Sign up as a hirer or vendor.' },
  { step: '02', title: 'Browse', desc: 'Customer search venues with location, affordability and suitability filter.' },
  { step: '03', title: 'Submit application', desc: 'Fill in your event details and supporting documents and submit !' },
  { step: '04', title: 'Vendor confirms', desc: 'Vendors review applicants, check credibility, and confirm bookings.' },
];

// Authenticate user whether they are logged in and show them pages accordingly
const Home = () => {
  const { isAuthenticated, currentUser } = useAuth();
  // If logged in show dashboard page, otherwise show Signin/Signup Page
  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">Melbourne Fastest Growing Venue Hiring Platform</span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">Find and hire the perfect<br />venue for your event</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-8">Looking for a place to host your party? A birthday party to a corporate event. Join Us!</p>
          {isAuthenticated ? (
            <Link to={currentUser?.role === 'vendor' ? '/vendor' : '/hirer'} 
             className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-indigo-50">Go to My Dashboard →</Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signin" className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-indigo-50">Sign In</Link>
              <Link to="/signup" className="inline-block border border-white/40 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:bg-white/10">Sign Up</Link>
            </div>
            
          )}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">We are the one you should go for !</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {functionality.map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-3xl block mb-3">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guidance.map(s => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <span className="w-12 h-12 bg-indigo-700 text-white font-bold text-lg rounded-full flex items-center justify-center mb-4">{s.step}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Join us?</h2>
        <Link to="/signin" className="inline-block bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-3 rounded-xl text-sm">Get started today</Link>
      </section>
    </div>
  );
};

export default Home;