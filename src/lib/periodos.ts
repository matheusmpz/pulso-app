// Atalhos de período. Datas sempre em hora local (format yyyy-MM-dd), nunca toISOString.

import { endOfMonth, format, startOfMonth, startOfYear, subDays, subMonths } from 'date-fns'

import type { OpcaoSprint } from '@/types/api'

export function paraIso(data: Date): string {
  return format(data, 'yyyy-MM-dd')
}

export function deIso(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export interface Atalho {
  id: string
  rotulo: string
  intervalo: (hoje: Date) => { de: string; ate: string }
}

export const ATALHOS: Atalho[] = [
  { id: 'hoje', rotulo: 'Hoje', intervalo: (h) => ({ de: paraIso(h), ate: paraIso(h) }) },
  { id: '7d', rotulo: 'Últimos 7 dias', intervalo: (h) => ({ de: paraIso(subDays(h, 6)), ate: paraIso(h) }) },
  { id: '30d', rotulo: 'Últimos 30 dias', intervalo: (h) => ({ de: paraIso(subDays(h, 29)), ate: paraIso(h) }) },
  { id: '90d', rotulo: 'Últimos 90 dias', intervalo: (h) => ({ de: paraIso(subDays(h, 89)), ate: paraIso(h) }) },
  { id: 'mes', rotulo: 'Este mês', intervalo: (h) => ({ de: paraIso(startOfMonth(h)), ate: paraIso(h) }) },
  {
    id: 'mes-passado',
    rotulo: 'Mês passado',
    intervalo: (h) => {
      const m = subMonths(h, 1)
      return { de: paraIso(startOfMonth(m)), ate: paraIso(endOfMonth(m)) }
    },
  },
  { id: 'ano', rotulo: 'Este ano', intervalo: (h) => ({ de: paraIso(startOfYear(h)), ate: paraIso(h) }) },
]

/** Atalho que corresponde ao intervalo atual (para marcar como selecionado). */
export function atalhoAtivo(de: string | undefined, ate: string | undefined, hoje: Date = new Date()): string | null {
  if (!de || !ate) return null
  return (
    ATALHOS.find((a) => {
      const i = a.intervalo(hoje)
      return i.de === de && i.ate === ate
    })?.id ?? null
  )
}

/** Sprint pré-selecionada: a atual (a primeira, se houver várias); senão a mais recente. */
export function sprintPadrao(sprints: ReadonlyArray<OpcaoSprint>): OpcaoSprint | null {
  const atual = sprints.find((s) => s.atual)
  if (atual) return atual
  return [...sprints].sort((a, b) => b.inicio.localeCompare(a.inicio))[0] ?? null
}

export function rotuloSprint(s: Pick<OpcaoSprint, 'numero' | 'time_nome'>): string {
  return `Sprint ${s.numero} · ${s.time_nome}`
}
