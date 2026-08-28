import { RotateCcw } from 'lucide-react';
import { Component, type ReactNode } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/Button';
import styles from './App.module.css';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  private readonly handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className={styles.fatal} role="alert">
        <div>
          <span className={styles.brandMark}>
            <BrandMark />
          </span>
          <h1>Algo saiu do ritmo</h1>
          <p>Não foi possível exibir esta tela. Seus dados salvos permanecem neste aparelho.</p>
          <Button leadingIcon={<RotateCcw />} onClick={this.handleRetry}>
            Tentar novamente
          </Button>
        </div>
      </main>
    );
  }
}
