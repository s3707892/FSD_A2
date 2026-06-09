import api from './Client';

export interface ApiVenue {
  venueId: number;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  suburb: string;
  postcode: string;
  state: string;
  capacity: number;
  description: string;
  hourlyPrice: number;
  active: boolean;
  featured: boolean;
  vendorId: number;
  suitabilities: string[];
  imageUrl: string | null;
  blockouts: { blockoutId: number; startDate: string; endDate: string }[];
}

export const getVenues = async (): Promise<ApiVenue[]> => {
  try {
    const response = await api.get('/venues');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

