import { CirclePause, CirclePlay, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import type { ExerciseDemonstration } from '@/types';
import { Button } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { resolvePublicAssetPath } from '@/utils/public-asset';
import styles from './ExerciseMedia.module.css';

interface ExerciseMediaProps {
  demonstration: ExerciseDemonstration;
}

export function ExerciseMedia({ demonstration }: ExerciseMediaProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [motionOverride, setMotionOverride] = useState<'auto' | 'play' | 'pause'>('auto');
  const [animationFailed, setAnimationFailed] = useState(false);
  const shouldAnimate =
    !animationFailed &&
    (motionOverride === 'play' || (motionOverride === 'auto' && !prefersReducedMotion));

  const sourcePath = shouldAnimate
    ? demonstration.animationPath
    : demonstration.posterPath;

  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <img
          key={sourcePath}
          src={resolvePublicAssetPath(sourcePath)}
          alt={demonstration.alt}
          width={demonstration.width}
          height={demonstration.height}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (shouldAnimate) setAnimationFailed(true);
          }}
        />
        <span className={styles.badge}>
          {shouldAnimate ? <CirclePlay aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
          {shouldAnimate ? 'Demonstração animada' : 'Imagem estática'}
        </span>
      </div>
      <figcaption className={styles.caption}>
        <strong>{demonstration.caption}</strong>
        <span>Guia visual gerado para apoio. Use os pontos técnicos abaixo como referência principal.</span>
      </figcaption>
      <Button
        className={styles.motionControl}
        variant="secondary"
        size="compact"
        leadingIcon={shouldAnimate ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        onClick={() => setMotionOverride(shouldAnimate ? 'pause' : 'play')}
      >
        {shouldAnimate ? 'Pausar animação' : 'Reproduzir animação'}
      </Button>
    </figure>
  );
}
