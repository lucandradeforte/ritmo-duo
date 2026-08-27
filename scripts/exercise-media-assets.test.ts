/** @vitest-environment node */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { exercises } from '@/data';

const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));

describe('arquivos locais das demonstrações', () => {
  it('mantém animação e poster WebP válidos para cada exercício', async () => {
    const paths = exercises.flatMap((exercise) => {
      if (!exercise.demonstration) {
        throw new Error(`Demonstração ausente para ${exercise.id}`);
      }

      return [
        exercise.demonstration.animationPath,
        exercise.demonstration.posterPath,
      ];
    });

    expect(paths).toHaveLength(24);
    expect(new Set(paths).size).toBe(paths.length);

    await Promise.all(
      paths.map(async (relativePath) => {
        const file = await readFile(`${publicDirectory}${relativePath}`);
        expect(file.byteLength).toBeGreaterThan(100);
        expect(file.subarray(0, 4).toString('ascii')).toBe('RIFF');
        expect(file.subarray(8, 12).toString('ascii')).toBe('WEBP');
      }),
    );
  });
});
