import { Outlet } from 'react-router'

import { CabecalhoApp } from '@/components/layout/CabecalhoApp'

/** Casca das telas autenticadas: cabeçalho fixo + conteúdo. */
export function LayoutApp() {
  return (
    <div className="flex min-h-svh flex-col">
      <CabecalhoApp />
      <Outlet />
    </div>
  )
}
