import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = 'lg',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  width?: 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const w = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }[width];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <aside
        className={cn(
          'relative w-full h-full overflow-y-auto flex flex-col animate-fadeIn',
          'bg-white dark:bg-ink-900 text-ink-900 dark:text-white',
          'border-l border-ink-200 dark:border-white/10',
          'shadow-[-12px_0_48px_rgba(0,0,0,0.12)] dark:shadow-[-12px_0_48px_rgba(0,0,0,0.5)]',
          w
        )}
      >
        <header className="sticky top-0 z-10 px-6 py-4 border-b border-ink-200 dark:border-white/10 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-display text-xl leading-tight">{title}</div>
            {subtitle && <div className="text-xs text-ink-500 dark:text-white/50 mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-white/5 text-ink-500 dark:text-white/60 shrink-0"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <footer className="sticky bottom-0 px-6 py-4 border-t border-ink-200 dark:border-white/10 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  width = 'lg',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const w = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' }[width];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-h-[88vh] flex flex-col rounded-3xl overflow-hidden animate-fadeIn',
          'bg-white dark:bg-ink-900 text-ink-900 dark:text-white',
          'border border-ink-200 dark:border-white/10',
          'shadow-2xl',
          w
        )}
      >
        <header className="px-6 py-4 border-b border-ink-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="font-display text-xl leading-tight">{title}</div>
            {subtitle && <div className="text-xs text-ink-500 dark:text-white/50 mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-white/5 text-ink-500 dark:text-white/60 shrink-0"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <footer className="px-6 py-4 border-t border-ink-200 dark:border-white/10 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
