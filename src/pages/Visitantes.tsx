import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Plus, Check, X, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/cn';

const statusPill = ['pill-warn', 'pill-success', 'pill-danger', 'pill-info', 'pill-mute', 'pill-mute'];
const statusTxt = ['Aguardando', 'Autorizado', 'Negado', 'Entrou', 'Saiu', 'Expirado'];

export default function VisitantesPage() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['visitantes', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/visitantes?condominioId=${condId}`)).data,
  });

  const aprovar = useMutation({
    mutationFn: (id: string) => api.post(`/api/visitantes/${id}/aprovar`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitantes'] }),
  });
  const negar = useMutation({
    mutationFn: (id: string) => api.post(`/api/visitantes/${id}/negar`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitantes'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitantes</h1>
          <p className="text-sm text-slate-400">Convites e autorizações</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo convite
        </button>
      </div>

      <section className="card">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-2.5">Visitante</th>
              <th className="text-left px-5 py-2.5">Documento</th>
              <th className="text-left px-5 py-2.5">Janela autorizada</th>
              <th className="text-left px-5 py-2.5">QR</th>
              <th className="text-left px-5 py-2.5">Status</th>
              <th className="text-left px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((v: any) => (
              <tr key={v.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-5 py-2.5">
                  <div className="font-medium">{v.nome}</div>
                  <div className="text-[11px] text-slate-500">
                    {v.pessoaResponsavel?.nome ? `Resp: ${v.pessoaResponsavel.nome}` : ''}
                    {v.unidade ? ` · ${v.unidade.bloco} ${v.unidade.numero}` : ''}
                  </div>
                </td>
                <td className="px-5 py-2.5">{v.documento || '—'}</td>
                <td className="px-5 py-2.5 tabular-nums">
                  {format(new Date(v.autorizadoDe), 'dd/MM HH:mm')} → {format(new Date(v.autorizadoAte), 'dd/MM HH:mm')}
                </td>
                <td className="px-5 py-2.5">
                  <span className="inline-flex items-center gap-1 text-brand-300 font-mono text-xs">
                    <QrCode className="size-3.5" /> {v.qrCode?.slice(0, 12)}…
                  </span>
                </td>
                <td className="px-5 py-2.5">
                  <span className={cn('pill', statusPill[v.status] ?? 'pill-mute')}>{statusTxt[v.status] ?? '—'}</span>
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex gap-1 justify-end">
                    {v.status === 0 && (
                      <>
                        <button title="Aprovar" onClick={() => aprovar.mutate(v.id)} className="btn btn-ghost px-2"><Check className="size-4 text-emerald-300" /></button>
                        <button title="Negar" onClick={() => negar.mutate(v.id)} className="btn btn-ghost px-2"><X className="size-4 text-rose-300" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-500 py-10">Nenhum visitante cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {open && <NovoConvite onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ['visitantes'] }); }} />}
    </div>
  );
}

function NovoConvite({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [nome, setNome] = useState('');
  const [doc, setDoc] = useState('');
  const [placa, setPlaca] = useState('');
  const start = new Date(); start.setMinutes(0, 0, 0);
  const end = new Date(start); end.setHours(end.getHours() + 4);
  const [de, setDe] = useState(start.toISOString().slice(0, 16));
  const [ate, setAte] = useState(end.toISOString().slice(0, 16));
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/api/visitantes?condominioId=${condId}`, {
        nome, documento: doc, placaVeiculo: placa,
        autorizadoDe: new Date(de).toISOString(),
        autorizadoAte: new Date(ate).toISOString(),
      });
      onClose();
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="card card-pad w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Novo convite</h3>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Nome do visitante" value={nome} onChange={setNome} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Documento" value={doc} onChange={setDoc} />
            <Input label="Placa (opcional)" value={placa} onChange={setPlaca} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Autorizado de" type="datetime-local" value={de} onChange={setDe} />
            <Input label="Autorizado até" type="datetime-local" value={ate} onChange={setAte} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button disabled={busy} className="btn btn-primary">Criar e gerar QR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required }: any) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="input mt-1" />
    </label>
  );
}
