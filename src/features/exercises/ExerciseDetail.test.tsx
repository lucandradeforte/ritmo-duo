import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getExercise } from '@/data';
import { ExerciseDetail } from './ExerciseDetail';

describe('ExerciseDetail', () => {
  it('mantém a demonstração local disponível quando o aparelho está offline', () => {
    const exercise = getExercise('goblet-squat-to-bench');
    expect(exercise).toBeDefined();

    render(
      <ExerciseDetail
        exercise={exercise ?? null}
        open
        online={false}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole('img', { name: /Sequência animada do agachamento/i })).toBeVisible();
    expect(screen.getByText(/A demonstração acima funciona offline/i)).toBeVisible();
    expect(screen.queryByRole('link', { name: /Ver demonstração/i })).not.toBeInTheDocument();
  });
});
