import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Plus, PackageOpen, Package as PackageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/cn';

const statusTxt = ['Recebida', 'Notificada', 'Retirada', 'Devolvida'];
const statusPill = ['pill-info', 'pill-warn', 'pill-success', 'pill-mute'];

export default function EncomendasPage() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['encomendas', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/encomendas?condominioId=${condId}`)).data,
  });

  const retirar = useMutation({
    mutationFn: (id: string) => api.post(`/api/portaria/encomendas/${id}/entregar`, { assinaturaUrl: null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encomendas'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Correspondencias</h1>
          <p className="text-sm text-slate-400">Recebimento e entrega</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Receber correspondencia
        </button>
      </div>

      <section className="card">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-2.5">Recebida</th>
              <th className="text-left px-5 py-2.5">Unidade</th>
              <th className="text-left px-5 py-2.5">Remetente</th>
              <th className="text-left px-5 py-2.5">Transportadora</th>
              <th className="text-left px-5 py-2.5">Rastreio</th>
              <th className="text-left px-5 py-2.5">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((e: any) => (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-5 py-2.5 tabular-nums">{format(new Date(e.recebida), 'dd/MM HH:mm')}</td>
                <td className="px-5 py-2.5">{e.unidade ? `${e.unidade.bloco} ${e.unidade.numero}` : '—'}</td>
                <td className="px-5 py-2.5">{e.remetente || '—'}</td>
                <td className="px-5 py-2.5">{e.transportadora || '—'}</td>
                <td className="px-5 py-2.5 font-mono text-xs">{e.codigoRastreio || '—'}</td>
                <td className="px-5 py-2.5">
                  <span className={cn('pill', statusPill[e.status] ?? 'pill-mute')}>{statusTxt[e.status] ?? '—'}</span>
                </td>
                <td className="px-5 py-2.5 text-right">
                  {e.status !== 2 && (
                    <button onClick={() => retirar.mutate(e.id)} className="btn btn-ghost text-emerald-300 px-3">
                      <PackageOpen className="size-4" /> Entregar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-500 py-10">Sem correspondencias registradas.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {open && <NovaEncomenda onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ['encomendas'] }); }} />}
    </div>
  );
}

function NovaEncomenda({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const condId = user?.condominioId;

  const unidades = useQuery({
    queryKey: ['unidades', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/condominios/${condId}/unidades`)).data,
  });

  const [unidadeId, setUnidadeId] = useState('');
  const [remetente, setRemetente] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/api/portaria/encomendas/receber?condominioId=${condId}`, {
        unidadeId, pessoaId: null, remetente, transportadora, codigoRastreio: codigo, descricao,
      });
      onClose();
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="card card-pad w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PackageIcon className="size-4" /> Nova correspondencia</h3>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-slate-400">Unidade</span>
            <select required value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} className="input mt-1">
              <option value="">Selecione…</option>
              {(unidades.data ?? []).map((u: any) => (
                <option key={u.id} value={u.id}>{u.bloco} {u.numero}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Remetente" value={remetente} onChange={setRemetente} />
            <Input label="Transportadora" value={transportadora} onChange={setTransportadora} />
          </div>
          <Input label="Código de rastreio" value={codigo} onChange={setCodigo} />
          <Input label="Descrição" value={descricao} onChange={setDescricao} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button disabled={busy || !unidadeId} className="btn btn-primary">Registrar recebimento</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input mt-1" />
    </label>
  );
}
