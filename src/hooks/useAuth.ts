import { useContext } from 'react'

import { ContextoAuth, type AuthContexto } from '@/hooks/auth-contexto'

export function useAuth(): AuthContexto {
  const contexto = useContext(ContextoAuth)
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return contexto
}
