import { useCallback, useSyncExternalStore } from 'react'

/** true enquanto a media query casar (ex.: '(min-width: 768px)'). */
export function useMediaQuery(consulta: string): boolean {
  const assinar = useCallback(
    (aoMudar: () => void) => {
      const mql = window.matchMedia(consulta)
      mql.addEventListener('change', aoMudar)
      return () => mql.removeEventListener('change', aoMudar)
    },
    [consulta],
  )
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}
