import { describe, expect, it } from 'vitest'

import { ATALHOS, atalhoAtivo, paraIso, rotuloSprint, sprintPadrao } from '@/lib/periodos'

const hoje = new Date(2026, 10, 15, 23, 30) // 15/11/2026 às 23:30 (à noite não pode virar o dia)
const atalho = (id: string) => ATALHOS.find((a) => a.id === id)!.intervalo(hoje)

describe('atalhos de período', () => {
  it('usa a data local, sem erro de fuso à noite', () => {
    expect(paraIso(hoje)).toBe('2026-11-15')
    expect(atalho('hoje')).toEqual({ de: '2026-11-15', ate: '2026-11-15' })
  })
  it('intervalos', () => {
    expect(atalho('30d')).toEqual({ de: '2026-10-17', ate: '2026-11-15' })
    expect(atalho('mes')).toEqual({ de: '2026-11-01', ate: '2026-11-15' })
    expect(atalho('mes-passado')).toEqual({ de: '2026-10-01', ate: '2026-10-31' })
    expect(atalho('ano')).toEqual({ de: '2026-01-01', ate: '2026-11-15' })
  })
  it('reconhece o atalho ativo', () => {
    expect(atalhoAtivo('2026-10-17', '2026-11-15', hoje)).toBe('30d')
    expect(atalhoAtivo('2026-10-18', '2026-11-15', hoje)).toBeNull()
  })
})

describe('sprints', () => {
  const s = (id: number, numero: number, inicio: string, atual = false) => ({
    id,
    numero,
    inicio,
    atual,
    time_id: 1,
    time_nome: 'Time Alfa',
    fim: inicio,
  })
  it('pré-seleciona a atual; senão a mais recente', () => {
    expect(sprintPadrao([s(1, 1, '2026-09-13'), s(9, 5, '2026-11-08', true), s(10, 5, '2026-11-08', true)])?.id).toBe(9)
    expect(sprintPadrao([s(1, 1, '2026-09-13'), s(3, 2, '2026-09-27')])?.id).toBe(3)
    expect(sprintPadrao([])).toBeNull()
  })
  it('rótulo', () => {
    expect(rotuloSprint({ numero: 4, time_nome: 'Time Beta' })).toBe('Sprint 4 · Time Beta')
  })
})
