import { CircuitBreakerOptions } from '@/lib/circuit_breaker.interface';
import LoggerMock from '../mocks/logger.mock';

export const TestConfig: CircuitBreakerOptions = {
  errorExpirationTimeInMilliseconds: 1000,
  circuitCheckTimeoutInMilliseconds: 200,
  maxAttemptsInHalfOpenState: 1,
  maxErrorsBeforeOpen: 1,
  key: 'default',
  logger: new LoggerMock(),
  fallbackFunction: () => null,
};
