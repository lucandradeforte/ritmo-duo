import { ArrowRight, Dumbbell, HeartPulse } from 'lucide-react';
import type { UserId, UserProfile } from '@/types';
import { Card } from '@/components/ui/Surface';
import styles from './ProfileSelectScreen.module.css';

interface ProfileSelectScreenProps {
  profiles: readonly UserProfile[];
  onSelect: (userId: UserId) => void;
}

export function ProfileSelectScreen({ profiles, onSelect }: ProfileSelectScreenProps) {
  return (
    <main className={styles.screen}>
      <header className={styles.brand}>
        <div className={styles.mark} aria-hidden="true">
          <Dumbbell />
        </div>
        <div>
          <strong>Ritmo Duo</strong>
          <span>Seu treino, sem complicação.</span>
        </div>
      </header>

      <section className={styles.selection} aria-labelledby="profile-heading">
        <div>
          <h1 id="profile-heading">Quem está treinando?</h1>
          <p>Cada perfil mantém suas próprias cargas, progressões e histórico.</p>
        </div>

        <div className={styles.profiles}>
          {profiles.map((profile) => (
            <button key={profile.id} className={styles.profileButton} type="button" onClick={() => onSelect(profile.id)}>
              <Card as="div" className={styles.card} padding="spacious">
                <div className={styles.avatar} data-profile={profile.id}>
                  {profile.name.slice(0, 1)}
                </div>
                <div className={styles.profileCopy}>
                  <strong>{profile.name}</strong>
                  <span>
                    {profile.secondaryGoals.includes('muscle-gain') ? (
                      <><Dumbbell aria-hidden="true" /> Massa muscular</>
                    ) : (
                      <><HeartPulse aria-hidden="true" /> Saúde</>
                    )}
                  </span>
                </div>
                <ArrowRight className={styles.arrow} aria-hidden="true" />
              </Card>
            </button>
          ))}
        </div>
      </section>
      <p className={styles.storageNote}>Os dados ficam somente neste aparelho e podem ser exportados.</p>
    </main>
  );
}
