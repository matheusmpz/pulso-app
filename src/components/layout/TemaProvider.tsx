import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'

import { ContextoTema, type Tema, type TemaEfetivo } from '@/hooks/tema-contexto'

const CHAVE = 'pulso-tema'
const CONSULTA_ESCURO = '(prefers-color-scheme: dark)'

function lerTemaSalvo(): Tema {
  try {
    const valor = localStorage.getItem(CHAVE)
    return valor === 'claro' || valor === 'escuro' || valor === 'sistema' ? valor : 'sistema'
  } catch {
    return 'sistema'
  }
}

function assinarSistema(aoMudar: () => void) {
  const mql = window.matchMedia(CONSULTA_ESCURO)
  mql.addEventListener('change', aoMudar)
  return () => mql.removeEventListener('change', aoMudar)
}

function sistemaEscuro() {
  return window.matchMedia(CONSULTA_ESCURO).matches
}

/** Tema claro, escuro ou sistema (padrão), com a classe .dark no <html>. */
export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo)
  const escuroNoSistema = useSyncExternalStore(assinarSistema, sistemaEscuro, () => false)

  const temaEfetivo: TemaEfetivo = tema === 'sistema' ? (escuroNoSistema ? 'escuro' : 'claro') : tema

  useEffect(() => {
    document.documentElement.classList.toggle('dark', temaEfetivo === 'escuro')
  }, [temaEfetivo])

  const definirTema = useCallback((novo: Tema) => {
    setTema(novo)
    try {
      localStorage.setItem(CHAVE, novo)
    } catch {
      // Sem storage: o tema vale só nesta aba.
    }
  }, [])

  const valor = useMemo(() => ({ tema, temaEfetivo, definirTema }), [tema, temaEfetivo, definirTema])

  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>
}
