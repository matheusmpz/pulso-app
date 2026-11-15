import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { chaves } from '@/lib/query'
import type { Filtros } from '@/types/api'

/** Metadados do dashboard (cards visíveis, títulos e descrições). Quase não mudam. */
export function useDashboard(chave: string) {
  return useQuery({
    queryKey: chaves.dashboard(chave),
    queryFn: ({ signal }) => api.dashboard(chave, signal),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Resultados de todos os cards. Ao mudar filtros, mantém os dados anteriores na tela
 * (isPlaceholderData = true) para não piscar.
 */
export function useDashboardDados(chave: string, filtros: Filtros, habilitado = true) {
  return useQuery({
    queryKey: chaves.dados(chave, filtros),
    queryFn: ({ signal }) => api.dadosDashboard(chave, filtros, signal),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  })
}
