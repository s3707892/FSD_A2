import './helpers/mockDataSource';
import { mockRepo } from './helpers/mockDataSource';
import { createMockRequest, createMockResponse } from './helpers/mockExpress';
import { UserController } from '../src/controller/UserController';

describe('UserController', () => {
    const controller = new UserController();
    // before each test, clear all mocks and set up the mock data source
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo.findOne.mockResolvedValue(null);
        mockRepo.create.mockImplementation((data) => data);
        mockRepo.save.mockImplementation((data) => {
            data.userId = 42;
            return Promise.resolve(data);
        });
    });
    // test the create method
    describe('create', () => {
        it('rejects invalid email, weak password, and missing required fields', async () => {
            const res = createMockResponse();
            // test invalid email
            await controller.create(
                createMockRequest({ body: { email: 'not-an-email', password: 'weak', phone: '0412345678', roleId: 1 } }),
                res
            );
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Valid email is required.' });

            const res2 = createMockResponse();
            // test weak password
            await controller.create(
                createMockRequest({
                    body: { email: 'hirer@example.com', password: 'weak', phone: '0412345678', roleId: 1, firstName: 'A', lastName: 'B' },
                }),
                res2
            );
            expect(res2.status).toHaveBeenCalledWith(400);
            expect(res2.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters.' });

            const res3 = createMockResponse();
            // test missing required fields for hirers
            await controller.create(
                createMockRequest({
                    body: {
                        email: 'hirer@example.com',
                        password: 'Valid1!',
                        phone: '0412345678',
                        roleId: 1,
                    },
                }),
                res3
            );
            expect(res3.status).toHaveBeenCalledWith(400);
            expect(res3.json).toHaveBeenCalledWith({ error: 'First and last name are required for hirers.' });

            const res4 = createMockResponse();
            // test missing required fields for vendors
            await controller.create(
                createMockRequest({
                    body: {
                        email: 'vendor@example.com',
                        password: 'Valid1!',
                        phone: '0412345678',
                        roleId: 2,
                    },
                }),
                res4
            );
            expect(res4.status).toHaveBeenCalledWith(400);
            expect(res4.json).toHaveBeenCalledWith({ error: 'Business name is required for vendors.' });
        });

        // test when email is already registered
        it('returns 409 when email is already registered', async () => {
            mockRepo.findOne.mockResolvedValue({ userId: 1, email: 'taken@example.com' });
            const res = createMockResponse();

            await controller.create(
                createMockRequest({
                    body: {
                        email: 'taken@example.com',
                        password: 'Valid1!',
                        phone: '0412345678',
                        roleId: 1,
                        firstName: 'Jane',
                        lastName: 'Doe',
                    },
                }),
                res
            );

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email is already registered.' });
            expect(mockRepo.save).not.toHaveBeenCalled();
        });

        // test creating a hirer user and returns 201 with userId
        it('creates a hirer user and returns 201 with userId', async () => {
            const res = createMockResponse();

            await controller.create(
                createMockRequest({
                    body: {
                        email: 'newhirer@example.com',
                        password: 'Valid1!',
                        phone: '0412345678',
                        roleId: 1,
                        firstName: 'Jane',
                        lastName: 'Doe',
                    },
                }),
                res
            );

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ email: 'newhirer@example.com', password: 'Valid1!' })
            );
            expect(mockRepo.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'User created', userId: 42 });
        });
    });

    describe('checkLogin', () => {
        // test for invalid credentials and user payload on success
        it('returns 401 for invalid credentials and user payload on success', async () => {
            const res401 = createMockResponse();
            // test invalid credentials
            await controller.checkLogin(
                createMockRequest({ body: { email: 'user@example.com', password: 'wrong' } }),
                res401
            );
            expect(res401.status).toHaveBeenCalledWith(401);
            expect(res401.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });

            // test valid credentials
            mockRepo.findOne.mockResolvedValue({
                userId: 7,
                email: 'user@example.com',
                phone: '0412345678',
                createdAt: new Date('2024-01-01'),
                role: { roleName: 'Hirer' },
                person: { firstName: 'Alex', lastName: 'Smith' },
                vendor: null,
            });

            const res200 = createMockResponse();
            // test valid credentials
            await controller.checkLogin(
                createMockRequest({ body: { email: 'user@example.com', password: 'Valid1!' } }),
                res200
            );

            expect(res200.json).toHaveBeenCalledWith({
                message: 'Login successful',
                user: expect.objectContaining({
                    userId: 7,
                    email: 'user@example.com',
                    role: 'Hirer',
                    firstName: 'Alex',
                    lastName: 'Smith',
                }),
            });
        });
    });
});
