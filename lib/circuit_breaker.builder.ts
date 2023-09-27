import { Cache } from 'cache-manager';
import {
  CircuitBreakerOptions,
  CircuitBreakerDefaultOptions,
} from './circuit_breaker.interface';
import { CircuitBreakerState } from './circuit_breaker.state';

export default class CircuitBreakerBuilder {
  static async build(cacheManager: Cache, options: CircuitBreakerOptions) {
    let circuitBreaker: CircuitBreakerState = await cacheManager.get(
      `circuit_breaker_${options.key}`,
    );

    if (!circuitBreaker) {
      const constrcutionOptions = {
        ...CircuitBreakerDefaultOptions,
        ...options,
      };

      circuitBreaker = new CircuitBreakerState(constrcutionOptions);

      await cacheManager.set(
        `circuit_breaker_${options.key}`,
        circuitBreaker,
        0,
      );
    }

    return circuitBreaker;
  }
}
