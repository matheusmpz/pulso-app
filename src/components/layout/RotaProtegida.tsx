import { Navigate, Outlet, useLocation } from 'react-router'

import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/useAuth'

/** Sem token válido → /login, guardando o destino para voltar depois do login. */
export function RotaProtegida() {
  const { token, usuario, carregandoUsuario } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ destino: location.pathname + location.search }} />
  }

  if (carregandoUsuario && !usuario) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        <Spinner className="size-6" />
      </div>
    )
  }

  return <Outlet />
}

/** /login com sessão ativa → home. */
export function RotaPublica() {
  const { token } = useAuth()
  if (token) return <Navigate to="/" replace />
  return <Outlet />
}
