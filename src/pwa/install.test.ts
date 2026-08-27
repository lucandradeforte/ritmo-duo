import { describe, expect, it } from 'vitest';
import { detectInstallBrowser, detectInstallPlatform } from './install';

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

describe('detectInstallBrowser', () => {
  it('identifica Samsung Internet para evitar seu fluxo de instalação', () => {
    expect(
      detectInstallBrowser({
        userAgent:
          'Mozilla/5.0 (Linux; Android 16; SM-A556E) AppleWebKit/537.36 SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
      }),
    ).toBe('samsung-internet');
  });

  it('mantem o prompt nativo nos demais navegadores', () => {
    expect(
      detectInstallBrowser({
        userAgent:
          'Mozilla/5.0 (Linux; Android 16; SM-A556E) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36',
      }),
    ).toBe('other');
  });
});
