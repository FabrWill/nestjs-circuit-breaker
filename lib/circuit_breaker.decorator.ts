import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { CircuitBreakerOptions } from './circuit_breaker.interface';
import CircuitBreakerBuilder from './circuit_breaker.builder';

export const CircuitBreaker = (options: CircuitBreakerOptions) => {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    Inject(CACHE_MANAGER)(target, 'cacheManager');

    descriptor.value = async function (...args: any[]) {
      const circuitBreaker = await CircuitBreakerBuilder.build(
        this.cacheManager,
        options,
      );

      try {
        const result = await circuitBreaker.handle(originalMethod, this, args);

        return result;
      } catch (error) {
        circuitBreaker.open();

        return options.fallbackFunction.apply(this, args);
      }
    };
  };
};
