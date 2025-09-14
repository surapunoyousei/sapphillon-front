import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/lib/grpc-clients', () => {
  return {
    clients: {
      version: {
        getVersion: vi.fn(),
      },
    },
  };
});

import { clients } from '@/lib/grpc-clients';
import { useVersionPing } from '@/hooks';

describe('useVersionPing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('updates status and version on success', async () => {
    (clients.version.getVersion as any).mockResolvedValue({
      version: { version: 'v1.2.3' },
    });

    const { result } = renderHook(() => useVersionPing(10000));

    // first effect tick happens immediately
    // allow microtasks to flush
    await Promise.resolve();

    expect(result.current.status).toBe('connected');
    expect(result.current.version).toBe('v1.2.3');
    expect(result.current.error).toBeUndefined();

    // advance timer to trigger another poll
    await act(async () => {
      vi.advanceTimersByTime(10000);
      await Promise.resolve();
    });
    expect(clients.version.getVersion).toHaveBeenCalledTimes(2);
  });

  it('sets disconnected on error', async () => {
    (clients.version.getVersion as any).mockRejectedValue(new Error('net'));

    const { result } = renderHook(() => useVersionPing(5000));
    await Promise.resolve();
    expect(result.current.status).toBe('disconnected');
    expect(result.current.version).toBe('');
    expect(result.current.error).toBeInstanceOf(Error);

    // manual refetch
    (clients.version.getVersion as any).mockResolvedValue({ version: { version: 'v9.9.9' } });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.status).toBe('connected');
    expect(result.current.version).toBe('v9.9.9');
  });
});

