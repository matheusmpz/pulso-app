// Conexão de tempo real (WebSocket nativo), independente do React.
// Uma conexão por aba, reaproveitada entre dashboards. A carga inicial é sempre pelo REST;
// o servidor só envia atualizações dos cards que mudaram.

import type { CardResultado, Filtros, MensagemAssinar, MensagemServidor } from '@/types/api'
import { chaveDosFiltros, paraWebSocket } from '@/lib/filtros'

export type StatusTempoReal = 'desconectado' | 'conectando' | 'ao_vivo' | 'reconectando' | 'offline'

export interface EstadoTempoReal {
  status: StatusTempoReal
  /** Última mensagem de erro do servidor (exceto sessão), para o indicador */
  erro: string | null
}

export interface Assinatura {
  dashboard: string
  filtros: Filtros
}

export interface OpcoesConexao {
  url: string
  token: string
  aoAssinado: (assinatura: Assinatura) => void
  aoCardAtualizado: (assinatura: Assinatura, card: CardResultado) => void
  aoSessaoExpirada: () => void
  /** A conexão caiu antes de abrir (pode ser token inválido): quem usa confere a sessão pelo REST */
  aoFalhaAoConectar?: () => void
  /** Fábrica do WebSocket (testes) */
  criarSocket?: (url: string) => WebSocket
}

/** Backoff exponencial: 1 s, 2 s, 4 s... até 30 s. */
export function atrasoReconexao(tentativa: number): number {
  return Math.min(1000 * 2 ** tentativa, 30_000)
}

/** Depois de tantas falhas seguidas o indicador mostra "Offline" (mas continua tentando a cada 30 s). */
export const TENTATIVAS_ATE_OFFLINE = 10

/** Tempo de espera antes de fechar a conexão sem assinatura (troca rápida de dashboard reaproveita). */
const ESPERA_FECHAR_MS = 3000

const SESSAO_EXPIRADA = 'Sessão expirada.'

export class ConexaoTempoReal {
  private socket: WebSocket | null = null
  private assinatura: Assinatura | null = null
  /** Chave da assinatura confirmada pelo servidor ("assinado"); mensagens fora dela são ignoradas */
  private confirmada: string | null = null
  private cardsAssinados = new Set<string>()
  private tentativas = 0
  private timerReconexao: number | undefined
  private timerFechar: number | undefined
  private encerrada = false
  private abriu = false
  private estado: EstadoTempoReal = { status: 'desconectado', erro: null }
  private ouvintes = new Set<() => void>()
  private readonly opcoes: OpcoesConexao

  constructor(opcoes: OpcoesConexao) {
    this.opcoes = opcoes
  }

  /* ---------- Estado (para useSyncExternalStore) ---------- */

  obterEstado = (): EstadoTempoReal => this.estado

  inscrever = (ouvinte: () => void): (() => void) => {
    this.ouvintes.add(ouvinte)
    return () => this.ouvintes.delete(ouvinte)
  }

  private definirEstado(parcial: Partial<EstadoTempoReal>) {
    const novo = { ...this.estado, ...parcial }
    if (novo.status === this.estado.status && novo.erro === this.estado.erro) return
    this.estado = novo
    this.ouvintes.forEach((o) => o())
  }

  /* ---------- Assinatura ---------- */

