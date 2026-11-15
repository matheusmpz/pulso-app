// Atualização de um único card no cache do React Query.
// Mantém a identidade dos outros cards para que só o card alterado redesenhe (React.memo).

import type { QueryClient } from '@tanstack/react-query'

import type { CardResultado, Filtros, RespostaDadosDashboard } from '@/types/api'
import { chaves } from '@/lib/query'

export function substituirCard(
  queryClient: QueryClient,
  chave: string,
  filtros: Filtros,
  novo: CardResultado,
): boolean {
  let aplicado = false
  queryClient.setQueryData<RespostaDadosDashboard>(chaves.dados(chave, filtros), (antigo) => {
    if (!antigo) return antigo
    const indice = antigo.cards.findIndex((c) => c.codigo === novo.codigo)
    if (indice < 0) return antigo
    aplicado = true
    const cards = antigo.cards.slice()
    cards[indice] = novo
    return { ...antigo, cards }
  })
  return aplicado
}
