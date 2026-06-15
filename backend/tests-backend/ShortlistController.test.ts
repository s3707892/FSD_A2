import './helpers/mockDataSource';
import { mockRepo, mockTransactionManager } from './helpers/mockDataSource';
import { createMockRequest, createMockResponse } from './helpers/mockExpress';
import { ShortlistController } from '../src/controller/ShortlistController';

describe('ShortlistController', () => {
    const controller = new ShortlistController();
    // before each test, clear all mocks and set up the mock data source
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo.findOne.mockResolvedValue(null);
        mockRepo.find.mockResolvedValue([]);
        mockRepo.save.mockImplementation((data) => Promise.resolve(data));
    });

    describe('create', () => {
        it('returns 409 when venue is already shortlisted', async () => {
            mockRepo.findOne.mockResolvedValue({ userId: 1, venueId: 5, ranking: 0 });
            const res = createMockResponse();

            await controller.create(
                createMockRequest({ body: { userId: 1, venueId: 5, ranking: 1 } }),
                res
            );

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Already in shortlist' });
            expect(mockRepo.save).not.toHaveBeenCalled();
        });

        // test adding a new shortlist item with default ranking 0
        it('adds a new shortlist item with default ranking 0', async () => {
            const res = createMockResponse();

            await controller.create(
                createMockRequest({ body: { userId: 1, venueId: 8 } }),
                res
            );

            expect(mockRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 1, venueId: 8, ranking: 0 })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item added to shortlist' });
        });
    });

    describe('remove', () => {
        // test deleting the item and reindexing remaining rankings in a transaction
        it('deletes the item and reindexes remaining rankings in a transaction', async () => {
            const items = [
                { userId: 1, venueId: 10, ranking: 0 },
                { userId: 1, venueId: 20, ranking: 2 },
                { userId: 1, venueId: 30, ranking: 3 },
            ];
            mockTransactionManager.find.mockResolvedValue(items);

            const res = createMockResponse();
            await controller.remove(
                createMockRequest({ body: { userId: 1, venueId: 20 } }),
                res
            );

            expect(mockTransactionManager.delete).toHaveBeenCalledWith(
                expect.anything(),
                { userId: 1, venueId: 20 }
            );
            expect(mockTransactionManager.save).toHaveBeenCalledTimes(2);
            expect(mockTransactionManager.save).toHaveBeenCalledWith(
                expect.objectContaining({ venueId: 20, ranking: 1 })
            );
            expect(mockTransactionManager.save).toHaveBeenCalledWith(
                expect.objectContaining({ venueId: 30, ranking: 2 })
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Removed from shortlist' });
        });
    });

    describe('moveUp', () => {
        // test swapping rankings with the item above in a transaction
        it('swaps rankings with the item above in a transaction', async () => {
            const item = { userId: 1, venueId: 20, ranking: 1 };
            const targetItem = { userId: 1, venueId: 10, ranking: 0 };
            mockTransactionManager.findOne
                .mockResolvedValueOnce(item)
                .mockResolvedValueOnce(targetItem);

            const res = createMockResponse();
            await controller.moveUp(
                createMockRequest({ body: { userId: 1, venueId: 20 } }),
                res
            );

            expect(mockTransactionManager.save).toHaveBeenCalledWith([
                expect.objectContaining({ venueId: 20, ranking: 0 }),
                expect.objectContaining({ venueId: 10, ranking: 1 }),
            ]);
            expect(res.json).toHaveBeenCalledWith({ message: 'Moved up' });
        });
    });
});
