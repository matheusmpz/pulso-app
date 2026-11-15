import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { ContextoTempoReal } from '@/hooks/tempo-real-contexto'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { substituirCard } from '@/lib/cache-cards'
import { WS_URL } from '@/lib/config'
import { chaves } from '@/lib/query'
import { emitirRealce } from '@/lib/realce'
import { ConexaoTempoReal } from '@/lib/tempo-real'

/** Intervalo mínimo entre conferências de sessão quando o WebSocket não abre. */
const INTERVALO_CONFERIR_SESSAO = 15_000

/**
 * Dono da conexão de tempo real da aba. Recria a conexão quando o token muda
 * e a fecha no logout. Atualizações substituem só o card afetado no cache.
 */
export function TempoRealProvider({ children }: { children: ReactNode }) {
  const { token, expirarSessao } = useAuth()
  const queryClient = useQueryClient()
  const [conexao, setConexao] = useState<ConexaoTempoReal | null>(null)
  const ultimaConferencia = useRef(0)

  useEffect(() => {
    if (!token) return
    const nova = new ConexaoTempoReal({
      url: WS_URL,
      token,
      aoAssinado: ({ dashboard, filtros }) => {
        // Invalida uma vez: cobre eventos entre o REST e a assinatura (e a volta de uma queda).
        queryClient.invalidateQueries({ queryKey: chaves.dados(dashboard, filtros), exact: true })
      },
      aoCardAtualizado: ({ dashboard, filtros }, card) => {
        if (substituirCard(queryClient, dashboard, filtros, card)) emitirRealce(card.codigo)
      },
      aoSessaoExpirada: expirarSessao,
      aoFalhaAoConectar: () => {
        // O handshake recusado (401) não é distinguível de API fora do ar: confere pelo REST.
        const agora = Date.now()
        if (agora - ultimaConferencia.current < INTERVALO_CONFERIR_SESSAO) return
        ultimaConferencia.current = agora
        api.me().catch(() => undefined) // um 401 aqui dispara o logout global
      },
    })
    setConexao(nova)

    const aoFicarOnline = () => nova.tentarAgora()
    window.addEventListener('online', aoFicarOnline)
    return () => {
      window.removeEventListener('online', aoFicarOnline)
      nova.encerrar()
      setConexao(null)
    }
  }, [token, queryClient, expirarSessao])

  return <ContextoTempoReal.Provider value={conexao}>{children}</ContextoTempoReal.Provider>
}
