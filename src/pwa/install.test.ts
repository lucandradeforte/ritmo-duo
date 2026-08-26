import { describe, expect, it } from 'vitest';
import { detectInstallPlatform } from './install';

describe('detectInstallPlatform', () => {
  it('identifica iPhone e iPad', () => {
    expect(
      detectInstallPlatform({
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
      }),
    ).toBe('ios');
  });

  it('identifica iPad em modo desktop', () => {
    expect(
      detectInstallPlatform({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe('ios');
  });

  it('identifica Android', () => {
    expect(
      detectInstallPlatform({
        userAgent:
          'Mozilla/5.0 (Linux; Android 15; SM-A556E) AppleWebKit/537.36 Chrome/132 Mobile',
      }),
    ).toBe('android');
  });

  it('mantem outros ambientes sem suposicao', () => {
    expect(
      detectInstallPlatform({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }),
    ).toBe('other');
  });
});
