import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './OfflineIndicator.module.css';

export interface OfflineIndicatorProps {
  showOnline?: boolean;
  placement?: 'floating' | 'inline';
}

function getOnlineStatus() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function OfflineIndicator({
  showOnline = false,
  placement = 'floating',
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(getOnlineStatus);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (isOnline && !showOnline) {
    return null;
  }

  const Icon = isOnline ? Wifi : WifiOff;

  return (
    <div
      className={styles.indicator}
      data-online={isOnline || undefined}
      data-placement={placement}
      role="status"
      aria-live="polite"
    >
      <Icon aria-hidden="true" />
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}
