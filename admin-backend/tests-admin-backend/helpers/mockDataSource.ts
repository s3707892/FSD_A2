export type MockRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

export const createMockRepository = (): MockRepository => ({
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn((data) => data),
  save: jest.fn((data) => Promise.resolve(data)),
  delete: jest.fn().mockResolvedValue(undefined),
});

export const mockVenueRepo = createMockRepository();
export const mockUserRepo = createMockRepository();
export const mockBookingRepo = createMockRepository();

jest.mock('../../src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: { name: string }) => {
      switch (entity.name) {
        case 'Venue':
          return mockVenueRepo;
        case 'User':
          return mockUserRepo;
        case 'Booking':
          return mockBookingRepo;
        default:
          return mockVenueRepo;
      }
    }),
  },
}));
