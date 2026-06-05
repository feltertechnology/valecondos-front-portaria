import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, RefreshCw, LifeBuoy, Loader2, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const { setSession } = useAuth();
  const nav = useNavigate();

  useEffect(() => { document.title = 'Vale Acesso Tecnologia - Portaria'; }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      setErr('Resultado do captcha incorreto');
      setCaptcha(makeCaptcha());
      setCaptchaInput('');
      return;
    }
    setBusy(true); setErr(null);
    try {
      const { data } = await api.post('/api/auth/login', { email, senha });
      setSession(data.accessToken, data.refreshToken, data.user);
      nav('/');
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Falha no login');
      setCaptcha(makeCaptcha()); setCaptchaInput('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.4fr_1fr] bg-navy-950 text-cream-100">
      {/* Esquerda: cinematografica */}
      <aside className="relative hidden lg:flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #15A8F5 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* glow gold */}
        <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-gold-500/[0.06] blur-3xl" />

        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center">
            <img src="/logo.png" alt="Vale Acesso Tecnologia" className="h-20 w-auto object-contain" draggable={false} />
            <div className="ml-4 pl-4 border-l border-cyan-500/15 self-stretch flex items-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">Smart Access - Portaria</div>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="font-display text-6xl leading-tight tracking-tight text-cream-100">
              Portaria<br />
              <span className="text-gold-400 italic">redefinida.</span>
            </h1>
            <p className="mt-5 text-cream-200/70 text-sm leading-relaxed max-w-sm">
              Controle de acesso, encomendas e visitantes com a discricao e a
              sofisticacao que seu condominio merece.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              <Stat label="Portaria" value="24h" />
              <Stat label="Visitantes" value="QR" />
              <Stat label="Acesso" value="RFID" />
            </div>
          </div>

          <div className="text-[11px] tracking-[0.2em] uppercase text-cream-200/30">
            (c) {new Date().getFullYear()} Vale Acesso Tecnologia - Tecnologia em Controle de Acesso
          </div>
        </div>
      </aside>

      {/* Direita: formulario */}
      <main className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-navy-950">
        <div className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.3em] text-cream-200/40">
          v1.0.1 - build {new Date().getFullYear()}.05
        </div>

        <div className="max-w-sm w-full mx-auto animate-fadeIn">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src="/logo.png" alt="Vale Acesso Tecnologia" className="h-16 w-auto object-contain" draggable={false} />
          </div>

          <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400/80 mb-2">Portaria</div>
          <h2 className="font-display text-4xl leading-tight text-cream-100">Bem-vindo</h2>
          <p className="text-cream-200/50 text-sm mt-2 leading-relaxed">
            Acesse uma experiencia condominial mais elegante,
            integrada e segura.
          </p>

          <form onSubmit={submit} className="mt-10 space-y-5">
            <Field label="Usuario" icon={User}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                autoComplete="username"
                className="bg-transparent flex-1 outline-none placeholder:text-cream-200/20 text-sm text-cream-100"
                placeholder="seu.email@condominio.com"
              />
            </Field>

            <Field label="Senha" icon={Lock}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={senha} onChange={(e) => setSenha(e.target.value)} required
                autoComplete="current-password"
                className="bg-transparent flex-1 outline-none placeholder:text-cream-200/20 text-sm text-cream-100"
                placeholder="********"
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)}
                      className="text-cream-200/40 hover:text-gold-400 transition" aria-label="Mostrar senha">
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </Field>

            <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
              <div className="rounded-xl border border-gold-500/20 bg-navy-900/70 px-4 py-3 font-mono text-sm select-none text-cream-100">
                {captcha.a} + {captcha.b} = ?
              </div>
              <Field label="Resultado" compact>
                <input inputMode="numeric" value={captchaInput}
                       onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))} required
                       className="bg-transparent flex-1 outline-none text-sm tracking-widest text-cream-100"
                       placeholder="-" />
                <button type="button" className="text-cream-200/40 hover:text-gold-400 transition"
                        onClick={() => { setCaptcha(makeCaptcha()); setCaptchaInput(''); }}
                        aria-label="Regenerar captcha">
                  <RefreshCw className="size-4" />
                </button>
              </Field>
            </div>

            {err && (
              <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                <AlertCircle className="size-4" /> {err}
              </div>
            )}

            <button disabled={busy}
                    className="w-full rounded-xl bg-gold-500 text-navy-950 font-semibold tracking-wider uppercase text-sm py-3.5 hover:bg-gold-400 transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-gold-500/20">
              {busy && <Loader2 className="size-4 animate-spin" />}
              Conectar
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button"
                      onClick={() => { setCaptcha(makeCaptcha()); setCaptchaInput(''); }}
                      className="rounded-xl border border-gold-500/15 hover:bg-gold-500/[0.06] text-cream-200/70 hover:text-gold-400 text-xs py-2.5 inline-flex items-center justify-center gap-2 transition">
                <RefreshCw className="size-3.5" /> Atualizar
              </button>
              <button type="button"
                      className="rounded-xl border border-gold-500/15 hover:bg-gold-500/[0.06] text-cream-200/70 hover:text-gold-400 text-xs py-2.5 inline-flex items-center justify-center gap-2 transition">
                <LifeBuoy className="size-3.5" /> Suporte
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-gold-500/10 text-[11px] text-cream-200/40 leading-relaxed">
            Acesso restrito aos operadores cadastrados pelo cliente.
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, icon: Icon, children, compact = false }: any) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400/70">{label}</span>
      <div className={`mt-1.5 flex items-center gap-3 rounded-xl border border-gold-500/15 bg-navy-900/40 hover:bg-navy-900/60 focus-within:border-gold-500/50 focus-within:bg-navy-900/70 transition px-4 ${compact ? 'py-2.5' : 'py-3'}`}>
        {Icon && <Icon className="size-4 text-gold-400/60" />}
        {children}
      </div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold-500/15 bg-navy-900/40 p-3">
      <div className="text-lg font-display font-semibold text-gold-400">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-cream-200/50 mt-0.5">{label}</div>
    </div>
  );
}



