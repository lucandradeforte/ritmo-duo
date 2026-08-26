export interface RestFeedbackOptions {
  vibrate?: boolean;
  sound?: boolean;
}

export interface RestFeedbackResult {
  vibrated: boolean;
  sounded: boolean;
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

let audioContext: AudioContext | undefined;

export const supportsVibration = (navigatorObject: Navigator = navigator): boolean =>
  typeof navigatorObject.vibrate === 'function';

export const vibrateRestComplete = (
  pattern: VibratePattern = [160, 80, 160],
  navigatorObject: Navigator = navigator,
): boolean => {
  if (!supportsVibration(navigatorObject)) return false;

  try {
    return navigatorObject.vibrate(pattern);
  } catch {
    return false;
  }
};

/**
 * Call from an explicit user action, such as enabling sound in settings.
 * Mobile browsers can reject audio initialization outside a user gesture.
 */
export const unlockFeedbackAudio = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const AudioContextConstructor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioContextConstructor) return false;

  try {
    audioContext ??= new AudioContextConstructor();
    if (audioContext.state === 'suspended') await audioContext.resume();
    return audioContext.state === 'running';
  } catch {
    return false;
  }
};

export const playRestCompleteSound = (): boolean => {
  if (!audioContext || audioContext.state !== 'running') return false;

  try {
    const startedAt = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(740, startedAt);
    oscillator.frequency.exponentialRampToValueAtTime(980, startedAt + 0.18);
    gain.gain.setValueAtTime(0.0001, startedAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startedAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.26);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startedAt);
    oscillator.stop(startedAt + 0.27);
    return true;
  } catch {
    return false;
  }
};

export const notifyRestComplete = ({
  vibrate = true,
  sound = false,
}: RestFeedbackOptions = {}): RestFeedbackResult => ({
  vibrated: vibrate ? vibrateRestComplete() : false,
  sounded: sound ? playRestCompleteSound() : false,
});
