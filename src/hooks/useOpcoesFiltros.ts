import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { chaves } from '@/lib/query'

/** Opções dos seletores de filtro (GET /filtros/opcoes): uma vez, com cache longo. */
export function useOpcoesFiltros() {
  return useQuery({
    queryKey: chaves.opcoes,
    queryFn: ({ signal }) => api.opcoesFiltros(signal),
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })
}
