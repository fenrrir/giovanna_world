import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call through before the delay elapses', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    vi.advanceTimersByTime(299);

    expect(spy).not.toHaveBeenCalled();
  });

  it('calls through once the delay elapses', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('collapses a burst into a single call carrying the last arguments', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    vi.advanceTimersByTime(100);
    debounced('b');
    vi.advanceTimersByTime(100);
    debounced('c');
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledExactlyOnceWith('c');
  });

  it('cancels a pending call', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    debounced.cancel();
    vi.advanceTimersByTime(1000);

    expect(spy).not.toHaveBeenCalled();
  });

  it('flushes a pending call immediately, exactly once', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    debounced.flush();

    expect(spy).toHaveBeenCalledExactlyOnceWith('a');

    vi.advanceTimersByTime(1000);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('flushes to nothing when no call is pending', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced.flush();

    expect(spy).not.toHaveBeenCalled();
  });

  it('cancels to nothing when no call is pending', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    expect(() => {
      debounced.cancel();
    }).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('runs again after a completed cycle', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    vi.advanceTimersByTime(300);
    debounced('b');
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('b');
  });
});
