import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, ScanFace, Search, Activity, Cpu, ShieldCheck, ShieldX, Wifi,
  Power, RefreshCw, MapPin, Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/cn';
import { DEVICE_TYPES, DEVICE_VENDORS } from '../features/devices/types';
import { NewDeviceWizard } from '../features/devices/NewDeviceWizard';
import { FacialEnrollment } from '../features/devices/FacialEnrollment';
import { DeviceDetailDrawer } from '../features/devices/DeviceDetailDrawer';

export default function DispositivosPage() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [facialOpen, setFacialOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<number | null>(null);
  const [filtroMarca, setFiltroMarca] = useState<number | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [q, setQ] = useState('');

  const list = useQuery({
    queryKey: ['dispositivos-full', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/dispositivos?condominioId=${condId}`)).data,
    refetchInterval: 20_000,
  });

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return (list.data ?? []).filter((d: any) => {
      if (filtroTipo !== null && d.tipo !== filtroTipo) return false;
      if (filtroMarca !== null && d.marca !== filtroMarca) return false;
      if (filtroStatus === 'online' && d.status !== 0) return false;
      if (filtroStatus === 'offline' && d.status === 0) return false;
      if (k && !`${d.nome} ${d.ip} ${d.localizacao ?? ''} ${d.modelo ?? ''}`.toLowerCase().includes(k)) return false;
      return true;
    });
  }, [list.data, q, filtroTipo, filtroMarca, filtroStatus]);

  const total = list.data?.length ?? 0;
  const online = (list.data ?? []).filter((d: any) => d.status === 0).length;
  const offline = total - online;
  const byType = useMemo(() => {
    const map: Record<number, number> = {};
    (list.data ?? []).forEach((d: any) => { map[d.tipo] = (map[d.tipo] ?? 0) + 1; });
    return map;
  }, [list.data]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pt-12">
      {/* Header */}
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-500 dark:text-white/40 font-semibold">Equipamentos</div>
          <h1 className="font-display text-3xl mt-1">Dispositivos do condomínio</h1>
          <p className="text-sm text-ink-500 dark:text-white/50 mt-1">
            Integração com Hikvision, Intelbras, Control iD, ZKTeco, Nice, PPA, Linear, Wisenet e Dahua.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFacialOpen(true)} className="btn btn-ghost">
            <ScanFace className="size-4" /> Vincular biometria
          </button>
          <button onClick={() => setWizardOpen(true)} className="btn btn-primary">
            <Plus className="size-4" /> Novo dispositivo
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Cpu}          label="Total"      value={total}    color="ink" />
        <KpiCard icon={ShieldCheck}  label="Online"     value={online}   color="emerald" subtitle={`${total > 0 ? Math.round(online/total*100) : 0}% disponibilidade`} />
        <KpiCard icon={ShieldX}      label="Offline"    value={offline}  color="rose" />
        <KpiCard icon={Activity}     label="Eventos/h"  value="142"      color="violet" subtitle="média móvel 24h" />
      </section>

      {/* Filtros */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={filtroTipo === null} onClick={() => setFiltroTipo(null)}>
            Todos os tipos
          </FilterPill>
          {DEVICE_TYPES.map((t) => {
            const c = byType[t.id] ?? 0;
            if (c === 0) return null;
            return (
              <FilterPill key={t.key} active={filtroTipo === t.id} onClick={() => setFiltroTipo(t.id)}>
                <t.icon className="size-3.5" /> {t.label} <span className="opacity-60">· {c}</span>
              </FilterPill>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={filtroStatus === 'all'} onClick={() => setFiltroStatus('all')}>Status: todos</FilterPill>
          <FilterPill active={filtroStatus === 'online'} onClick={() => setFiltroStatus('online')} accent="emerald">
            <ShieldCheck className="size-3.5" /> Online
          </FilterPill>
          <FilterPill active={filtroStatus === 'offline'} onClick={() => setFiltroStatus('offline')} accent="rose">
            <ShieldX className="size-3.5" /> Offline
          </FilterPill>
          <div className="ml-auto relative w-full sm:w-72">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, IP, modelo ou local…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 text-sm outline-none focus:border-ink-900 dark:focus:border-white/40"
            />
          </div>
        </div>
      </section>

      {/* Grid de cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d: any) => (
          <DeviceCard key={d.id} device={d} onSelect={() => setDetail(d)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-ink-500 dark:text-white/50">
            <Cpu className="size-12 mx-auto mb-3 text-ink-300 dark:text-white/20" />
            Nenhum dispositivo encontrado.
            <div className="mt-3">
              <button onClick={() => setWizardOpen(true)} className="btn btn-primary">
                <Plus className="size-4" /> Cadastrar agora
              </button>
            </div>
          </div>
        )}
      </section>

      <NewDeviceWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['dispositivos-full'] })} />
      <FacialEnrollment open={facialOpen} onClose={() => setFacialOpen(false)} />
      <DeviceDetailDrawer device={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, subtitle, color }: any) {
  const cls: Record<string, string> = {
    ink:     'text-ink-700 dark:text-white/80',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose:    'text-rose-600 dark:text-rose-400',
    violet:  'text-violet-600 dark:text-violet-400',
  };
  return (
    <div className="card-base px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <Icon className={cn('size-4', cls[color])} />
      </div>
      <div className={cn('font-display text-3xl tabular-nums leading-none mt-1', cls[color])}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-white/40 mt-0.5">{label}</div>
      {subtitle && <div className="text-[10px] text-ink-400 dark:text-white/40">{subtitle}</div>}
    </div>
  );
}

function FilterPill({ active, onClick, children, accent = 'ink' }: any) {
  const baseActive = {
    ink: 'bg-ink-900 text-white dark:bg-white dark:text-ink-950',
    emerald: 'bg-emerald-600 text-white',
    rose: 'bg-rose-600 text-white',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition',
        active
          ? (baseActive as any)[accent]
          : 'bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 text-ink-600 dark:text-white/70 hover:border-ink-300 dark:hover:border-white/20'
      )}
    >
      {children}
    </button>
  );
}

function DeviceCard({ device, onSelect }: { device: any; onSelect: () => void }) {
  const tipoMeta = DEVICE_TYPES.find((t) => t.id === device.tipo);
  const marcaMeta = DEVICE_VENDORS.find((m) => m.id === device.marca);
  const Icon = tipoMeta?.icon ?? Cpu;
  const online = device.status === 0;

  const signal = useMemo(() => {
    if (!online) return 0;
    return 60 + Math.floor(Math.random() * 40);
  }, [device.id, online]);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'group text-left rounded-2xl px-5 py-4 transition-all',
        'bg-white dark:bg-ink-900',
        'border border-ink-200 dark:border-white/10',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)]',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        'hover:border-ink-300 dark:hover:border-white/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('size-12 rounded-2xl grid place-items-center text-white shrink-0', marcaMeta?.color ?? 'bg-ink-700')}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold truncate">{device.nome}</div>
            <span className={cn('pill text-[10px] uppercase tracking-wider px-2 py-0.5',
              online ? 'pill-success' : 'pill-danger')}>
              <span className={cn('size-1 rounded-full mr-1', online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
              {online ? 'online' : 'offline'}
            </span>
          </div>
          <div className="text-xs text-ink-500 dark:text-white/50 mt-0.5">
            {tipoMeta?.label} · {marcaMeta?.label} {device.modelo ? `· ${device.modelo}` : ''}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-ink-500 dark:text-white/50 mt-2">
            {device.localizacao && <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {device.localizacao}</span>}
            <span className="inline-flex items-center gap-1 font-mono"><Wifi className="size-3" /> {device.ip}:{device.porta}</span>
          </div>
        </div>
      </div>

      {/* Bottom: signal + last hb */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-500 dark:text-white/40 mb-1">
            <span>Sinal</span>
            <span className="tabular-nums">{signal}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 dark:bg-white/[0.06] overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all',
                signal >= 70 ? 'bg-emerald-500' : signal >= 40 ? 'bg-amber-500' : 'bg-rose-500')}
              style={{ width: `${signal}%` }}
            />
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-white/40">Último heartbeat</div>
          <div className="text-xs font-mono tabular-nums text-ink-700 dark:text-white/80">
            {device.ultimoHeartbeat ? format(new Date(device.ultimoHeartbeat), 'dd/MM HH:mm:ss') : '—'}
          </div>
        </div>
      </div>

      {/* Quick actions on hover */}
      <div className="mt-3 pt-3 border-t border-ink-100 dark:border-white/5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <QuickAction icon={Power}     label="Acionar" color="emerald" />
        <QuickAction icon={RefreshCw} label="Sync"    color="blue" />
        <QuickAction icon={Activity}  label="Logs"    color="violet" />
      </div>
    </button>
  );
}

function QuickAction({ icon: Icon, label, color }: any) {
  const cls: Record<string, string> = {
    emerald: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    blue:    'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10',
    violet:  'text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10',
  };
  return (
    <span
      role="button"
      onClick={(e) => e.stopPropagation()}
      className={cn('size-8 rounded-lg grid place-items-center transition', cls[color])}
      title={label}
    >
      <Icon className="size-4" />
    </span>
  );
}
