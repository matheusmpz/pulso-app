import { describe, expect, it } from 'vitest'

import { corDaFatia, corDoDashboard, estiloDaSerie } from '@/lib/cores'

describe('corDoDashboard', () => {
  it('usa a cor da API quando válida', () => {
    expect(corDoDashboard({ chave: 'vendas', cor: 'orange' })).toBe('orange')
  })
  it('cai no mapa padrão quando a cor é inválida ou ausente', () => {
    expect(corDoDashboard({ chave: 'vendas', cor: 'pink' })).toBe('emerald')
    expect(corDoDashboard({ chave: 'projetos', cor: null })).toBe('violet')
    expect(corDoDashboard({ chave: 'ia' })).toBe('orange')
  })
  it('chave desconhecida = violet', () => {
    expect(corDoDashboard({ chave: 'rh' })).toBe('violet')
  })
})

describe('estiloDaSerie', () => {
  const s = (...chaves: string[]) => chaves.map((chave) => ({ chave, nome: chave }))

  it('referência é neutra e marcada', () => {
    expect(estiloDaSerie('ideal', s('ideal', 'real'))).toEqual({ cor: 'var(--ref)', referencia: true })
    expect(estiloDaSerie('estimado', s('estimado', 'real')).referencia).toBe(true)
  })

  it('principal usa --dash', () => {
    expect(estiloDaSerie('real', s('ideal', 'real')).cor).toBe('var(--dash)')
    expect(estiloDaSerie('margem_real', s('previsto', 'margem_real', 'custo_ia')).cor).toBe('var(--dash)')
  })

  it('secundárias conhecidas usam --dash-3', () => {
    expect(estiloDaSerie('custo_ia', s('custo_horas', 'custo_ia')).cor).toBe('var(--dash-3)')
    expect(estiloDaSerie('media_movel', s('consumo', 'media_movel')).cor).toBe('var(--dash-3)')
  })

  it('ordinais seguem a rampa', () => {
    const series = s('pequena', 'media', 'grande')
    expect(estiloDaSerie('pequena', series).cor).toBe('var(--dash-1)')
    expect(estiloDaSerie('media', series).cor).toBe('var(--dash-2)')
    expect(estiloDaSerie('grande', series).cor).toBe('var(--dash-3)')
  })

  it('a cor segue a entidade: remover uma série não muda as outras', () => {
    expect(estiloDaSerie('grande', s('pequena', 'grande')).cor).toBe('var(--dash-3)')
  })
})

describe('corDaFatia', () => {
  it('estados reservados', () => {
    expect(corDaFatia('concluida', 0)).toBe('var(--estado-concluida)')
    expect(corDaFatia('aprovada', 3)).toBe('var(--estado-concluida)')
    expect(corDaFatia('recusada', 0)).toBe('var(--estado-recusada)')
  })
  it('rampa e depois cinzas', () => {
    expect(corDaFatia('claude-sonnet', 0)).toBe('var(--dash-1)')
    expect(corDaFatia('x', 3)).toBe('var(--dash-4)')
    expect(corDaFatia('y', 4)).toBe('var(--extra-1)')
  })
})
