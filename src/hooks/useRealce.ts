import { useCallback, useSyncExternalStore } from 'react'

import { inscreverRealce, realceAtivo } from '@/lib/realce'

/** true durante o realce do card (atualização em tempo real). */
export function useRealce(codigo: string): boolean {
  const inscrever = useCallback((o: () => void) => inscreverRealce(codigo, o), [codigo])
  return useSyncExternalStore(
    inscrever,
    () => realceAtivo(codigo),
    () => false,
  )
}
