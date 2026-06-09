// User role authenticate
export type UserRole = 'hirer' | 'vendor';

export interface User {
  id: number;
  email: string;
  role: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  joinedAt?: string;
}

// Venue Authentication
export type VenueSuitability = 
'corporate' | 'wedding' | 'birthday' 
| 'concert' | 'conference' | 'exhibition';

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  suitability: VenueSuitability[];
  description: string;
  imageUrl: string;
  pricePerHour: number;
  isBlocked: boolean;
  blockedFrom?: string; 
  blockedTo?: string;   
}
// Application status function vendor side
export type ApplicationStatus = 
'pending' | 'approved' | 'rejected';

export interface Application {
  id: string;
  hirerId: number;
  hirerName: string;
  hirerEmail: string;
  venueId: string;
  venueName: string;
  eventName: string;
  expectedGuests: number;
  eventDate: string;   // ISO date string
  startTime: string;   // e.g. "12:30 PM"
  duration: number;    // hours
  eventABN: string;
  licenseFile: string;
  liabilityFile: string;
  abnCertFile: string;
  status: ApplicationStatus;
  vendorComment?: string;
  createdAt: string;
}

// HireHistory function
export interface HireRecord {
  id: string;
  hirerId: string | number;
  venueId: string;
  venueName: string;
  venueLocation: string;
  eventName: string;
  dateOfHire: string;
  rating: number; // 0–5
}

// Ranked venue for hirer preference
export interface ShortlistItem {
  venueId: number;
  ranking: number;
}

// Hirer preference 
export interface RankedVenue {
  venueId: string;
  rank: number;
}

// authentication of user session
export interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<string | false>;
  signOut: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}