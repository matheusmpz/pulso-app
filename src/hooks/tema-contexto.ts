import { createContext } from 'react'

export type Tema = 'claro' | 'escuro' | 'sistema'
export type TemaEfetivo = 'claro' | 'escuro'

export interface TemaContexto {
  tema: Tema
  temaEfetivo: TemaEfetivo
  definirTema: (tema: Tema) => void
}

export const ContextoTema = createContext<TemaContexto | null>(null)
