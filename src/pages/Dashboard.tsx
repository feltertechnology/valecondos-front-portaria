import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus, Footprints, Building2, Package, Search, Eraser, Send,
  Camera, FileText, Power, Calendar, LogOut, Wrench, Barcode, Tag,
  ChevronDown, Pencil, ArrowRightToLine, History, X, Home, Car, Bike,
  Briefcase, UsersRound, PawPrint, Phone, Users, Megaphone, Lock,
  ClipboardCheck, ClipboardList, IdCard, PackagePlus, PackageOpen,
  Clock as ClockIcon, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/cn';
import { useDebounce } from '../lib/useDebounce';
import { TextField, SelectField, DateField } from '../components/TextField';
import { DateInput, DateRangeInput, InlineDateRange } from '../components/DatePicker';
import { ActionPill, ActionPillGroup } from '../components/ActionPill';

/* Headers das colunas — apenas a paleta do brand.
   Cada coluna ganha um sub-label distinto + posição da barra de progresso */
const ACCENTS = {
  avulso:     { tone: 'warm', subtitle: 'Visitantes · Saídas · Agendados' },
  passagens:  { tone: 'cool', subtitle: 'Histórico em tempo real' },
  unidades:   { tone: 'cool', subtitle: 'Moradores · Veículos · Vagas' },
  encomendas: { tone: 'warm', subtitle: 'Receber · Entregar' },
};

type ColumnKey = keyof typeof ACCENTS;

interface ColumnTab {
  key: string;
  label: string;
  icon: any;
}

