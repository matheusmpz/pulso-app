// Quais filtros cada dashboard mostra (configuração declarativa).
// A barra de filtros é um único componente que lê esta configuração.

import type { Filtros } from '@/types/api'

export type FiltroId = 'escopo' | 'periodo' | 'tipo_projeto' | 'status_projeto' | 'origem_lead' | 'modelo'

const FILTROS_POR_DASHBOARD: Record<string, FiltroId[]> = {
  projetos: ['escopo', 'periodo', 'tipo_projeto', 'status_projeto'],
  ia: ['escopo', 'periodo', 'tipo_projeto', 'status_projeto', 'modelo'],
  vendas: ['periodo', 'tipo_projeto', 'origem_lead'],
}

/** Dashboard desconhecido: só o período (vale em todos). */
const PADRAO: FiltroId[] = ['periodo']

export function filtrosDoDashboard(chave: string): FiltroId[] {
  return FILTROS_POR_DASHBOARD[chave] ?? PADRAO
}

const PARAMETROS: Record<FiltroId, (keyof Filtros)[]> = {
  escopo: ['escopo', 'id'],
  periodo: ['de', 'ate'],
  tipo_projeto: ['tipo_projeto'],
  status_projeto: ['status_projeto'],
  origem_lead: ['origem_lead'],
  modelo: ['modelo'],
}

/** Parâmetros da API que valem no dashboard. */
export function parametrosDoDashboard(chave: string): Set<keyof Filtros> {
  return new Set(filtrosDoDashboard(chave).flatMap((f) => PARAMETROS[f]))
}
