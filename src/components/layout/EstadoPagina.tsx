import type { ReactNode } from 'react'
import { FileQuestion, Lock, ServerCrash } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

const ICONES = {
  'nao-encontrado': FileQuestion,
  'sem-acesso': Lock,
  erro: ServerCrash,
} as const

interface EstadoPaginaProps {
  tipo: keyof typeof ICONES
  titulo: string
  descricao?: string
  /** Ações extras (ex.: "Tentar novamente"). O botão para a home sempre aparece. */
  acoes?: ReactNode
  destinoVoltar?: string
  rotuloVoltar?: string
}

/** Tela cheia de estado: 404, sem acesso, erro genérico. */
export function EstadoPagina({
  tipo,
  titulo,
  descricao,
  acoes,
  destinoVoltar = '/',
  rotuloVoltar = 'Voltar para o início',
}: EstadoPaginaProps) {
  const Icone = ICONES[tipo]
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icone className="size-6" aria-hidden="true" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h1 className="text-lg font-semibold">{titulo}</h1>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {acoes}
        <Button asChild variant="outline">
          <Link to={destinoVoltar}>{rotuloVoltar}</Link>
        </Button>
      </div>
    </div>
  )
}
