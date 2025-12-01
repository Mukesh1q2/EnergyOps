/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.property.test.ts'
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/types/**/*.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // ES6 modules support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  maxWorkers: 1,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};

module.exports = config;