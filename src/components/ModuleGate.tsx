import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useActivePortariaModules } from '../lib/moduleAccess';

export function ModuleGate({ moduleKey, children }: { moduleKey: string; children: ReactNode }) {
  const modules = useActivePortariaModules();
  if (modules.isLoading) return <div className="text-sm text-slate-400">Carregando permissao...</div>;
  if (!modules.isAllowed(moduleKey)) {
    return (
      <div className="card card-pad max-w-xl">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-rose-500/10 text-rose-300">
            <Lock className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Funcao bloqueada</h1>
            <p className="mt-1 text-sm text-slate-400">
              Esta funcao foi desativada para esta portaria. Sindico, administradora ou Vale Acesso podem reativar em Funcoes.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
