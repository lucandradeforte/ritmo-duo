import { describe, expect, it } from 'vitest';
import { resolvePublicAssetPath } from './public-asset';

describe('resolvePublicAssetPath', () => {
  it('respeita o subdiretório do GitHub Pages', () => {
    expect(resolvePublicAssetPath('/exercise-media/demo.webp', '/ritmo-duo/')).toBe(
      '/ritmo-duo/exercise-media/demo.webp',
    );
  });

  it('normaliza a barra final da base', () => {
    expect(resolvePublicAssetPath('pwa-icon-v6-192x192.png', '/ritmo-duo')).toBe(
      '/ritmo-duo/pwa-icon-v6-192x192.png',
    );
  });
});