export default function DashboardPage() {
  const [unidadeDetalhe, setUnidadeDetalhe] = useState<any>(null);

  const [avulsoTab,     setAvulsoTab]     = useState<'visitante'|'agendamentos'|'saidas'>('visitante');
  const [passagensTab,  setPassagensTab]  = useState<'passagens'|'agendados'|'saidas'>('passagens');
  const [unidadesTab,   setUnidadesTab]   = useState<'unidades'|'veiculos'|'vagas'>('unidades');
  const [encomendasTab, setEncomendasTab] = useState<'receber'|'entregar'>('receber');

  // Atalhos globais — ignora quando usuário está digitando
  useEffect(() => {
    const isTyping = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAvulsoTab('visitante');
        setTimeout(() => {
          const first = document.querySelector<HTMLInputElement>('input[placeholder*="automática"]');
          first?.focus();
        }, 30);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setAvulsoTab('saidas');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setEncomendasTab('receber');
      } else if (e.key === 'Escape' && !isTyping(e.target)) {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="h-full flex flex-col bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-white relative overflow-hidden">
      {/* Pano de fundo: pontos sutis */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pt-4 pb-14">
        <Column
          kind="avulso"
          tabs={[
            { key: 'visitante',    label: 'Visitante',     icon: IdCard },
            { key: 'agendamentos', label: 'Agendamentos',  icon: Calendar },
            { key: 'saidas',       label: 'Saídas',        icon: LogOut },
          ]}
          active={avulsoTab}
          onChange={(k) => setAvulsoTab(k as any)}
        >
          {avulsoTab === 'visitante'    && <AvulsoVisitante />}
          {avulsoTab === 'agendamentos' && <AvulsoAgendamentos />}
          {avulsoTab === 'saidas'       && <AvulsoSaidas accent="emerald" />}
        </Column>

        <Column
          kind="passagens"
          tabs={[
            { key: 'passagens',  label: 'Passagens',  icon: Footprints },
            { key: 'agendados',  label: 'Agendados',  icon: Calendar },
            { key: 'saidas',     label: 'Saídas',     icon: LogOut },
          ]}
          active={passagensTab}
          onChange={(k) => setPassagensTab(k as any)}
        >
          {passagensTab === 'passagens' && <PassagensPanel />}
          {passagensTab === 'agendados' && <AvulsoAgendamentos />}
          {passagensTab === 'saidas'    && <AvulsoSaidas accent="blue" />}
        </Column>

        <Column
          kind="unidades"
          tabs={[
            { key: 'unidades', label: 'Unidades', icon: Building2 },
            { key: 'veiculos', label: 'Veículos', icon: Car },
            { key: 'vagas',    label: 'Vagas',    icon: Home },
          ]}
          active={unidadesTab}
          onChange={(k) => setUnidadesTab(k as any)}
        >
          {unidadesTab === 'unidades' && <UnidadesPanel onSelect={setUnidadeDetalhe} />}
          {unidadesTab === 'veiculos' && <VeiculosPanel />}
          {unidadesTab === 'vagas'    && <VagasPanel />}
        </Column>

        <Column
          kind="encomendas"
          tabs={[
            { key: 'receber',  label: 'Receber',  icon: PackagePlus },
            { key: 'entregar', label: 'Entregar', icon: PackageOpen },
          ]}
          active={encomendasTab}
          onChange={(k) => setEncomendasTab(k as any)}
        >
          {encomendasTab === 'receber'  && <EncomendasReceber />}
          {encomendasTab === 'entregar' && <EncomendasEntregar />}
        </Column>
      </div>
      <BottomBar />
      {unidadeDetalhe && <UnidadeModal unidade={unidadeDetalhe} onClose={() => setUnidadeDetalhe(null)} />}
    </div>
  );
}

/* ---------------- Coluna com abas ---------------- */

function Column({ kind, tabs, active, onChange, children }: {
  kind: ColumnKey; tabs: ColumnTab[]; active: string; onChange: (k: string) => void;
  children: React.ReactNode;
}) {
  const meta = ACCENTS[kind];
  const activeTab = tabs.find((t) => t.key === active);
  const ActiveIcon = activeTab?.icon;

  return (
    <section className="flex flex-col gap-2.5 min-h-0 animate-fadeIn">
      <header
        className={cn(
          'relative overflow-hidden rounded-xl shrink-0',
          'bg-ink-900 text-cream-100',
          'border border-ink-700/60',
          'shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(11,14,18,0.18)]'
        )}
      >
        {/* hairline champagne no topo · tom warm/cool muito sutil */}
        <span
          className={cn(
            'absolute top-0 left-0 right-0 h-px',
            meta.tone === 'warm'
              ? 'bg-gradient-to-r from-transparent via-champagne-400/60 to-transparent'
              : 'bg-gradient-to-r from-transparent via-ink-100/30 to-transparent'
          )}
        />

        <div className="flex items-stretch">
          {/* Bloco do título (esquerda) — fixo, mostrando o módulo + sub-label */}
          <div className="flex items-center gap-3 px-3.5 py-3 flex-1 min-w-0 border-r border-ink-700/40">
            <div
              className={cn(
                'size-9 rounded-lg grid place-items-center shrink-0',
                meta.tone === 'warm'
                  ? 'bg-champagne-400/15 text-champagne-300 ring-1 ring-champagne-400/25'
                  : 'bg-white/[0.04] text-cream-100 ring-1 ring-cream-100/15'
              )}
            >
              {ActiveIcon && <ActiveIcon className="size-[18px]" strokeWidth={2} />}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-cream-100 truncate">
                {activeTab?.label}
              </div>
              <div className="text-[10px] text-cream-100/40 truncate">{meta.subtitle}</div>
            </div>
          </div>

          {/* Tabs secundárias (direita) — só ícones */}
          <div className="flex items-center gap-0.5 px-1.5">
            {tabs.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => onChange(t.key)}
                  className={cn(
                    'size-9 rounded-md grid place-items-center transition',
                    isActive
                      ? meta.tone === 'warm'
                        ? 'bg-champagne-400 text-ink-900'
                        : 'bg-cream-100 text-ink-900'
                      : 'text-cream-100/40 hover:text-cream-100 hover:bg-white/[0.06]'
                  )}
                  title={t.label}
                >
                  <t.icon className="size-4" strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2.5 min-h-0 overflow-y-auto overflow-x-hidden pr-1 -mr-1 scroll-thin">
        {children}
      </div>
    </section>
  );
}

/* ---------------- AVULSO · Visitante ---------------- */

function AvulsoVisitante() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [doc, setDoc] = useState('');
  const [nome, setNome] = useState('');
  const debouncedQ = useDebounce((doc || nome).trim(), 280);

  // Form Novo Visitante (funcional)
  const [nv, setNv] = useState({
    documento: '', nome: '', unidadeId: '', autorizante: '',
    saida: '', placa: '', marca: '', modelo: '', cor: '', vaga: '', cracha: '', observacoes: '',
  });
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  const unidades = useQuery({
    queryKey: ['unidades-cad', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/condominios/${condId}/unidades`)).data,
  });

  // Busca automática (sem clicar na lupa) — debounced 280ms
  const search = useQuery({
    queryKey: ['avulso-busca', condId, debouncedQ],
    enabled: !!condId && debouncedQ.length >= 2,
    queryFn: async () => (await api.get(`/api/pessoas?condominioId=${condId}&q=${encodeURIComponent(debouncedQ)}`)).data,
  });
  const resultados: any[] = search.data ?? [];


  const cadastrar = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const saidaIso = nv.saida
        ? new Date(nv.saida).toISOString()
        : new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
      return api.post(`/api/visitantes?condominioId=${condId}`, {
        unidadeId: nv.unidadeId || null,
        nome: nv.nome,
        documento: nv.documento,
        telefone: null,
        placaVeiculo: nv.placa,
        observacoes: [nv.autorizante && `Autorizante: ${nv.autorizante}`,
                      nv.marca && `${nv.marca} ${nv.modelo}`,
                      nv.cor && `Cor: ${nv.cor}`,
                      nv.vaga && `Vaga: ${nv.vaga}`,
                      nv.cracha && `Crachá: ${nv.cracha}`,
                      nv.observacoes].filter(Boolean).join(' · '),
        autorizadoDe: now.toISOString(),
        autorizadoAte: saidaIso,
      });
    },
    onSuccess: () => {
      setToast({ msg: 'Visitante registrado com sucesso', tone: 'ok' });
      setNv({ documento: '', nome: '', unidadeId: '', autorizante: '', saida: '',
              placa: '', marca: '', modelo: '', cor: '', vaga: '', cracha: '', observacoes: '' });
      qc.invalidateQueries({ queryKey: ['visitantes'] });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (e: any) => {
      setToast({ msg: e.response?.data?.error || 'Erro ao cadastrar', tone: 'err' });
      setTimeout(() => setToast(null), 4000);
    },
  });

  const limpar = () => setNv({ documento: '', nome: '', unidadeId: '', autorizante: '', saida: '',
                                placa: '', marca: '', modelo: '', cor: '', vaga: '', cracha: '', observacoes: '' });
  const canSubmit = nv.nome.trim().length > 0 && nv.unidadeId.length > 0;

  return (
    <>
      <Card>
        <TextField
          label="Documento"
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          autoFocus
          maxLength={20}
          counter
        />
        <TextField
          label="Nome e Sobrenome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={80}
          counter
          rightSlot={search.isFetching ? <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin text-champagne-500" /> : null}
        />
        <ActionPillGroup>
          <ActionPill icon={Eraser}   label="Limpar"   color="violet"   onClick={() => { setDoc(''); setNome(''); }} />
          <ActionPill icon={UserPlus} label="Convidar" color="emerald" />
        </ActionPillGroup>
        {debouncedQ.length >= 2 && resultados.length === 0 && !search.isFetching && (
          <div className="text-[11px] text-ink-400 dark:text-cream-100/40 text-center py-1.5">Nada encontrado para "{debouncedQ}"</div>
        )}
      </Card>

      {resultados.map((p) => <PessoaCard key={p.id} pessoa={p} />)}

      <Card>
        <Banner color="blue" icon={UserPlus}>Novo Visitante</Banner>
        {toast && (
          <div className={cn(
            'rounded-lg px-3 py-2 text-[11px] font-medium',
            toast.tone === 'ok'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
          )}>{toast.msg}</div>
        )}
        <TextField label="Documento" value={nv.documento} onChange={(e) => setNv({ ...nv, documento: e.target.value })}
                   maxLength={20} counter rightSlot={<Wrench className="size-3.5" />} />
        <TextField label="Nome e Sobrenome" value={nv.nome} onChange={(e) => setNv({ ...nv, nome: e.target.value })}
                   maxLength={80} counter />
        <SelectField label="Unidade" value={nv.unidadeId} onChange={(e) => setNv({ ...nv, unidadeId: e.target.value })}
                     options={(unidades.data ?? []).map((u: any) => ({ value: u.id, label: `${u.bloco} ${u.numero}` }))} />
        <TextField label="Autorizante" value={nv.autorizante} onChange={(e) => setNv({ ...nv, autorizante: e.target.value })}
                   maxLength={80} counter />
        <DateInput
          label="Saída prevista"
          value={nv.saida ? new Date(nv.saida) : null}
          onChange={(d) => setNv({ ...nv, saida: d ? d.toISOString().slice(0, 16) : '' })}
        />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Marca" value={nv.marca} onChange={(e) => setNv({ ...nv, marca: e.target.value })} maxLength={30} />
          <TextField label="Modelo" value={nv.modelo} onChange={(e) => setNv({ ...nv, modelo: e.target.value })} maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Placa" value={nv.placa} onChange={(e) => setNv({ ...nv, placa: e.target.value.toUpperCase() })}
                     maxLength={8} counter style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
          <TextField label="Cor" value={nv.cor} onChange={(e) => setNv({ ...nv, cor: e.target.value })} maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Vaga" value={nv.vaga} onChange={(e) => setNv({ ...nv, vaga: e.target.value })} maxLength={10} />
          <TextField label="Crachá" value={nv.cracha} onChange={(e) => setNv({ ...nv, cracha: e.target.value })} maxLength={10} />
        </div>
        <TextField label="Observação" value={nv.observacoes} onChange={(e) => setNv({ ...nv, observacoes: e.target.value })}
                   maxLength={200} counter />
        <ActionPillGroup>
          <ActionPill icon={X}        label="Cancelar"  color="rose"    onClick={limpar} />
          <ActionPill icon={Eraser}   label="Limpar"    color="violet"  onClick={limpar} />
          <ActionPill icon={Camera}   label="Foto"      color="ink" />
          <ActionPill icon={FileText} label="Doc"       color="ink" />
          <ActionPill icon={UserPlus} label="Cadastrar" color="emerald" busy={cadastrar.isPending} disabled={!canSubmit} onClick={() => cadastrar.mutate()} />
        </ActionPillGroup>
      </Card>
    </>
  );
}

function SelectNative({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg px-3 py-1.5 h-9',
      'bg-navy-50/60 dark:bg-white/[0.03]',
      'border border-navy-200/80 dark:border-white/[0.08]',
      'hover:border-navy-300 dark:hover:border-white/[0.15]',
      'focus-within:border-gold-500 transition'
    )}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function PessoaCard({ pessoa }: { pessoa: any }) {
  const docMasked = pessoa.cpf ? pessoa.cpf.slice(0, 3) + '*'.repeat(8) : '—';
  const initials = (pessoa.nome || '?').split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase();
  return (
    <Card>
      <div className="flex items-center gap-3">
        {pessoa.fotoUrl ? (
          <img src={pessoa.fotoUrl} className="size-14 rounded-xl object-cover" alt="" />
        ) : (
          <div className="size-14 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-700 dark:text-white/70 font-semibold">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{pessoa.nome}</div>
          <div className="text-xs text-ink-500 dark:text-white/50 font-mono">{docMasked}</div>
          <div className="text-xs text-ink-500 dark:text-white/50">
            {pessoa.unidade ? `${pessoa.unidade.numero} ${pessoa.unidade.bloco === 'A' ? 'Torre A' : pessoa.unidade.bloco === 'B' ? 'Torre B' : pessoa.unidade.bloco}` : '—'}
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-ink-100 dark:border-white/5">
        <ActionPillGroup>
          <ActionPill icon={Pencil}          label="Editar"    color="ink" />
          <ActionPill icon={ArrowRightToLine} label="Liberar"  color="emerald" />
          <ActionPill icon={History}         label="Histórico" color="blue" />
        </ActionPillGroup>
      </div>
    </Card>
  );
}

/* ---------------- AVULSO · Agendamentos ---------------- */

function AvulsoAgendamentos() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [doc, setDoc] = useState('');
  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  const visitantes = useQuery({
    queryKey: ['agendamentos-visitantes', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/visitantes?condominioId=${condId}&status=1`)).data,
  });

  const reservas = useQuery({
    queryKey: ['agendamentos-reservas', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/reservas?condominioId=${condId}&desde=${new Date().toISOString()}`)).data,
  });

  const visitantesFiltrados = useMemo(() => {
    const k = (doc || nome).toLowerCase();
    return (visitantes.data ?? []).filter((v: any) => {
      if (!dentroDoPeriodo(v.autorizadoDe, periodo)) return false;
      if (!k) return true;
      return (v.nome || '').toLowerCase().includes(k) || (v.documento || '').toLowerCase().includes(k);
    });
  }, [visitantes.data, doc, nome, periodo]);

  const reservasFiltradas = useMemo(() => {
    const k = (doc || nome).toLowerCase();
    return (reservas.data ?? []).filter((r: any) => {
      if (!dentroDoPeriodo(r.inicio, periodo)) return false;
      if (!k) return true;
      const alvo = [
        r.titulo,
        r.areaComum?.nome,
        r.pessoa?.nome,
        r.unidade ? `${r.unidade.bloco} ${r.unidade.numero}` : '',
        tipoAgendamentoPortaria(r.tipoAgendamento),
      ].join(' ').toLowerCase();
      return alvo.includes(k);
    });
  }, [reservas.data, doc, nome, periodo]);

  return (
    <Card>
      <TextField label="Documento" value={doc} onChange={(e) => setDoc(e.target.value)} maxLength={20} counter />
      <TextField label="Nome e Sobrenome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} counter />
      <SelectField label="Unidade" options={[]} />
      <InlineDateRange label="Período" value={periodo} onChange={setPeriodo} />

      <ActionPillGroup>
        <ActionPill icon={Eraser} label="Limpar" color="violet" onClick={() => { setDoc(''); setNome(''); setPeriodo({ from: null, to: null }); }} />
        <ActionPill icon={Search} label="Buscar" color="blue" />
        <ActionPill icon={ClipboardCheck} label="Agendar" color="ink" />
      </ActionPillGroup>

      {reservasFiltradas.slice(0, 5).map((r: any) => (
        <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-ink-100 dark:border-white/5 bg-ink-50/40 dark:bg-white/[0.02]">
          <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 grid place-items-center">
            <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{r.titulo || r.areaComum?.nome || tipoAgendamentoPortaria(r.tipoAgendamento)}</div>
            <div className="text-[11px] text-ink-500 dark:text-white/50 truncate">
              {tipoAgendamentoPortaria(r.tipoAgendamento)} {r.pessoa?.nome ? `- ${r.pessoa.nome}` : ''}
            </div>
            <div className="text-[11px] text-ink-500 dark:text-white/50">
              {format(new Date(r.inicio), 'dd/MM HH:mm')} - {format(new Date(r.fim), 'HH:mm')}
            </div>
          </div>
        </div>
      ))}

      {visitantesFiltrados.slice(0, 5).map((v: any) => (
        <div key={v.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-ink-100 dark:border-white/5 bg-ink-50/40 dark:bg-white/[0.02]">
          <div className="size-9 rounded-lg bg-ink-100 dark:bg-ink-800 grid place-items-center">
            <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{v.nome}</div>
            <div className="text-[11px] text-ink-500 dark:text-white/50">
              {format(new Date(v.autorizadoDe), 'dd/MM HH:mm')} → {format(new Date(v.autorizadoAte), 'HH:mm')}
            </div>
          </div>
        </div>
      ))}
      {reservasFiltradas.length === 0 && visitantesFiltrados.length === 0 && (
        <div className="text-xs text-ink-400 dark:text-white/40 text-center py-4">Nenhum agendamento.</div>
      )}
    </Card>
  );
}

function dentroDoPeriodo(raw: string | null | undefined, periodo: { from: Date | null; to: Date | null }) {
  if (!raw) return true;
  const data = new Date(raw);
  if (periodo.from && data < periodo.from) return false;
  if (periodo.to && data > periodo.to) return false;
  return true;
}

function tipoAgendamentoPortaria(tipo?: string) {
  switch (tipo) {
    case 'locacao_temporaria': return 'Locacao temporaria';
    case 'mudanca': return 'Mudanca';
    case 'obra': return 'Obras';
    case 'prestador_servico': return 'Prestador de servico';
    default: return 'Espacos sociais';
  }
}

function MiniCalendario({ mesAtual, onChangeMes }: { mesAtual: Date; onChangeMes: (d: Date) => void }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const dias: (number | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
  for (let d = 1; d <= diasNoMes; d++) dias.push(d);

  const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const semanas = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="rounded-xl border border-ink-200 dark:border-white/10 bg-white dark:bg-ink-900 p-3">
      <div className="flex items-center justify-between mb-2">
        <button className="text-sm font-semibold flex items-center gap-1">
          {nomeMes} <ChevronDown className="size-3.5" />
        </button>
        <div className="flex items-center">
          <button onClick={() => onChangeMes(new Date(ano, mes - 1, 1))} className="size-7 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-white/5">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => onChangeMes(new Date(ano, mes + 1, 1))} className="size-7 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-white/5">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-ink-400 dark:text-white/40 font-semibold mb-1">
        {semanas.map((s, i) => <div key={i}>{s}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {dias.map((d, i) => {
          if (d === null) return <div key={i} />;
          const data = new Date(ano, mes, d);
          const isToday = data.getTime() === today.getTime();
          return (
            <button
              key={i}
              className={cn(
                'aspect-square text-xs rounded-md transition',
                isToday
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'hover:bg-ink-100 dark:hover:bg-white/5 text-ink-700 dark:text-white/70'
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- AVULSO/PASSAGENS · Saídas ---------------- */

function AvulsoSaidas({ accent }: { accent: 'emerald' | 'blue' }) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [doc, setDoc] = useState('');
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [unid, setUnid] = useState('');
  const [periodo, setPeriodo] = useState<{ from: Date | null; to: Date | null }>(() => {
    const today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - 14);
    return { from: start, to: today };
  });

  const acessos = useQuery({
    queryKey: ['saidas-acessos', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/acessos?condominioId=${condId}&pageSize=30`)).data,
    refetchInterval: 20_000,
  });

  // Entradas que ainda não têm saída registrada (matching simples por PessoaId/VisitanteId)
  const sinSaida = useMemo(() => {
    const items: any[] = acessos.data?.items ?? [];
    const result: any[] = [];
    for (const e of items) {
      if (e.direcao !== 0) continue; // só entradas
      // procura uma saída posterior do mesmo ator
      const ator = e.pessoaId || e.visitanteId || e.nomeApresentado;
      const temSaida = items.some((s) => s.direcao === 1 &&
        new Date(s.quando) > new Date(e.quando) &&
        ((s.pessoaId && s.pessoaId === e.pessoaId) ||
         (s.visitanteId && s.visitanteId === e.visitanteId) ||
         (s.nomeApresentado && s.nomeApresentado === e.nomeApresentado)));
      if (!temSaida) result.push(e);
    }
    return result.slice(0, 8);
  }, [acessos.data]);

  const registrarSaida = useMutation({
    mutationFn: async ({ acesso, quando }: { acesso: any; quando: string }) => {
      return api.post(`/api/acessos?condominioId=${condId}`, {
        pessoaId: acesso.pessoaId,
        visitanteId: acesso.visitanteId,
        tipo: 8, // Manual
        direcao: 1, // Saída
        resultado: 0,
        nomeApresentado: acesso.nomeApresentado || acesso.pessoa?.nome || acesso.visitante?.nome,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saidas-acessos'] }),
  });

  return (
    <>
      <Card>
        <TextField label="Documento" value={doc} onChange={(e) => setDoc(e.target.value)} maxLength={20} counter />
        <TextField label="Nome e Sobrenome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} counter />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} maxLength={8} counter style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
          <TextField label="Unidade" value={unid} onChange={(e) => setUnid(e.target.value)} maxLength={10} />
        </div>
        <DateRangeInput label="Período" value={periodo} onChange={setPeriodo} />
        <ActionPillGroup>
          <ActionPill icon={Eraser}         label="Limpar"  color="violet" onClick={() => { setDoc(''); setNome(''); setPlaca(''); setUnid(''); }} />
          <ActionPill icon={Search}         label="Buscar"  color="blue" />
          <ActionPill icon={ClipboardCheck} label="Lista"   color="ink" />
        </ActionPillGroup>
      </Card>

      {sinSaida.map((e) => (
        <SaidaCard key={e.id} acesso={e} onSaida={(quando) => registrarSaida.mutate({ acesso: e, quando })} accent={accent} />
      ))}
      {sinSaida.length === 0 && (
        <div className="text-xs text-ink-400 dark:text-white/40 text-center py-4">Nenhuma entrada sem saída.</div>
      )}
    </>
  );
}

function SaidaCard({ acesso, onSaida }: { acesso: any; onSaida: (quando: string) => void; accent?: string }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customWhen, setCustomWhen] = useState(() => new Date().toISOString().slice(0, 16));
  const nome = acesso.nomeApresentado || acesso.pessoa?.nome || acesso.visitante?.nome || 'Desconhecido';
  const torre = acesso.pessoa?.unidade
    ? `Torre ${acesso.pessoa.unidade.bloco} ${acesso.pessoa.unidade.numero} · ${acesso.visitante ? 'Visitante' : 'Morador'}`
    : acesso.visitante?.unidade ? `Torre ${acesso.visitante.unidade.bloco} ${acesso.visitante.unidade.numero} · Visitante` : 'Sem unidade';
  const doc = acesso.pessoa?.cpf ? acesso.pessoa.cpf.slice(0, 3) + '...' : null;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-lg bg-ink-100 dark:bg-ink-800 grid place-items-center shrink-0">
          <Lock className="size-4 text-ink-400 dark:text-cream-100/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate text-ink-900 dark:text-cream-100">{nome}</div>
          <div className="text-[11px] text-ink-500 dark:text-cream-100/50 truncate">{torre}</div>
          {doc && <div className="text-[10px] text-ink-400 dark:text-cream-100/30 font-mono">{doc}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[9px] uppercase tracking-[0.18em] text-ink-400 dark:text-cream-100/30">Entrada</div>
          <div className="text-[12px] text-champagne-600 dark:text-champagne-300 tabular-nums font-mono">
            {format(new Date(acesso.quando), 'HH:mm:ss')}
          </div>
          <div className="text-[9px] text-ink-400 dark:text-cream-100/30 tabular-nums">
            {format(new Date(acesso.quando), 'dd/MM')}
          </div>
        </div>
      </div>

      {/* Ações em 1 clique */}
      <div className="flex items-stretch gap-2 pt-1">
        <button
          onClick={() => onSaida(new Date().toISOString())}
          className={cn(
            'flex-1 px-3 py-2.5 rounded-lg text-[11px] font-bold tracking-[0.18em] uppercase transition flex items-center justify-center gap-2',
            'bg-champagne-400 text-ink-900 hover:bg-champagne-300',
            'shadow-sm shadow-champagne-500/10'
          )}
        >
          <ArrowRightToLine className="size-4" /> Saída agora
        </button>
        <button
          onClick={() => setShowCustom((s) => !s)}
          className={cn(
            'px-3 py-2.5 rounded-lg border transition',
            'border-ink-200 dark:border-ink-700',
            'text-ink-500 dark:text-cream-100/50',
            'hover:border-champagne-400 hover:text-champagne-500 dark:hover:text-champagne-300'
          )}
          title="Saída em outro horário"
        >
          <ClockIcon className="size-4" />
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2 animate-fadeIn">
          <input
            type="datetime-local"
            value={customWhen}
            onChange={(e) => setCustomWhen(e.target.value)}
            className="field-input rounded-lg bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 px-2 py-1.5 text-xs"
          />
          <button
            onClick={() => { onSaida(new Date(customWhen).toISOString()); setShowCustom(false); }}
            className="px-3 py-1.5 rounded-lg bg-champagne-400 text-ink-900 text-[11px] font-bold uppercase tracking-wider"
          >
            Confirmar
          </button>
        </div>
      )}
    </Card>
  );
}

