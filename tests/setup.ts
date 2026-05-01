/**
 * Jest test setup file
 * 
 * This file runs before all tests and sets up the testing environment
 */

// Add custom matchers if needed
import '@testing-library/jest-dom';

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};

// Set up global test timeout
jest.setTimeout(10000);

// Made with Bob
