// Regras de exibição comuns aos cards (sem cálculo de negócio).

import type {
  CardResultado,
  DadosBarras,
  DadosBarrasAgrupadas,
  DadosDonut,
  DadosLista,
  DadosSerieTemporal,
  TipoCard,
} from '@/types/api'
import { intervalo, numero } from '@/lib/formatadores'

/**
 * Unidade dos donuts: a API ainda não envia `unidade` no donut.
 * Quando enviar, `dados.unidade` tem prioridade sobre este mapa.
 */
const UNIDADE_DONUT: Record<string, string> = {
  'ia-07': 'R$',
}

export function unidadeDoDonut(codigo: string, dados: DadosDonut): string | undefined {
  return dados.unidade ?? UNIDADE_DONUT[codigo]
}

/** "Vazio" é decidido pelo formato de cada tipo. Número/radial nunca são vazios (null = "—"). */
export function cardVazio(tipo: TipoCard, dados: unknown): boolean {
  if (!dados || typeof dados !== 'object') return false
  switch (tipo) {
    case 'linhas':
    case 'area':
      return ((dados as DadosSerieTemporal).pontos ?? []).length === 0
    case 'barras':
      return ((dados as DadosBarras).itens ?? []).length === 0
    case 'barras_agrupadas':
      return ((dados as DadosBarrasAgrupadas).itens ?? []).length === 0
    case 'donut': {
      const d = dados as DadosDonut
      return (d.fatias ?? []).length === 0 || d.total === 0
    }
    case 'lista':
      return ((dados as DadosLista).linhas ?? []).length === 0
    default:
      return false
  }
}

interface SprintExtra {
  numero?: number
  inicio?: string
  fim?: string
}

function sprintDoExtra(extra: unknown): SprintExtra | null {
  if (!extra || typeof extra !== 'object' || !('sprint' in extra)) return null
  const sprint = (extra as { sprint: unknown }).sprint
  return sprint && typeof sprint === 'object' ? (sprint as SprintExtra) : null
}

/** Subtítulo vindo dos dados (ex.: proj-06: "Sprint 5 · 08/11 – 21/11/2026"). */
export function subtituloDoCard(card: CardResultado | undefined): string | null {
  if (!card?.dados || (card.tipo !== 'linhas' && card.tipo !== 'area')) return null
  const sprint = sprintDoExtra((card.dados as DadosSerieTemporal).extra)
  if (!sprint || sprint.numero === undefined) return null
  const periodo = sprint.inicio && sprint.fim ? ` · ${intervalo(sprint.inicio, sprint.fim)}` : ''
  return `Sprint ${sprint.numero}${periodo}`
}

/** O card de série temporal tem `extra.sprint` explicitamente null? (proj-06 sem sprint) */
export function semSprint(card: CardResultado | undefined): boolean {
  if (!card?.dados || (card.tipo !== 'linhas' && card.tipo !== 'area')) return false
  const extra = (card.dados as DadosSerieTemporal).extra
  return !!extra && typeof extra === 'object' && 'sprint' in extra && extra.sprint === null
}

/** Badge do cabeçalho: `total` das barras quando não é null (ex.: proj-12: "15 no total"). */
export function badgeDoCard(card: CardResultado | undefined): string | null {
  if (!card?.dados || card.tipo !== 'barras') return null
  const total = (card.dados as DadosBarras).total
  return total === null || total === undefined ? null : `${numero(total)} no total`
}
