// Constantes comuns dos gráficos.

import { useId } from 'react'

/* ---------- Eixos e grade ---------- */

/** Eixos sem linha e sem tracinhos, texto 12px em muted-foreground. */
export const PROPS_EIXO = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 12, fill: 'var(--muted-foreground)' },
  tickMargin: 8,
} as const

/** Grade só horizontal, traço fino. */
export const PROPS_GRADE = {
  vertical: false,
  stroke: 'var(--border)',
  strokeDasharray: '0',
} as const

export const TRACO_REFERENCIA = '6 4'

/** Id seguro para usar em url(#...) dentro do SVG. */
export function useIdSvg(prefixo: string): string {
  return `${prefixo}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
}

/** Largura do eixo Y conforme a unidade (moeda compacta é mais larga). */
export function larguraEixoY(unidade?: string | null): number {
  return unidade === 'R$' ? 76 : unidade === 'tokens' ? 64 : 52
}

/** Contagens (todos os valores inteiros) não ganham ticks decimais no eixo. */
export function somenteInteiros(valores: ReadonlyArray<unknown>): boolean {
  return valores.every((v) => typeof v !== 'number' || Number.isInteger(v))
}
