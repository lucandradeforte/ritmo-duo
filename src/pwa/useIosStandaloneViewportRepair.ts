import { useEffect } from 'react';
import {
  getCurrentInstallPlatform,
  isRunningStandalone,
  type InstallPlatform,
} from './install';

export const shouldRepairIosStandaloneViewport = (
  platform: InstallPlatform,
  standalone: boolean,
): boolean => platform === 'ios' && standalone;

/**
 * WebKit can leave fixed elements above the home-indicator inset on a cold
 * standalone launch. Replaying a one-pixel scroll makes it recalculate the viewport.
 */
export const useIosStandaloneViewportRepair = (enabled: boolean) => {
  useEffect(() => {
    if (
      !enabled ||
      !shouldRepairIosStandaloneViewport(getCurrentInstallPlatform(), isRunningStandalone())
    ) {
      return undefined;
    }

    const root = document.documentElement;
    let repairFrame = 0;
    let resetFrame = 0;
    const syncViewportHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty('--app-viewport-height', `${Math.round(height)}px`);
    };
    const repair = () => {
      if (window.scrollY !== 0) return;

      repairFrame = window.requestAnimationFrame(() => {
        if (window.scrollY !== 0) return;

        window.scrollTo(0, 1);
        resetFrame = window.requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          syncViewportHeight();
        });
      });
    };
    const visualViewport = window.visualViewport;
    const timer = window.setTimeout(repair, 100);

    syncViewportHeight();
    repair();
    window.addEventListener('resize', syncViewportHeight);
    visualViewport?.addEventListener('resize', syncViewportHeight);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(repairFrame);
      window.cancelAnimationFrame(resetFrame);
      window.removeEventListener('resize', syncViewportHeight);
      visualViewport?.removeEventListener('resize', syncViewportHeight);
      root.style.removeProperty('--app-viewport-height');
    };
  }, [enabled]);
};
