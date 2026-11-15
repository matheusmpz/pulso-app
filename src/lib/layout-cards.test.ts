import { describe, expect, it } from 'vitest'

import type { TipoCard } from '@/types/api'
import { montarLinhas } from '@/lib/layout-cards'

// Tipos reais dos cards, na ordem da API (GET /dashboards/:chave).
const PROJETOS: [string, TipoCard][] = [
  ['proj-01', 'numero'],
  ['proj-02', 'numero'],
  ['proj-03', 'numero'],
  ['proj-04', 'linhas'],
  ['proj-05', 'donut'],
  ['proj-06', 'area'],
  ['proj-07', 'barras_agrupadas'],
  ['proj-08', 'barras_agrupadas'],
  ['proj-09', 'barras_agrupadas'],
  ['proj-10', 'barras_agrupadas'],
  ['proj-11', 'barras_agrupadas'],
  ['proj-12', 'barras'],
  ['proj-13', 'barras_agrupadas'],
  ['proj-14', 'barras'],
  ['proj-15', 'area'],
]

const VENDAS: [string, TipoCard][] = [
  ['ven-01', 'numero'],
  ['ven-02', 'numero'],
  ['ven-03', 'numero'],
  ['ven-04', 'numero'],
  ['ven-05', 'barras'],
  ['ven-06', 'barras_agrupadas'],
  ['ven-07', 'donut'],
  ['ven-08', 'barras'],
  ['ven-09', 'barras'],
  ['ven-10', 'area'],
  ['ven-11', 'donut'],
  ['ven-12', 'barras'],
  ['ven-13', 'barras_agrupadas'],
  ['ven-14', 'barras_agrupadas'],
]

const IA: [string, TipoCard][] = [
  ['ia-01', 'numero'],
  ['ia-02', 'numero'],
  ['ia-03', 'radial'],
  ['ia-04', 'numero'],
  ['ia-05', 'area'],
  ['ia-06', 'barras'],
  ['ia-07', 'donut'],
  ['ia-08', 'barras'],
  ['ia-09', 'barras_agrupadas'],
  ['ia-10', 'barras_agrupadas'],
  ['ia-11', 'barras_agrupadas'],
  ['ia-12', 'lista'],
]

function resumo(cards: [string, TipoCard][]) {
  return montarLinhas(cards.map(([codigo, tipo]) => ({ codigo, tipo }))).map((linha) =>
    linha.map(({ card, span }) => `${card.codigo.split('-')[1]}·${span}`),
  )
}

describe('montarLinhas', () => {
  it('projetos', () => {
    expect(resumo(PROJETOS)).toEqual([
      ['01·4', '02·4', '03·4'],
      ['04·8', '05·4'],
      ['06·12'],
      ['07·4', '08·4', '09·4'],
      ['10·6', '11·6'],
      ['12·6', '13·6'],
      ['14·6', '15·6'],
    ])
  })

  it('vendas', () => {
    expect(resumo(VENDAS)).toEqual([
      ['01·3', '02·3', '03·3', '04·3'],
      ['05·6', '06·6'],
      ['07·4', '08·4', '09·4'],
      ['10·8', '11·4'],
      ['12·4', '13·8'],
      ['14·12'],
    ])
  })

  it('ia', () => {
    expect(resumo(IA)).toEqual([
      ['01·3', '02·3', '03·3', '04·3'],
      ['05·8', '07·4'],
      ['06·6', '08·6'],
      ['09·6', '10·6'],
      ['11·6', '12·6'],
    ])
  })

  it('toda linha soma 12, inclusive com cards desconhecidos', () => {
    const cards = [
      { codigo: 'x-1', tipo: 'numero' as const },
      { codigo: 'x-2', tipo: 'linhas' as const },
      { codigo: 'x-3', tipo: 'donut' as const },
      { codigo: 'x-4', tipo: 'numero' as const },
      { codigo: 'x-5', tipo: 'barras' as const },
    ]
    for (const linha of montarLinhas(cards)) {
      expect(linha.reduce((s, c) => s + c.span, 0)).toBe(12)
    }
  })

  it('um card de 8 sozinho vira 12', () => {
    expect(resumo([['z-1', 'area']])).toEqual([['1·12']])
  })

  it('lista vazia não gera linhas', () => {
    expect(montarLinhas([])).toEqual([])
  })
})
