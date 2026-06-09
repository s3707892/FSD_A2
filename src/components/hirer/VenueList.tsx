import { useState, useEffect, useMemo } from 'react';
import VenueCard from './VenueCard';
import { useAuth } from '../../hooks/useAuth';
import { getShortlist, addToShortlist, removeFromShortlist } from '../../api/Shortlist';
import { getVenues, ApiVenue } from '../../api/Venue';



type TabId = 'venues' | 'apply' | 'history' | 'shortlist';

const VenueList = ({
  setActiveTab,
  selectedVenueId,
  setSelectedVenueId,
}: {
  setActiveTab: (tab: TabId) => void;
  selectedVenueId: string;
  setSelectedVenueId: (id: string) => void;
}) => {
  const { currentUser } = useAuth();
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [suitabilityFilter, setSuitabilityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Extract unique suitabilities from venues
  const suitabilities = useMemo(() => {
    const unique = new Set<string>();
    venues.forEach(v => {
      v.suitabilities?.forEach(s => unique.add(s));
    });
    return Array.from(unique).sort();
  }, [venues]);

  useEffect(() => {
    getVenues().then(data => {
      setVenues(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      getShortlist(currentUser.id).then(items => setShortlistedIds(items.map(i => i.venueId)));
    }
  }, [currentUser]);

  const toggleShortlist = async (venueId: number) => {
    if (!currentUser) return;
    const isShortlisted = shortlistedIds.includes(venueId);
    try {
      if (isShortlisted) {
        const success = await removeFromShortlist(currentUser.id, venueId);
        if (success) setShortlistedIds(prev => prev.filter(id => id !== venueId));
      } else {
        const success = await addToShortlist(currentUser.id, venueId, shortlistedIds.length);
        if (success) setShortlistedIds(prev => [...prev, venueId]);
      }
    } catch (err) {
      console.error('Shortlist error', err);
    }
  };

  const filtered = useMemo(() => venues.filter(v => {
    const location = `${v.suburb} ${v.state || ''}`.toLowerCase();
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchLocation = location.includes(locationFilter.toLowerCase());
    const matchCapacity = !capacityFilter || v.capacity >= parseInt(capacityFilter, 10);
    const matchSuitability = !suitabilityFilter || v.suitabilities.some(s => s.toLowerCase().includes(suitabilityFilter.toLowerCase()));
    return matchSearch && matchLocation && matchCapacity && matchSuitability;
  }), [venues, search, locationFilter, capacityFilter, suitabilityFilter]);

  const featuredVenues = useMemo(() => venues.filter(v => v.featured), [venues]);

  if (!currentUser) return <p className="text-center text-gray-500 py-10">Please sign in to browse venues.</p>;
  if (loading) return <p className="text-center text-gray-400 py-10">Loading venues...</p>;

  return (
    <div className="space-y-6">
      {featuredVenues.length > 0 && (
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">Featured Venues</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredVenues.map(venue => (
              <VenueCard
                key={venue.venueId}
                venue={venue}
                isShortlisted={shortlistedIds.includes(venue.venueId)}
                onToggleShortlist={() => toggleShortlist(venue.venueId)}
                setActiveTab={setActiveTab}
                setSelectedVenueId={setSelectedVenueId}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse Venues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" placeholder="Filter by suburb..." value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="number" placeholder="Min capacity..." value={capacityFilter} onChange={e => setCapacityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={suitabilityFilter} onChange={e => setSuitabilityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">All suitability</option>
            {suitabilities.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No venues match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(venue => (
            <VenueCard
              key={venue.venueId}
              venue={venue}
              isShortlisted={shortlistedIds.includes(venue.venueId)}
              onToggleShortlist={() => toggleShortlist(venue.venueId)}
              setActiveTab={setActiveTab}
              setSelectedVenueId={setSelectedVenueId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VenueList;
