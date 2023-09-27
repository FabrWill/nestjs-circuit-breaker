import { CircuitBreaker } from "@/lib/circuit_breaker.decorator";
import { TestConfig } from "@/test/config/circuit_breaker_test.config";

export default class ServiceMock {
    throwErrors = false;

    @CircuitBreaker({
        ...TestConfig,
        fallbackFunction: () => 'fallback',
    })
    async execute() {
        if (this.throwErrors) {
            console.log('throw');
            throw new Error('Test error');
        }

        return 'success';
    }
}