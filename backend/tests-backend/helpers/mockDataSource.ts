export type MockRepository = {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
};

export const createMockRepository = (): MockRepository => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn((data) => data),
    save: jest.fn((data) => Promise.resolve(data)),
    delete: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(),
});

export const mockRepo = createMockRepository();

export const mockTransactionManager = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn((data) => Promise.resolve(data)),
    delete: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => mockRepo),
        transaction: jest.fn((cb: (manager: typeof mockTransactionManager) => Promise<void>) =>
            cb(mockTransactionManager)
        ),
    },
}));
