import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SetSession } from '@/types';
import { ExerciseSetRow } from './ExerciseSetRow';

const createSet = (patch: Partial<SetSession> = {}): SetSession => ({
  id: 'set-1',
  setNumber: 1,
  loadKg: 10,
  repetitions: 8,
  durationSeconds: null,
  rir: 3,
  completed: false,
  completedAt: null,
  ...patch,
});

describe('validação de esforço da série', () => {
  it('descarta RIR acima de 10 antes de persistir', () => {
    const onChange = vi.fn();
    render(
      <ExerciseSetRow set={createSet()} onChange={onChange} onComplete={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('RIR da série 1'), {
      target: { value: '11' },
    });

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ rir: null }));
  });

  it('não permite concluir carry com RPE zero', () => {
    render(
      <ExerciseSetRow
        mode="duration"
        set={createSet({ repetitions: null, durationSeconds: 20, rir: 0 })}
        onChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('RPE da série 1')).toHaveAttribute('min', '1');
    expect(screen.getByRole('button', { name: 'Concluir série 1' })).toBeDisabled();
  });
});
