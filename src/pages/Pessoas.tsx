import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Search } from 'lucide-react';

const roleTxt = ['Administradora', 'Síndico', 'Subsíndico', 'Conselheiro', 'Porteiro', 'Vigilante', 'Funcionário', 'Morador', 'Inquilino', 'Proprietário'];

export default function PessoasPage() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [q, setQ] = useState('');

  const list = useQuery({
    queryKey: ['pessoas', condId, q],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/pessoas?condominioId=${condId}&q=${encodeURIComponent(q)}`)).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pessoas</h1>
        <p className="text-sm text-slate-400">Moradores, prestadores e funcionários</p>
      </div>

      <section className="card card-pad">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome, CPF ou e-mail…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {(list.data ?? []).map((p: any) => (
          <article key={p.id} className="card card-pad flex items-center gap-3">
            <div className="size-12 rounded-full bg-slate-800 grid place-items-center font-semibold uppercase">
              {p.nome.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{p.nome}</div>
              <div className="text-[11px] text-slate-500 truncate">{p.email || p.telefone || '—'}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="pill-info pill">{roleTxt[p.role]}</span>
                {p.unidade && <span className="pill-mute pill">{p.unidade.bloco} {p.unidade.numero}</span>}
              </div>
            </div>
          </article>
        ))}
        {list.data?.length === 0 && <div className="text-slate-500 text-sm col-span-full text-center py-10">Nenhuma pessoa encontrada.</div>}
      </section>
    </div>
  );
}
