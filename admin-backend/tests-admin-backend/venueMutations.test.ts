import { mockVenueRepo } from './helpers/mockDataSource';
import { resolvers } from '../src/resolvers';


// create sample venue
const existingVenue = {
  venueId: 3,
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
};

// making tests for mutations create updae and delete
describe('Venue Mutation resolvers (Create, Update, Delete)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVenueRepo.findOne.mockResolvedValue({ ...existingVenue });
    mockVenueRepo.create.mockImplementation((data) => data);
    mockVenueRepo.save.mockImplementation((data) => Promise.resolve({ ...data, venueId: data.venueId ?? 50 }));
    mockVenueRepo.delete.mockResolvedValue(undefined);
  });

  // checking if create venue works
  describe('createVenue', () => {
    it('creates a venue and returns the created venue', async () => {
      const args = {
        name: 'New Event Space',
        addressLine1: '10 Main Rd',
        addressLine2: 'Suite 2',
        suburb: 'Melbourne',
        postcode: '3000',
        capacity: 80,
        hourlyPrice: 200,
        description: 'Modern city venue',
        userId: 12,
      };

      const result = await resolvers.Mutation.createVenue(null, args);

      expect(mockVenueRepo.create).toHaveBeenCalledWith({
        name: 'New Event Space',
        addressLine1: '10 Main Rd',
        addressLine2: 'Suite 2',
        suburb: 'Melbourne',
        postcode: '3000',
        capacity: 80,
        hourlyPrice: 200,
        description: 'Modern city venue',
        userId: 12,
        active: true,
        featured: false,
      });
      // check if the venue has been saved
      expect(mockVenueRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ venueId: 50, name: 'New Event Space' }));
    });

    it('sets addressLine2 to null when omitted', async () => {
      await resolvers.Mutation.createVenue(null, {
        name: 'Minimal Venue',
        addressLine1: '1 St',
        suburb: 'Brisbane',
        postcode: '4000',
        capacity: 50,
        hourlyPrice: 100,
        description: 'Compact space',
        userId: 5,
      });

      expect(mockVenueRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ addressLine2: null })
      );
    });
  });
  // checking if update venue works
  describe('updateVenue', () => {
    it('applies only the provided fields and saves the updated venue', async () => {
      const result = await resolvers.Mutation.updateVenue(null, {
        venueId: 3,
        name: 'Renamed Hall',
        capacity: 250,
        active: false,
      });

      expect(mockVenueRepo.findOne).toHaveBeenCalledWith({ where: { venueId: 3 } });
      expect(mockVenueRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          venueId: 3,
          name: 'Renamed Hall',
          capacity: 250,
          active: false,
          suburb: 'Sydney',
        })
      );
      expect(result).toEqual(
        expect.objectContaining({ name: 'Renamed Hall', capacity: 250, active: false })
      );
    });

    it('returns null when updating a venue that does not exist', async () => {
      mockVenueRepo.findOne.mockResolvedValue(null);

      const result = await resolvers.Mutation.updateVenue(null, {
        venueId: 999,
        name: 'Ghost Venue',
      });

      expect(result).toBeNull();
      expect(mockVenueRepo.save).not.toHaveBeenCalled();
    });
  });

  // checking if delete venue works
  describe('deleteVenue', () => {
    it('deletes the venue by id and returns true', async () => {
      const result = await resolvers.Mutation.deleteVenue(null, { venueId: 3 });

      expect(mockVenueRepo.delete).toHaveBeenCalledWith({ venueId: 3 });
      expect(result).toBe(true);
    });
  });
});
