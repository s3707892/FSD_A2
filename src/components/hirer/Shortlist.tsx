import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShortlistItem } from '../../types';
import { ApiVenue, getVenues } from '../../api/Venue';
import { getShortlist, removeFromShortlist, moveDownShortlist, moveUpShortlist } from '../../api/Shortlist';

type TabId = 'venues' | 'apply' | 'history' | 'shortlist';

interface ShortlistProps {
  setActiveTab: (tab: TabId) => void;
  setSelectedVenueId: (id: string) => void;
}

const Shortlist = ({ setActiveTab, setSelectedVenueId }: ShortlistProps) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [venueMap, setVenueMap] = useState<Record<number, ApiVenue>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getShortlist(currentUser.id),
      getVenues(),
    ]).then(([shortlist, venues]) => {
      setItems(shortlist || []);
      // build a lookup map so each venue can be found quickly by id
      const map: Record<number, ApiVenue> = {};
      venues.forEach((v: ApiVenue) => { map[v.venueId] = v; });
      setVenueMap(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);
  // reload shortlist and venue data after any move or remove action
  const refresh = async () => {
    if (!currentUser) return;
    try {
      const [shortlist, venues] = await Promise.all([
        getShortlist(currentUser.id),
        getVenues(),
      ]);
      setItems(shortlist || []);
      const map: Record<number, ApiVenue> = {};
      venues.forEach((v: ApiVenue) => { map[v.venueId] = v; });
      setVenueMap(map);
    } catch (err) {
      console.error('Failed to refresh shortlist', err);
    }
  };

  // Swap venue positions to change rank
  const moveRank = async (venueId: number, direction: 'up' | 'down') => {
    if (!currentUser || currentUser.role !== 'hirer') 
      return;
    try {
      if (direction === 'up') {
        await moveUpShortlist(currentUser.id, venueId);
      } else {
        await moveDownShortlist(currentUser.id, venueId);
      }
      await refresh();
    } catch (err) {
      console.error('Move error', err);
    }
  };
  const removeItem = async (venueId: number) => {
    if (!currentUser) return;
    const success = await removeFromShortlist(currentUser.id, venueId);
    if (success) refresh();
  };

  if (!currentUser) return null;
  if (loading) return <p className="text-center text-gray-400 py-10">Loading shortlist...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Shortlist</h2>
          <button 
            onClick={refresh} 
            disabled={loading}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">No venues shortlisted yet. Browse venues and click Shortlist to add them here.</p>
        ) : (
          <ol className="space-y-3">
            {items.map(({ venueId, ranking }) => {
              const venue = venueMap[venueId];
              return (
                <li key={venueId} className="flex items-center gap-4 bg-indigo-50 rounded-xl px-4 py-3">
                  <span className="w-8 h-8 bg-indigo-700 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">{ranking + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{venue?.name || `Venue #${venueId}`}</p>
                    <p className="text-xs text-gray-500">{venue ? `${venue.suburb}${venue.state ? ', ' + venue.state : ''}` : ''}</p>
                    {venue && <p className="text-xs text-indigo-600">${venue.hourlyPrice}/hr · {venue.capacity} guests</p>}
                  </div>
                  <button onClick={() => { setSelectedVenueId(String(venueId)); setActiveTab('apply'); }}
                    className="bg-indigo-700 text-white hover:bg-indigo-800 text-sm font-medium px-4 py-2 rounded-lg">
                    Apply
                  </button>
                    <button 
                      onClick={() => moveRank(venueId, 'up')} 
                      
                      className="p-1 text-gray-400 hover:text-indigo-700">▲
                    </button>
                    <button 
                      onClick={() => moveRank(venueId, 'down')} 
                      
                      className="p-1 text-gray-400 hover:text-indigo-700">▼
                    </button>
                  <button onClick={() => removeItem(venueId)} className="p-1 text-gray-400 hover:text-red-500 ml-1 text-lg">✕</button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default Shortlist;
