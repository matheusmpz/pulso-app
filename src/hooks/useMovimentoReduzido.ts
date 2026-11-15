import { useSyncExternalStore } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function assinar(aoMudar: () => void) {
  const mql = window.matchMedia(CONSULTA)
  mql.addEventListener('change', aoMudar)
  return () => mql.removeEventListener('change', aoMudar)
}

/** true quando o usuário pediu menos animação no sistema. */
export function useMovimentoReduzido(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  )
}
