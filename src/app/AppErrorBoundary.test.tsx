import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenScreen(): never {
  throw new Error('detalhe interno que não deve aparecer');
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe um fallback seguro quando uma tela falha ao renderizar', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenScreen />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Algo saiu do ritmo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    expect(screen.queryByText(/detalhe interno/i)).not.toBeInTheDocument();
  });
});
