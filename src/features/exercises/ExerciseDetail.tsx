import { ExternalLink, WifiOff } from 'lucide-react';
import type { Exercise } from '@/types';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/Modal';
import { ExerciseMedia } from './ExerciseMedia';
import styles from './ExerciseDetail.module.css';

interface ExerciseDetailProps {
  exercise: Exercise | null;
  open: boolean;
  online: boolean;
  onClose: () => void;
}

function InstructionList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      <ol>{items.map((item) => <li key={item}>{item}</li>)}</ol>
    </section>
  );
}

export function ExerciseDetail({ exercise, open, online, onClose }: ExerciseDetailProps) {
  if (!exercise) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={exercise.name}
      description={exercise.englishName}
      footer={
        exercise.media ? (
          online ? (
            <a className={styles.mediaLink} href={exercise.media.url} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Ver demonstração — {exercise.media.label}
            </a>
          ) : (
            <div className={styles.offline}><WifiOff aria-hidden="true" /> Referência externa indisponível. A demonstração acima funciona offline.</div>
          )
        ) : <Button fullWidth variant="secondary" onClick={onClose}>Entendi</Button>
      }
    >
      <div className={styles.content}>
        {exercise.demonstration ? (
          <ExerciseMedia key={exercise.id} demonstration={exercise.demonstration} />
        ) : null}
        <div className={styles.equipment}>
          <span>Equipamento</span>
          <strong>{exercise.equipmentLabel}</strong>
        </div>
        <section className={styles.muscles}>
          <div><span>Principal</span><strong>{exercise.muscles.primary.join(', ')}</strong></div>
          <div><span>Secundários</span><strong>{exercise.muscles.secondary.join(', ')}</strong></div>
        </section>
        <InstructionList title="Configuração" items={exercise.instructions.configuration} />
        <InstructionList title="Execução" items={exercise.instructions.execution} />
        <InstructionList title="Pontos técnicos" items={exercise.instructions.technicalPoints} />
        <InstructionList title="Erros comuns" items={exercise.instructions.commonMistakes} />
        <section className={styles.section}><h3>Sensação esperada</h3><p>{exercise.instructions.expectedSensation}</p></section>
        <InstructionList title="Sinais para interromper" items={exercise.instructions.stopSignals} />
        <section className={styles.alternatives}>
          <div><span>Mais fácil</span><p>{exercise.instructions.alternatives.easier}</p></div>
          <div><span>Padrão</span><p>{exercise.instructions.alternatives.standard}</p></div>
          <div><span>Progressão</span><p>{exercise.instructions.alternatives.progression}</p></div>
        </section>
      </div>
    </BottomSheet>
  );
}
