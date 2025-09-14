import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';

vi.mock('@/hooks', () => {
  return {
    useVersionPing: () => ({
      status: 'connected',
      version: 'v1.0.0',
      error: undefined,
      lastUpdated: Date.now(),
      refetch: vi.fn(),
    }),
  };
});

import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('renders connection status and version', async () => {
    render(
      <Provider>
        <StatusBar />
      </Provider>
    );

    expect(await screen.findByText(/Automotor Status/i)).toBeInTheDocument();
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});

