import { Activity } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Mostra o nome "Pulso" ao lado do símbolo */
  comNome?: boolean
}

/** Quadrado amarelo da marca com o ícone Activity e o nome "Pulso". */
export function Logo({ className, comNome = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
      >
        <Activity className="size-5" strokeWidth={2.5} />
      </span>
      {comNome && <span className="text-base font-semibold tracking-tight">Pulso</span>}
    </span>
  )
}
