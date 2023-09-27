import { Logger, LoggerService } from '@nestjs/common';

export interface CircuitBreakerOptions {
  /**
   * Maximum number of allowed errors before opening the circuit breaker.
   * When the number of errors reaches this limit, the circuit breaker is opened.
   */
  maxErrorsBeforeOpen?: number;

  /**
   * Expiration time (in milliseconds) for recorded errors.
   * Errors will expire after this period, allowing the circuit breaker to close after a period of inactivity.
   */
  errorExpirationTimeInMilliseconds?: number;

  /**
   * Maximum number of allowed attempts when the circuit breaker is in the "HALF_OPEN" state.
   * After reaching this limit, the circuit breaker will fully open if there are failures.
   */
  maxAttemptsInHalfOpenState?: number;

  /**
   * Timeout (in milliseconds) for the circuit breaker check in the "HALF_OPEN" state.
   * After this timeout, the circuit breaker will transition to the "HALF_OPEN" state.
   */
  circuitCheckTimeoutInMilliseconds?: number;

  /**
   * Fallback function to be executed when the circuit breaker is open or an error occurs.
   * This function can be used to return a default value or perform alternative behavior.
   */
  fallbackFunction: (...args: any[]) => any;

  /**
   * Custom logging service to be used for logging circuit breaker events.
   * If not provided, a default logging service will be used.
   */
  logger?: LoggerService;

  /**
   * A unique key that identifies the circuit breaker.
   * It is used to store and retrieve circuit breaker state information.
   */
  key: string;
}

export const CircuitBreakerDefaultOptions: CircuitBreakerOptions = {
  errorExpirationTimeInMilliseconds: 60 * 1000 * 2,
  circuitCheckTimeoutInMilliseconds: 60 * 1000 * 2,
  maxAttemptsInHalfOpenState: 10,
  maxErrorsBeforeOpen: 10,
  key: 'default',
  logger: new Logger(),
  fallbackFunction: () => null,
};
