import { Download, RefreshCw, Share2, WifiOff, X } from 'lucide-react';
import { useState } from 'react';
import {
  getCurrentInstallBrowser,
  getCurrentInstallPlatform,
  isRunningStandalone,
  useInstallPrompt,
} from './install';
import styles from './PwaStatusCenter.module.css';
import { useOnlineStatus } from './useOnlineStatus';
import { usePwaUpdate } from './usePwaUpdate';

export interface PwaStatusCenterProps {
  installHelpDismissed: boolean;
  workoutActive: boolean;
  onDismissInstallHelp: () => void;
}

export const PwaStatusCenter = ({
  installHelpDismissed,
  workoutActive,
  onDismissInstallHelp,
}: PwaStatusCenterProps) => {
  const online = useOnlineStatus();
  const browser = getCurrentInstallBrowser();
  const platform = getCurrentInstallPlatform();
  const standalone = isRunningStandalone();
  const { canPrompt, installed, promptInstall } = useInstallPrompt();
  const { updateAvailable, updating, applyUpdate } = usePwaUpdate({ workoutActive });
  const [updateDismissed, setUpdateDismissed] = useState(false);

  const showIosHelp =
    platform === 'ios' && !standalone && !installed && !installHelpDismissed && !workoutActive;
  const showSamsungInstallHelp =
    browser === 'samsung-internet' &&
    !standalone &&
    !installed &&
    !installHelpDismissed &&
    !workoutActive;
  const showNativeInstall =
    canPrompt &&
    browser !== 'samsung-internet' &&
    !standalone &&
    !installed &&
    !installHelpDismissed &&
    !workoutActive;
  const showUpdate = updateAvailable && !workoutActive && !updateDismissed;

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome !== 'unavailable') onDismissInstallHelp();
  };

  return (
    <>
      {!online ? (
        <div className={styles.offline} role="status" aria-live="polite">
          <WifiOff aria-hidden="true" size={16} />
          Offline
        </div>
      ) : null}

      {showIosHelp || showSamsungInstallHelp || showNativeInstall || showUpdate ? (
        <aside className={styles.noticeStack} aria-label="Avisos do aplicativo">
          {showUpdate ? (
            <section className={styles.notice} aria-labelledby="pwa-update-title">
              <div className={styles.noticeIcon} aria-hidden="true">
                <RefreshCw size={21} />
              </div>
              <div className={styles.noticeBody}>
                <strong id="pwa-update-title">Nova versão disponível</strong>
                <span>Atualize agora para usar as melhorias mais recentes.</span>
                <button
                  className={styles.primaryAction}
                  type="button"
                  disabled={updating}
                  onClick={() => void applyUpdate()}
                >
                  {updating ? 'Atualizando…' : 'Atualizar'}
                </button>
              </div>
              <button
                className={styles.dismissButton}
                type="button"
                aria-label="Lembrar da atualização depois"
                onClick={() => setUpdateDismissed(true)}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </section>
          ) : null}

          {showNativeInstall ? (
            <section className={styles.notice} aria-labelledby="pwa-install-title">
              <div className={styles.noticeIcon} aria-hidden="true">
                <Download size={21} />
              </div>
              <div className={styles.noticeBody}>
                <strong id="pwa-install-title">Instalar Ritmo Duo</strong>
                <span>Acesso rápido e treino disponível mesmo sem internet.</span>
                <button
                  className={styles.primaryAction}
                  type="button"
                  onClick={() => void handleInstall()}
                >
                  Instalar aplicativo
                </button>
              </div>
              <button
                className={styles.dismissButton}
                type="button"
                aria-label="Fechar ajuda de instalação"
                onClick={onDismissInstallHelp}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </section>
          ) : null}

          {showIosHelp && !showNativeInstall ? (
            <section className={styles.notice} aria-labelledby="ios-install-title">
              <div className={styles.noticeIcon} aria-hidden="true">
                <Share2 size={21} />
              </div>
              <div className={styles.noticeBody}>
                <strong id="ios-install-title">Instalar no iPhone</strong>
                <span>
                  No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.
                </span>
                <button
                  className={styles.secondaryAction}
                  type="button"
                  onClick={onDismissInstallHelp}
                >
                  Entendi
                </button>
              </div>
              <button
                className={styles.dismissButton}
                type="button"
                aria-label="Fechar ajuda de instalação"
                onClick={onDismissInstallHelp}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </section>
          ) : null}

          {showSamsungInstallHelp ? (
            <section className={styles.notice} aria-labelledby="samsung-install-title">
              <div className={styles.noticeIcon} aria-hidden="true">
                <Download size={21} />
              </div>
              <div className={styles.noticeBody}>
                <strong id="samsung-install-title">Instale pelo Chrome</strong>
                <span>
                  No Samsung Internet, o Android pode bloquear a instalação. Abra este endereço no
                  Google Chrome e escolha Instalar aplicativo.
                </span>
                <button
                  className={styles.secondaryAction}
                  type="button"
                  onClick={onDismissInstallHelp}
                >
                  Entendi
                </button>
              </div>
              <button
                className={styles.dismissButton}
                type="button"
                aria-label="Fechar ajuda de instalação"
                onClick={onDismissInstallHelp}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </section>
          ) : null}
        </aside>
      ) : null}
    </>
  );
};
