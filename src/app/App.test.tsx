import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeStorage, deleteStorageDatabase, getActiveWorkout } from '@/storage';
import { App } from './App';

vi.mock('virtual:pwa-register', () => ({
  registerSW: () => () => Promise.resolve(),
}));

describe.sequential('fluxo principal do aplicativo', () => {
  beforeEach(async () => {
    window.location.hash = '';
    await deleteStorageDatabase();
  });

  afterEach(async () => {
    await closeStorage();
  });

  it('seleciona um perfil e abre o treino sugerido sem onboarding longo', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Quem está treinando?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Lucas/i }));

    expect(await screen.findByText('Olá, Lucas')).toBeVisible();
    expect(screen.getByRole('button', { name: /Iniciar treino/i })).toBeEnabled();
  });

  it('persiste uma série imediatamente e recupera o treino depois de remontar', async () => {
    const firstRender = render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Lucas/i }));
    fireEvent.click(await screen.findByRole('button', { name: /^Iniciar treino$/i }));

    const loadInput = await screen.findByLabelText(/Carga da série 1/i);
    const repetitionsInput = screen.getByLabelText(/Repetições da série 1/i);
    const rirInput = screen.getByLabelText(/RIR da série 1/i);
    fireEvent.change(loadInput, { target: { value: '10' } });
    fireEvent.change(repetitionsInput, { target: { value: '8' } });
    fireEvent.change(rirInput, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /Concluir série 1/i }));

    await waitFor(async () => {
      const active = await getActiveWorkout();
      expect(active?.sessions.lucas?.exercises[0]?.sets[0]).toMatchObject({
        loadKg: 10,
        repetitions: 8,
        rir: 3,
        completed: true,
      });
    });
    expect(screen.getByLabelText('Cronômetro de descanso')).toBeVisible();

    firstRender.unmount();
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Treino em andamento' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar treino' }));
    expect(await screen.findByLabelText(/Carga da série 1/i)).toHaveValue(10);
  });

  it('cria modo dupla com sessões independentes e troca o perfil ativo em um toque', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Geovanna/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Iniciar em modo dupla/i }));

    const active = await waitFor(async () => {
      const stored = await getActiveWorkout();
      expect(stored?.mode).toBe('duo');
      return stored;
    });
    expect(active?.sessions.lucas?.id).not.toBe(active?.sessions.geovanna?.id);

    const lucasButton = await screen.findByRole('button', { name: /Lucas/i });
    fireEvent.click(lucasButton);
    await waitFor(() => expect(lucasButton).toHaveAttribute('aria-pressed', 'true'));
  });
});
