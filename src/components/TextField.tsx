import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

interface Common {
  label: string;
  counter?: boolean;
  maxLength?: number;
  rightSlot?: ReactNode;
  className?: string;
  tone?: 'champagne' | 'neutral';
}

type TextFieldProps = Common & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

/**
 * Outlined field (Material 3 style):
 * - Vazio: label centralizado dentro do input (placeholder).
 * - Focado / preenchido: label crava na borda superior (bg matching o card cortando o traço).
 * - Contador opcional inline no próprio label: "Documento 12/20".
 *
 * IMPORTANTE: `<input>` precisa vir ANTES do `<label>` no DOM
 * para o Tailwind `peer-*` funcionar (sibling combinator `~`).
 */
export function TextField({
  label, counter, maxLength, rightSlot, className, tone = 'champagne',
  value, defaultValue, onChange, ...rest
}: TextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [innerLen, setInnerLen] = useState(() =>
    String(value ?? defaultValue ?? '').length
  );
  const isControlled = value !== undefined;
  const len = isControlled ? String(value ?? '').length : innerLen;

  useEffect(() => {
    if (isControlled) setInnerLen(String(value ?? '').length);
  }, [value, isControlled]);

  const showCounter = counter || !!maxLength;
  const counterText = maxLength ? `${len}/${maxLength}` : `${len}`;
  const overLimit = !!maxLength && len >= maxLength;

  const borderClasses = tone === 'champagne'
    ? 'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-champagne-400/40 focus:border-champagne-400 dark:focus:border-champagne-400'
    : 'border-ink-200 dark:border-ink-600 hover:border-ink-300 focus:border-ink-900 dark:focus:border-cream-100/50';

  return (
    <div className={cn('relative', className)}>
      {/* Input PRIMEIRO (peer) */}
      <input
        ref={ref}
        {...rest}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => {
          if (!isControlled) setInnerLen(e.target.value.length);
          onChange?.(e);
        }}
        maxLength={maxLength}
        placeholder=" "
        className={cn(
          'peer w-full h-12 bg-transparent outline-none transition-all duration-150',
          'px-3 text-sm font-medium',
          'text-ink-900 dark:text-cream-100',
          'rounded-xl border-2',
          borderClasses,
          'focus:ring-2 focus:ring-champagne-400/15',
          rightSlot ? 'pr-10' : '',
        )}
      />

      {/* Label DEPOIS — usa peer-* baseado no estado do input */}
      <label
        className={cn(
          'pointer-events-none absolute z-10 transition-all duration-150 font-medium select-none',
          // Estado padrão (preenchido) — cravado no top border
          'left-2.5 -top-2 px-1.5 text-[11px] tracking-wide',
          'bg-white dark:bg-ink-800',
          tone === 'champagne'
            ? 'text-champagne-600 dark:text-champagne-300'
            : 'text-ink-700 dark:text-cream-100/80',
          // Estado vazio — vira placeholder centralizado
          'peer-placeholder-shown:left-3 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2',
          'peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal',
          'peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0',
          'peer-placeholder-shown:text-ink-400 dark:peer-placeholder-shown:text-cream-100/35',
          // Estado focado — volta pra borda mesmo se vazio
          'peer-focus:left-2.5 peer-focus:-top-2 peer-focus:translate-y-0',
          'peer-focus:text-[11px] peer-focus:tracking-wide peer-focus:px-1.5',
          'peer-focus:bg-white dark:peer-focus:bg-ink-800',
          tone === 'champagne'
            ? 'peer-focus:text-champagne-600 dark:peer-focus:text-champagne-300'
            : 'peer-focus:text-ink-700 dark:peer-focus:text-cream-100/80',
        )}
      >
        <span>{label}</span>
        {showCounter && (
          <span className={cn(
            'ml-1.5 font-mono tabular-nums',
            overLimit ? 'text-rose-500 dark:text-rose-400' : 'opacity-65'
          )}>
            {counterText}
          </span>
        )}
      </label>

      {/* Slot à direita */}
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-cream-100/40 pointer-events-none">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

/* ------------- SelectField ------------- */

interface SelectFieldProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: any) => void;
}

export function SelectField({ label, options, value, onChange, ...rest }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        value={value ?? ''}
        onChange={onChange}
        className={cn(
          'peer w-full h-12 bg-transparent outline-none transition-all duration-150',
          'px-3 pr-9 text-sm font-medium appearance-none cursor-pointer',
          'text-ink-900 dark:text-cream-100',
          'rounded-xl border-2',
          'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-champagne-400/40',
          'focus:border-champagne-400 focus:ring-2 focus:ring-champagne-400/15',
          // Quando vazio, o option oculto faz aparecer o "placeholder" visualmente
          !value && 'text-transparent',
        )}
      >
        <option value="" disabled hidden></option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <label
        className={cn(
          'pointer-events-none absolute z-10 transition-all duration-150 font-medium select-none',
          value
            ? 'left-2.5 -top-2 px-1.5 text-[11px] tracking-wide bg-white dark:bg-ink-800 text-champagne-600 dark:text-champagne-300'
            : 'left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 dark:text-cream-100/35',
          'peer-focus:left-2.5 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:tracking-wide peer-focus:px-1.5',
          'peer-focus:bg-white dark:peer-focus:bg-ink-800 peer-focus:text-champagne-600 dark:peer-focus:text-champagne-300',
        )}
      >
        {label}
      </label>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 dark:text-cream-100/40 pointer-events-none" />
    </div>
  );
}

/* ------------- DateField ------------- */

interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label: string;
  type?: 'date' | 'datetime-local' | 'time';
}

export function DateField({ label, type = 'datetime-local', value, defaultValue, ...rest }: DateFieldProps) {
  const filled = !!(value ?? defaultValue);
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        {...rest}
        className={cn(
          'peer w-full h-12 bg-transparent outline-none transition-all duration-150',
          'px-3 text-sm font-medium',
          'text-ink-900 dark:text-cream-100',
          'rounded-xl border-2',
          'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-champagne-400/40',
          'focus:border-champagne-400 focus:ring-2 focus:ring-champagne-400/15',
        )}
      />
      <label
        className={cn(
          'pointer-events-none absolute z-10 transition-all duration-150 font-medium select-none',
          filled
            ? 'left-2.5 -top-2 px-1.5 text-[11px] tracking-wide bg-white dark:bg-ink-800 text-champagne-600 dark:text-champagne-300'
            : 'left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 dark:text-cream-100/35',
          'peer-focus:left-2.5 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:tracking-wide peer-focus:px-1.5',
          'peer-focus:bg-white dark:peer-focus:bg-ink-800 peer-focus:text-champagne-600 dark:peer-focus:text-champagne-300',
        )}
      >
        {label}
      </label>
    </div>
  );
}
