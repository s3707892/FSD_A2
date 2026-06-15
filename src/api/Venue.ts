// functions to fetch, create, update and delete venues from the api
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


export const getVendorVenues = async (vendorId: number): Promise<ApiVenue[]> => {
  const res = await api.get(`/venues/vendor/${vendorId}`);
  return res.data;
};


export const getStates = async (): Promise<{ stateId: number; state: string }[]> => {
  const res = await api.get(`/states`);
  return res.data;
};


export const getSuitabilityOptions = async (): Promise<string[]> => {
  const res = await api.get(`/suitability`);
  return res.data.map((s: any) => s.name.toLowerCase());
};


// use put if editing an existing venue or post if creating a new one
export const saveVenue = async (
  body: any,
  editVenueId?: number
): Promise<void> => {
  if (editVenueId) {
    await api.put(`/venues/${editVenueId}`, body);
  } else {
    await api.post(`/venues`, body);
  }
};


export const deleteVenue = async (venueId: number): Promise<void> => {
  await api.delete(`/venues/${venueId}`);
};