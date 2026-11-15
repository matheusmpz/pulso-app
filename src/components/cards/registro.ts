import type { ComponentType } from 'react'

import { ListaCard } from '@/components/cards/tipos/ListaCard'
import { NumeroCard } from '@/components/cards/tipos/NumeroCard'
import type { DadosPorTipo, TipoCard } from '@/types/api'

type Registro = { [T in TipoCard]?: ComponentType<{ dados: DadosPorTipo[T]; codigo: string }> }

/** Um componente por tipo de card. */
export const REGISTRO_TIPOS: Registro = {
  numero: NumeroCard,
  lista: ListaCard,
}
