import { Link } from 'react-router'

import { Logo } from '@/components/layout/Logo'
import { MenuUsuario } from '@/components/layout/MenuUsuario'
import { SeletorDashboard } from '@/components/layout/SeletorDashboard'
import { TemaToggle } from '@/components/layout/TemaToggle'

export function CabecalhoApp() {
  return (
    <header className="sticky top-0 z-20 h-14 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-2 px-4 md:px-6">
        <Link
          to="/"
          aria-label="Pulso: ir para o início"
          className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>
        <SeletorDashboard />
        <div className="ml-auto flex items-center gap-1">
          <TemaToggle />
          <MenuUsuario />
        </div>
      </div>
    </header>
  )
}
