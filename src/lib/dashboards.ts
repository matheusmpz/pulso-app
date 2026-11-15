// Ícones e ordem dos dashboards (mapa único).

import { CircleDollarSign, FolderKanban, LayoutDashboard, Sparkles, type LucideIcon } from 'lucide-react'

const ICONES: Record<string, LucideIcon> = {
  vendas: CircleDollarSign,
  projetos: FolderKanban,
  ia: Sparkles,
}

export function iconeDoDashboard(chave: string): LucideIcon {
  return ICONES[chave] ?? LayoutDashboard
}

/** Ordem dos tiles e do menu. Chaves desconhecidas vão ao final, na ordem da API. */
export const ORDEM_DASHBOARDS = ['vendas', 'projetos', 'ia']

export function ordenarDashboards<T extends { chave: string }>(lista: ReadonlyArray<T>): T[] {
  const posicao = (chave: string) => {
    const i = ORDEM_DASHBOARDS.indexOf(chave)
    return i < 0 ? ORDEM_DASHBOARDS.length : i
  }
  return lista
    .map((d, i) => ({ d, i }))
    .sort((a, b) => posicao(a.d.chave) - posicao(b.d.chave) || a.i - b.i)
    .map(({ d }) => d)
}
