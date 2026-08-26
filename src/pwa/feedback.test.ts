import { describe, expect, it, vi } from 'vitest';
import { supportsVibration, vibrateRestComplete } from './feedback';

describe('feedback por vibracao', () => {
  it('faz feature detection sem depender do modelo do aparelho', () => {
    const vibrate = vi.fn(() => true);
    const navigatorWithVibration = { vibrate } as unknown as Navigator;

    expect(supportsVibration(navigatorWithVibration)).toBe(true);
    expect(vibrateRestComplete([100, 50, 100], navigatorWithVibration)).toBe(true);
    expect(vibrate).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('degrada silenciosamente quando a API nao existe', () => {
    const navigatorWithoutVibration = {} as Navigator;

    expect(supportsVibration(navigatorWithoutVibration)).toBe(false);
    expect(vibrateRestComplete(100, navigatorWithoutVibration)).toBe(false);
  });
});
