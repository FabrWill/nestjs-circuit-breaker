import { CircuitBreakerOptions } from 'lib/circuit_breaker.interface';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { CircuitBreakerState } from '@/lib/circuit_breaker.state';
import { TestConfig } from '@/test/config/circuit_breaker_test.config';

describe('Testing Circuit Breaker State control', () => {
  let circuitBreaker: CircuitBreakerState;

  beforeAll(() => {
    jest.useFakeTimers();

    circuitBreaker = new CircuitBreakerState({
      ...TestConfig,
      key: 'test-key',
    });
  });

  it('should start CLOSED', () => {
    expect(circuitBreaker.status).toBe('CLOSED');
  });

  it('should change to OPEN', () => {
    const times = TestConfig.maxErrorsBeforeOpen + 1;
    for (let i = 0; i < times; i++) {
      circuitBreaker.open();
    }

    expect(circuitBreaker.status).toBe('OPEN');
  });

  it('should be HALF_OPEN', (done) => {
    setTimeout(() => {
      expect(circuitBreaker.status).toBe('HALF_OPEN');
      done();
    }, TestConfig.circuitCheckTimeoutInMilliseconds + 20);

    jest.advanceTimersByTime(
      TestConfig.circuitCheckTimeoutInMilliseconds + 20,
    );
  });
});
