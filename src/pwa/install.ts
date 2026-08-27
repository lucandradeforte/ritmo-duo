import { useSyncExternalStore } from 'react';

export type InstallPlatform = 'ios' | 'android' | 'other';
export type InstallBrowser = 'samsung-internet' | 'other';
export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

export interface PlatformSignals {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallSnapshot {
  canPrompt: boolean;
  installed: boolean;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const listeners = new Set<() => void>();
const emptySnapshot: InstallSnapshot = { canPrompt: false, installed: false };
let deferredPrompt: BeforeInstallPromptEvent | undefined;
let initialized = false;
let snapshot = emptySnapshot;

const emit = () => {
  snapshot = {
    canPrompt: deferredPrompt !== undefined,
    installed: snapshot.installed,
  };
  listeners.forEach((listener) => listener());
};

const handleBeforeInstallPrompt = (event: Event) => {
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  emit();
};

const handleAppInstalled = () => {
  deferredPrompt = undefined;
  snapshot = { canPrompt: false, installed: true };
  listeners.forEach((listener) => listener());
};

export const initializeInstallPrompt = () => {
  if (initialized || typeof window === 'undefined') return;

  initialized = true;
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
};

export const detectInstallPlatform = ({
  userAgent,
  platform = '',
  maxTouchPoints = 0,
}: PlatformSignals): InstallPlatform => {
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent);
  const isIPadDesktopMode = platform === 'MacIntel' && maxTouchPoints > 1;

  if (isAppleMobile || isIPadDesktopMode) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'other';
};

export const getCurrentInstallPlatform = (): InstallPlatform => {
  if (typeof navigator === 'undefined') return 'other';

  return detectInstallPlatform({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  });
};

export const detectInstallBrowser = ({ userAgent }: Pick<PlatformSignals, 'userAgent'>): InstallBrowser =>
  /SamsungBrowser/i.test(userAgent) ? 'samsung-internet' : 'other';

export const getCurrentInstallBrowser = (): InstallBrowser => {
  if (typeof navigator === 'undefined') return 'other';

  return detectInstallBrowser({ userAgent: navigator.userAgent });
};

export const isRunningStandalone = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const navigatorWithStandalone = navigator as NavigatorWithStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
};

const subscribe = (listener: () => void) => {
  initializeInstallPrompt();
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => snapshot;
const getServerSnapshot = () => emptySnapshot;

export const useInstallPrompt = () => {
  const currentSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const promptInstall = async (): Promise<InstallOutcome> => {
    const prompt = deferredPrompt;
    if (!prompt) return 'unavailable';

    deferredPrompt = undefined;
    emit();

    await prompt.prompt();
    const choice = await prompt.userChoice;
    return choice.outcome;
  };

  return { ...currentSnapshot, promptInstall };
};
