import { Request, Response } from 'express';
// create mock values so the real database isnt changed
export const createMockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
        params: {},
        query: {},
        body: {},
        ...overrides,
    }) as Request;

export const createMockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
