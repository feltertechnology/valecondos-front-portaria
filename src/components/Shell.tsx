import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, DoorOpen, UserPlus, Package, Users, Cpu,
  AlarmClock, LogOut, Sun, Moon, Settings, Phone, KeyRound, Megaphone, X,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { startRealtime, on } from '../lib/realtime';
import { cn } from '../lib/cn';
import { useActivePortariaModules } from '../lib/moduleAccess';

const nav = [
  { key: 'portaria.operacao',         to: '/',             icon: LayoutDashboard, label: 'Operacao' },
  { key: 'portaria.acessos',          to: '/acessos',      icon: DoorOpen,        label: 'Acessos' },
  { key: 'portaria.visitantes',       to: '/visitantes',   icon: UserPlus,        label: 'Visitantes' },
  { key: 'portaria.correspondencias', to: '/encomendas',   icon: Package,         label: 'Correspondencias' },
  { key: 'portaria.pessoas',          to: '/pessoas',      icon: Users,           label: 'Pessoas' },
  { key: 'portaria.dispositivos',     to: '/dispositivos', icon: Cpu,             label: 'Dispositivos' },
  { key: 'portaria.ocorrencias',      to: '/ocorrencias',  icon: AlarmClock,      label: 'Ocorrencias' },
];

const utilities = [
  { icon: AlarmClock, label: 'Alarmes' },
  { icon: Phone,      label: 'Interfone' },
  { icon: KeyRound,   label: 'Chaves' },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { user, logout, accessToken } = useAuth();
  const { mode, toggle } = useTheme();
  const nav2 = useNavigate();
  const loc = useLocation();
  const isHome = loc.pathname === '/';
  const modules = useActivePortariaModules();
  const visibleNav = nav.filter((n) => modules.isAllowed(n.key));

  const [alerts, setAlerts] = useState<{ id: string; mensagem: string }[]>([]);

  useEffect(() => {
    if (!accessToken || !user?.condominioId) return;
    const stops: (() => void)[] = [];
    (async () => {
      try {
        await startRealtime(accessToken, user.condominioId!);
        stops.push(on('alerta:critico', (data) => {
          const id = crypto.randomUUID();
          setAlerts((a) => [{ id, mensagem: data.mensagem || 'Alerta' }, ...a].slice(0, 4));
          setTimeout(() => setAlerts((a) => a.filter((x) => x.id !== id)), 8000);
        }));
      } catch { /* offline mode */ }
    })();
    return () => { stops.forEach((s) => s()); };
  }, [accessToken, user?.condominioId]);

  return (
    <div className="min-h-screen flex bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100">
      {/* Sidebar navy com sotaque gold */}
      <aside
        className={cn(
          'group/sidebar shrink-0 sticky top-0 h-screen z-30',
          'w-16 hover:w-60 transition-[width] duration-300 ease-out',
          'bg-navy-950 text-cream-100 border-r border-gold-500/10',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Logo (apenas a marca, sem texto) */}
        <div className="h-20 px-3 flex items-center justify-center shrink-0 border-b border-cyan-500/10">
          <img
            src="/logo.png"
            alt="Vale Acesso Tecnologia"
            className="h-12 w-auto object-contain transition-all duration-300 group-hover/sidebar:h-16"
            draggable={false}
          />
        </div>

        {/* NavegaÃ§Ã£o */}
        <nav className="flex-1 flex flex-col gap-0.5 p-2 mt-2 overflow-y-auto overflow-x-hidden scroll-thin">
          {visibleNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-xl text-sm transition-colors',
                  'justify-center group-hover/sidebar:justify-start',
                  'gap-0 group-hover/sidebar:gap-3',
                  'px-0 group-hover/sidebar:px-3 py-2.5',
                  isActive
                    ? 'bg-gold-500 text-navy-950 font-semibold shadow-sm shadow-gold-500/30'
                    : 'text-cream-100/60 hover:text-gold-400 hover:bg-gold-500/[0.06]'
                )
              }
            >
              <n.icon className="size-4 shrink-0" />
              <SideLabel>{n.label}</SideLabel>
            </NavLink>
          ))}

          <div className="mt-4 mb-2 px-3 text-[9px] uppercase tracking-[0.3em] text-gold-400/40 h-0 overflow-hidden group-hover/sidebar:h-auto transition-all">
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">Utilidades</span>
          </div>
          {utilities.map((u) => (
            <button
              key={u.label}
              className={cn(
                'flex items-center rounded-xl text-sm text-cream-100/50 hover:text-gold-400 hover:bg-gold-500/[0.06] transition-colors text-left',
                'justify-center group-hover/sidebar:justify-start',
                'gap-0 group-hover/sidebar:gap-3',
                'px-0 group-hover/sidebar:px-3 py-2.5'
              )}
            >
              <u.icon className="size-4 shrink-0" />
              <SideLabel>{u.label}</SideLabel>
            </button>
          ))}
        </nav>

        {/* Footer da sidebar */}
        <div className="p-2 space-y-1 border-t border-gold-500/10">
          <button
            onClick={toggle}
            className={cn(
              'w-full flex items-center rounded-xl text-sm text-cream-100/60 hover:text-gold-400 hover:bg-gold-500/[0.06] transition-colors text-left',
              'justify-center group-hover/sidebar:justify-start',
              'gap-0 group-hover/sidebar:gap-3',
              'px-0 group-hover/sidebar:px-3 py-2.5'
            )}
            title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {mode === 'dark' ? <Sun className="size-4 shrink-0" /> : <Moon className="size-4 shrink-0" />}
            <SideLabel>{mode === 'dark' ? 'Modo claro' : 'Modo escuro'}</SideLabel>
          </button>

          <button className={cn(
            'w-full flex items-center rounded-xl text-sm text-cream-100/50 hover:text-gold-400 hover:bg-gold-500/[0.06] transition-colors text-left',
            'justify-center group-hover/sidebar:justify-start',
            'gap-0 group-hover/sidebar:gap-3',
            'px-0 group-hover/sidebar:px-3 py-2.5'
          )}>
            <Settings className="size-4 shrink-0" />
            <SideLabel>ConfiguraÃ§Ãµes</SideLabel>
          </button>

          <div className="border-t border-gold-500/10 pt-2 mt-2 px-3 h-0 overflow-hidden group-hover/sidebar:h-auto transition-all">
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
              <div className="text-[9px] uppercase tracking-[0.3em] text-gold-400/40">Operador</div>
              <div className="text-xs font-medium truncate text-cream-100">{user?.nome || user?.email}</div>
            </div>
          </div>

          <button
            onClick={() => { logout(); nav2('/login'); }}
            className={cn(
              'w-full flex items-center rounded-xl text-sm text-cream-100/60 hover:text-rose-300 hover:bg-rose-500/[0.06] transition-colors text-left',
              'justify-center group-hover/sidebar:justify-start',
              'gap-0 group-hover/sidebar:gap-3',
              'px-0 group-hover/sidebar:px-3 py-2.5'
            )}
          >
            <LogOut className="size-4 shrink-0" />
            <SideLabel>Sair</SideLabel>
          </button>

          <div className="text-center text-[10px] text-cream-200/30 mt-2 h-0 overflow-hidden group-hover/sidebar:h-auto transition-all">
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">v1.0.1</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AlertsToast alerts={alerts} onDismiss={(id) => setAlerts((a) => a.filter((x) => x.id !== id))} />
        <main className={cn('flex-1 min-h-0', isHome ? 'overflow-hidden' : 'overflow-y-auto p-6')}>
          {children}
        </main>
      </div>
    </div>
  );
}

/** Texto da sidebar que colapsa pra largura 0 quando ela nÃ£o estÃ¡ hovered. */
function SideLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'overflow-hidden whitespace-nowrap transition-all duration-200',
        'max-w-0 group-hover/sidebar:max-w-[200px]',
        'opacity-0 group-hover/sidebar:opacity-100'
      )}
    >
      {children}
    </span>
  );
}

function AlertsToast({ alerts, onDismiss }: {
  alerts: { id: string; mensagem: string }[];
  onDismiss: (id: string) => void;
}) {
  if (alerts.length === 0) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/15 backdrop-blur-md border border-rose-500/30 shadow-lg animate-fadeIn"
        >
          <Megaphone className="size-4 text-rose-300 shrink-0" />
          <span className="flex-1 text-sm font-medium text-rose-200">{a.mensagem}</span>
          <button onClick={() => onDismiss(a.id)} className="text-rose-300/70 hover:text-rose-100">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

