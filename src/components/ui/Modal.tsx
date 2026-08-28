import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type DialogVariant = 'modal' | 'sheet' | 'adaptive';

export interface DialogSurfaceProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: DialogVariant;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  trapFocus?: boolean;
  suspended?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function DialogSurface({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'adaptive',
  closeLabel = 'Fechar',
  closeOnBackdrop = true,
  trapFocus = true,
  suspended = false,
}: DialogSurfaceProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !trapFocus) {
      return undefined;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? dialog)?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open, trapFocus]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={styles.backdrop}
      data-variant={variant}
      role="presentation"
      onClick={(event) => {
        if (!suspended && closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-hidden={suspended || undefined}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        data-variant={variant}
        data-has-footer={Boolean(footer) || undefined}
        tabIndex={-1}
      >
        <span className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className={styles.description} id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button className={styles.close} type="button" aria-label={closeLabel} onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}

export type ModalProps = Omit<DialogSurfaceProps, 'variant'>;

export function Modal(props: ModalProps) {
  return <DialogSurface {...props} variant="modal" />;
}

export type BottomSheetProps = Omit<DialogSurfaceProps, 'variant'>;

export function BottomSheet(props: BottomSheetProps) {
  return <DialogSurface {...props} variant="sheet" />;
}
