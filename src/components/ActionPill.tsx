import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../lib/cn';

type ColorKey = 'champagne' | 'violet' | 'rose' | 'emerald' | 'blue' | 'ink';

const COLORS: Record<ColorKey, string> = {
  champagne: 'text-champagne-500 hover:bg-champagne-400/10 dark:text-champagne-300 dark:hover:bg-champagne-400/15',
  violet:    'text-violet-500    hover:bg-violet-400/10    dark:text-violet-300    dark:hover:bg-violet-400/15',
  rose:      'text-rose-500      hover:bg-rose-400/10      dark:text-rose-300      dark:hover:bg-rose-400/15',
  emerald:   'text-emerald-500   hover:bg-emerald-400/10   dark:text-emerald-300   dark:hover:bg-emerald-400/15',
  blue:      'text-sky-500       hover:bg-sky-400/10       dark:text-sky-300       dark:hover:bg-sky-400/15',
  ink:       'text-ink-700       hover:bg-ink-100          dark:text-cream-100/80  dark:hover:bg-white/[0.06]',
};

/**
 * Botão capsula segmentado.
 * Default: só ícone. Hover: expande para mostrar o label ao lado.
 * Use sempre dentro de <ActionPillGroup>.
 */
export function ActionPill({
  icon: Icon, label, color = 'ink', onClick, disabled, busy,
}: {
  icon: LucideIcon;
  label: string;
  color?: ColorKey;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      title={label}
      className={cn(
        'group/pill flex items-center gap-0 hover:gap-2 transition-all duration-200',
        'h-10 px-3 rounded-none whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        COLORS[color],
      )}
    >
      {busy ? (
        <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        <Icon className="size-4 shrink-0" />
      )}
      <span className="
        max-w-0 overflow-hidden text-[11px] font-bold uppercase tracking-[0.16em]
        opacity-0 group-hover/pill:max-w-[180px] group-hover/pill:opacity-100
        transition-all duration-200
      ">
        {label}
      </span>
    </button>
  );
}

/**
 * Cápsula que envolve vários ActionPill com divisor vertical entre eles.
 * Estilo: rounded-full, border, hover de cada item separa visualmente.
 */
export function ActionPillGroup({ children, align = 'center', className }: {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  const justify = align === 'end' ? 'justify-end' : align === 'start' ? 'justify-start' : 'justify-center';
  return (
    <div className={cn('flex pt-1', justify, className)}>
      <div className={cn(
        'inline-flex items-center rounded-full overflow-hidden',
        'bg-white dark:bg-ink-800/60',
        'border border-ink-200 dark:border-champagne-400/15',
        'shadow-sm',
        'divide-x divide-ink-200 dark:divide-champagne-400/15'
      )}>
        {children}
      </div>
    </div>
  );
}
