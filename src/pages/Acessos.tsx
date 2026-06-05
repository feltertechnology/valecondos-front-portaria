import { type FormEvent, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Car,
  Loader2,
  Plus,
  QrCode,
  ShieldCheck,
  ShieldX,
  UserRoundPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/cn';

const tipoLabel = ['Facial', 'Biometria', 'QR Code', 'RFID', 'Controle', 'Senha', 'Placa', 'Interfone', 'Manual'];

export default function AcessosPage() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [qr, setQr] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const list = useQuery({
    queryKey: ['acessos', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/acessos?condominioId=${condId}&pageSize=100`)).data,
    refetchInterval: 20_000,
  });

  const validar = useMutation({
    mutationFn: async (qrCode: string) => (await api.post('/api/acessos/validar-qr', { qrCode })).data,
    onSuccess: (data) => setResultado(data),
  });

  const registrar = useMutation({
    mutationFn: async (visitanteId: string) => (await api.post(`/api/acessos?condominioId=${condId}`, {
      visitanteId, tipo: 2, direcao: 0, resultado: 0, nomeApresentado: resultado?.visitante?.nome,
    })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['acessos'] }); setQr(''); setResultado(null); },
  });

  const manual = useMutation({
    mutationFn: async (payload: any) => (await api.post(`/api/portaria/acessos/manual?condominioId=${condId}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['acessos'] });
      setManualOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Controle de acesso</h1>
          <p className="text-sm text-slate-400">Validacao por QR Code, entrada avulsa e historico</p>
        </div>
        <button className="btn btn-primary" onClick={() => setManualOpen(true)}>
          <Plus className="size-4" /> Entrada avulsa
        </button>
      </div>

      <section className="card card-pad">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><QrCode className="size-4" /> Validar QR Code</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            placeholder="Cole ou escaneie o QR Code (ex: CF-xxxx)"
            className="input md:flex-1"
            value={qr}
            onChange={(e) => setQr(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && qr) validar.mutate(qr); }}
          />
          <button onClick={() => qr && validar.mutate(qr)} disabled={!qr || validar.isPending} className="btn btn-primary">
            {validar.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Validar'}
          </button>
        </div>

        {resultado && (
          <div className={cn('mt-4 rounded-xl border p-4',
            resultado.ok ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10')}>
            <div className="mb-2 flex items-center gap-3">
              {resultado.ok ? <ShieldCheck className="size-5 text-emerald-300" /> : <ShieldX className="size-5 text-rose-300" />}
              <div className="font-semibold">{resultado.ok ? 'Autorizado' : 'Acesso negado'}</div>
            </div>
            {resultado.ok ? (
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Field k="Nome" v={resultado.visitante.nome} />
                <Field k="Documento" v={resultado.visitante.documento || '-'} />
                <Field k="Responsavel" v={resultado.visitante.responsavel || '-'} />
                <Field k="Unidade" v={resultado.visitante.unidade || '-'} />
                <div className="mt-2 flex gap-2 md:col-span-4">
                  <button className="btn btn-success" onClick={() => registrar.mutate(resultado.visitante.id)}>
                    <ArrowDownToLine className="size-4" /> Liberar entrada
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-rose-200">{resultado.motivo}</div>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="font-semibold">Historico</h2>
          <span className="text-xs text-slate-400">{list.data?.total ?? 0} eventos</span>
        </header>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-2.5 text-left">Quando</th>
                <th className="px-5 py-2.5 text-left">Pessoa</th>
                <th className="px-5 py-2.5 text-left">Tipo</th>
                <th className="px-5 py-2.5 text-left">Direcao</th>
                <th className="px-5 py-2.5 text-left">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {(list.data?.items ?? []).map((a: any) => (
                <tr key={a.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-5 py-2.5 tabular-nums text-slate-300">
                    {format(new Date(a.quando), 'dd/MM HH:mm:ss')}
                  </td>
                  <td className="px-5 py-2.5">{a.nomeApresentado || a.pessoa?.nome || a.visitante?.nome || '-'}</td>
                  <td className="px-5 py-2.5">{tipoLabel[a.tipo] ?? '-'}</td>
                  <td className="px-5 py-2.5">
                    {a.direcao === 0
                      ? <span className="inline-flex items-center gap-1 text-emerald-300"><ArrowDownToLine className="size-3.5" /> Entrada</span>
                      : <span className="inline-flex items-center gap-1 text-amber-300"><ArrowUpFromLine className="size-3.5" /> Saida</span>}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={cn('pill',
                      a.resultado === 0 ? 'pill-success' : a.resultado === 1 ? 'pill-danger' : 'pill-warn')}>
                      {['Permitido', 'Negado', 'Pendente', 'Erro'][a.resultado] ?? '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {manualOpen && (
        <EntradaAvulsa
          busy={manual.isPending}
          error={manual.error}
          onClose={() => setManualOpen(false)}
          onSubmit={(payload) => manual.mutate(payload)}
        />
      )}
    </div>
  );
}

function EntradaAvulsa({ busy, error, onClose, onSubmit }: {
  busy: boolean;
  error: any;
  onClose: () => void;
  onSubmit: (payload: any) => void;
}) {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [placa, setPlaca] = useState('');
  const [motivo, setMotivo] = useState('');
  const [direcao, setDirecao] = useState('0');
  const [resultado, setResultado] = useState('0');

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      pessoaId: null,
      visitanteId: null,
      prestadorId: null,
      veiculoId: null,
      dispositivoId: null,
      direcao: Number(direcao),
      resultado: Number(resultado),
      motivo: [documento ? `Documento: ${documento}` : null, motivo ? `Motivo: ${motivo}` : null].filter(Boolean).join(' | ') || null,
      nomeApresentado: nome,
      fotoCapturadaUrl: null,
      placaCapturada: placa || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="card card-pad w-full max-w-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-sky-500/15 text-sky-300">
            <UserRoundPlus className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Entrada avulsa</h3>
            <p className="text-sm text-slate-400">Registro manual para acesso sem QR ou cadastro previo.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input required label="Nome apresentado" value={nome} onChange={setNome} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Documento" value={documento} onChange={setDocumento} />
            <Input icon={<Car className="size-4" />} label="Placa" value={placa} onChange={setPlaca} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-slate-400">Direcao</span>
              <select value={direcao} onChange={(e) => setDirecao(e.target.value)} className="input mt-1">
                <option value="0">Entrada</option>
                <option value="1">Saida</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-slate-400">Resultado</span>
              <select value={resultado} onChange={(e) => setResultado(e.target.value)} className="input mt-1">
                <option value="0">Permitido</option>
                <option value="1">Negado</option>
                <option value="2">Pendente</option>
              </select>
            </label>
          </div>
          <Input label="Motivo" value={motivo} onChange={setMotivo} />
          {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">Erro ao registrar acesso.</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button disabled={busy || !nome} className="btn btn-primary">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function Input({ label, value, onChange, required, icon }: any) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <div className="relative mt-1">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
        <input
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('input', icon && 'pl-9')}
        />
      </div>
    </label>
  );
}