/* ---------------- PASSAGENS ---------------- */

function PassagensPanel() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [periodo, setPeriodo] = useState<{ from: Date | null; to: Date | null }>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: start, to: today };
  });
  const list = useQuery({
    queryKey: ['passagens', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/acessos?condominioId=${condId}&pageSize=10`)).data,
    refetchInterval: 15_000,
  });

  return (
    <>
      <Card>
        <TextField label="Documento" maxLength={20} counter />
        <TextField label="Nome e Sobrenome" maxLength={80} counter />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Unidade" maxLength={10} />
          <TextField label="Placa" maxLength={8} counter style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
        </div>
        <DateRangeInput label="Período" value={periodo} onChange={setPeriodo} />
        <ActionPillGroup>
          <ActionPill icon={Eraser} label="Limpar" color="violet" />
          <ActionPill icon={Search} label="Buscar" color="blue" />
        </ActionPillGroup>
      </Card>

      {(list.data?.items ?? []).slice(0, 6).map((a: any) => (
        <PassagemCard key={a.id} acesso={a} />
      ))}
      {(list.data?.items ?? []).length === 0 && (
        <div className="card-base text-xs text-ink-400 dark:text-white/40 text-center py-6">Nenhuma passagem registrada.</div>
      )}
    </>
  );
}

function PassagemCard({ acesso }: { acesso: any }) {
  const foto = acesso.fotoCapturadaUrl || acesso.pessoa?.fotoUrl;
  const destino = acesso.pessoa?.unidade
    ? `destino: Torre ${acesso.pessoa.unidade.bloco} ${acesso.pessoa.unidade.numero}`
    : (acesso.visitante?.unidade ? `destino: Torre ${acesso.visitante.unidade.bloco} ${acesso.visitante.unidade.numero}` : '');
  const semFoto = !foto;
  return (
    <div className="card-base flex items-center gap-3 px-3 py-2.5 shrink-0">
      {semFoto ? (
        <div className="size-12 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-400 dark:text-white/30 text-[9px] flex-col">
          <Camera className="size-4 mb-0.5" /> Sem Foto
        </div>
      ) : (
        <img src={foto} className="size-12 rounded-xl object-cover" alt="" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{acesso.nomeApresentado || acesso.pessoa?.nome || 'Desconhecido'}</div>
        {destino && <div className="text-[11px] text-ink-500 dark:text-white/50">{destino}</div>}
        <div className="text-[11px] text-ink-500 dark:text-white/50 tabular-nums">
          {format(new Date(acesso.quando), 'dd/MM/yyyy HH:mm:ss')}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UNIDADES ---------------- */

function UnidadesPanel({ onSelect }: { onSelect: (u: any) => void }) {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const list = useQuery({
    queryKey: ['unidades-busca', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/condominios/${condId}/unidades`)).data,
  });
  const pessoas = useQuery({
    queryKey: ['pessoas-unidades', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/pessoas?condominioId=${condId}`)).data,
  });
  const [q, setQ] = useState('');
  const total = list.data?.length ?? 0;
  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return (pessoas.data ?? []).filter((p: any) =>
      p.unidade && (`${p.unidade.numero} ${p.unidade.bloco}`).toLowerCase().includes(k));
  }, [pessoas.data, q]);

  return (
    <>
      <Card>
        <TextField
          label={q ? `Unidades ${filtered.length}/${total}` : 'Unidades'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={20}
          counter
          rightSlot={q ? <button onClick={() => setQ('')} className="hover:text-ink-600"><X className="size-4" /></button> : null}
        />
        <TextField label="Nome" maxLength={80} counter />
        <ActionPillGroup>
          <ActionPill icon={Eraser} label="Limpar" color="violet" onClick={() => setQ('')} />
          <ActionPill icon={Search} label="Buscar" color="blue" />
        </ActionPillGroup>
      </Card>

      {q && filtered.map((p: any) => (
        <button key={p.id} onClick={() => onSelect(p)}
                className="card-base flex items-center gap-3 px-3 py-2.5 text-left hover:border-violet-300 dark:hover:border-violet-500/40 transition shrink-0">
          <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 grid place-items-center">
            <Home className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {p.nome} / {p.unidade?.numero} - {p.unidade?.bloco === 'A' ? 'Torre A' : p.unidade?.bloco === 'B' ? 'Torre B' : `Bloco ${p.unidade?.bloco}`}
            </div>
            <div className="text-xs text-ink-500 dark:text-white/50">
              {p.proprietario ? 'Proprietário' : p.inquilino ? 'Locatário' : 'Morador'}
            </div>
          </div>
        </button>
      ))}
      {q && filtered.length === 0 && (
        <div className="card-base text-xs text-ink-400 dark:text-white/40 text-center py-6">Nada encontrado.</div>
      )}
    </>
  );
}

/* ---------------- UNIDADES · Veículos ---------------- */

function VeiculosPanel() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const [q, setQ] = useState('');
  const veiculos = useQuery({
    queryKey: ['veiculos', condId, q],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/condominios/${condId}/veiculos${q ? `?q=${encodeURIComponent(q)}` : ''}`)).data,
  });

  return (
    <>
      <Card>
        <TextField
          label="Placa"
          value={q}
          onChange={(e) => setQ(e.target.value.toUpperCase())}
          maxLength={8}
          counter
          style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
        />
        <ActionPillGroup>
          <ActionPill icon={Eraser} label="Limpar" color="violet" onClick={() => setQ('')} />
          <ActionPill icon={Search} label="Buscar" color="blue" />
        </ActionPillGroup>
      </Card>

      {(veiculos.data ?? []).map((v: any) => (
        <div key={v.id} className="card-base flex items-center gap-3 px-3 py-2.5 shrink-0">
          <div className="size-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300 grid place-items-center">
            <Car className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-bold text-sm">{v.placa}</div>
            <div className="text-xs text-ink-500 dark:text-white/50 truncate">
              {v.marca} {v.modelo} · {v.cor || '—'} {v.ano ? `· ${v.ano}` : ''}
            </div>
            <div className="text-[11px] text-ink-500 dark:text-white/50">
              {v.unidade ? `${v.unidade.bloco} ${v.unidade.numero}` : '—'}
              {v.tagRfid && <span className="ml-2 inline-flex items-center gap-1 font-mono"><Tag className="size-3" /> {v.tagRfid}</span>}
            </div>
          </div>
        </div>
      ))}
      {(veiculos.data ?? []).length === 0 && (
        <div className="card-base text-xs text-ink-400 dark:text-white/40 text-center py-6">
          {q ? 'Nenhum veículo encontrado.' : 'Digite para buscar.'}
        </div>
      )}
    </>
  );
}

