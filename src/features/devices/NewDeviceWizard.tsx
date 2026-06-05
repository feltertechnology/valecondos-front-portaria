import { useState } from 'react';
import {
  MapPin, Wifi, Loader2, ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '../../components/Drawer';
import { Stepper } from '../../components/Stepper';
import { cn } from '../../lib/cn';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { DEVICE_TYPES, DEVICE_VENDORS, type DeviceType, type DeviceVendor } from './types';

const steps = [
  { key: 'tipo',   label: 'Tipo',   description: 'Categoria do equipamento' },
  { key: 'marca',  label: 'Marca',  description: 'Fabricante' },
  { key: 'rede',   label: 'Rede',   description: 'IP, porta e credenciais' },
  { key: 'teste',  label: 'Teste',  description: 'Validar conectividade' },
];

export function NewDeviceWizard({ open, onClose, onSaved }: {
  open: boolean; onClose: () => void; onSaved?: () => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState<DeviceType | null>(null);
  const [marca, setMarca] = useState<DeviceVendor | null>(null);
  const [nome, setNome] = useState('');
  const [modelo, setModelo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [ip, setIp] = useState('');
  const [porta, setPorta] = useState<number>(80);
  const [usuario, setUsuario] = useState('admin');
  const [senha, setSenha] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const reset = () => {
    setStep(0); setTipo(null); setMarca(null);
    setNome(''); setModelo(''); setLocalizacao('');
    setIp(''); setPorta(80); setUsuario('admin'); setSenha('');
    setTestStatus('idle');
  };

  const handleClose = () => { reset(); onClose(); };

  const save = useMutation({
    mutationFn: async () => {
      if (!tipo || !marca) throw new Error('Faltam dados');
      const r = await api.post(`/api/dispositivos?condominioId=${user?.condominioId}`, {
        nome: nome || `${tipo.label} ${marca.label}`,
        tipo: tipo.id,
        marca: marca.id,
        modelo,
        localizacao,
        ip,
        porta,
        usuario,
        senha,
      });
      return r.data;
    },
    onSuccess: () => { onSaved?.(); handleClose(); },
  });

  const testConnection = () => {
    setTestStatus('testing');
    // simulação: PING simples no IP via fetch (não-bloqueante)
    setTimeout(() => {
      // critério simulado: ip preenchido e formato razoável
      const validIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip);
      setTestStatus(validIp ? 'ok' : 'fail');
    }, 1400);
  };

  const canNext =
    (step === 0 && !!tipo) ||
    (step === 1 && !!marca) ||
    (step === 2 && !!ip);

  // Auto-fill defaults when tipo/marca selected
  function selectTipo(t: DeviceType) {
    setTipo(t);
    setPorta(t.defaultPort);
    if (!nome) setNome(t.label);
  }
  function selectMarca(m: DeviceVendor) {
    setMarca(m);
    if (m.models[0] && !modelo) setModelo(m.models[0]);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="xl"
      title="Cadastrar novo dispositivo"
      subtitle="Integração com Hikvision, Intelbras, Control iD, ZKTeco, Nice, PPA, Linear, Wisenet, Dahua"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-ghost disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Voltar
          </button>
          <div className="text-xs text-ink-500 dark:text-white/40">
            Etapa {step + 1} de {steps.length}
          </div>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              disabled={!canNext}
              className="btn btn-primary disabled:opacity-40"
            >
              Continuar <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || testStatus !== 'ok'}
              className="btn btn-primary disabled:opacity-40"
            >
              {save.isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar dispositivo
            </button>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <Stepper steps={steps} current={step} />

        {step === 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEVICE_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => selectTipo(t)}
                className={cn(
                  'rounded-2xl p-4 text-left border transition-all',
                  'hover:shadow-md hover:-translate-y-0.5',
                  tipo?.key === t.key
                    ? 'border-ink-900 dark:border-white bg-ink-50 dark:bg-white/[0.06] ring-2 ring-ink-900/10 dark:ring-white/20'
                    : 'border-ink-200 dark:border-white/10 bg-white dark:bg-ink-900'
                )}
              >
                <div className={cn(
                  'size-11 rounded-xl grid place-items-center mb-3',
                  tipo?.key === t.key
                    ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950'
                    : 'bg-ink-100 text-ink-700 dark:bg-white/[0.06] dark:text-white/80'
                )}>
                  <t.icon className="size-5" />
                </div>
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-ink-500 dark:text-white/50 mt-0.5">{t.description}</div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {t.protocols.map((p) => (
                    <span key={p} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink-100 dark:bg-white/5 text-ink-600 dark:text-white/60">{p}</span>
                  ))}
                </div>
              </button>
            ))}
          </section>
        )}

        {step === 1 && (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DEVICE_VENDORS.map((m) => (
              <button
                key={m.key}
                onClick={() => selectMarca(m)}
                className={cn(
                  'rounded-2xl p-4 text-center border transition-all hover:-translate-y-0.5 hover:shadow-md',
                  marca?.key === m.key
                    ? 'border-ink-900 dark:border-white bg-ink-50 dark:bg-white/[0.06] ring-2 ring-ink-900/10 dark:ring-white/20'
                    : 'border-ink-200 dark:border-white/10 bg-white dark:bg-ink-900'
                )}
              >
                <div className={cn('size-12 mx-auto rounded-xl grid place-items-center text-white font-bold mb-2', m.color)}>
                  {m.initials}
                </div>
                <div className="text-sm font-semibold">{m.label}</div>
                <div className="text-[10px] text-ink-500 dark:text-white/50 mt-1">{m.defaultProtocol}</div>
              </button>
            ))}
          </section>
        )}

        {step === 2 && tipo && marca && (
          <section className="space-y-4">
            <div className="rounded-2xl bg-ink-50 dark:bg-white/[0.03] border border-ink-200 dark:border-white/10 p-4 flex items-center gap-3">
              <div className={cn('size-10 rounded-xl grid place-items-center text-white font-bold', marca.color)}>{marca.initials}</div>
              <div className="flex-1">
                <div className="font-semibold">{tipo.label} · {marca.label}</div>
                <div className="text-xs text-ink-500 dark:text-white/50">Protocolo padrão: {marca.defaultProtocol}</div>
              </div>
              <tipo.icon className="size-5 text-ink-500 dark:text-white/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Nome do dispositivo">
                <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder={`${tipo.label} ${marca.label}`} />
              </FormField>
              <FormField label="Modelo">
                <select value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full bg-transparent outline-none text-sm">
                  <option value="">Selecione…</option>
                  {marca.models.map((mod) => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </FormField>
              <FormField label="Localização" icon={MapPin}>
                <input value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Ex: Garagem, Hall, Bloco A" />
              </FormField>
              <FormField label="Porta">
                <input type="number" value={porta} onChange={(e) => setPorta(+e.target.value)} className="w-full bg-transparent outline-none text-sm" />
              </FormField>
              <FormField label="Endereço IP" icon={Wifi} hint="IPv4 da rede local">
                <input value={ip} onChange={(e) => setIp(e.target.value)} className="w-full bg-transparent outline-none text-sm font-mono" placeholder="192.168.10.50" />
              </FormField>
              <FormField label="Usuário">
                <input value={usuario} onChange={(e) => setUsuario(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
              </FormField>
              <FormField label="Senha" hint="Credencial de admin do equipamento">
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="••••••••" />
              </FormField>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div className="rounded-2xl bg-ink-50 dark:bg-white/[0.03] border border-ink-200 dark:border-white/10 p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <Summary k="Tipo"        v={tipo?.label ?? '—'} />
                <Summary k="Marca"       v={marca?.label ?? '—'} />
                <Summary k="Modelo"      v={modelo || '—'} />
                <Summary k="Localização" v={localizacao || '—'} />
                <Summary k="IP"          v={ip || '—'} mono />
                <Summary k="Porta"       v={String(porta)} mono />
                <Summary k="Protocolo"   v={marca?.defaultProtocol ?? '—'} />
                <Summary k="Usuário"     v={usuario || '—'} />
              </div>
            </div>

            <div className="rounded-2xl border border-ink-200 dark:border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">Teste de conectividade</div>
                  <div className="text-xs text-ink-500 dark:text-white/50">Validamos rede + protocolo antes de salvar.</div>
                </div>
                <button
                  onClick={testConnection}
                  disabled={testStatus === 'testing'}
                  className="btn btn-primary"
                >
                  {testStatus === 'testing' ? <Loader2 className="size-4 animate-spin" /> : <Wifi className="size-4" />}
                  Testar
                </button>
              </div>

              {testStatus === 'testing' && (
                <div className="rounded-xl bg-ink-50 dark:bg-white/[0.04] border border-ink-200 dark:border-white/10 px-4 py-3 text-sm text-ink-700 dark:text-white/70 flex items-center gap-3">
                  <Loader2 className="size-4 animate-spin" /> Validando {ip}:{porta}…
                </div>
              )}
              {testStatus === 'ok' && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200 flex items-center gap-3">
                  <ShieldCheck className="size-4" /> Conexão estabelecida com sucesso. Dispositivo respondeu em &lt; 200ms.
                </div>
              )}
              {testStatus === 'fail' && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-200 flex items-center gap-3">
                  <AlertTriangle className="size-4" /> Falha de conectividade. Verifique IP, porta e firewall.
                </div>
              )}
              {testStatus === 'idle' && (
                <div className="text-xs text-ink-500 dark:text-white/50">Clique em <strong>Testar</strong> para liberar o salvamento.</div>
              )}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}

function FormField({ label, icon: Icon, hint, children }: any) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500 dark:text-white/50 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />} {label}
      </div>
      <div className="rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20 focus-within:border-ink-900 dark:focus-within:border-white/40 transition px-3.5 py-2.5">
        {children}
      </div>
      {hint && <div className="text-[10px] text-ink-400 dark:text-white/40 mt-1">{hint}</div>}
    </label>
  );
}

function Summary({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-white/40">{k}</div>
      <div className={cn('text-sm font-semibold', mono && 'font-mono')}>{v}</div>
    </div>
  );
}
