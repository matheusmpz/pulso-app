// Resolução de cor por dashboard e por série/fatia.
// Os componentes nunca citam emerald/violet/orange: usam só os tokens --dash, --dash-1..4 e --ref.

import type { Serie } from '@/types/api'

export const CORES_VALIDAS = ['emerald', 'violet', 'orange'] as const
export type CorDashboard = (typeof CORES_VALIDAS)[number]

const COR_PADRAO: Record<string, CorDashboard> = { vendas: 'emerald', projetos: 'violet', ia: 'orange' }

function corValida(cor: unknown): cor is CorDashboard {
  return typeof cor === 'string' && (CORES_VALIDAS as readonly string[]).includes(cor)
}

/** 1) `cor` da API, se válida · 2) mapa padrão por chave · 3) violet. */
export function corDoDashboard(dashboard: { chave: string; cor?: string | null }): CorDashboard {
  if (corValida(dashboard.cor)) return dashboard.cor
  return COR_PADRAO[dashboard.chave] ?? 'violet'
}

/* ---------- Séries ---------- */

export const COR_DASH = 'var(--dash)'
export const COR_REF = 'var(--ref)'
export const RAMPA = ['var(--dash-1)', 'var(--dash-2)', 'var(--dash-3)', 'var(--dash-4)'] as const
const EXTRAS = ['var(--extra-1)', 'var(--extra-2)', 'var(--extra-3)'] as const

/** Séries de referência: cor neutra e sempre com segundo código visual (tracejado/hachura). */
const REFERENCIA = new Set(['ideal', 'estimado', 'planejado', 'meta', 'limite', 'referencia', 'previsto'])

/** Séries ordinais, do menor ao maior. */
const ORDINAIS: ReadonlyArray<readonly string[]> = [
  ['pequena', 'media', 'grande'],
  ['baixa', 'media', 'alta'],
]

/** Séries secundárias conhecidas (a cor segue a entidade, não a posição). */
const SECUNDARIAS = new Set(['custo_ia', 'media_movel', 'ponderado'])

export function ehReferencia(chave: string): boolean {
  return REFERENCIA.has(chave)
}

export interface EstiloSerie {
  cor: string
  referencia: boolean
}

/**
 * Cor de uma série. A regra usa a chave da série (entidade) e, só como último recurso,
 * a posição dela na lista completa de séries do card, que é fixa por card.
 */
export function estiloDaSerie(chave: string, series: ReadonlyArray<Serie>): EstiloSerie {
  if (ehReferencia(chave)) return { cor: COR_REF, referencia: true }

  const chaves = series.map((s) => s.chave)
  for (const ordem of ORDINAIS) {
    if (ordem.includes(chave) && chaves.every((c) => ordem.includes(c) || ehReferencia(c))) {
      // pequena/média/grande → --dash-1 → --dash-3
      return { cor: RAMPA[ordem.indexOf(chave)], referencia: false }
    }
  }

  if (SECUNDARIAS.has(chave)) return { cor: 'var(--dash-3)', referencia: false }

  const principais = chaves.filter((c) => !ehReferencia(c) && !SECUNDARIAS.has(c))
  const indice = principais.indexOf(chave)
  const ciclo = [COR_DASH, 'var(--dash-3)', 'var(--dash-1)', 'var(--dash-4)']
  return { cor: ciclo[Math.max(0, indice) % ciclo.length], referencia: false }
}

/* ---------- Fatias de donut ---------- */

export type EstadoFatia = 'concluida' | 'andamento' | 'revisao' | 'aberta' | 'recusada'

const ESTADOS: Record<string, EstadoFatia> = {
  concluida: 'concluida',
  aprovada: 'concluida',
  em_andamento: 'andamento',
  em_revisao: 'revisao',
  aberta: 'aberta',
  pendente: 'aberta',
  recusada: 'recusada',
}

export function estadoDaFatia(chave: string | undefined): EstadoFatia | null {
  return chave && ESTADOS[chave] ? ESTADOS[chave] : null
}

/** Cor da fatia: estado reservado pela chave; senão rampa do dashboard; da 5ª em diante, cinzas. */
export function corDaFatia(chave: string | undefined, indice: number): string {
  const estado = estadoDaFatia(chave)
  if (estado) return `var(--estado-${estado})`
  if (indice < RAMPA.length) return RAMPA[indice]
  return EXTRAS[(indice - RAMPA.length) % EXTRAS.length]
}
