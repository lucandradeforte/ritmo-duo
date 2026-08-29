import { describe, expect, it } from 'vitest';
import { shouldRepairIosStandaloneViewport } from './useIosStandaloneViewportRepair';

describe('shouldRepairIosStandaloneViewport', () => {
  it('limita a correção ao aplicativo instalado no iOS', () => {
    expect(shouldRepairIosStandaloneViewport('ios', true)).toBe(true);
    expect(shouldRepairIosStandaloneViewport('ios', false)).toBe(false);
    expect(shouldRepairIosStandaloneViewport('android', true)).toBe(false);
  });
});
