import { expect, it } from 'vitest'

import { ordenarDashboards } from '@/lib/dashboards'

it('ordena vendas, projetos, ia e manda chaves desconhecidas para o fim', () => {
  const lista = [{ chave: 'projetos' }, { chave: 'rh' }, { chave: 'vendas' }, { chave: 'ia' }, { chave: 'fin' }]
  expect(ordenarDashboards(lista).map((d) => d.chave)).toEqual(['vendas', 'projetos', 'ia', 'rh', 'fin'])
})
