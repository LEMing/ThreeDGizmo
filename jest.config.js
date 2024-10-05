export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^three/examples/jsm/controls/OrbitControls$': '<rootDir>/src/__mocks__/OrbitControlsMock.ts',
    '^three/examples/jsm/loaders/GLTFLoader$': '<rootDir>/src/__mocks__/GLTFLoaderMock.ts',
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
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};
