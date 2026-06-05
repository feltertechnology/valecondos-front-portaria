import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from 'lucide-react';
import { format, isSameDay, isWithinInterval, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/cn';

/* ============================================================
 * DateInput · seletor de DATA ÚNICA (ex: Saída prevista)
 * ============================================================ */

interface DateInputProps {
  label: string;
  value?: Date | null;
  onChange: (d: Date | null) => void;
  className?: string;
  fmt?: string;
}

export function DateInput({ label, value, onChange, className, fmt = 'dd/MM/yyyy' }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(() => startOfMonth(value ?? new Date()));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [open]);

  const filled = !!value;
  const display = value ? format(value, fmt, { locale: ptBR }) : '';

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'peer w-full h-12 text-left transition-all duration-150',
          'px-3 pr-10 text-sm font-medium',
          'text-ink-900 dark:text-cream-100',
          'rounded-xl border-2 outline-none',
          'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-champagne-400/40',
          'focus:border-champagne-400 focus:ring-2 focus:ring-champagne-400/15',
          open && 'border-champagne-400 ring-2 ring-champagne-400/15'
        )}
      >
        {display || <span className="opacity-0">·</span>}
      </button>

      <label
        className={cn(
          'pointer-events-none absolute z-10 transition-all duration-150 font-medium select-none',
          filled || open
            ? 'left-2.5 -top-2 px-1.5 text-[11px] tracking-wide bg-white dark:bg-ink-800 text-champagne-600 dark:text-champagne-300'
            : 'left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 dark:text-cream-100/35',
        )}
      >
        {label}
      </label>

      <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 dark:text-cream-100/40" />

      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          className="absolute right-9 top-1/2 -translate-y-1/2 size-5 grid place-items-center text-ink-400 dark:text-cream-100/40 hover:text-rose-500"
        >
          <X className="size-3.5" />
        </button>
      )}

      {open && (
        <Popover>
          <MonthGrid
            month={month}
            onPrev={() => setMonth(subMonths(month, 1))}
            onNext={() => setMonth(addMonths(month, 1))}
            onPick={(d) => { onChange(d); setOpen(false); }}
            isSelected={(d) => !!value && isSameDay(d, value)}
          />
        </Popover>
      )}
    </div>
  );
}

/* ============================================================
 * DateRangeInput · seletor de RANGE (ex: Período)
 * ============================================================ */

interface DateRange { from: Date | null; to: Date | null; }

interface DateRangeInputProps {
  label: string;
  value?: DateRange;
  onChange: (r: DateRange) => void;
  className?: string;
}

