import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

// Spy navigate before importing components
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { HomePage } from './Home';
import { Provider } from '@/components/ui/provider';

describe('HomePage', () => {
  it('renders hero and hints; quick actions navigate', async () => {
    render(
      <Provider>
        <HomePage />
      </Provider>
    );

    expect(
      await screen.findByText(/あなたが今やりたいことを代わりに実行/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Summarize this tab/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Generate/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/generate');

    await user.click(screen.getByRole('button', { name: /Run/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/run');

    await user.click(screen.getByRole('button', { name: /Plugins/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/plugins');
  });
});

