import { memo, type ComponentType } from 'react'

import { BarrasAgrupadasCard } from '@/components/cards/tipos/BarrasAgrupadasCard'
import { BarrasCard } from '@/components/cards/tipos/BarrasCard'
import { DonutCard } from '@/components/cards/tipos/DonutCard'
import { ListaCard } from '@/components/cards/tipos/ListaCard'
import { NumeroCard } from '@/components/cards/tipos/NumeroCard'
import { RadialCard } from '@/components/cards/tipos/RadialCard'
import { AreaCard, LinhasCard } from '@/components/cards/tipos/SerieTemporalCard'
import type { DadosPorTipo, TipoCard } from '@/types/api'

type Registro = { [T in TipoCard]?: ComponentType<{ dados: DadosPorTipo[T]; codigo: string }> }

/** Um componente por tipo de card. React.memo: a atualização de um card não redesenha os outros. */
export const REGISTRO_TIPOS: Registro = {
  numero: memo(NumeroCard),
  radial: memo(RadialCard),
  linhas: memo(LinhasCard),
  area: memo(AreaCard),
  barras: memo(BarrasCard),
  barras_agrupadas: memo(BarrasAgrupadasCard),
  donut: memo(DonutCard),
  lista: memo(ListaCard),
}
