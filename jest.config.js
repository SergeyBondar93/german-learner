module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
