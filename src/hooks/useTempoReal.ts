import { useContext, useEffect, useSyncExternalStore } from 'react'

import { ContextoTempoReal } from '@/hooks/tempo-real-contexto'
import type { EstadoTempoReal } from '@/lib/tempo-real'
import type { Filtros } from '@/types/api'

const DESCONECTADO: EstadoTempoReal = { status: 'desconectado', erro: null }
const nada = () => () => {}

/**
 * Assina o dashboard com os filtros atuais e reassina quando mudam.
 * Ao sair da tela, cancela a assinatura (a conexão fecha se nenhuma outra tela assinar).
 */
export function useTempoReal(chave: string, filtros: Filtros, habilitado = true): EstadoTempoReal {
  const conexao = useContext(ContextoTempoReal)

  useEffect(() => {
    if (!conexao || !habilitado) return
    conexao.assinar(chave, filtros)
    return () => conexao.cancelarAssinatura()
  }, [conexao, chave, filtros, habilitado])

  return useSyncExternalStore(
    conexao?.inscrever ?? nada,
    conexao?.obterEstado ?? (() => DESCONECTADO),
    () => DESCONECTADO,
  )
}
