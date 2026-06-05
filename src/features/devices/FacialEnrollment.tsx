import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Camera, Search, RotateCcw, Check, X, Loader2, ScanFace, ChevronRight, ChevronLeft,
  ShieldCheck, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Modal } from '../../components/Drawer';
import { Stepper } from '../../components/Stepper';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/cn';

const ANGLES = [
  { key: 'center', label: 'Frontal',           icon: Camera },
  { key: 'left',   label: 'Leve à esquerda',   icon: ArrowLeft },
  { key: 'right',  label: 'Leve à direita',    icon: ArrowRight },
  { key: 'up',     label: 'Leve para cima',    icon: ArrowUp },
  { key: 'down',   label: 'Leve para baixo',   icon: ArrowDown },
];

const steps = [
  { key: 'pessoa',     label: 'Pessoa',     description: 'Quem será cadastrado' },
  { key: 'captura',    label: 'Captura',    description: 'Coletar 5 ângulos' },
  { key: 'qualidade',  label: 'Qualidade',  description: 'Revisão e score' },
  { key: 'sync',       label: 'Sincronizar',description: 'Enviar aos leitores' },
];

export function FacialEnrollment({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [step, setStep] = useState(0);

  const [q, setQ] = useState('');
  const [pessoa, setPessoa] = useState<any | null>(null);
  const [captures, setCaptures] = useState<Record<string, string>>({}); // angle -> dataUrl (placeholder)
  const [angle, setAngle] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState<Record<string, 'ok' | 'fail' | 'pending'>>({});

  const pessoas = useQuery({
    queryKey: ['facial-pessoas', condId, q],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/pessoas?condominioId=${condId}&q=${encodeURIComponent(q)}`)).data,
  });

  const dispositivos = useQuery({
    queryKey: ['facial-disp', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/dispositivos?condominioId=${condId}`)).data,
  });

  const leitores = useMemo(
    () => (dispositivos.data ?? []).filter((d: any) => d.tipo === 1), // LeitorFacial
    [dispositivos.data]
  );

  const reset = () => {
    setStep(0); setQ(''); setPessoa(null); setCaptures({}); setAngle(0);
    setSelectedDevices(new Set()); setSyncing(false); setSynced({});
  };
  const handleClose = () => { reset(); onClose(); };

  // Quality score simulado a partir dos ângulos capturados
  const qualityScore = Math.round((Object.keys(captures).length / ANGLES.length) * 100);
  const qualityColor = qualityScore >= 80 ? 'emerald' : qualityScore >= 60 ? 'amber' : 'rose';

  const captureNow = () => {
    const a = ANGLES[angle];
    // placeholder dataUrl (cor sólida) — no real, capturar da webcam
    setCaptures((c) => ({ ...c, [a.key]: `placeholder-${a.key}` }));
    if (angle < ANGLES.length - 1) setAngle(angle + 1);
  };

  const recapture = (k: string) => {
    setCaptures((c) => {
      const n = { ...c }; delete n[k]; return n;
    });
    const i = ANGLES.findIndex((a) => a.key === k);
    if (i >= 0) setAngle(i);
  };

  const toggleDevice = (id: string) => {
    setSelectedDevices((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const startSync = async () => {
    setSyncing(true);
    const ids = Array.from(selectedDevices);
    const next: Record<string, 'ok' | 'fail' | 'pending'> = {};
    ids.forEach((id) => (next[id] = 'pending'));
    setSynced(next);
    for (const id of ids) {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      next[id] = Math.random() > 0.1 ? 'ok' : 'fail';
      setSynced({ ...next });
    }
    setSyncing(false);
  };

  const canNext =
    (step === 0 && !!pessoa) ||
    (step === 1 && Object.keys(captures).length === ANGLES.length) ||
    (step === 2 && qualityScore >= 60) ||
    (step === 3 && selectedDevices.size > 0 && !syncing);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="xl"
      title="Vincular biometria facial"
      subtitle="Captura e sincronização com leitores faciais do condomínio"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-ghost disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Voltar
          </button>
          <div className="text-xs text-ink-500 dark:text-white/40">Etapa {step + 1} de {steps.length}</div>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="btn btn-primary disabled:opacity-40"
            >
              Continuar <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={Object.keys(synced).length > 0 ? handleClose : startSync}
              disabled={!canNext && Object.keys(synced).length === 0}
              className="btn btn-primary disabled:opacity-40"
            >
              {syncing && <Loader2 className="size-4 animate-spin" />}
              {Object.keys(synced).length > 0 && !syncing ? 'Concluir' : 'Sincronizar agora'}
            </button>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <Stepper steps={steps} current={step} />

        {step === 0 && (
          <section className="space-y-3">
            <div className="rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 px-3.5 py-2.5 flex items-center gap-2">
              <Search className="size-4 text-ink-500 dark:text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar morador por nome, CPF ou e-mail…"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {(pessoas.data ?? []).slice(0, 30).map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setPessoa(p)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition',
                    pessoa?.id === p.id
                      ? 'border-ink-900 dark:border-white bg-ink-50 dark:bg-white/[0.06] ring-2 ring-ink-900/10 dark:ring-white/20'
                      : 'border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20'
                  )}
                >
                  <div className="size-10 rounded-full bg-ink-100 dark:bg-ink-800 grid place-items-center font-semibold text-sm">
                    {(p.nome || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.nome}</div>
                    <div className="text-[11px] text-ink-500 dark:text-white/50">
                      {p.unidade ? `${p.unidade.bloco} ${p.unidade.numero}` : 'Sem unidade'} · {['Adm','Síndico','Subs','Cons','Porteiro','Vig','Func','Morador','Inq','Prop'][p.role] ?? '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && pessoa && (
          <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
            <CameraPreview angle={ANGLES[angle]} pessoa={pessoa} onCapture={captureNow} />
            <aside className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500 dark:text-white/50">Ângulos a capturar</div>
              {ANGLES.map((a, i) => {
                const done = !!captures[a.key];
                const active = i === angle;
                return (
                  <div
                    key={a.key}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl border',
                      active
                        ? 'border-ink-900 dark:border-white bg-ink-50 dark:bg-white/[0.06]'
                        : 'border-ink-200 dark:border-white/10'
                    )}
                  >
                    <div className={cn(
                      'size-8 rounded-lg grid place-items-center',
                      done ? 'bg-emerald-500 text-white' : 'bg-ink-100 dark:bg-white/[0.05] text-ink-500 dark:text-white/50'
                    )}>
                      {done ? <Check className="size-4" /> : <a.icon className="size-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{a.label}</div>
                      <div className="text-[10px] text-ink-500 dark:text-white/40">{done ? 'capturado' : active ? 'aguardando…' : 'pendente'}</div>
                    </div>
                    {done && (
                      <button onClick={() => recapture(a.key)} className="text-ink-500 dark:text-white/50 hover:text-rose-500 transition" title="Recapturar">
                        <RotateCcw className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </aside>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-ink-50 to-white dark:from-white/[0.05] dark:to-ink-900 border border-ink-200 dark:border-white/10 p-5">
              <div className="flex items-center gap-5">
                <div className="size-20 rounded-2xl bg-ink-900 dark:bg-white grid place-items-center text-white dark:text-ink-950">
                  <ScanFace className="size-10" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink-500 dark:text-white/40 font-semibold">Score de qualidade</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={cn(
                      'font-display text-5xl leading-none',
                      qualityColor === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                      qualityColor === 'amber'   && 'text-amber-600 dark:text-amber-400',
                      qualityColor === 'rose'    && 'text-rose-600 dark:text-rose-400'
                    )}>
                      {qualityScore}
                    </span>
                    <span className="text-ink-500 dark:text-white/50 text-sm">/ 100</span>
                  </div>
                  <div className="text-xs text-ink-500 dark:text-white/50 mt-2">
                    {qualityScore >= 80 && 'Excelente — pronto para sincronizar com qualquer leitor.'}
                    {qualityScore >= 60 && qualityScore < 80 && 'Bom — recomenda-se recapturar 1 ângulo para melhor acurácia.'}
                    {qualityScore < 60 && 'Insuficiente — capture mais ângulos antes de prosseguir.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {ANGLES.map((a) => {
                const done = !!captures[a.key];
                return (
                  <div key={a.key} className="text-center">
                    <div className={cn(
                      'aspect-square rounded-2xl border-2 grid place-items-center mb-2',
                      done
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-ink-50 dark:bg-white/[0.03] border-dashed border-ink-200 dark:border-white/10 text-ink-300 dark:text-white/20'
                    )}>
                      {done ? <Check className="size-8" /> : <a.icon className="size-8" />}
                    </div>
                    <div className="text-[10px] text-ink-500 dark:text-white/50">{a.label}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/[0.08] border border-violet-200 dark:border-violet-500/20 p-4 flex items-center gap-3">
              <ScanFace className="size-5 text-violet-600 dark:text-violet-300" />
              <div className="text-sm text-violet-700 dark:text-violet-200">
                Selecione os leitores faciais que receberão o template biométrico de <strong>{pessoa?.nome}</strong>.
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {leitores.length === 0 && (
                <div className="text-sm text-ink-500 dark:text-white/50 text-center py-10">
                  Nenhum leitor facial cadastrado. Cadastre um dispositivo do tipo "Leitor Facial" primeiro.
                </div>
              )}
              {leitores.map((d: any) => {
                const checked = selectedDevices.has(d.id);
                const syncState = synced[d.id];
                return (
                  <label
                    key={d.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition',
                      checked
                        ? 'border-ink-900 dark:border-white bg-ink-50 dark:bg-white/[0.06]'
                        : 'border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDevice(d.id)}
                      className="size-4 accent-ink-900 dark:accent-white"
                      disabled={syncing}
                    />
                    <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 grid place-items-center">
                      <ScanFace className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{d.nome}</div>
                      <div className="text-[11px] text-ink-500 dark:text-white/50">
                        {d.localizacao || '—'} · {d.ip}
                      </div>
                    </div>
                    {syncState === 'pending' && <Loader2 className="size-4 animate-spin text-ink-500 dark:text-white/50" />}
                    {syncState === 'ok' && <span className="pill-success"><Check className="size-3 mr-1" /> Sincronizado</span>}
                    {syncState === 'fail' && <span className="pill-danger"><X className="size-3 mr-1" /> Falhou</span>}
                    {!syncState && d.status === 0 && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">online</span>}
                    {!syncState && d.status !== 0 && <span className="text-[10px] text-rose-600 dark:text-rose-400">offline</span>}
                  </label>
                );
              })}
            </div>

            {Object.keys(synced).length > 0 && !syncing && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200 flex items-center gap-3">
                <ShieldCheck className="size-4" />
                Sincronização concluída em {Object.keys(synced).length} leitor(es).
              </div>
            )}
          </section>
        )}
      </div>
    </Modal>
  );
}

function CameraPreview({ angle, pessoa, onCapture }: any) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const start = () => {
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          clearInterval(timerRef.current);
          onCapture();
          return null;
        }
        return c - 1;
      });
    }, 700);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-ink-950 ring-1 ring-ink-200 dark:ring-white/10">
        {/* Camera placeholder com grid overlay e máscara facial */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Máscara oval */}
        <svg className="absolute inset-0 m-auto" width="48%" height="80%" viewBox="0 0 200 280" fill="none">
          <ellipse cx="100" cy="140" rx="90" ry="130"
                   stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="8 8" />
          <ellipse cx="100" cy="140" rx="60" ry="90" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
        </svg>
        {countdown !== null && (
          <div className="absolute inset-0 grid place-items-center text-white font-display text-9xl animate-pulse">
            {countdown}
          </div>
        )}
        {countdown === null && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/80 text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 backdrop-blur border border-rose-500/40">
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
              REC · {pessoa?.nome}
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15">
              <angle.icon className="size-3.5" /> {angle.label}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={start}
          disabled={countdown !== null}
          className="btn btn-primary disabled:opacity-40"
        >
          <Camera className="size-4" /> Capturar — {angle.label}
        </button>
      </div>
    </div>
  );
}
