import type { HTMLAttributes } from 'react';
import styles from './Surface.module.css';

export type SurfaceTone = 'default' | 'raised' | 'muted' | 'accent' | 'timer' | 'danger';
export type SurfacePadding = 'none' | 'compact' | 'default' | 'spacious';

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article';
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  outlined?: boolean;
}

export function Surface({
  as: Element = 'div',
  tone = 'default',
  padding = 'default',
  outlined = true,
  className,
  ...props
}: SurfaceProps) {
  const classes = [
    styles.surface,
    styles[`tone-${tone}`],
    styles[`padding-${padding}`],
    outlined ? styles.outlined : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes} {...props} />;
}

export type CardProps = SurfaceProps;

export function Card({ as = 'article', ...props }: CardProps) {
  return <Surface as={as} {...props} />;
}
