import api from './Client';
import { ShortlistItem } from '../types';

export const getShortlist = async (userId: number): Promise<ShortlistItem[]> => {
  try {
    const response = await api.get(`/shortlist/${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addToShortlist = async (userId: number, venueId: number, ranking: number): Promise<boolean> => {
  try {
    await api.post('/shortlist', { userId, venueId, ranking });
    return true;
  } catch (err) {
    console.error('Shortlist error', err);
    return false;
  }
};

export const removeFromShortlist = async (userId: number, venueId: number): Promise<boolean> => {
  try {
    await api.delete('/shortlist', { data: { userId, venueId } });
    return true;
  } catch (err) {
    console.error('Shortlist error', err);
    return false;
  }
};

export const moveUpShortlist = async (userId: number, venueId: number): Promise<boolean> => {
  try {
    await api.post('/shortlist/moveUp', { userId, venueId });
    return true;
  } catch (err) {
    console.error('Shortlist error', err);
    return false;
  }
};

export const moveDownShortlist = async (userId: number, venueId: number): Promise<boolean> => {
  try {
    await api.post('/shortlist/moveDown', { userId, venueId });
    return true;
  } catch (err) {
    console.error('Shortlist error', err);
    return false;
  }
};
