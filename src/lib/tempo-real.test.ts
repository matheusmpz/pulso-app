import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { atrasoReconexao, ConexaoTempoReal, TENTATIVAS_ATE_OFFLINE, type OpcoesConexao } from '@/lib/tempo-real'
import type { CardResultado } from '@/types/api'

/** WebSocket falso controlado pelo teste. */
class SocketFalso {
  static instancias: SocketFalso[] = []
  readyState: number = WebSocket.CONNECTING
  enviados: unknown[] = []
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  readonly url: string
  constructor(url: string) {
    this.url = url
    SocketFalso.instancias.push(this)
  }
  send(dados: string) {
    this.enviados.push(JSON.parse(dados))
  }
  close() {
    this.readyState = WebSocket.CLOSED
    this.onclose?.()
  }
  abrir() {
    this.readyState = WebSocket.OPEN
    this.onopen?.()
  }
  receber(msg: object) {
    this.onmessage?.({ data: JSON.stringify(msg) })
  }
  cair() {
    this.readyState = WebSocket.CLOSED
    this.onclose?.()
  }
}

const ultimo = () => SocketFalso.instancias[SocketFalso.instancias.length - 1]
const card = (codigo: string): CardResultado => ({ codigo, titulo: codigo, tipo: 'numero', alerta: null, dados: {} })

function criar(extra: Partial<OpcoesConexao> = {}) {
  const opcoes = {
    url: 'ws://api/ws',
    token: 'abc.def',
    aoAssinado: vi.fn(),
    aoCardAtualizado: vi.fn(),
    aoSessaoExpirada: vi.fn(),
    aoFalhaAoConectar: vi.fn(),
    criarSocket: (url: string) => new SocketFalso(url) as unknown as WebSocket,
    ...extra,
  }
  return { conexao: new ConexaoTempoReal(opcoes), opcoes }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (f: () => void) => setTimeout(f, 0))
  SocketFalso.instancias = []
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('ConexaoTempoReal', () => {
  it('conecta com o token na query e assina logo após abrir', () => {
    const { conexao } = criar()
    conexao.assinar('projetos', { escopo: 'time', id: 1, tipo_projeto: ['web'] })
    expect(ultimo().url).toBe('ws://api/ws?token=abc.def')
    expect(conexao.obterEstado().status).toBe('conectando')
    ultimo().abrir()
    expect(ultimo().enviados).toEqual([
      { tipo: 'assinar', dashboard: 'projetos', filtros: { escopo: 'time', id: 1, tipo_projeto: ['web'] } },
    ])
  })

  it('"assinado" marca ao vivo e invalida uma vez', () => {
    const { conexao, opcoes } = criar()
    conexao.assinar('projetos', {})
    ultimo().abrir()
    ultimo().receber({ tipo: 'assinado', dashboard: 'projetos', cards: ['proj-01'] })
    expect(conexao.obterEstado().status).toBe('ao_vivo')
    expect(opcoes.aoAssinado).toHaveBeenCalledTimes(1)
  })

  it('aplica card_atualizado só da assinatura atual', () => {
    const { conexao, opcoes } = criar()
    conexao.assinar('projetos', {})
    ultimo().abrir()
    ultimo().receber({ tipo: 'assinado', dashboard: 'projetos', cards: ['proj-01', 'proj-02'] })
    ultimo().receber({ tipo: 'card_atualizado', card: 'proj-02', dados: card('proj-02') })
    expect(opcoes.aoCardAtualizado).toHaveBeenCalledTimes(1)

    // Troca de filtros: mensagens que chegam antes do novo "assinado" são ignoradas
    conexao.assinar('projetos', { escopo: 'time', id: 2 })
    ultimo().receber({ tipo: 'card_atualizado', card: 'proj-02', dados: card('proj-02') })
    expect(opcoes.aoCardAtualizado).toHaveBeenCalledTimes(1)
    expect(ultimo().enviados).toHaveLength(2)

    ultimo().receber({ tipo: 'assinado', dashboard: 'projetos', cards: ['proj-02'] })
    ultimo().receber({ tipo: 'card_atualizado', card: 'proj-02', dados: card('proj-02') })
    expect(opcoes.aoCardAtualizado).toHaveBeenCalledTimes(2)
    expect(opcoes.aoCardAtualizado).toHaveBeenLastCalledWith(
      { dashboard: 'projetos', filtros: { escopo: 'time', id: 2 } },
      expect.objectContaining({ codigo: 'proj-02' }),
    )
  })

  it('reconecta com backoff exponencial e reassina', () => {
    const { conexao } = criar()
    conexao.assinar('ia', {})
    ultimo().abrir()
    ultimo().cair()
    expect(conexao.obterEstado().status).toBe('reconectando')
    expect(SocketFalso.instancias).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(SocketFalso.instancias).toHaveLength(2)
    ultimo().cair() // falhou antes de abrir
    vi.advanceTimersByTime(1999)
    expect(SocketFalso.instancias).toHaveLength(2)
    vi.advanceTimersByTime(1)
    expect(SocketFalso.instancias).toHaveLength(3)
    ultimo().abrir()
    expect(ultimo().enviados).toEqual([{ tipo: 'assinar', dashboard: 'ia', filtros: {} }])
  })

  it('backoff vai até 30 s e o indicador vira offline depois de várias falhas', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(atrasoReconexao)).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000])
    const { conexao, opcoes } = criar()
    conexao.assinar('ia', {})
    for (let i = 0; i < TENTATIVAS_ATE_OFFLINE; i++) {
      ultimo().cair()
      vi.advanceTimersByTime(30_000)
    }
    expect(conexao.obterEstado().status).toBe('offline')
    expect(opcoes.aoFalhaAoConectar).toHaveBeenCalled()
  })

  it('"Sessão expirada." faz logout e não reconecta', () => {
    const { conexao, opcoes } = criar()
    conexao.assinar('ia', {})
    ultimo().abrir()
    ultimo().receber({ tipo: 'erro', mensagem: 'Sessão expirada.' })
    expect(opcoes.aoSessaoExpirada).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    expect(SocketFalso.instancias).toHaveLength(1)
    expect(conexao.obterEstado().status).toBe('desconectado')
  })

  it('"Servidor encerrando." aparece no indicador e reconecta quando cai', () => {
    const { conexao } = criar()
    conexao.assinar('ia', {})
    ultimo().abrir()
    ultimo().receber({ tipo: 'erro', mensagem: 'Servidor encerrando.' })
    expect(conexao.obterEstado().erro).toBe('Servidor encerrando.')
    ultimo().cair()
    vi.advanceTimersByTime(1000)
    expect(SocketFalso.instancias).toHaveLength(2)
  })

  it('fecha ao sair da tela, mas reaproveita numa troca rápida de dashboard', () => {
    const { conexao } = criar()
    conexao.assinar('projetos', {})
    ultimo().abrir()
    conexao.cancelarAssinatura()
    conexao.assinar('ia', {})
    vi.advanceTimersByTime(5000)
    expect(SocketFalso.instancias).toHaveLength(1)
    expect(ultimo().readyState).toBe(WebSocket.OPEN)

    conexao.cancelarAssinatura()
    vi.advanceTimersByTime(5000)
    expect(ultimo().readyState).toBe(WebSocket.CLOSED)
    expect(conexao.obterEstado().status).toBe('desconectado')
  })
})
