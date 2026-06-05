import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

export interface Step {
  key: string;
  label: string;
  description?: string;
}

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex items-center gap-3 flex-1">
            <div
              className={cn(
                'size-9 rounded-full grid place-items-center text-xs font-semibold transition shrink-0',
                done && 'bg-emerald-500 text-white',
                active && 'bg-ink-900 text-white dark:bg-white dark:text-ink-950 ring-4 ring-ink-100 dark:ring-white/10',
                !done && !active && 'bg-ink-100 text-ink-400 dark:bg-white/[0.06] dark:text-white/40'
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </div>
            <div className="hidden md:block min-w-0 flex-1">
              <div className={cn(
                'text-[11px] uppercase tracking-wider font-semibold',
                active ? 'text-ink-900 dark:text-white' : 'text-ink-500 dark:text-white/50'
              )}>
                {s.label}
              </div>
              {s.description && (
                <div className="text-[10px] text-ink-400 dark:text-white/40 truncate">{s.description}</div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={cn('hidden md:block h-px flex-1', done ? 'bg-emerald-300 dark:bg-emerald-500/30' : 'bg-ink-200 dark:bg-white/10')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
