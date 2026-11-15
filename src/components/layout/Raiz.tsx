import { Outlet } from 'react-router'

import { AuthProvider } from '@/components/layout/AuthProvider'

/** Raiz das rotas: a autenticação precisa do roteador (para navegar no logout). */
export function Raiz() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
