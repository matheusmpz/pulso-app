// Configuração de ambiente.
// Ordem: config em tempo de execução (public/config.js, gerado pelo Docker) > variáveis do Vite > padrão local.

interface ConfigExecucao {
  API_URL?: string
  WS_URL?: string
}

declare global {
  interface Window {
    __PULSO_CONFIG__?: ConfigExecucao
  }
}

const execucao: ConfigExecucao = (typeof window !== 'undefined' && window.__PULSO_CONFIG__) || {}

function semBarraFinal(url: string) {
  return url.replace(/\/+$/, '')
}

/** Deriva a URL do WebSocket da URL da API: http → ws, https → wss, + /ws. */
export function derivarUrlWs(apiUrl: string): string {
  return `${semBarraFinal(apiUrl).replace(/^http/i, 'ws')}/ws`
}

export const API_URL = semBarraFinal(execucao.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080')

export const WS_URL = execucao.WS_URL || import.meta.env.VITE_WS_URL || derivarUrlWs(API_URL)
