import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { lerFiltros, normalizarFiltros, paraQueryString } from '@/lib/filtros'
import type { Filtros } from '@/types/api'

/**
 * Filtros do dashboard com a URL como fonte da verdade (mesmos nomes de parâmetros da API).
 * Devolve o objeto normalizado (estável enquanto a URL não muda) usado no React Query,
 * nas requisições e na assinatura do WebSocket.
 */
export function useFiltros(chave: string) {
  const { search } = useLocation()
  const navigate = useNavigate()

  // O objeto só muda quando a URL muda: chave de cache e assinatura estáveis.
  const filtros = useMemo(() => lerFiltros(new URLSearchParams(search), chave), [search, chave])

  const definir = useCallback(
    (novos: Filtros, opcoes?: { substituir?: boolean }) => {
      // Listas ficam legíveis na URL: tipo_projeto=api,web
      const qs = paraQueryString(normalizarFiltros(novos, chave))
      navigate({ search: qs ? `?${qs}` : '' }, { replace: opcoes?.substituir })
    },
    [navigate, chave],
  )

  const alterar = useCallback((parcial: Partial<Filtros>) => definir({ ...filtros, ...parcial }), [definir, filtros])

  const limpar = useCallback(() => navigate({ search: '' }), [navigate])

  return { filtros, definir, alterar, limpar }
}
