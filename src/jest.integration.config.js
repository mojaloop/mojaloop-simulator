'use strict'
module.exports = {
  roots: ['<rootDir>/src/', '<rootDir>/test/integration'],
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  clearMocks: true,
  reporters: ['jest-junit', 'default']
}
