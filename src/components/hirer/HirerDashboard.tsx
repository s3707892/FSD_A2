import { useState, useEffect, useRef } from 'react';
import VenueList from './VenueList';
import ApplicationForm from './ApplicationForm';
import HireHistory from './HireHistory';
import Shortlist from './Shortlist';

// define tab for the hirer dashboard navigation
const TABS = [
  { id: 'venues', label: 'Venues' },
  { id: 'apply', label: 'Apply' },
  { id: 'history', label: 'History' },
  { id: 'shortlist', label: 'Shortlist' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// define hirer dashboard with tabs for venues, apply, history and shortlist
const HirerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>('venues');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');

  const prevTabRef = useRef<TabId>('venues');

  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hirer Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Browse venues, submit applications and check your reputation.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      {activeTab === 'venues' && 
        <VenueList 
           setActiveTab={setActiveTab} 
           selectedVenueId={selectedVenueId} 
           setSelectedVenueId={setSelectedVenueId} 
        />
      }
      {activeTab === 'apply' && 
         <ApplicationForm 
           selectedVenueId={selectedVenueId}
        />
      }
      {activeTab === 'history' && 
         <HireHistory 
        />
      }
      {activeTab === 'shortlist' && 
         <Shortlist 
           setActiveTab={setActiveTab} 
           setSelectedVenueId={setSelectedVenueId} 
        />
      }
    </div>
  );
};

export default HirerDashboard;