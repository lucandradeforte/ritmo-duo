import { ChevronRight } from 'lucide-react';
import { ProfileAvatar, type ProfileTone } from './ProfileAvatar';
import styles from './ProfileSwitcher.module.css';

export interface ProfileSwitcherItem {
  id: string;
  name: string;
  description?: string;
  tone?: ProfileTone;
}

export interface ProfileSwitcherProps {
  profiles: readonly ProfileSwitcherItem[];
  activeProfileId?: string;
  onSelect: (profileId: string) => void;
  variant?: 'segmented' | 'cards';
  label?: string;
}

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSelect,
  variant = 'segmented',
  label = 'Escolher perfil',
}: ProfileSwitcherProps) {
  return (
    <div className={styles.switcher} data-variant={variant} role="group" aria-label={label}>
      {profiles.map((profile) => {
        const isActive = profile.id === activeProfileId;

        return (
          <button
            key={profile.id}
            className={styles.profile}
            type="button"
            aria-pressed={isActive}
            data-active={isActive || undefined}
            onClick={() => onSelect(profile.id)}
          >
            <ProfileAvatar
              name={profile.name}
              tone={profile.tone}
              size={variant === 'cards' ? 'large' : 'small'}
              decorative
            />
            <span className={styles.copy}>
              <strong className={styles.name}>{profile.name}</strong>
              {profile.description ? (
                <span className={styles.description}>{profile.description}</span>
              ) : null}
            </span>
            {variant === 'cards' ? <ChevronRight className={styles.chevron} aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
