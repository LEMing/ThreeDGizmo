export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^three/examples/jsm/controls/OrbitControls$': '<rootDir>/src/infrastructure/mocks/OrbitControlsMock.ts',
    '^three/examples/jsm/controls/MapControls': '<rootDir>/src/infrastructure/mocks/MapControlsMock.ts',
    '^three/examples/jsm/loaders/GLTFLoader$': '<rootDir>/src/infrastructure/mocks/GLTFLoaderMock.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'  // Add this line to mock CSS files
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
    }],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: [
    '<rootDir>/.jest/setupTests.ts',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/infrastructure/mocks/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['cobertura', 'json-summary', 'lcov'],
};
