import api from './Client';
import { ApiVenue } from './Venue';

export interface CreateBookingPayload {
  userId: number;
  venueId: number;
  startDateTime: string;
  eventName: string;
  guests: number;
  duration: number;
  abn: string | null;
  licensePhoto: string | null;
  liabilityDoc: string | null;
  abnDoc: string | null;
}

export interface ApiBooking {
  bookingId: number;
  userId: number;
  hirerName: string;
  hirerEmail: string;
  venueId: number;
  venueName: string;
  status: string;
  statusId: number;
  startDateTime: string;
  eventName: string;
  guests: number;
  duration: number;
  abn: string;
  licensePhoto: string;
  liabilityDoc: string;
  abnDoc: string;
  dateSubmitted: string;
  review: { rating: number; comment: string } | null;
}

export const createBooking = async (payload: CreateBookingPayload): Promise<boolean> => {
  try {
    await api.post('/bookings', payload);
    return true;
  } catch (err) {
    console.error('Booking error', err);
    return false;
  }
};

export const getBookings = async (userId: number): Promise<ApiBooking[]> => {
  try {
    const response = await api.get(`/bookings/vendor/${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const updateBookingStatus = async (bookingId: number, statusName: string): Promise<boolean> => {
  try {
    await api.post(`/bookings/${bookingId}/status`, { bookingId, statusName });
    return true;
  } catch (err) {
    console.error('Booking update error', err);
    return false;
  }
}


