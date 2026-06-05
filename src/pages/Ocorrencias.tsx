import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Plus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/cn';

const sevPill = ['pill-info', 'pill-warn', 'pill-danger', 'pill-danger'];
const sevTxt = ['Baixa', 'Média', 'Alta', 'Crítica'];
const stPill = ['pill-warn', 'pill-info', 'pill-success', 'pill-mute'];
const stTxt = ['Aberta', 'Em andamento', 'Resolvida', 'Fechada'];

export default function OcorrenciasPage() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['ocorrencias', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/ocorrencias?condominioId=${condId}`)).data,
  });

  const atualizar = useMutation({
    mutationFn: ({ id, status }: any) => api.put(`/api/ocorrencias/${id}`, { status, responsavelId: null, resolucaoNota: null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ocorrencias'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ocorrências</h1>
          <p className="text-sm text-slate-400">Registros e acompanhamento</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          <Plus className="size-4" /> Abrir ocorrência
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(list.data ?? []).map((o: any) => (
          <article key={o.id} className="card card-pad">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-rose-500/15 text-rose-300 grid place-items-center">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">{o.titulo}</div>
                  <div className="text-xs text-slate-400">{o.categoria || 'Geral'} · {format(new Date(o.createdAt), 'dd/MM HH:mm')}</div>
                </div>
              </div>
              <span className={cn('pill', sevPill[o.severidade])}>{sevTxt[o.severidade]}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300 line-clamp-3">{o.descricao}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={cn('pill', stPill[o.status])}>{stTxt[o.status]}</span>
              <div className="flex gap-1">
                {o.status === 0 && <button onClick={() => atualizar.mutate({ id: o.id, status: 1 })} className="btn btn-ghost text-xs">Iniciar</button>}
                {o.status !== 2 && o.status !== 3 && <button onClick={() => atualizar.mutate({ id: o.id, status: 2 })} className="btn btn-ghost text-xs text-emerald-300">Resolver</button>}
              </div>
            </div>
          </article>
        ))}
        {list.data?.length === 0 && <div className="text-slate-500 text-sm col-span-full text-center py-10">Sem ocorrências.</div>}
      </div>

      {open && <NovaOcorrencia onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ['ocorrencias'] }); }} />}
    </div>
  );
}

function NovaOcorrencia({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Segurança');
  const [severidade, setSeveridade] = useState(1);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/api/ocorrencias?condominioId=${condId}`, { titulo, descricao, categoria, severidade });
      onClose();
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="card card-pad w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Nova ocorrência</h3>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-slate-400">Título</span>
            <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input mt-1" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-slate-400">Descrição</span>
            <textarea required value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} className="input mt-1" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-slate-400">Categoria</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input mt-1">
                {['Segurança', 'Manutenção', 'Limpeza', 'Convivência', 'Outros'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-slate-400">Severidade</span>
              <select value={severidade} onChange={(e) => setSeveridade(+e.target.value)} className="input mt-1">
                {['Baixa', 'Média', 'Alta', 'Crítica'].map((c, i) => <option key={c} value={i}>{c}</option>)}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button disabled={busy} className="btn btn-primary">Abrir ocorrência</button>
          </div>
        </form>
      </div>
    </div>
  );
}
