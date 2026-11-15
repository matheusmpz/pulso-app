// Grade de 12 colunas: tamanho de cada card (span) e encaixe em linhas que somam 12.
// Fonte única para ajustar o layout dos dashboards.

import type { TipoCard } from '@/types/api'

export const COLUNAS = 12

/** Span padrão por tipo. */
export const SPAN_POR_TIPO: Record<TipoCard, number> = {
  numero: 3,
  radial: 3,
  donut: 4,
  barras: 6,
  barras_agrupadas: 6,
  lista: 6,
  linhas: 8,
  area: 8,
}

/** Exceções por código de card. */
export const SPAN_POR_CARD: Record<string, number> = {
  // Projetos
  'proj-04': 8,
  'proj-05': 4,
  'proj-06': 12,
  'proj-07': 4,
  'proj-08': 4,
  'proj-09': 4,
  'proj-10': 6,
  'proj-11': 6,
  'proj-12': 6,
  'proj-13': 6,
  'proj-14': 6,
  'proj-15': 6,
  // Vendas
  'ven-05': 6,
  'ven-06': 6,
  'ven-07': 4,
  'ven-08': 4,
  'ven-09': 4,
  'ven-10': 8,
  'ven-11': 4,
  'ven-12': 4,
  'ven-13': 8,
  'ven-14': 12,
  // IA
  'ia-05': 8,
  'ia-06': 6,
  'ia-07': 4,
  'ia-08': 6,
  'ia-09': 6,
  'ia-10': 6,
  'ia-11': 6,
  'ia-12': 6,
}

/** Quantos cards à frente o algoritmo olha para preencher uma linha. */
const JANELA = 4

export interface CardLayout {
  codigo: string
  tipo: TipoCard
}

export interface CelulaGrade<C extends CardLayout = CardLayout> {
  card: C
  span: number
}

export function spanDoCard(card: CardLayout): number {
  const span = SPAN_POR_CARD[card.codigo] ?? SPAN_POR_TIPO[card.tipo] ?? 6
  return Math.min(Math.max(span, 1), COLUNAS)
}

/**
 * Monta as linhas da grade mantendo a ordem da API e fazendo pequenas trocas
 * só para preencher a linha. Sobras são distribuídas da esquerda para a direita.
 */
export function montarLinhas<C extends CardLayout>(cards: ReadonlyArray<C>): CelulaGrade<C>[][] {
  const fila = cards.map((card) => ({ card, span: spanDoCard(card) }))
  const linhas: CelulaGrade<C>[][] = []

  while (fila.length > 0) {
    const primeiro = fila.shift()!
    const linha: CelulaGrade<C>[] = [primeiro]
    let livre = COLUNAS - primeiro.span

    while (livre > 0 && fila.length > 0) {
      // (a) a ordem da API tem prioridade
      if (fila[0].span <= livre) {
        const proximo = fila.shift()!
        linha.push(proximo)
        livre -= proximo.span
        continue
      }
      // (b) janela: exato primeiro, senão o primeiro que cabe
      const janela = fila.slice(0, JANELA)
      let indice = janela.findIndex((c) => c.span === livre)
      if (indice < 0) indice = janela.findIndex((c) => c.span <= livre)
      if (indice < 0) break
      const [escolhido] = fila.splice(indice, 1)
      linha.push(escolhido)
      livre -= escolhido.span
    }

    // Distribui as colunas livres uma a uma, da esquerda para a direita
    for (let i = 0; livre > 0; i = (i + 1) % linha.length) {
      linha[i] = { ...linha[i], span: linha[i].span + 1 }
      livre--
    }

    linhas.push(linha)
  }

  return linhas
}

/** Classes estáticas (o Tailwind não enxerga nomes de classe dinâmicos). */
export const COL_SPAN_LG: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
}

/** Em md (2 colunas): span ≥ 8 ocupa as duas. */
export function classeSpan(span: number): string {
  return `${COL_SPAN_LG[span] ?? 'lg:col-span-12'} ${span >= 8 ? 'md:col-span-2' : 'md:col-span-1'}`
}
