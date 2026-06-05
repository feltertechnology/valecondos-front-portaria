import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ScanFace, Fingerprint, CreditCard, KeyRound, Car, Radar, Calendar, Camera,
  Plus, ShieldCheck, Trash2,
} from 'lucide-react';
import { Modal } from '../../components/Drawer';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/cn';
import { CREDENTIAL_TYPES } from '../devices/types';

export function CadastroAcessoModal({ pessoa, open, onClose, onOpenFacial }: {
  pessoa: any | null; open: boolean; onClose: () => void; onOpenFacial?: () => void;
}) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [validade, setValidade] = useState<string>(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [tipoSel, setTipoSel] = useState<number>(0);

  const dispositivos = useQuery({
    queryKey: ['ca-disp', condId],
    enabled: !!condId && open,
    queryFn: async () => (await api.get(`/api/dispositivos?condominioId=${condId}`)).data,
  });

  if (!pessoa) return null;

  const tipo = CREDENTIAL_TYPES.find((c) => c.id === tipoSel)!;
  const compatibleTypes: Record<number, number[]> = {
    1: [0],   // facial → leitor facial
    2: [4, 5],// rfid → cancela/portão (controladora)
    4: [4, 5],// controle → cancela/portão
    6: [4, 2],// placa → cancela/câmera LPR
  };
  const allowedDeviceTypes = compatibleTypes[tipoSel] ?? [0, 1, 2, 3, 4, 5];
  const leitores = (dispositivos.data ?? []).filter((d: any) => allowedDeviceTypes.includes(d.tipo));

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="xl"
      title={
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 grid place-items-center">
            <ShieldCheck className="size-4" />
          </div>
          <span>Cadastro de Acesso</span>
          <span className="text-ink-400 dark:text-white/30 font-normal">— / {pessoa.nome}</span>
        </div>
      }
      subtitle={pessoa.unidade ? `${pessoa.unidade.bloco} ${pessoa.unidade.numero} · ${['Adm','Síndico','Subs','Cons','Porteiro','Vig','Func','Morador','Inq','Prop'][pessoa.role] ?? '—'}` : ''}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-500 dark:text-white/40">Credenciais ficam ativas em todos os leitores selecionados.</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button className="btn btn-primary"><ShieldCheck className="size-4" /> Salvar credencial</button>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Validade */}
        <section>
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500 dark:text-white/50 mb-1.5">
              Data de validade
            </div>
            <div className="rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20 focus-within:border-violet-500 dark:focus-within:border-violet-400 transition px-3.5 py-2.5 flex items-center gap-2 max-w-md">
              <Calendar className="size-4 text-ink-500 dark:text-white/40" />
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            <div className="text-[10px] text-ink-400 dark:text-white/40 mt-1">
              Exame médico, contrato de locação, validade de visitante etc.
            </div>
          </label>
        </section>

        {/* Tipos de credencial */}
        <section>
          <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500 dark:text-white/50 mb-2">
            Tipo de credencial
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {CREDENTIAL_TYPES.map((c) => (
              <button
                key={c.key}
                onClick={() => setTipoSel(c.id)}
                className={cn(
                  'rounded-xl px-3 py-3 text-left border transition',
                  tipoSel === c.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/[0.08] dark:border-violet-400'
                    : 'border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20'
                )}
              >
                <c.icon className={cn('size-5 mb-1.5', tipoSel === c.id ? 'text-violet-600 dark:text-violet-300' : 'text-ink-500 dark:text-white/50')} />
                <div className="text-xs font-semibold">{c.label}</div>
              </button>
            ))}
          </div>
          <div className="text-xs text-ink-500 dark:text-white/50 mt-2">{tipo.description}</div>
        </section>

        {/* Captura/Input por tipo */}
        <section className="rounded-2xl border border-ink-200 dark:border-white/10 p-5">
          {tipo.key === 'facial' && (
            <FacialBox onCapture={() => onOpenFacial?.()} />
          )}
          {tipo.key === 'biometria' && (
            <FingerprintBox />
          )}
          {(tipo.key === 'rfid' || tipo.key === 'controle') && (
            <CardInputBox icon={tipo.icon} label={tipo.label} placeholder="Aproxime a tag/controle do leitor ou digite o ID" />
          )}
          {tipo.key === 'senha' && (
            <PinBox />
          )}
          {tipo.key === 'qrcode' && (
            <div className="text-center py-8">
              <div className="size-20 mx-auto rounded-2xl bg-ink-100 dark:bg-white/[0.06] text-ink-500 dark:text-white/50 grid place-items-center mb-3">
                <KeyRound className="size-8" />
              </div>
              <div className="font-semibold">QR Code rotativo</div>
              <div className="text-sm text-ink-500 dark:text-white/50 mt-1">
                Gerado automaticamente no app do morador, com refresh a cada 60s.
              </div>
            </div>
          )}
          {tipo.key === 'placa' && (
            <CardInputBox icon={Car} label="Placa" placeholder="ABC1D23 ou ABC1234" />
          )}
        </section>

        {/* Equipamentos */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500 dark:text-white/50">
              Equipamentos vinculados
            </div>
            <span className="text-xs text-ink-500 dark:text-white/50">{leitores.length} compatíveis</span>
          </div>
          <div className="rounded-2xl border-2 border-violet-500 bg-violet-50/50 dark:bg-violet-500/[0.06] dark:border-violet-400/50 p-4 mb-3 text-center text-sm text-violet-700 dark:text-violet-200 font-semibold">
            <Plus className="size-4 inline mr-1" /> Equipamentos
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {leitores.length === 0 && (
              <div className="text-sm text-ink-500 dark:text-white/50 text-center py-6">
                Nenhum equipamento compatível cadastrado.
              </div>
            )}
            {leitores.map((d: any) => (
              <label key={d.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20 cursor-pointer transition">
                <input type="checkbox" className="size-4 accent-violet-600" />
                <div className="size-9 rounded-xl bg-ink-100 dark:bg-white/[0.06] text-ink-700 dark:text-white/70 grid place-items-center">
                  {tipo.id === 1 ? <Fingerprint className="size-4" /> : tipo.id === 0 ? <ScanFace className="size-4" /> : <Radar className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.nome}</div>
                  <div className="text-[11px] text-ink-500 dark:text-white/50">{d.localizacao || '—'} · {d.ip}</div>
                </div>
                <span className={cn('pill', d.status === 0 ? 'pill-success' : 'pill-danger')}>
                  {d.status === 0 ? 'online' : 'offline'}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function FacialBox({ onCapture }: { onCapture: () => void }) {
  return (
    <div className="text-center">
      <div className="size-20 mx-auto rounded-2xl bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 grid place-items-center mb-3">
        <ScanFace className="size-10" />
      </div>
      <div className="font-semibold">Captura biométrica facial</div>
      <div className="text-sm text-ink-500 dark:text-white/50 mt-1 mb-4">
        Coleta 5 ângulos e gera template biométrico padrão do fabricante.
      </div>
      <button onClick={onCapture} className="btn btn-primary">
        <Camera className="size-4" /> Iniciar captura
      </button>
    </div>
  );
}

function FingerprintBox() {
  return (
    <div className="text-center">
      <div className="size-20 mx-auto rounded-2xl bg-ink-100 dark:bg-white/[0.06] text-ink-700 dark:text-white/70 grid place-items-center mb-3">
        <Fingerprint className="size-10" />
      </div>
      <div className="font-semibold">Coleta de impressão digital</div>
      <div className="text-sm text-ink-500 dark:text-white/50 mt-1 mb-4">
        Posicione o dedo no leitor 3 vezes seguidas para registrar o minutiae.
      </div>
      <button className="btn btn-primary">
        <Fingerprint className="size-4" /> Iniciar coleta
      </button>
    </div>
  );
}

function CardInputBox({ icon: Icon, label, placeholder }: any) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="size-12 rounded-xl bg-ink-100 dark:bg-white/[0.06] text-ink-700 dark:text-white/70 grid place-items-center">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-xs text-ink-500 dark:text-white/50">Pode ser preenchido manualmente ou capturado pelo leitor.</div>
        </div>
      </div>
      <div className="rounded-xl bg-ink-50 dark:bg-white/[0.03] border border-ink-200 dark:border-white/10 px-4 py-3">
        <input className="w-full bg-transparent outline-none text-sm font-mono" placeholder={placeholder} />
      </div>
    </div>
  );
}

function PinBox() {
  return (
    <div className="text-center">
      <div className="font-semibold mb-1">Senha numérica (PIN)</div>
      <div className="text-sm text-ink-500 dark:text-white/50 mb-4">4 a 8 dígitos. Será cifrado antes de envio aos equipamentos.</div>
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            type="password"
            maxLength={1}
            className="size-12 rounded-xl border-2 border-ink-200 dark:border-white/10 bg-white dark:bg-ink-800 text-center text-xl font-bold outline-none focus:border-violet-500"
          />
        ))}
      </div>
    </div>
  );
}