/* ---------------- UNIDADES · Vagas ---------------- */

function VagasPanel() {
  // Mock: 30 vagas, algumas ocupadas
  const vagas = Array.from({ length: 30 }, (_, i) => ({
    n: i + 1,
    ocupada: i % 3 === 0,
    placa: i % 3 === 0 ? ['ABC1D23', 'LXA3825', 'MER1234', 'GHI3F67'][i % 4] : null,
  }));

  return (
    <>
      <Card>
        <SelectField label="Vagas" options={[
          { value: 'todas', label: 'Todas' },
          { value: 'livres', label: 'Livres' },
          { value: 'ocupadas', label: 'Ocupadas' },
          { value: 'visitantes', label: 'Visitantes' },
        ]} />
        <ActionPillGroup>
          <ActionPill icon={Eraser} label="Limpar" color="violet" />
          <ActionPill icon={Search} label="Buscar" color="blue" />
        </ActionPillGroup>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500 dark:text-white/50">Mapa de vagas</div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="inline-flex items-center gap-1 text-ink-500 dark:text-white/50"><span className="size-2 rounded-sm bg-emerald-500" /> Livre</span>
            <span className="inline-flex items-center gap-1 text-ink-500 dark:text-white/50"><span className="size-2 rounded-sm bg-violet-500" /> Ocupada</span>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {vagas.map((v) => (
            <button
              key={v.n}
              className={cn(
                'aspect-square rounded-lg text-[10px] font-bold transition',
                v.ocupada
                  ? 'bg-violet-500 text-white hover:bg-violet-600'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300'
              )}
              title={v.placa ?? `Vaga ${v.n} livre`}
            >
              {v.n}
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ---------------- ENCOMENDAS · Receber ---------------- */

function EncomendasReceber() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [f, setF] = useState({ codigo: '', interno: '', unidadeId: '', remetente: '', tipo: '', local: '', obs: '' });
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  const unidades = useQuery({
    queryKey: ['unidades-enc', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/condominios/${condId}/unidades`)).data,
  });

  const limpar = () => setF({ codigo: '', interno: '', unidadeId: '', remetente: '', tipo: '', local: '', obs: '' });

  const receber = useMutation({
    mutationFn: () => api.post(`/api/portaria/encomendas/receber?condominioId=${condId}`, {
      unidadeId: f.unidadeId,
      pessoaId: null,
      remetente: f.remetente || f.tipo || 'Sem remetente',
      transportadora: f.local,
      codigoRastreio: f.codigo,
      descricao: [f.interno && `Int: ${f.interno}`, f.obs].filter(Boolean).join(' · '),
      fotoUrl: null,
    }),
    onSuccess: () => {
      setToast({ msg: 'Encomenda registrada · morador foi notificado', tone: 'ok' });
      limpar();
      qc.invalidateQueries({ queryKey: ['enc-pend'] });
      qc.invalidateQueries({ queryKey: ['enc-entregar'] });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (e: any) => {
      setToast({ msg: e.response?.data?.error || 'Erro ao registrar', tone: 'err' });
      setTimeout(() => setToast(null), 4000);
    },
  });

  const canSubmit = !!f.unidadeId && (f.codigo || f.remetente);

  return (
    <>
      <Card>
        {toast && (
          <div className={cn(
            'rounded-lg px-3 py-2 text-[11px] font-medium',
            toast.tone === 'ok'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
          )}>{toast.msg}</div>
        )}
        <TextField label="Código de Barras" value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })}
                   maxLength={40} counter rightSlot={<Barcode className="size-3.5" />}
                   style={{ fontFamily: 'monospace' }} />
        <TextField label="Identificação Interna" value={f.interno} onChange={(e) => setF({ ...f, interno: e.target.value })}
                   maxLength={20} counter rightSlot={<Tag className="size-3.5" />} />
        <SelectField label="Unidade" value={f.unidadeId} onChange={(e) => setF({ ...f, unidadeId: e.target.value })}
                     options={(unidades.data ?? []).map((u: any) => ({ value: u.id, label: `${u.bloco} ${u.numero}` }))} />
        <div className="grid grid-cols-2 gap-2">
          <SelectField label="Tipo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}
                       options={[
                         { value: 'Caixa', label: 'Caixa' },
                         { value: 'Envelope', label: 'Envelope' },
                         { value: 'Sedex', label: 'Sedex' },
                         { value: 'Entrega delivery', label: 'Delivery' },
                         { value: 'Outro', label: 'Outro' },
                       ]} />
          <SelectField label="Local" value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })}
                       options={[
                         { value: 'Mercado Livre', label: 'Mercado Livre' },
                         { value: 'Amazon', label: 'Amazon' },
                         { value: 'Shopee', label: 'Shopee' },
                         { value: 'iFood', label: 'iFood' },
                         { value: 'Loggi', label: 'Loggi' },
                         { value: 'Correios', label: 'Correios' },
                         { value: 'Outro', label: 'Outro' },
                       ]} />
        </div>
        <TextField label="Observação" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })}
                   maxLength={200} counter />
        <ActionPillGroup>
          <ActionPill icon={Eraser} label="Limpar"  color="violet"  onClick={limpar} />
          <ActionPill icon={Camera} label="Foto"    color="ink" />
          <ActionPill icon={Send}   label="Receber" color="emerald" busy={receber.isPending} disabled={!canSubmit} onClick={() => receber.mutate()} />
        </ActionPillGroup>
      </Card>
      <PendentesEncomendas />
    </>
  );
}

function PendentesEncomendas() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const list = useQuery({
    queryKey: ['enc-pend', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/encomendas?condominioId=${condId}`)).data,
  });
  const pendentes = (list.data ?? []).filter((e: any) => e.status !== 2).slice(0, 5);
  if (pendentes.length === 0) return null;
  return (
    <Card>
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400 dark:text-white/40 font-semibold pb-1">Aguardando retirada</div>
      <ul className="space-y-1.5">
        {pendentes.map((e: any) => (
          <li key={e.id} className="flex items-center gap-2 text-xs">
            <Package className="size-3.5 text-amber-600" />
            <span className="flex-1 truncate text-ink-700 dark:text-white/70">{e.remetente || 'Sem remetente'}</span>
            <span className="text-ink-400 dark:text-white/40">{e.unidade ? `${e.unidade.bloco}${e.unidade.numero}` : '—'}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------- ENCOMENDAS · Entregar ---------------- */

function EncomendasEntregar() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const qc = useQueryClient();
  const [unidade, setUnidade] = useState('');
  const [ident, setIdent] = useState('');
  const [codigo, setCodigo] = useState('');

  const list = useQuery({
    queryKey: ['enc-entregar', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/encomendas?condominioId=${condId}`)).data,
  });

  const retirar = useMutation({
    mutationFn: (id: string) => api.post(`/api/portaria/encomendas/${id}/entregar`, { assinaturaUrl: null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enc-entregar'] }),
  });

  const filtrados = useMemo(() => {
    const lst = (list.data ?? []).filter((e: any) => e.status !== 2);
    return lst.filter((e: any) => {
      if (unidade && !(e.unidade && `${e.unidade.bloco}${e.unidade.numero}`.toLowerCase().includes(unidade.toLowerCase()))) return false;
      if (ident && !(e.descricao || '').toLowerCase().includes(ident.toLowerCase())) return false;
      if (codigo && !(e.codigoRastreio || '').toLowerCase().includes(codigo.toLowerCase())) return false;
      return true;
    });
  }, [list.data, unidade, ident, codigo]);

  return (
    <>
      <Card>
        <TextField label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)} maxLength={10} />
        <TextField label="Identificação Interna" value={ident} onChange={(e) => setIdent(e.target.value)} maxLength={20} counter rightSlot={<Tag className="size-3.5" />} />
        <TextField label="Código de Barras" value={codigo} onChange={(e) => setCodigo(e.target.value)} maxLength={40} counter rightSlot={<Barcode className="size-3.5" />} style={{ fontFamily: 'monospace' }} />
        <ActionPillGroup>
          <ActionPill icon={Eraser}        label="Limpar" color="violet" onClick={() => { setUnidade(''); setIdent(''); setCodigo(''); }} />
          <ActionPill icon={Search}        label="Buscar" color="blue" />
          <ActionPill icon={ClipboardList} label="Lista"  color="ink" />
        </ActionPillGroup>
      </Card>

      {filtrados.slice(0, 8).map((e: any) => (
        <div key={e.id} className="card-base px-3 py-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 grid place-items-center">
              <Package className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{e.remetente || 'Sem remetente'}</div>
              <div className="text-[11px] text-ink-500 dark:text-white/50 truncate">{e.transportadora || '—'} · {e.codigoRastreio || '—'}</div>
              <div className="text-[11px] text-ink-500 dark:text-white/50">
                {e.unidade ? `${e.unidade.bloco} ${e.unidade.numero}` : '—'} · {format(new Date(e.recebida), 'dd/MM HH:mm')}
              </div>
            </div>
          </div>
          <button
            onClick={() => retirar.mutate(e.id)}
            className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
          >
            Confirmar entrega
          </button>
        </div>
      ))}
      {filtrados.length === 0 && (
        <div className="card-base text-xs text-ink-400 dark:text-white/40 text-center py-6">
          Nenhuma encomenda pendente.
        </div>
      )}
    </>
  );
}

/* ---------------- Modal de detalhe da unidade ---------------- */

function UnidadeModal({ unidade, onClose }: { unidade: any; onClose: () => void }) {
  const titulo = `${unidade.nome} / ${unidade.unidade?.numero} - ${unidade.unidade?.bloco === 'A' ? 'Torre A' : unidade.unidade?.bloco === 'B' ? 'Torre B' : unidade.unidade?.bloco}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-2xl">
        <header className="px-5 py-4 border-b border-ink-200 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-ink-900 z-10">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-ink-700 dark:text-white/80" />
            <h2 className="font-display text-xl">{titulo}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button className="size-9 grid place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-white/5 text-ink-500 dark:text-white/60">
              <History className="size-4" />
            </button>
            <button onClick={onClose} className="size-9 grid place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-white/5 text-ink-500 dark:text-white/60">
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
          <Section icon={Users} title="Moradores">
            <PersonRow name={unidade.nome} role={unidade.proprietario ? 'Proprietário' : 'Morador'} />
            <PersonRow name="Beatriz" role="Smart Access | Morador" />
            <PersonRow name="Leonardo" role="Smart Access | Morador" />
          </Section>

          <Section icon={Car} title="Veículos | Bicicletas" extra={<Bike className="size-4 text-ink-400 dark:text-white/40" />}>
            <PersonRow icon={Car} name="Honda" role="Smart Access" extra={<span className="text-xs text-ink-500 dark:text-white/50">Placa: LXA3825 • Vinculado: {unidade.nome}</span>} />
          </Section>

          <Section icon={Briefcase} title="Colaboradores">
            <PersonRow name="Maria" role="Smart Access" />
            <PersonRow name="regina" role="Smart Access" />
          </Section>

          <Section icon={UsersRound} title="Visitantes">
            <PersonRow name="leo" role="Smart Access" extra={
              <div className="text-xs">
                <div className="text-ink-600 dark:text-white/60">Status: <span className="text-emerald-600 dark:text-emerald-400">Ativo</span></div>
                <button className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1">
                  <Megaphone className="size-3" /> Anunciar visitante
                </button>
              </div>
            } />
          </Section>

          <Section icon={Phone} title="Contatos"><Empty>Sem contatos cadastrados</Empty></Section>
          <Section icon={PawPrint} title="Pets"><Empty>Sem pets cadastrados</Empty></Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, extra, children }: any) {
  return (
    <section className="rounded-2xl border border-ink-200 dark:border-white/10 bg-ink-50/50 dark:bg-white/[0.02] p-4">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-ink-600 dark:text-white/70" />
          {title}
        </div>
        {extra}
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function PersonRow({ name, role, icon: Icon, extra }: any) {
  return (
    <div className="card-base px-3 py-2.5 flex items-center gap-3">
      <div className="size-10 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-400 dark:text-white/40">
        {Icon ? <Icon className="size-4" /> : <Camera className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs text-ink-500 dark:text-white/50">{role}</div>
        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
}

function Empty({ children }: any) {
  return <div className="text-xs text-ink-400 dark:text-white/40 text-center py-6">{children}</div>;
}

/* ---------------- Building blocks ---------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      'rounded-xl px-3.5 py-3 space-y-2.5 transition-all duration-200 shrink-0',
      // Light: branco fumê com borda alumínio
      'bg-white border border-ink-100',
      'shadow-[0_1px_2px_rgba(11,14,18,0.04),0_8px_24px_rgba(11,14,18,0.04)]',
      // Dark: vidro fumê (grafite translúcido) com hairline champagne sutil
      'dark:bg-ink-800/60 dark:backdrop-blur-md dark:border-champagne-400/[0.08]',
      'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.6),0_8px_32px_rgba(0,0,0,0.4)]',
      // Hover sutil — eleva
      'hover:shadow-[0_2px_4px_rgba(11,14,18,0.06),0_12px_32px_rgba(11,14,18,0.06)]',
      'dark:hover:border-champagne-400/[0.14]'
    )}>
      {children}
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg px-3 py-1.5 h-9 transition-all duration-150',
      'bg-ink-50 dark:bg-white/[0.03]',
      'border border-ink-200 dark:border-white/[0.08]',
      'hover:border-ink-300 dark:hover:border-champagne-400/30',
      'focus-within:border-champagne-400 dark:focus-within:border-champagne-400',
      'focus-within:bg-white dark:focus-within:bg-white/[0.05]',
      'focus-within:ring-2 focus-within:ring-champagne-400/15'
    )}>
      {children}
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/field">
      <span className="absolute -top-1.5 left-2.5 px-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ink-500 dark:text-champagne-400/70 bg-white dark:bg-ink-800 z-10 transition-colors group-focus-within/field:text-champagne-500 dark:group-focus-within/field:text-champagne-300">
        {label}
      </span>
      <div className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 h-10 transition-all duration-150',
        'bg-white dark:bg-ink-800/40',
        'border-2 border-ink-200 dark:border-white/[0.10]',
        'hover:border-ink-300 dark:hover:border-champagne-400/25',
        'focus-within:border-champagne-400 dark:focus-within:border-champagne-400',
        'focus-within:ring-2 focus-within:ring-champagne-400/15'
      )}>
        {children}
      </div>
    </div>
  );
}

function Select({ label, icon: Icon = ChevronDown }: { label: string; icon?: any }) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg px-3 py-1.5 h-9 text-sm cursor-pointer transition-all duration-150',
      'bg-ink-50 dark:bg-white/[0.03]',
      'border border-ink-200 dark:border-white/[0.08]',
      'hover:border-ink-300 dark:hover:border-champagne-400/30',
      'text-ink-400 dark:text-white/40'
    )}>
      <span className="flex-1">{label}</span>
      <Icon className="size-3.5" />
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center gap-1.5 pt-0.5">{children}</div>;
}

function ActionIcon({ children, color = 'ink', tone = 'solid', onClick }: any) {
  const cls: Record<string, string> = {
    emerald: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:text-emerald-400',
    blue:    'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:text-blue-400',
    violet:  'text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 dark:text-violet-400',
    rose:    'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-rose-400',
    ink:     'text-ink-700 dark:text-white/70 hover:bg-ink-100 dark:hover:bg-white/5',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'size-8 rounded-lg grid place-items-center transition',
        tone === 'solid' && 'border border-ink-200/70 dark:border-white/[0.08] bg-white dark:bg-ink-800/50',
        cls[color]
      )}
    >
      {children}
    </button>
  );
}

function Banner({ color, icon: Icon, children }: any) {
  const cls: Record<string, string> = {
    blue: 'bg-blue-50/80 dark:bg-blue-500/[0.08] text-blue-700 dark:text-blue-300 border-blue-100/80 dark:border-blue-500/20',
  };
  return (
    <div className={cn('-mx-3 -mt-3 mb-2 px-3 py-2 text-[11px] font-semibold tracking-wide border-b rounded-t-xl flex items-center gap-2', cls[color])}>
      <Icon className="size-3.5" /> {children}
    </div>
  );
}

function BottomBar() {
  return (
    <footer className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
      {/* Atalhos rápidos */}
      <div className={cn(
        'hidden md:flex items-center gap-1 pl-3 pr-2 py-2 rounded-full text-[10px] uppercase tracking-[0.18em] font-semibold',
        'bg-white/90 dark:bg-ink-800/80 backdrop-blur-md',
        'border border-ink-200/70 dark:border-champagne-400/[0.10]',
        'text-ink-600 dark:text-cream-100/70',
        'shadow-[0_4px_24px_rgba(11,14,18,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
      )}>
        <Kbd>F2</Kbd> Visitante
        <span className="text-ink-300 dark:text-cream-100/20 mx-1">·</span>
        <Kbd>F3</Kbd> Saída
        <span className="text-ink-300 dark:text-cream-100/20 mx-1">·</span>
        <Kbd>F4</Kbd> Encomenda
      </div>

      {/* Botão Botoeiras */}
      <button className={cn(
        'rounded-full pl-3.5 pr-5 py-2 flex items-center gap-2 text-xs font-bold tracking-wide transition-all',
        'bg-white/95 dark:bg-ink-800/90 backdrop-blur-md',
        'border border-ink-200/70 dark:border-champagne-400/[0.12]',
        'shadow-[0_4px_24px_rgba(11,14,18,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'hover:shadow-[0_8px_32px_rgba(11,14,18,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
        'text-ink-900 dark:text-cream-100 hover:-translate-y-0.5'
      )}>
        <span className="relative flex">
          <span className="absolute inset-0 size-1.5 rounded-full bg-champagne-400 animate-ping opacity-75" />
          <span className="relative size-1.5 rounded-full bg-champagne-400" />
        </span>
        <Power className="size-3.5 text-champagne-500 dark:text-champagne-400" />
        Botoeiras
      </button>
    </footer>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className={cn(
      'inline-flex items-center justify-center min-w-[24px] h-5 px-1 rounded font-mono text-[10px]',
      'bg-ink-100 text-ink-700 border border-ink-200',
      'dark:bg-white/[0.06] dark:text-cream-100/80 dark:border-white/[0.10]'
    )}>{children}</kbd>
  );
}
