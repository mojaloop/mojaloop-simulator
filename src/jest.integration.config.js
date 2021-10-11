'use strict'
module.exports = {
  // roots: ['<rootDir>/', '<rootDir>/test/integration'],
  roots: ['<rootDir>/' ],
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: false,
  clearMocks: true,
  reporters: ['jest-junit', 'default']
}
