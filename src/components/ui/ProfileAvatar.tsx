import type { HTMLAttributes } from 'react';
import styles from './ProfileAvatar.module.css';

export type ProfileTone = 'lime' | 'orange' | 'blue' | 'violet';
export type ProfileAvatarSize = 'small' | 'medium' | 'large';

export interface ProfileAvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: string;
  tone?: ProfileTone;
  size?: ProfileAvatarSize;
  decorative?: boolean;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('pt-BR'))
    .join('');
}

export function ProfileAvatar({
  name,
  tone = 'lime',
  size = 'medium',
  decorative = false,
  className,
  ...props
}: ProfileAvatarProps) {
  return (
    <span
      className={[styles.avatar, styles[tone], styles[size], className ?? '']
        .filter(Boolean)
        .join(' ')}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `Perfil de ${name}`}
      {...props}
    >
      {getInitials(name)}
    </span>
  );
}