export function DateRangeInput({ label, value, onChange, className }: DateRangeInputProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<Date | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(() => startOfMonth(value?.from ?? new Date()));
  const from = value?.from ?? null;
  const to = value?.to ?? null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [open]);

  const filled = !!(from || to);
  const display = from && to
    ? `${format(from, 'dd/MM/yyyy', { locale: ptBR })} até ${format(to, 'dd/MM/yyyy', { locale: ptBR })}`
    : from
      ? `${format(from, 'dd/MM/yyyy', { locale: ptBR })} → selecione fim`
      : '';

  function pick(d: Date) {
    if (!from || (from && to)) {
      onChange({ from: d, to: null });
    } else if (d < from) {
      onChange({ from: d, to: from });
      setOpen(false);
    } else {
      onChange({ from, to: d });
      setOpen(false);
    }
  }

  const previewEnd = (!to && from && hover && hover > from) ? hover : null;

  function isInRange(d: Date) {
    if (from && to) return isWithinInterval(d, { start: from, end: to });
    if (from && previewEnd) return isWithinInterval(d, { start: from, end: previewEnd });
    return false;
  }
  function isEdge(d: Date) {
    return (from && isSameDay(d, from)) || (to && isSameDay(d, to)) || false;
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'peer w-full h-12 text-left transition-all duration-150',
          'px-3 pr-10 text-sm font-medium',
          'text-ink-900 dark:text-cream-100',
          'rounded-xl border-2 outline-none',
          'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-champagne-400/40',
          'focus:border-champagne-400 focus:ring-2 focus:ring-champagne-400/15',
          open && 'border-champagne-400 ring-2 ring-champagne-400/15'
        )}
      >
        {display || <span className="opacity-0">·</span>}
      </button>

      <label
        className={cn(
          'pointer-events-none absolute z-10 transition-all duration-150 font-medium select-none',
          filled || open
            ? 'left-2.5 -top-2 px-1.5 text-[11px] tracking-wide bg-white dark:bg-ink-800 text-champagne-600 dark:text-champagne-300'
            : 'left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 dark:text-cream-100/35',
        )}
      >
        {label}
      </label>

      <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 dark:text-cream-100/40" />

      {filled && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange({ from: null, to: null }); }}
          className="absolute right-9 top-1/2 -translate-y-1/2 size-5 grid place-items-center text-ink-400 dark:text-cream-100/40 hover:text-rose-500"
        >
          <X className="size-3.5" />
        </button>
      )}

      {open && (
        <Popover>
          <MonthGrid
            month={month}
            onPrev={() => setMonth(subMonths(month, 1))}
            onNext={() => setMonth(addMonths(month, 1))}
            onPick={pick}
            onHoverDay={setHover}
            isSelected={isEdge}
            isInRange={isInRange}
          />
          <div className="border-t border-ink-100 dark:border-champagne-400/10 px-3 py-2.5 flex items-center justify-between text-[11px] text-ink-500 dark:text-cream-100/60">
            <div className="font-mono tabular-nums">
              {from ? format(from, 'dd/MM/yyyy', { locale: ptBR }) : '—'} → {to ? format(to, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
            </div>
            <div className="flex gap-2">
              <PresetBtn onClick={() => {
                const today = new Date(); const sevenAgo = new Date(); sevenAgo.setDate(today.getDate() - 7);
                onChange({ from: sevenAgo, to: today }); setOpen(false);
              }}>7d</PresetBtn>
              <PresetBtn onClick={() => {
                const today = new Date(); const m = new Date(today.getFullYear(), today.getMonth(), 1);
                onChange({ from: m, to: today }); setOpen(false);
              }}>Mês</PresetBtn>
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
}

function PresetBtn({ children, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-ink-100 dark:bg-white/[0.06] text-ink-700 dark:text-cream-100/80 hover:bg-champagne-400 hover:text-ink-900 transition"
    >
      {children}
    </button>
  );
}

/* ============================================================
 * InlineDateRange · seletor de RANGE INLINE (expande no card)
 *  - Click no campo: expande mostrando o calendário ABAIXO no mesmo card
 *  - Não usa popover flutuante
 * ============================================================ */

export function InlineDateRange({ label, value, onChange, className }: {
  label: string;
  value?: { from: Date | null; to: Date | null };
  onChange: (r: { from: Date | null; to: Date | null }) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(true); // padrão: aberto (igual ao screenshot)
  const [hover, setHover] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => startOfMonth(value?.from ?? new Date()));
  const from = value?.from ?? null;
  const to = value?.to ?? null;
  const filled = !!(from || to);
  const display = from && to
    ? `${format(from, 'dd/MM/yyyy', { locale: ptBR })} → ${format(to, 'dd/MM/yyyy', { locale: ptBR })}`
    : from
      ? `${format(from, 'dd/MM/yyyy', { locale: ptBR })} → ?`
      : '';

  function pick(d: Date) {
    if (!from || (from && to)) {
      onChange({ from: d, to: null });
    } else if (d < from) {
      onChange({ from: d, to: from });
    } else {
      onChange({ from, to: d });
    }
  }

  const previewEnd = (!to && from && hover && hover > from) ? hover : null;
  const isInRange = (d: Date) => {
    if (from && to) return isWithinInterval(d, { start: from, end: to });
    if (from && previewEnd) return isWithinInterval(d, { start: from, end: previewEnd });
    return false;
  };
  const isEdge = (d: Date) =>
    (from && isSameDay(d, from)) || (to && isSameDay(d, to)) || false;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Botão outlined "Período" — clica para expandir/colapsar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative w-full text-left h-12 px-3 pr-10 rounded-xl border-2 transition-all duration-150',
          'bg-transparent text-sm font-medium',
          'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-champagne-400/40',
          'focus:outline-none focus:border-champagne-400 focus:ring-2 focus:ring-champagne-400/15',
          'text-ink-900 dark:text-cream-100',
          open && 'border-champagne-400 ring-2 ring-champagne-400/15'
        )}
      >
        {display || <span className="opacity-0">·</span>}

        {/* Label crava na borda quando preenchido ou aberto */}
        <span className={cn(
          'pointer-events-none absolute z-10 transition-all duration-150 font-medium select-none',
          filled || open
            ? 'left-2.5 -top-2 px-1.5 text-[11px] tracking-wide bg-white dark:bg-ink-800 text-champagne-600 dark:text-champagne-300'
            : 'left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 dark:text-cream-100/35'
        )}>
          {label}
        </span>

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-cream-100/40">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {/* Calendário inline */}
      {open && (
        <div className={cn(
          'rounded-xl overflow-hidden animate-fadeIn',
          'bg-white dark:bg-ink-800',
          'border border-ink-200 dark:border-champagne-400/15',
        )}>
          <MonthGrid
            month={month}
            onPrev={() => setMonth(subMonths(month, 1))}
            onNext={() => setMonth(addMonths(month, 1))}
            onPick={pick}
            onHoverDay={setHover}
            isSelected={isEdge}
            isInRange={isInRange}
          />
          <div className="border-t border-ink-100 dark:border-champagne-400/10 px-3 py-2.5 flex items-center justify-between text-[11px] text-ink-500 dark:text-cream-100/60">
            <div className="font-mono tabular-nums">
              {from ? format(from, 'dd/MM/yyyy', { locale: ptBR }) : '—'} → {to ? format(to, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
            </div>
            <div className="flex gap-2">
              <PresetBtn onClick={() => {
                const today = new Date(); const sevenAgo = new Date(); sevenAgo.setDate(today.getDate() - 7);
                onChange({ from: sevenAgo, to: today });
              }}>7d</PresetBtn>
              <PresetBtn onClick={() => {
                const today = new Date(); const m = new Date(today.getFullYear(), today.getMonth(), 1);
                onChange({ from: m, to: today });
              }}>Mês</PresetBtn>
              <PresetBtn onClick={() => onChange({ from: null, to: null })}>Limpar</PresetBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Popover + MonthGrid (compartilhado)
 * ============================================================ */

function Popover({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      'absolute z-50 mt-1.5 w-[300px] rounded-xl overflow-hidden',
      'bg-white dark:bg-ink-800',
      'border border-ink-200 dark:border-champagne-400/15',
      'shadow-[0_8px_24px_rgba(11,14,18,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]',
      'animate-fadeIn'
    )}>
      {children}
    </div>
  );
}

interface MonthGridProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  onPick: (d: Date) => void;
  onHoverDay?: (d: Date | null) => void;
  isSelected: (d: Date) => boolean;
  isInRange?: (d: Date) => boolean;
}

function MonthGrid({ month, onPrev, onNext, onPick, onHoverDay, isSelected, isInRange }: MonthGridProps) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ano = month.getFullYear();
  const mes = month.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const dias: (Date | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
  for (let d = 1; d <= diasNoMes; d++) dias.push(new Date(ano, mes, d));

  return (
    <div className="p-3" onMouseLeave={() => onHoverDay?.(null)}>
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={onPrev}
          className="size-7 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-white/[0.06] text-ink-700 dark:text-cream-100/80"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-sm font-bold capitalize text-ink-900 dark:text-cream-100">
          {format(month, 'LLLL yyyy', { locale: ptBR })}
        </div>
        <button
          type="button"
          onClick={onNext}
          className="size-7 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-white/[0.06] text-ink-700 dark:text-cream-100/80"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-ink-400 dark:text-cream-100/40 font-bold mb-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((s, i) => <div key={i}>{s}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {dias.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = d.getTime() === today.getTime();
          const selected = isSelected(d);
          const ranged = isInRange?.(d);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(d)}
              onMouseEnter={() => onHoverDay?.(d)}
              className={cn(
                'aspect-square text-xs rounded-md transition font-medium',
                selected
                  ? 'bg-champagne-400 text-ink-900 font-bold'
                  : ranged
                    ? 'bg-champagne-400/15 text-champagne-700 dark:text-champagne-200'
                    : 'hover:bg-ink-100 dark:hover:bg-white/[0.06] text-ink-700 dark:text-cream-100/80',
                isToday && !selected && 'ring-1 ring-champagne-400/50'
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
