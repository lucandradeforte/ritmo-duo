import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ExerciseDemonstration } from '@/types';
import { ExerciseMedia } from './ExerciseMedia';

const demonstration: ExerciseDemonstration = {
  kind: 'animated-webp',
  animationPath: 'exercise-media/example.webp',
  posterPath: 'exercise-media/example-poster.webp',
  alt: 'Sequência animada de exemplo com quatro fases do exercício.',
  caption: 'Mantenha o movimento controlado.',
  width: 480,
  height: 480,
};

function mockReducedMotion(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ExerciseMedia', () => {
  it('carrega a animação local de forma preguiçosa por padrão', () => {
    mockReducedMotion(false);
    render(<ExerciseMedia demonstration={demonstration} />);

    const image = screen.getByRole('img', { name: demonstration.alt });
    expect(image).toHaveAttribute('src', '/exercise-media/example.webp');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('width', '480');
    expect(image).toHaveAttribute('height', '480');

    fireEvent.click(screen.getByRole('button', { name: 'Pausar animação' }));
    expect(screen.getByRole('img', { name: demonstration.alt })).toHaveAttribute(
      'src',
      '/exercise-media/example-poster.webp',
    );
    expect(screen.getByRole('button', { name: 'Reproduzir animação' })).toBeVisible();
  });

  it('usa o poster e exige ação explícita quando movimento reduzido está ativo', () => {
    mockReducedMotion(true);
    render(<ExerciseMedia demonstration={demonstration} />);

    const image = screen.getByRole('img', { name: demonstration.alt });
    expect(image).toHaveAttribute('src', '/exercise-media/example-poster.webp');

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir animação' }));
    expect(screen.getByRole('img', { name: demonstration.alt })).toHaveAttribute(
      'src',
      '/exercise-media/example.webp',
    );
    expect(screen.getByRole('button', { name: 'Pausar animação' })).toBeVisible();
  });

  it('usa o poster como fallback quando a animação não carrega', () => {
    mockReducedMotion(false);
    render(<ExerciseMedia demonstration={demonstration} />);

    fireEvent.error(screen.getByRole('img', { name: demonstration.alt }));

    expect(screen.getByRole('img', { name: demonstration.alt })).toHaveAttribute(
      'src',
      '/exercise-media/example-poster.webp',
    );
  });
});
