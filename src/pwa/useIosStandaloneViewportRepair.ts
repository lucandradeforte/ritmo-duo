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

/** Marks the installed iOS app so the shell can use WebKit's stable standalone viewport unit. */
export const useIosStandaloneViewportRepair = (enabled: boolean) => {
  useEffect(() => {
    if (
      !enabled ||
      !shouldRepairIosStandaloneViewport(getCurrentInstallPlatform(), isRunningStandalone())
    ) {
      return undefined;
    }

    const root = document.documentElement;
    root.dataset.iosStandalone = '';

    return () => {
      delete root.dataset.iosStandalone;
    };
  }, [enabled]);
};
