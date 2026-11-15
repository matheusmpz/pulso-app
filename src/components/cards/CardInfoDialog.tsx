import { Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { horaCompleta } from '@/lib/formatadores'

interface CardInfoDialogProps {
  titulo: string
  descricao: string
  atualizadoEm?: string
}

/** Ícone (i) do card + modal com título, descrição completa e hora da última atualização. */
export function CardInfoDialog({ titulo, descricao, atualizadoEm }: CardInfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="-my-1 -ml-1.5 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={`Sobre este card: ${titulo}`}
        >
          <Info />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none">
        <DialogHeader>
          <div className="flex items-center gap-3 text-left">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-dash/10 text-dash">
              <Info className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle>{titulo}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-left text-sm leading-relaxed whitespace-pre-line text-foreground/80">
            {descricao || 'Sem descrição para este card.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="items-center sm:justify-between">
          <span className="text-xs text-muted-foreground tabular-nums">
            {atualizadoEm ? `Atualizado às ${horaCompleta(atualizadoEm)}` : ''}
          </span>
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
