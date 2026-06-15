/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests-backend'],
    testMatch: ['**/*.test.ts'],
    clearMocks: true,
};
