import { createContext } from 'react'

import type { Usuario } from '@/types/api'

export interface AuthContexto {
  /** Token atual (null = deslogado) */
  token: string | null
  /** Usuário de GET /auth/me (null enquanto carrega ou sem sessão) */
  usuario: Usuario | null
  carregandoUsuario: boolean
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => void
  /** Sessão expirada (ex.: WebSocket avisou): limpa tudo e volta ao login com aviso */
  expirarSessao: () => void
}

export const ContextoAuth = createContext<AuthContexto | null>(null)
