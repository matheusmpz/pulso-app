import { createContext } from 'react'

import type { ConexaoTempoReal } from '@/lib/tempo-real'

/** A conexão de tempo real da aba (null sem sessão). */
export const ContextoTempoReal = createContext<ConexaoTempoReal | null>(null)
