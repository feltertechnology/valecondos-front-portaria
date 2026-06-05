import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Power, RotateCw, Activity, Wifi, MapPin, Server, ShieldAlert, ShieldCheck,
  PlayCircle, Clock, Cpu, Camera as CameraIcon, Edit, Loader2,
} from 'lucide-react';
import { Drawer } from '../../components/Drawer';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/cn';
import { format } from 'date-fns';
import { DEVICE_TYPES, DEVICE_VENDORS } from './types';

const TABS = ['Visão geral', 'Rede', 'Eventos', 'Vínculos'] as const;
type Tab = typeof TABS[number];

export function DeviceDetailDrawer({ device, onClose }: { device: any | null; onClose: () => void }) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('Visão geral');

  const eventos = useQuery({
    queryKey: ['acessos-by-dev', device?.id],
    enabled: !!device?.id,
    queryFn: async () => (await api.get(`/api/acessos?condominioId=${condId}&pageSize=15`)).data,
  });

  const acionar = useMutation({
    mutationFn: (comando: string) => api.post(`/api/dispositivos/${device.id}/acionar`, { comando }),
  });

  if (!device) return null;

  const tipoMeta = DEVICE_TYPES.find((t) => t.id === device.tipo);
  const marcaMeta = DEVICE_VENDORS.find((m) => m.id === device.marca);
  const online = device.status === 0;
  const Icon = tipoMeta?.icon ?? Cpu;

  return (
    <Drawer
      open={!!device}
      onClose={onClose}
      width="xl"
      title={
        <div className="flex items-center gap-3">
          <div className={cn('size-10 rounded-xl grid place-items-center text-white', marcaMeta?.color ?? 'bg-ink-700')}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-xl leading-tight truncate">{device.nome}</div>
            <div className="text-xs text-ink-500 dark:text-white/50">
              {tipoMeta?.label} · {marcaMeta?.label} {device.modelo ? `· ${device.modelo}` : ''}
            </div>
          </div>
        </div>
      }
    >
      <div className="px-6 py-4 border-b border-ink-200 dark:border-white/10 flex items-center gap-2">
        <span className={cn('pill flex items-center gap-1.5', online ? 'pill-success' : 'pill-danger')}>
          <span className={cn('size-1.5 rounded-full', online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
          {online ? 'Online' : 'Offline'}
        </span>
        {device.ultimoHeartbeat && (
          <span className="text-xs text-ink-500 dark:text-white/50">
            <Clock className="size-3 inline mr-1" />
            HB {format(new Date(device.ultimoHeartbeat), 'dd/MM HH:mm:ss')}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={() => acionar.mutate('open')} className="btn btn-success">
            <Power className="size-4" /> Acionar
          </button>
          <button onClick={() => acionar.mutate('reboot')} className="btn btn-ghost">
            <RotateCw className="size-4" /> Reiniciar
          </button>
          <button className="btn btn-ghost"><Edit className="size-4" /> Editar</button>
        </div>
      </div>

      <nav className="px-6 border-b border-ink-200 dark:border-white/10 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition',
              tab === t
                ? 'border-ink-900 dark:border-white text-ink-900 dark:text-white'
                : 'border-transparent text-ink-500 dark:text-white/50 hover:text-ink-700 dark:hover:text-white/80'
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-5">
        {tab === 'Visão geral' && (
          <>
            {device.tipo === 2 ? (
              // Câmera: preview
              <div className="aspect-video rounded-2xl overflow-hidden bg-ink-950 ring-1 ring-ink-200 dark:ring-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900" />
                <CameraIcon className="size-16 text-white/20 absolute inset-0 m-auto" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500/30 backdrop-blur border border-rose-500/40 text-white text-xs flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" /> AO VIVO
                </div>
                <button className="absolute bottom-3 right-3 size-12 grid place-items-center rounded-full bg-white/90 hover:bg-white text-ink-950 transition">
                  <PlayCircle className="size-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Stat icon={Activity} label="Latência" value="84 ms"  />
                <Stat icon={ShieldCheck} label="Uptime" value="99.7%" />
                <Stat icon={Server} label="Firmware" value={device.modelo ? `${device.modelo} v2.1.4` : 'v2.1.4'} />
              </div>
            )}

            <div className="rounded-2xl border border-ink-200 dark:border-white/10 p-5">
              <h3 className="font-semibold mb-3">Detalhes</h3>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                <Detail k="Tipo"        v={tipoMeta?.label ?? '—'} />
                <Detail k="Marca"       v={marcaMeta?.label ?? '—'} />
                <Detail k="Modelo"      v={device.modelo || '—'} />
                <Detail k="IP"          v={`${device.ip}:${device.porta}`} mono />
                <Detail k="Protocolo"   v={marcaMeta?.defaultProtocol ?? '—'} />
                <Detail k="Localização" v={device.localizacao || '—'} />
              </dl>
            </div>
          </>
        )}

        {tab === 'Rede' && (
          <div className="rounded-2xl border border-ink-200 dark:border-white/10 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail k="Endereço IP" v={device.ip} mono />
              <Detail k="Porta"       v={String(device.porta)} mono />
              <Detail k="Usuário"     v={device.usuario || '—'} />
              <Detail k="Protocolo"   v={marcaMeta?.defaultProtocol ?? '—'} />
            </div>
            <div className="border-t border-ink-200 dark:border-white/10 pt-4 flex gap-2">
              <button className="btn btn-primary"><Wifi className="size-4" /> Testar ping</button>
              <button className="btn btn-ghost"><MapPin className="size-4" /> Traçar rota</button>
            </div>
          </div>
        )}

        {tab === 'Eventos' && (
          <div className="rounded-2xl border border-ink-200 dark:border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-white/[0.03] text-[11px] uppercase tracking-wider text-ink-500 dark:text-white/50">
                <tr>
                  <th className="text-left px-5 py-2">Quando</th>
                  <th className="text-left px-5 py-2">Nome</th>
                  <th className="text-left px-5 py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {(eventos.data?.items ?? []).slice(0, 12).map((e: any) => (
                  <tr key={e.id} className="border-t border-ink-100 dark:border-white/5">
                    <td className="px-5 py-2 tabular-nums">{format(new Date(e.quando), 'dd/MM HH:mm:ss')}</td>
                    <td className="px-5 py-2">{e.nomeApresentado || '—'}</td>
                    <td className="px-5 py-2">
                      <span className={cn('pill', e.resultado === 0 ? 'pill-success' : 'pill-danger')}>
                        {e.resultado === 0 ? 'permitido' : 'negado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Vínculos' && (
          <div className="rounded-2xl border border-ink-200 dark:border-white/10 p-5">
            <div className="flex items-center gap-2 text-ink-500 dark:text-white/50 text-sm">
              <ShieldAlert className="size-4" />
              Pessoas com credenciais enroladas neste dispositivo aparecem aqui.
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function Detail({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-white/40">{k}</dt>
      <dd className={cn('font-medium', mono && 'font-mono')}>{v}</dd>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-ink-200 dark:border-white/10 p-4">
      <Icon className="size-4 text-ink-500 dark:text-white/50 mb-2" />
      <div className="font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-white/40">{label}</div>
    </div>
  );
}