  /** Assina (ou troca a assinatura). Abre a conexão se preciso. */
  assinar(dashboard: string, filtros: Filtros) {
    if (this.encerrada) return
    window.clearTimeout(this.timerFechar)
    this.assinatura = { dashboard, filtros }
    this.confirmada = null
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.enviarAssinatura()
    } else if (!this.socket) {
      this.conectar()
    }
  }

  /** Sai da tela do dashboard: fecha a conexão se nenhuma outra assinatura chegar logo. */
  cancelarAssinatura() {
    this.assinatura = null
    this.confirmada = null
    window.clearTimeout(this.timerFechar)
    this.timerFechar = window.setTimeout(() => {
      if (!this.assinatura) this.desligar()
    }, ESPERA_FECHAR_MS)
  }

  /** Logout ou troca de token: fecha de vez. */
  encerrar() {
    this.encerrada = true
    this.assinatura = null
    window.clearTimeout(this.timerFechar)
    this.desligar()
  }

  /** O navegador voltou a ficar online: tenta de novo na hora. */
  tentarAgora() {
    if (this.encerrada || !this.assinatura || this.socket) return
    window.clearTimeout(this.timerReconexao)
    this.conectar()
  }

  /* ---------- Conexão ---------- */

  private conectar() {
    window.clearTimeout(this.timerReconexao)
    this.abriu = false
    this.definirEstado({ status: this.tentativas === 0 ? 'conectando' : this.estadoDeFalha() })

    // O navegador não envia Authorization no WebSocket: o token vai na query.
    const url = `${this.opcoes.url}?token=${encodeURIComponent(this.opcoes.token)}`
    let socket: WebSocket
    try {
      socket = this.opcoes.criarSocket ? this.opcoes.criarSocket(url) : new WebSocket(url)
    } catch {
      this.agendarReconexao()
      return
    }
    this.socket = socket

    socket.onopen = () => {
      this.abriu = true
      this.tentativas = 0
      if (this.assinatura) this.enviarAssinatura()
    }
    socket.onmessage = (evento) => this.tratarMensagem(evento.data)
    socket.onclose = () => {
      if (this.socket !== socket) return
      this.socket = null
      this.confirmada = null
      if (this.encerrada || !this.assinatura) {
        this.definirEstado({ status: 'desconectado' })
        return
      }
      if (!this.abriu) this.opcoes.aoFalhaAoConectar?.()
      this.agendarReconexao()
    }
    // onerror sempre é seguido de onclose; a reconexão acontece lá.
    socket.onerror = () => {}
  }

  private desligar() {
    window.clearTimeout(this.timerReconexao)
    const socket = this.socket
    this.socket = null
    this.confirmada = null
    this.tentativas = 0
    if (socket) {
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close()
    }
    this.definirEstado({ status: 'desconectado' })
  }

  private estadoDeFalha(): StatusTempoReal {
    return this.tentativas >= TENTATIVAS_ATE_OFFLINE ? 'offline' : 'reconectando'
  }

  private agendarReconexao() {
    const atraso = atrasoReconexao(this.tentativas)
    this.tentativas++
    this.definirEstado({ status: this.estadoDeFalha() })
    this.timerReconexao = window.setTimeout(() => this.conectar(), atraso)
  }

  private enviarAssinatura() {
    if (!this.assinatura || this.socket?.readyState !== WebSocket.OPEN) return
    const mensagem: MensagemAssinar = {
      tipo: 'assinar',
      dashboard: this.assinatura.dashboard,
      filtros: paraWebSocket(this.assinatura.filtros),
    }
    this.socket.send(JSON.stringify(mensagem))
  }

  /* ---------- Mensagens ---------- */

  private tratarMensagem(bruto: unknown) {
    let mensagem: MensagemServidor
    try {
      mensagem = JSON.parse(String(bruto)) as MensagemServidor
    } catch {
      return
    }
    const atual = this.assinatura

    switch (mensagem.tipo) {
      case 'assinado': {
        if (!atual || mensagem.dashboard !== atual.dashboard) return
        this.confirmada = chaveDosFiltros(atual.dashboard, atual.filtros)
        this.cardsAssinados = new Set(mensagem.cards ?? [])
        this.definirEstado({ status: 'ao_vivo', erro: null })
        this.opcoes.aoAssinado(atual)
        return
      }
      case 'card_atualizado': {
        // Só aplica se for da assinatura atual (ignora o que chega depois de uma troca de filtros).
        if (!atual || this.confirmada !== chaveDosFiltros(atual.dashboard, atual.filtros)) return
        if (this.cardsAssinados.size > 0 && !this.cardsAssinados.has(mensagem.card)) return
        if (!mensagem.dados || mensagem.dados.codigo !== mensagem.card) return
        this.opcoes.aoCardAtualizado(atual, mensagem.dados)
        return
      }
      case 'erro': {
        if (mensagem.mensagem === SESSAO_EXPIRADA) {
          this.encerrar()
          this.opcoes.aoSessaoExpirada()
          return
        }
        // "Servidor encerrando." e outros: mostra no indicador; o onclose cuida da reconexão.
        this.definirEstado({ erro: mensagem.mensagem })
        return
      }
    }
  }
}
