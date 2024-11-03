import { throttle } from '../throttle';

jest.useFakeTimers();

describe('throttle', () => {
  it('should call the function immediately and then throttle subsequent calls', () => {
    const mockFn = jest.fn();
    const limit = 1000; // 1 second limit
    const throttledFn = throttle(mockFn, limit);

    // Call the throttled function multiple times
    throttledFn(); // First call
    throttledFn(); // Should be ignored due to throttling
    throttledFn(); // Should be ignored due to throttling

    // Fast-forward time by less than the limit
    jest.advanceTimersByTime(500);
    throttledFn(); // Should still be ignored

    // Fast-forward time to exceed the limit
    jest.advanceTimersByTime(500);
    throttledFn(); // Now, it should execute again

    // Assertions
    expect(mockFn).toHaveBeenCalledTimes(2); // Should have been called twice in total
  });

  it('should use the correct arguments and context when calling the function', () => {
    const mockFn = jest.fn(function (this: any, ...args: any[]) {
      return this.value + args.join(' ');
    });
    const limit = 1000;
    const context = { value: 'Hello, ' };
    const throttledFn = throttle(mockFn.bind(context), limit);

    throttledFn('World!');
    jest.advanceTimersByTime(limit);
    throttledFn('Again!');

    // Assertions
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn.mock.calls[0][0]).toBe('World!');  // First call argument check
    expect(mockFn.mock.calls[1][0]).toBe('Again!');  // Second call argument check
  });
});
