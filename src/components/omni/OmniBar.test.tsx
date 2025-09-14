import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock useNavigate before importing component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { OmniBar } from './OmniBar';
import { Provider } from '@/components/ui/provider';

describe('OmniBar', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  function renderOpen(onClose = vi.fn()) {
    return render(
      <Provider>
        <OmniBar isOpen={true} onClose={onClose} />
      </Provider>
    );
  }

  it('filters suggestions by query', async () => {
    renderOpen();
    const user = userEvent.setup();
    const input = await screen.findByRole('textbox');
    await user.type(input, 'fix');

    expect(await screen.findByText(/Go to Fix/i)).toBeInTheDocument();
    expect(screen.queryByText(/Run Workflow/i)).not.toBeInTheDocument();
  });

  it('navigates and closes on Enter', async () => {
    const onClose = vi.fn();
    renderOpen(onClose);
    const user = userEvent.setup();
    const input = await screen.findByRole('textbox');
    await user.type(input, 'fix');

    // Press Enter -> should navigate to /fix and close
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/fix');
    expect(onClose).toHaveBeenCalled();
  });
});

