import { describe, expect, it } from 'vitest'

import {
  escreverFiltros,
  filtrosParaOutroDashboard,
  lerFiltros,
  normalizarFiltros,
  paraQueryString,
  paraWebSocket,
  temFiltrosAtivos,
} from '@/lib/filtros'

const params = (qs: string) => new URLSearchParams(qs)

describe('lerFiltros', () => {
  it('sem parâmetros = padrão da API (objeto vazio)', () => {
    expect(lerFiltros(params(''), 'projetos')).toEqual({})
  })

  it('lê escopo, id, período e listas (ordenadas e sem repetição)', () => {
    expect(
      lerFiltros(params('escopo=time&id=1&de=2026-10-16&ate=2026-11-14&tipo_projeto=web,api,web'), 'projetos'),
    ).toEqual({ escopo: 'time', id: 1, de: '2026-10-16', ate: '2026-11-14', tipo_projeto: ['api', 'web'] })
  })

  it('escopo "projeto" é o padrão e não entra no objeto', () => {
    expect(lerFiltros(params('escopo=projeto&id=2'), 'projetos')).toEqual({ id: 2 })
  })

  it('descarta valores inválidos', () => {
    expect(lerFiltros(params('escopo=xyz&id=abc&de=2026-13-40&tipo_projeto=,'), 'projetos')).toEqual({})
  })

  it('mantém de > ate para a API responder com a mensagem dela', () => {
    expect(lerFiltros(params('de=2026-11-10&ate=2026-11-01'), 'vendas')).toEqual({
      de: '2026-11-10',
      ate: '2026-11-01',
    })
  })

  it('ignora filtros que não valem no dashboard', () => {
    expect(lerFiltros(params('escopo=time&id=1&origem_lead=site&modelo=gpt-4o-mini'), 'vendas')).toEqual({
      origem_lead: ['site'],
    })
    expect(lerFiltros(params('origem_lead=site&modelo=gpt-4o-mini'), 'ia')).toEqual({ modelo: ['gpt-4o-mini'] })
  })
})

describe('escrita', () => {
  it('URL com ordem fixa e listas por vírgula', () => {
    const qs = paraQueryString({ tipo_projeto: ['api', 'web'], escopo: 'sprint', id: 9 })
    expect(qs).toBe('escopo=sprint&id=9&tipo_projeto=api,web')
  })

  it('vazios não entram', () => {
    expect(escreverFiltros({ tipo_projeto: [] }).toString()).toBe('')
  })

  it('ida e volta pela URL', () => {
    const filtros = normalizarFiltros(
      { escopo: 'time', id: 2, de: '2026-10-01', ate: '2026-10-31', status_projeto: ['pausado', 'concluido'] },
      'projetos',
    )
    expect(lerFiltros(escreverFiltros(filtros), 'projetos')).toEqual(filtros)
  })

  it('objeto do WebSocket com arrays', () => {
    expect(paraWebSocket({ escopo: 'time', id: 1, tipo_projeto: ['web'] })).toEqual({
      escopo: 'time',
      id: 1,
      tipo_projeto: ['web'],
    })
  })
})

describe('troca de dashboard', () => {
  it('mantém só os filtros que valem no destino', () => {
    expect(
      filtrosParaOutroDashboard(
        params('escopo=time&id=1&de=2026-10-01&ate=2026-10-31&tipo_projeto=web'),
        'projetos',
        'vendas',
      ),
    ).toBe('de=2026-10-01&ate=2026-10-31&tipo_projeto=web')
  })
})

it('temFiltrosAtivos', () => {
  expect(temFiltrosAtivos({})).toBe(false)
  expect(temFiltrosAtivos({ de: '2026-10-01' })).toBe(true)
})
