import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatBytes,
  formatRelativeTime,
  truncate,
  capitalize,
  generateId,
  isEmpty,
  deepClone,
  isValidEmail,
  isValidUrl,
  sleep,
  retry,
} from './utils';

describe('utils', () => {
  it('formatBytes works', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 1.5)).toMatch(/1.5 MB/);
  });

  it('formatRelativeTime works', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 30 * 1000)).toBe('just now');
    expect(formatRelativeTime(now - 90 * 1000)).toBe('1 minute ago');
  });

  it('truncate works', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('capitalize works', () => {
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('')).toBe('');
  });

  it('generateId length', () => {
    const id = generateId(12);
    expect(id).toHaveLength(12);
  });

  it('isEmpty checks', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('  ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty('x')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it('deepClone makes deep copy', () => {
    const src = { a: 1, b: { c: 2 }, d: [1, 2, { e: 3 }] };
    const cloned = deepClone(src);
    expect(cloned).toEqual(src);
    (cloned.b as any).c = 3;
    expect(src.b.c).toBe(2);
  });

  it('validators', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('x')).toBe(false);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('sleep & retry', async () => {
    vi.useFakeTimers();
    const spy = vi.fn()
      .mockRejectedValueOnce(new Error('a'))
      .mockResolvedValueOnce('ok');

    const p = retry(spy, 2, 1000);
    // advance 1s for backoff after first failure
    await vi.advanceTimersByTimeAsync(1000);
    await expect(p).resolves.toBe('ok');
    expect(spy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

