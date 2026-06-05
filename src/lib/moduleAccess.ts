import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { useAuth } from './auth';

export function useActivePortariaModules() {
  const { user } = useAuth();
  const condId = user?.condominioId;
  const query = useQuery({
    queryKey: ['active-modules', 'portaria', condId],
    enabled: !!condId,
    queryFn: async () => (await api.get(`/api/modulos/ativos?condominioId=${condId}&ambiente=portaria`)).data,
    staleTime: 30_000,
  });

  const active = useMemo(() => new Set<string>(query.data?.active ?? []), [query.data]);

  function isAllowed(moduleKey?: string) {
    if (!moduleKey || !condId || query.isLoading) return true;
    return active.has(moduleKey);
  }

  return { ...query, active, isAllowed };
}
