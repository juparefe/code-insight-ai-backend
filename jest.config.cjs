/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  // The bundled Lambda artifact ships its own package.json / node_modules;
  // keep Jest's haste map from scanning it (avoids naming collisions).
  modulePathIgnorePatterns: ['<rootDir>/lambda-package/'],
  // Source imports use explicit ".js" extensions (NodeNext); strip them so
  // ts-jest can resolve the ".ts" files under CommonJS.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
};
