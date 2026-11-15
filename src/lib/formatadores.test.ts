import { describe, expect, it } from 'vitest'

import {
  compacto,
  dataCurta,
  dataLonga,
  dias,
  formatarEixo,
  formatarPorUnidade,
  formatarX,
  horas,
  intervalo,
  mesAno,
  moeda,
  moedaCompacta,
  numero,
  percentual,
  variacaoPercentual,
} from '@/lib/formatadores'

describe('formatadores', () => {
  it('null, undefined e NaN viram "—"', () => {
    for (const fn of [numero, moeda, moedaCompacta, compacto, percentual, horas, dias]) {
      expect(fn(null)).toBe('—')
      expect(fn(undefined)).toBe('—')
      expect(fn(Number.NaN)).toBe('—')
    }
    expect(formatarPorUnidade(null, '%')).toBe('—')
  })

  it('zero continua zero', () => {
    expect(numero(0)).toBe('0')
    expect(percentual(0)).toBe('0%')
    expect(moeda(0)).toBe('R$ 0,00')
  })

  it('números em pt-BR', () => {
    expect(numero(12345)).toBe('12.345')
    expect(numero(655.75)).toBe('655,75')
    expect(numero(1.5, 2)).toBe('1,50')
  })

  it('moeda', () => {
    expect(moeda(12345.67)).toBe('R$ 12.345,67')
    expect(moeda(-27.5)).toBe('-R$ 27,50')
    expect(moedaCompacta(1_200_000)).toBe('R$ 1,2 mi')
    expect(moedaCompacta(48000)).toBe('R$ 48 mil')
    expect(moedaCompacta(500)).toBe('R$ 500')
  })

  it('compacto (tokens)', () => {
    expect(compacto(1_200_000)).toBe('1,2 mi')
    expect(compacto(450_000)).toBe('450 mil')
    expect(compacto(950)).toBe('950')
  })

  it('percentual, horas e dias', () => {
    expect(percentual(72.5)).toBe('72,5%')
    expect(percentual(100)).toBe('100%')
    expect(horas(120.5)).toBe('120,5 h')
    expect(dias(14.2)).toBe('14,2 dias')
    expect(dias(1)).toBe('1 dia')
  })

  it('variação com sinal', () => {
    expect(variacaoPercentual(3.2)).toBe('+3,2%')
    expect(variacaoPercentual(-27.5)).toBe('-27,5%')
    expect(variacaoPercentual(0)).toBe('0%')
  })

  it('formatarPorUnidade', () => {
    expect(formatarPorUnidade(63.3, '%')).toBe('63,3%')
    expect(formatarPorUnidade(48000, 'R$')).toBe('R$ 48.000,00')
    expect(formatarPorUnidade(655.75, 'h')).toBe('655,75 h')
    expect(formatarPorUnidade(3802521, 'tokens')).toBe('3,8 mi tokens')
    expect(formatarPorUnidade(20.3, 'dias')).toBe('20,3 dias')
    expect(formatarPorUnidade(26, 'atividades')).toBe('26 atividades')
    expect(formatarPorUnidade(1, 'vendas')).toBe('1 venda')
    expect(formatarPorUnidade(1, 'reuniões')).toBe('1 reunião')
    expect(formatarPorUnidade(7, 'xícaras')).toBe('7 xícaras')
    expect(formatarPorUnidade(7, undefined)).toBe('7')
  })

  it('eixos', () => {
    expect(formatarEixo(80, '%')).toBe('80%')
    expect(formatarEixo(100000, 'R$')).toBe('R$ 100 mil')
    expect(formatarEixo(10_500_000, 'tokens')).toBe('10,5 mi')
  })

  it('datas sem erro de fuso', () => {
    expect(dataCurta('2026-11-14')).toBe('14/11')
    expect(dataLonga('2026-11-14')).toBe('14/11/2026')
    expect(mesAno('2026-11')).toBe('nov/26')
    expect(intervalo('2026-10-14', '2026-11-14')).toBe('14/10 – 14/11/2026')
    expect(intervalo('2025-12-20', '2026-01-10')).toBe('20/12/2025 – 10/01/2026')
    expect(dataCurta(null)).toBe('—')
  })

  it('eixo X: data, mês ou número', () => {
    expect(formatarX('2026-11-08')).toBe('08/11')
    expect(formatarX('2026-10')).toBe('out/26')
    expect(formatarX(655.75)).toBe('655,75')
    expect(formatarX('Sprint 5')).toBe('Sprint 5')
  })
})
