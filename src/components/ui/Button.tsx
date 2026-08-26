import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'timer';
export type ButtonSize = 'compact' | 'default' | 'large' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  isLoading = false,
  loadingLabel = 'Carregando',
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      type={type}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : leadingIcon}
      <span className={size === 'icon' ? styles.iconLabel : styles.label}>
        {isLoading ? loadingLabel : children}
      </span>
      {isLoading ? null : trailingIcon}
    </button>
  );
}
