// Chaves extras que a API manda junto dos itens (só para tooltip/rótulo).

import { formatarCelula, numero, percentual } from '@/lib/formatadores'

const ROTULOS: Record<string, string> = {
  desvio: 'Desvio',
  projeto: 'Projeto',
  n: 'Quantidade',
  percentual: 'Percentual',
  percentual_ia: 'Peso da IA',
}

export function rotuloExtra(chave: string): string {
  if (ROTULOS[chave]) return ROTULOS[chave]
  const texto = chave.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function valorExtra(chave: string, valor: unknown): string {
  if (typeof valor === 'number') return chave.startsWith('percentual') ? percentual(valor) : numero(valor)
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (typeof valor === 'string') return formatarCelula(valor)
  return '—'
}

/** Linhas "Rótulo: valor" a partir de um objeto extra. */
export function linhasExtra(extra: Record<string, unknown>, ignorar: ReadonlySet<string> = new Set()) {
  return Object.entries(extra)
    .filter(([chave]) => !ignorar.has(chave) && !chave.endsWith('_id'))
    .map(([chave, valor]) => ({ chave, texto: `${rotuloExtra(chave)}: ${valorExtra(chave, valor)}` }))
}
