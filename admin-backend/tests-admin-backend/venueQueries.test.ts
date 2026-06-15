import { mockVenueRepo } from './helpers/mockDataSource';

import { resolvers } from '../src/resolvers';


// create sample venue
const sampleVenue = {
  venueId: 1,
  name: 'Harbour Hall',
  addressLine1: '1 Wharf St',
  addressLine2: null,
  suburb: 'Sydney',
  postcode: '2000',
  capacity: 200,
  hourlyPrice: 150,
  description: 'Waterfront venue',
  active: true,
  featured: false,
  userId: 12,
  user: { userId: 12, email: 'vendor@example.com', roleId: 2 },
};

// making tests for queries read
describe('Venue Query resolvers (Read)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVenueRepo.find.mockResolvedValue([sampleVenue]);
    mockVenueRepo.findOne.mockResolvedValue(sampleVenue);
  });

  // checking if venues works
  describe('venues', () => {
    it('returns all venues with vendorEmail derived from the related user', async () => {
      const result = await resolvers.Query.venues();

      expect(mockVenueRepo.find).toHaveBeenCalledWith({ relations: ['user'] });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          venueId: 1,
          name: 'Harbour Hall',
          vendorEmail: 'vendor@example.com',
        })
      );
    });

    it('returns null vendorEmail when a venue has no assigned user', async () => {
      mockVenueRepo.find.mockResolvedValue([{ ...sampleVenue, user: null, userId: null }]);

      const result = await resolvers.Query.venues();

      expect(result[0].vendorEmail).toBeNull();
    });
  });

  // checking if venue works
  describe('venue', () => {
    // checking if venue returns a single venue by id with vendorEmail when found
    it('returns a single venue by id with vendorEmail when found', async () => {
      const result = await resolvers.Query.venue(null, { venueId: 1 });

      expect(mockVenueRepo.findOne).toHaveBeenCalledWith({
        where: { venueId: 1 },
        relations: ['user'],
      });
      expect(result).toEqual(
        expect.objectContaining({
          venueId: 1,
          name: 'Harbour Hall',
          vendorEmail: 'vendor@example.com',
        })
      );
    });
    // checking if venue returns null when the venue does not exist
    it('returns null when the venue does not exist', async () => {
      mockVenueRepo.findOne.mockResolvedValue(null);

      const result = await resolvers.Query.venue(null, { venueId: 999 });

      expect(result).toBeNull();
    });
  });
});
