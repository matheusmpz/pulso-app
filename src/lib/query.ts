// Cliente do TanStack Query e chaves de cache (fonte única).

import { QueryClient } from '@tanstack/react-query'

import type { Filtros } from '@/types/api'
import { ehApiError } from '@/lib/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Rede de segurança junto com o WebSocket
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // Erros 4xx não melhoram com nova tentativa
      retry: (tentativas, erro) => {
        if (ehApiError(erro) && erro.status >= 400 && erro.status < 500) return false
        return tentativas < 2
      },
    },
  },
})

export const chaves = {
  me: ['me'] as const,
  dashboards: ['dashboards'] as const,
  dashboard: (chave: string) => ['dashboard', chave] as const,
  dados: (chave: string, filtros: Filtros) => ['dados', chave, filtros] as const,
  dadosDoDashboard: (chave: string) => ['dados', chave] as const,
  opcoes: ['opcoes'] as const,
}
