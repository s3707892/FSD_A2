// function to fetch all available suitability event type options from the api
import api from './Client';

export interface Suitability {
    suitabilityId: number,
    name: String
}


export const getSuitabilities = async (): Promise<Suitability[]> => {
  try {
    const response = await api.get('/suitabilities');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};
