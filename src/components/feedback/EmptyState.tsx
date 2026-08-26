import { Dumbbell } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon = <Dumbbell />,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <section className={styles.emptyState} data-compact={compact || undefined} aria-label={title}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
