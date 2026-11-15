import { Outlet } from 'react-router'

import { CabecalhoApp } from '@/components/layout/CabecalhoApp'
import { TempoRealProvider } from '@/components/layout/TempoRealProvider'

/** Casca das telas autenticadas: cabeçalho fixo + conteúdo. */
export function LayoutApp() {
  return (
    <TempoRealProvider>
      <div className="flex min-h-svh flex-col">
        <CabecalhoApp />
        <Outlet />
      </div>
    </TempoRealProvider>
  )
}
