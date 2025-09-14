import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import { TopNav } from './TopNav';

describe('TopNav', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    try { localStorage.clear(); } catch {}
  });

  it('shows light logo in light mode', async () => {
    render(
      <Provider>
        <TopNav />
      </Provider>
    );
    const img = await screen.findByAltText('Floorp OS');
    expect((img as HTMLImageElement).src).toMatch(/Floorp_Logo_OS_C_Light\.png$/);
  });

  it('shows dark logo in dark mode', async () => {
    try { localStorage.setItem('sapphillon-theme', 'dark'); } catch {}
    render(
      <Provider>
        <TopNav />
      </Provider>
    );
    const img = await screen.findByAltText('Floorp OS');
    expect((img as HTMLImageElement).src).toMatch(/Floorp_Logo_OS_D_Dark\.png$/);
  });
});

