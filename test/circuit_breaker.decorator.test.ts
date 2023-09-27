import { Test, TestingModule } from '@nestjs/testing';
import ServiceMock from './mocks/service.mock';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { TestConfig } from './config/circuit_breaker_test.config';

describe('Testing Circuit Breaker Decorator implementation', () => {
  let service: ServiceMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        {
          provide: ServiceMock,
          useClass: ServiceMock,
        },
      ],
    }).compile();

    service = module.get<ServiceMock>(ServiceMock);

    jest.useFakeTimers();
  });

  it('should return success execution ', async () => {
    const result = await service.execute();

    expect(result).toBe('success');
  });

  it('should return fallback function execution and open circuit ', async () => {
    service.throwErrors = true;

    // first error execution
    expect(await service.execute()).toBe('fallback');

    // open circuit execution
    expect(await service.execute()).toBe('fallback');

    service.throwErrors = false;

    // open circuit execution
    expect(await service.execute()).toBe('fallback');
  });

  it('should close circuit', async () => {
    jest.advanceTimersByTime(
        TestConfig.circuitCheckTimeoutInMilliseconds + 20,
      );

    service.throwErrors = false;

    expect(await service.execute()).toBe('success');
  });
});
