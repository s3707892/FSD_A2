import './helpers/mockDataSource';
import { mockRepo } from './helpers/mockDataSource';
import { createMockRequest, createMockResponse } from './helpers/mockExpress';
import { BookingController } from '../src/controller/BookingController';
 // testing the booking controller
describe('BookingController', () => {
    const controller = new BookingController();

    const futureDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString();
    };
    // before each test, clear all mocks and set up the mock data source
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo.findOne.mockResolvedValue({ statusId: 1, statusName: 'Pending' });
        mockRepo.create.mockImplementation((data) => data);
        mockRepo.save.mockImplementation((data) => Promise.resolve({ ...data, bookingId: 99 }));
    });
    // test the create method
    describe('create', () => {
        it('rejects missing fields, invalid guests/duration, past dates, and invalid ABN', async () => {
            const res = createMockResponse();
            // test missing fields
            await controller.create(createMockRequest({ body: { userId: 1, venueId: 2 } }), res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing required booking fields.' });

            const res2 = createMockResponse();
            // test invalid guests
            await controller.create(
                createMockRequest({
                    body: {
                        userId: 1,
                        venueId: 2,
                        startDateTime: futureDate(),
                        eventName: 'Wedding',
                        guests: -10,
                        duration: 4,
                    },
                }),
                res2
            );
            expect(res2.status).toHaveBeenCalledWith(400);
            expect(res2.json).toHaveBeenCalledWith({ error: 'Guests must be a positive number.' });

            const res3 = createMockResponse();
            // test invalid duration
            await controller.create(
                createMockRequest({
                    body: {
                        userId: 1,
                        venueId: 2,
                        startDateTime: futureDate(),
                        eventName: 'Wedding',
                        guests: 50,
                        duration: -1,
                    },
                }),
                res3
            );
            expect(res3.status).toHaveBeenCalledWith(400);
            expect(res3.json).toHaveBeenCalledWith({ error: 'Duration must be positive.' });

            const res4 = createMockResponse();
            // test past date
            await controller.create(
                createMockRequest({
                    body: {
                        userId: 1,
                        venueId: 2,
                        startDateTime: '2020-01-01T10:00:00.000Z',
                        eventName: 'Wedding',
                        guests: 50,
                        duration: 4,
                    },
                }),
                res4
            );
            expect(res4.status).toHaveBeenCalledWith(400);
            expect(res4.json).toHaveBeenCalledWith({ error: 'Booking date must be in the future.' });

            const res5 = createMockResponse();
            // test invalid ABN
            await controller.create(
                createMockRequest({
                    body: {
                        userId: 1,
                        venueId: 2,
                        startDateTime: futureDate(),
                        eventName: 'Wedding',
                        guests: 50,
                        duration: 4,
                        abn: '12345',
                    },
                }),
                res5
            );
            expect(res5.status).toHaveBeenCalledWith(400);
            expect(res5.json).toHaveBeenCalledWith({ error: 'ABN must be exactly 10 characters.' });
        });

        // test creating a pending booking
        it('creates a pending booking and returns 201', async () => {
            const start = futureDate();
            const res = createMockResponse();

            await controller.create(
                createMockRequest({
                    body: {
                        userId: 5,
                        venueId: 10,
                        startDateTime: start,
                        eventName: 'Corporate Gala',
                        guests: 120,
                        duration: 6,
                        abn: '1234567890',
                    },
                }),
                res
            );

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: 'Corporate Gala',
                    guests: 120,
                    duration: 6,
                    abn: '1234567890',
                })
            );
            expect(mockRepo.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Booking created', bookingId: 99 });
        });
    });
    // test the updateStatus method
    describe('updateStatus', () => {
        // test when booking does not exist
        it('returns 404 when booking does not exist', async () => {
            mockRepo.findOne.mockResolvedValue(null);
            const res = createMockResponse();

            await controller.updateStatus(
                createMockRequest({ params: { id: '999' }, body: { statusName: 'Confirmed' } }),
                res
            );

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Booking not found' });
        });

        // test when booking exists
        it('updates booking status when booking exists', async () => {
            const booking = { bookingId: 1, bookingStatus: { statusId: 1, statusName: 'Pending' } };
            mockRepo.findOne
                .mockResolvedValueOnce(booking)
                .mockResolvedValueOnce({ statusId: 2, statusName: 'Confirmed' });
            mockRepo.save.mockResolvedValue(booking);

            const res = createMockResponse();
            await controller.updateStatus(
                createMockRequest({ params: { id: '1' }, body: { statusName: 'Confirmed' } }),
                res
            );

            expect(mockRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingStatus: { statusId: 2, statusName: 'Confirmed' },
                })
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Status updated' });
        });
    });
});
