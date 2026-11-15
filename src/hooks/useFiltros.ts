import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { escreverFiltros, lerFiltros, normalizarFiltros } from '@/lib/filtros'
import type { Filtros } from '@/types/api'

/**
 * Filtros do dashboard com a URL como fonte da verdade.
 * Devolve o objeto normalizado (estável enquanto a URL não muda) usado no React Query,
 * nas requisições e na assinatura do WebSocket.
 */
export function useFiltros(chave: string) {
  const [params, setParams] = useSearchParams()
  const texto = params.toString()

  // O objeto só muda quando a URL muda: chave de cache e assinatura estáveis.
  const filtros = useMemo(() => lerFiltros(new URLSearchParams(texto), chave), [texto, chave])

  const definir = useCallback(
    (novos: Filtros, opcoes?: { substituir?: boolean }) => {
      setParams(escreverFiltros(normalizarFiltros(novos, chave)), { replace: opcoes?.substituir })
    },
    [setParams, chave],
  )

  const alterar = useCallback((parcial: Partial<Filtros>) => definir({ ...filtros, ...parcial }), [definir, filtros])

  const limpar = useCallback(() => setParams(new URLSearchParams()), [setParams])

  return { filtros, definir, alterar, limpar }
}
