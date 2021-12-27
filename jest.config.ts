/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
	verbose: true,
	rootDir: 'test',
	preset: 'ts-jest',
	testTimeout: 60000,
	maxWorkers: 3,
	testMatch: ['**/*.test.ts'],
	testEnvironment: 'jsdom',
};
