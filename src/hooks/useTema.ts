import { useContext } from 'react'

import { ContextoTema, type TemaContexto } from '@/hooks/tema-contexto'

export function useTema(): TemaContexto {
  const contexto = useContext(ContextoTema)
  if (!contexto) throw new Error('useTema precisa estar dentro de <TemaProvider>')
  return contexto
}
