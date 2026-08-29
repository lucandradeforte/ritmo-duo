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

    let repairFrame = 0;
    let resetFrame = 0;
    const repair = () => {
      if (window.scrollY !== 0) return;

      repairFrame = window.requestAnimationFrame(() => {
        if (window.scrollY !== 0) return;

        window.scrollTo(0, 1);
        resetFrame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
      });
    };
    const timer = window.setTimeout(repair, 100);

    repair();

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(repairFrame);
      window.cancelAnimationFrame(resetFrame);
    };
  }, [enabled]);
};
