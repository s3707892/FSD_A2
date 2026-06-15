// card component showing venue details with shortlist and apply buttons
import { ApiVenue } from '../../api/Venue';

type TabId = 'venues' | 'apply' | 'history' | 'shortlist';

interface VenueCardProps {
  venue: ApiVenue;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  setActiveTab: (tab: TabId) => void;
  setSelectedVenueId: (id: string) => void;
}

const suitabilityColours: Record<string, string> = {
  corporate: 'bg-blue-100 text-blue-700',
  wedding: 'bg-pink-100 text-pink-700',
  birthday: 'bg-purple-100 text-purple-700',
  concert: 'bg-orange-100 text-orange-700',
  conference: 'bg-teal-100 text-teal-700',
  exhibition: 'bg-green-100 text-green-700',
  dinner: 'bg-yellow-100 text-yellow-700',
  tennis: 'bg-lime-100 text-lime-700',
};

const isBlocked = (venue: ApiVenue): boolean => {
  const today = new Date();
  return venue.blockouts.some(b => new Date(b.startDate) <= today && today <= new Date(b.endDate));
};

const VenueCard = ({ venue, isShortlisted, onToggleShortlist, setActiveTab, setSelectedVenueId }: VenueCardProps) => {
  const blocked = isBlocked(venue);
  const location = `${venue.suburb}${venue.state ? ', ' + venue.state : ''}`;
  const imgSrc = venue.imageUrl || 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${blocked ? 'opacity-60' : 'hover:shadow-md'} ${isShortlisted ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100'}`}>
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        <img src={imgSrc} alt={venue.name} className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'; }} />
        {blocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-600 px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">{venue.name}</h3>
          <span className="text-xs text-gray-500">${venue.hourlyPrice}/hr</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{location} · Up to {venue.capacity.toLocaleString()} guests</p>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{venue.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {venue.suitabilities.map(s => (
            <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${suitabilityColours[s.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{s}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setSelectedVenueId(String(venue.venueId)); setActiveTab('apply'); }} disabled={blocked}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${blocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
            {blocked ? 'Unavailable' : 'Apply Now'}
          </button>
          <button onClick={() => !blocked && onToggleShortlist()} disabled={blocked}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${blocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isShortlisted ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-indigo-700 text-white hover:bg-indigo-800'}`}>
            {isShortlisted ? '✓ Shortlisted' : 'Shortlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
