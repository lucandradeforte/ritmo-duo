import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    expect(document.querySelector('img[src="/pwa-icon-v6-192x192.png"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Lucas/i }));

    expect(await screen.findByText('Olá, Lucas')).toBeVisible();
    expect(screen.getByRole('button', { name: /Iniciar treino/i })).toBeEnabled();
  });

  it('fecha a ficha pelo botão voltar sem sair de Treinos', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Geovanna/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Treinos' }));
    fireEvent.click((await screen.findAllByRole('button', { name: 'Ver ficha' }))[0]!);

    expect(await screen.findByRole('dialog', { name: /Treino A/i })).toBeVisible();
    expect(window.location.hash).toContain('/workouts?ficha=');

    window.history.back();

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Treino A/i })).not.toBeInTheDocument();
      expect(window.location.hash).toBe('#/workouts');
    });
  });

  it('mostra na ficha as mesmas séries, RIR e cardio que iniciará na fase atual', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Lucas/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Treinos' }));
    fireEvent.click((await screen.findAllByRole('button', { name: 'Ver ficha' }))[0]!);

    const workoutDetail = await screen.findByRole('dialog', { name: /Treino A/i });
    expect(within(workoutDetail).getAllByText('1 × 8–10 · RIR 3–4 · 90s')).toHaveLength(2);
    expect(within(workoutDetail).getByText('8 min · RPE 3–4')).toBeVisible();

    fireEvent.click(within(workoutDetail).getByRole('button', {
      name: 'Ver exemplo de execução de Agachamento goblet para banco',
    }));
    const exerciseDetail = await screen.findByRole('dialog', {
      name: /Agachamento goblet para banco/i,
    });
    expect(within(exerciseDetail).getByRole('heading', { name: 'Configuração' })).toBeVisible();
    fireEvent.click(within(exerciseDetail).getByRole('button', { name: 'Fechar' }));
    expect(within(workoutDetail).getByText('Exercícios e cardio')).toBeVisible();

    fireEvent.click(within(workoutDetail).getByRole('button', { name: 'Iniciar treino' }));

    expect(await screen.findByText('1 × 8–10 · RIR 3–4')).toBeVisible();
    expect(screen.getAllByLabelText(/Carga da série/i)).toHaveLength(1);
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

  it('registra o peso no progresso e mostra a pesagem mais recente no perfil', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Lucas/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Progresso' }));

    fireEvent.change(await screen.findByLabelText('Peso em quilogramas'), { target: { value: '109.4' } });
    fireEvent.change(screen.getByLabelText('Data da pesagem'), { target: { value: '2026-08-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar peso' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Pesagem registrada.');
    expect(screen.getByRole('img', { name: /Evolução do peso: 109,4 kg/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(await screen.findByText(/24 anos · 183 cm · 109,4 kg/)).toBeVisible();
  });
});
