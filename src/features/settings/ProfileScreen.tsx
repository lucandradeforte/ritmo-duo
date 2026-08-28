import { BellRing, Download, LogOut, Moon, Smartphone, Sun, Trash2, Upload } from 'lucide-react';
import type { UserProfile, WorkoutPlan } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Card } from '@/components/ui/Surface';
import styles from './ProfileScreen.module.css';

const weightFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export type ThemePreference = 'system' | 'dark' | 'light';

interface ProfileScreenProps {
  user: UserProfile;
  plan: WorkoutPlan;
  theme: ThemePreference;
  soundEnabled: boolean;
  wakeLockEnabled: boolean;
  onThemeChange: (theme: ThemePreference) => void;
  onSoundChange: (enabled: boolean) => void;
  onWakeLockChange: (enabled: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClearHistory: () => void;
  onChangeUser: () => void;
}

export function ProfileScreen({
  user,
  plan,
  theme,
  soundEnabled,
  wakeLockEnabled,
  onThemeChange,
  onSoundChange,
  onWakeLockChange,
  onExport,
  onImport,
  onClearHistory,
  onChangeUser,
}: ProfileScreenProps) {
  return (
    <main className="app-content">
      <header className={styles.profileHeader}>
        <ProfileAvatar name={user.name} tone={user.id === 'lucas' ? 'lime' : 'orange'} size="large" />
        <div><h1>{user.name}</h1><p>{user.age} anos · {user.heightCm} cm · {weightFormatter.format(user.weightKg)} kg</p></div>
      </header>

      <section className={styles.section} aria-labelledby="appearance-heading">
        <h2 id="appearance-heading">Aparência</h2>
        <Card className={styles.segmented} padding="compact">
          <button type="button" data-active={theme === 'system' || undefined} onClick={() => onThemeChange('system')}><Smartphone /> Sistema</button>
          <button type="button" data-active={theme === 'dark' || undefined} onClick={() => onThemeChange('dark')}><Moon /> Escuro</button>
          <button type="button" data-active={theme === 'light' || undefined} onClick={() => onThemeChange('light')}><Sun /> Claro</button>
        </Card>
      </section>

      <section className={styles.section} aria-labelledby="workout-settings-heading">
        <h2 id="workout-settings-heading">Durante o treino</h2>
        <Card padding="none">
          <label className={styles.toggleRow}>
            <span><BellRing /><span><strong>Alerta sonoro</strong><small>Ativado somente após interação</small></span></span>
            <input type="checkbox" checked={soundEnabled} onChange={(event) => onSoundChange(event.target.checked)} />
          </label>
          <label className={styles.toggleRow}>
            <span><Smartphone /><span><strong>Manter tela ativa</strong><small>Quando o aparelho oferecer Wake Lock</small></span></span>
            <input type="checkbox" checked={wakeLockEnabled} onChange={(event) => onWakeLockChange(event.target.checked)} />
          </label>
        </Card>
      </section>

      <section className={styles.section} aria-labelledby="program-guide-heading">
        <h2 id="program-guide-heading">Guia do programa</h2>
        <Card className={styles.guide} padding="none">
          <div className={styles.guideIntro}>
            <strong>{plan.name}</strong>
            <p>{plan.objective}</p>
          </div>
          <details>
            <summary>Como usar RIR e RPE</summary>
            <div className={styles.guideContent}>
              <p><strong>RIR 3</strong> significa encerrar a série acreditando que ainda faria cerca de três repetições tecnicamente corretas.</p>
              <p><strong>RPE</strong> mede o esforço percebido de 1 a 10. No cardio inicial, RPE 3–4 deve permitir falar frases completas.</p>
              <p>Nas primeiras semanas, não treine até a falha muscular.</p>
            </div>
          </details>
          <details>
            <summary>Descobrir a carga inicial</summary>
            <ol className={styles.guideContent}>
              <li>Faça o aquecimento geral e a série preparatória indicada.</li>
              <li>Escolha uma carga claramente leve e execute 8–10 repetições.</li>
              <li>Avalie quantas repetições corretas ainda conseguiria fazer.</li>
              <li>Se sobrariam mais de 4, aumente um incremento pequeno; se sobrariam menos que o RIR-alvo, reduza.</li>
              <li>Repita com descanso completo até encontrar a faixa prescrita.</li>
              <li>Não faça teste de 1RM nesta fase.</li>
            </ol>
          </details>
          <details>
            <summary>Fases e progressão</summary>
            <div className={styles.guideContent}>
              {plan.phases.map((phase) => (
                <div key={phase.id}>
                  <strong>Semanas {phase.weeks.min}–{phase.weeks.max} · {phase.title}</strong>
                  <ul>{phase.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul>
                </div>
              ))}
              <strong>Progressão dupla</strong>
              <ul>{plan.progressionNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            </div>
          </details>
          <details>
            <summary>Sinais de segurança</summary>
            <ul className={styles.guideContent}>{plan.safetyNotes.map((note) => <li key={note}>{note}</li>)}</ul>
          </details>
        </Card>
      </section>

      <section className={styles.section} aria-labelledby="data-heading">
        <h2 id="data-heading">Dados e backup</h2>
        <div className={styles.actions}>
          <Button variant="secondary" leadingIcon={<Download />} onClick={onExport}>Exportar backup</Button>
          <label className={styles.importButton}>
            <Upload /> Importar backup
            <input className="sr-only" type="file" accept="application/json,.json" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.target.value = '';
            }} />
          </label>
          <Button variant="danger" leadingIcon={<Trash2 />} onClick={onClearHistory}>Apagar histórico</Button>
        </div>
      </section>

      <Button fullWidth variant="ghost" leadingIcon={<LogOut />} onClick={onChangeUser}>Trocar usuário</Button>
      <p className={styles.version}>Ritmo Duo · armazenamento local v2</p>
    </main>
  );
}
