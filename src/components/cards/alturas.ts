import type { TipoCard } from '@/types/api'

/** Altura mínima da área de conteúdo por tipo (px). */
export const ALTURA_POR_TIPO: Record<TipoCard, number> = {
  numero: 140,
  radial: 150,
  donut: 280,
  barras: 300,
  barras_agrupadas: 300,
  lista: 300,
  linhas: 320,
  area: 320,
}
