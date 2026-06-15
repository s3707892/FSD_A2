import './helpers/mockDataSource';
import { mockRepo } from './helpers/mockDataSource';
import { createMockRequest, createMockResponse } from './helpers/mockExpress';
import { VenueController } from '../src/controller/VenueController';
// sample venue data
const sampleVenue = {
    venueId: 3,
    name: 'Harbour Hall',
    addressLine1: '1 Wharf St',
    addressLine2: null,
    suburb: 'Sydney',
    postcode: '2000',
    capacity: 200,
    description: 'Waterfront venue',
    hourlyPrice: '150.00',
    active: true,
    featured: true,
    userId: 12,
    state: { stateId: 1, state: 'NSW' },
    venueSuitabilities: [{ suitability: { name: 'Wedding' } }],
    images: [{ path: '/images/image.jpg' }],
    blockouts: [{ blockoutId: 1, startDate: new Date('2025-06-01'), endDate: new Date('2025-06-02') }],
};

describe('VenueController', () => {
    const controller = new VenueController();

    // before each test, clear all mocks and set up the mock data source
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo.find.mockResolvedValue([sampleVenue]);
        mockRepo.findOne.mockResolvedValue(sampleVenue);
        mockRepo.create.mockImplementation((data) => data);
        mockRepo.save.mockImplementation((data) => Promise.resolve({ ...data, venueId: 50 }));
    });

    // test the getOne method
    describe('getOne', () => {
        // test when venue is found
        it('returns formatted venue data when found', async () => {
            const res = createMockResponse();

            await controller.getOne(createMockRequest({ params: { id: '3' } }), res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    venueId: 3,
                    name: 'Harbour Hall',
                    state: 'NSW',
                    suitabilities: ['Wedding'],
                    imageUrl: '/images/image.jpg',
                    hourlyPrice: 150,
                })
            );
        });

        // test when venue is not found
        it('returns 404 when venue is not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);
            const res = createMockResponse();

            await controller.getOne(createMockRequest({ params: { id: '999' } }), res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Venue not found' });
        });
    });

    // test the create method
    describe('create', () => {
        // test when missing required fields and non-positive capacity or price
        it('rejects missing required fields and non-positive capacity or price', async () => {
            const res = createMockResponse();
            await controller.create(createMockRequest({ body: { name: 'Only Name' } }), res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Name, address, suburb, postcode, capacity, description, price and vendor are required.',
            });

            const res2 = createMockResponse();
            // test non-positive capacity
            await controller.create(
                createMockRequest({
                    body: {
                        name: 'Test',
                        addressLine1: '1 St',
                        suburb: 'Town',
                        postcode: '3000',
                        capacity: -5,
                        description: 'Desc',
                        hourlyPrice: 100,
                        vendorId: 1,
                    },
                }),
                res2
            );
            expect(res2.status).toHaveBeenCalledWith(400);
            expect(res2.json).toHaveBeenCalledWith({ error: 'Capacity must be a positive number.' });

            const res3 = createMockResponse();
            // test non-positive price
            await controller.create(
                createMockRequest({
                    body: {
                        name: 'Test',
                        addressLine1: '1 St',
                        suburb: 'Town',
                        postcode: '3000',
                        capacity: 50,
                        description: 'Desc',
                        hourlyPrice: -50,
                        vendorId: 1,
                    },
                }),
                res3
            );
            expect(res3.status).toHaveBeenCalledWith(400);
            expect(res3.json).toHaveBeenCalledWith({ error: 'Hourly price must be a positive number.' });
        });

        // test creating a venue and returns 201 with venueId
        it('creates a venue and returns 201 with venueId', async () => {
            const res = createMockResponse();

            await controller.create(
                createMockRequest({
                    body: {
                        name: 'New Venue',
                        addressLine1: '10 Main Rd',
                        suburb: 'Melbourne',
                        postcode: '3000',
                        capacity: 80,
                        description: 'City venue',
                        hourlyPrice: 200,
                        vendorId: 12,
                    },
                }),
                res
            );

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Venue',
                    capacity: 80,
                    hourlyPrice: 200,
                    active: true,
                    userId: 12,
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Venue created', venueId: 50 });
        });
    });

    // test the remove method
    describe('remove', () => {
        // test deactivating a venue by setting active to false
        it('de activates venue by setting active to false', async () => {
            const venue = { ...sampleVenue, active: true };
            mockRepo.findOne.mockResolvedValue(venue);
            mockRepo.save.mockImplementation((v) => Promise.resolve(v));

            const res = createMockResponse();
            await controller.remove(createMockRequest({ params: { id: '3' } }), res);

            expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
            expect(res.json).toHaveBeenCalledWith({ message: 'Venue deactivated' });
        });
    });
});
