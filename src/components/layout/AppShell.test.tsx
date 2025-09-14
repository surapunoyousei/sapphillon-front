import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('opens OmniBar on Ctrl+K and shows dialog', async () => {
    render(
      <Provider>
        <AppShell>
          <div>content</div>
        </AppShell>
      </Provider>
    );

    const user = userEvent.setup();
    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByText(/Omni Bar/i)).toBeInTheDocument();
  });
});

