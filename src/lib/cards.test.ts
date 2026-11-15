import { describe, expect, it } from 'vitest'

import type { CardResultado } from '@/types/api'
import { badgeDoCard, cardVazio, semSprint, subtituloDoCard, unidadeDoDonut } from '@/lib/cards'

const card = (tipo: CardResultado['tipo'], dados: unknown): CardResultado => ({
  codigo: 'x',
  titulo: 'X',
  tipo,
  dados,
  alerta: null,
})

describe('cardVazio', () => {
  it('listas e séries sem itens são vazias', () => {
    expect(cardVazio('area', { series: [], pontos: [] })).toBe(true)
    expect(cardVazio('barras', { itens: [] })).toBe(true)
    expect(cardVazio('donut', { fatias: [{ rotulo: 'a', valor: 0 }], total: 0 })).toBe(true)
    expect(cardVazio('lista', { colunas: ['a'], linhas: [], total: 0 })).toBe(true)
  })
  it('número null não é vazio', () => {
    expect(cardVazio('numero', { valor: null, unidade: '%', variacao: null, detalhe: null })).toBe(false)
  })
})

describe('extras', () => {
  const burndown = (sprint: unknown) => card('area', { series: [], pontos: [{ x: '2026-11-08' }], extra: { sprint } })

  it('subtítulo da sprint (proj-06)', () => {
    expect(subtituloDoCard(burndown({ id: 9, numero: 5, inicio: '2026-11-08', fim: '2026-11-21' }))).toBe(
      'Sprint 5 · 08/11 – 21/11/2026',
    )
    expect(subtituloDoCard(burndown(null))).toBeNull()
  })

  it('sem sprint', () => {
    expect(semSprint(burndown(null))).toBe(true)
    expect(semSprint(burndown({ numero: 1 }))).toBe(false)
  })

  it('badge do total das barras', () => {
    expect(badgeDoCard(card('barras', { itens: [], total: 15 }))).toBe('15 no total')
    expect(badgeDoCard(card('barras', { itens: [], total: null }))).toBeNull()
  })

  it('unidade do donut', () => {
    expect(unidadeDoDonut('ia-07', { fatias: [], total: 0 })).toBe('R$')
    expect(unidadeDoDonut('ia-07', { fatias: [], total: 0, unidade: 'tokens' })).toBe('tokens')
    expect(unidadeDoDonut('proj-05', { fatias: [], total: 0 })).toBeUndefined()
  })
})
