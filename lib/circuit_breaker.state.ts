import { CircuitBreakerOptions } from './circuit_breaker.interface';
import { LoggerService } from '@nestjs/common';

/**
 * Represents a circuit breaker state for controlling the execution
 * of a function.
 */
export class CircuitBreakerState {
  key: string;

  private state: 'OPEN' | 'CLOSED' | 'HALF_OPEN' = 'CLOSED';

  private errors = 0;

  private attempts = 0;

  private logger: LoggerService;

  /**
   * Creates an instance of CircuitBreakerState.
   * @param {CircuitBreakerOptions} options - The options for configuring the circuit breaker.
   */
  constructor(private readonly options: CircuitBreakerOptions) {
    this.logger = options.logger;
    this.key = options.key;
  }

  /**
   * Closes the circuit breaker, resetting its state and error counters.
   */
  close() {
    this.state = 'CLOSED';
    this.attempts = 0;
    this.errors = 0;

    this.logger.log('CLOSED: closing circuit breaker', 'CircuitBreaker', this);
  }

  /**
   * Opens the circuit breaker if error threshold exceeded.
   */
  open() {
    if (this.state == 'OPEN') {
      return;
    }

    if (this.state == 'HALF_OPEN') {
      this.logger.error(
        'HALF_OPEN: opening circuit breaker',
        this,
        'CircuitBreaker',
      );
      this.state = 'OPEN';
    }

    this.errors++;

    // Schedule the expiration of an error count based on a timeout.
    setTimeout(
      this.expireAnError.bind(this),
      this.options.errorExpirationTimeInMilliseconds,
    );

    if (this.errors < this.options.maxErrorsBeforeOpen) {
      return;
    }

    this.logger.error('OPEN: opening circuit breaker', this, 'CircuitBreaker');

    this.state = 'OPEN';

    this.halfOpen();
  }

  /**
   * Decrements the error count when an error expires
   * used to in production isolated errors not start the secondary wire
   */
  expireAnError() {
    if (this.errors <= 0) {
      return;
    }

    this.errors--;
  }

  /**
   * Transitions the circuit breaker to 'HALF_OPEN' state after a timeout.
   */
  halfOpen() {
    setTimeout(() => {
      this.logger.warn(
        'HALF_OPEN: change to half open state',
        'CircuitBreaker',
        this,
      );
      this.state = 'HALF_OPEN';
    }, this.options.circuitCheckTimeoutInMilliseconds);
  }

  /**
   * GETTERS
   */
  get status(): string {
    return this.state;
  }

  get errorCount(): number {
    return this.errors;
  }

  /**
   * Executes a wire function with circuit breaker logic.
   * @param {Function} wireFunction - The function to execute within the circuit breaker.
   * @param {any} target - The target object (context) for the wireFunction.
   * @param {any[]} args - An array of arguments to pass to the wireFunction.
   * @returns {Promise<any>} A Promise representing the result of the wireFunction or a fallback function.
   */
  async handle(wireFunction, target: any, args: any[]): Promise<any> {
    if (this.state == 'CLOSED') {
      return await wireFunction.apply(target, args);
    }

    if (
      this.state == 'HALF_OPEN' &&
      this.attempts < this.options.maxAttemptsInHalfOpenState
    ) {
      this.logger.warn(
        'HALF_OPEN: attempt to open again',
        'CircuitBreaker',
        this,
      );
      this.attempts++;

      const result = await wireFunction.apply(target, args);

      this.close();

      return result;
    }

    return await this.options.fallbackFunction.apply(target, args);
  }
}
