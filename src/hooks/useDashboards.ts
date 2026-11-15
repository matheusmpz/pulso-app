import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { ordenarDashboards } from '@/lib/dashboards'
import { chaves } from '@/lib/query'

/** Dashboards visíveis ao perfil (GET /dashboards), já na ordem de exibição. */
export function useDashboards() {
  return useQuery({
    queryKey: chaves.dashboards,
    queryFn: ({ signal }) => api.dashboards(signal),
    select: (dados) => ordenarDashboards(dados.dashboards),
    staleTime: 5 * 60_000,
  })
}
