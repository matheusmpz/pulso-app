import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { substituirCard } from '@/lib/cache-cards'
import type { Filtros } from '@/types/api'

/**
 * "Tentar novamente" de um card com erro: busca só aquele card (GET /cards/:codigo/dados)
 * e o substitui no cache do dashboard.
 */
export function useAtualizarCard(chave: string, filtros: Filtros) {
  const queryClient = useQueryClient()
  const [pendentes, setPendentes] = useState<ReadonlySet<string>>(new Set())

  const atualizar = useCallback(
    async (codigo: string) => {
      setPendentes((atual) => new Set(atual).add(codigo))
      try {
        const { card } = await api.dadosCard(codigo, filtros)
        substituirCard(queryClient, chave, filtros, card)
      } catch (erro) {
        toast.error(erro instanceof Error ? erro.message : 'Não foi possível atualizar o card.')
      } finally {
        setPendentes((atual) => {
          const novo = new Set(atual)
          novo.delete(codigo)
          return novo
        })
      }
    },
    [queryClient, chave, filtros],
  )

  return { atualizar, pendentes }
}
