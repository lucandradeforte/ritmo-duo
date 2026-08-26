let fallbackCounter = 0;

export const createId = (prefix: string, now = Date.now()): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  fallbackCounter += 1;
  return `${prefix}-${now.toString(36)}-${fallbackCounter.toString(36)}`;
};
