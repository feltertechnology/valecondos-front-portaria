import { cn } from '../lib/cn';

interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function AludraLogo({ size = 48, withWordmark = false, className }: Props) {
  return (
    <img
      src="/logo.png"
      alt="Vale Acesso Tecnologia"
      className={cn('block shrink-0 object-contain', className)}
      style={{ width: withWordmark ? size * 2.9 : size, height: withWordmark ? size * 1.35 : size }}
      draggable={false}
    />
  );
}

export function AludraMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('grid place-items-center rounded-2xl bg-navy-950 ring-1 ring-gold-500/25', className)}
      style={{ width: size, height: size }}
    >
      <AludraLogo size={size * 0.82} />
    </div>
  );
}
