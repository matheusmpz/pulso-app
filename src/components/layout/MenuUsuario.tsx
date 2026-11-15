import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { iniciais, rotuloPerfil } from '@/lib/auth'

export function MenuUsuario() {
  const { usuario, sair } = useAuth()
  if (!usuario) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={`Menu do usuário: ${usuario.nome}`}>
          <Avatar>
            <AvatarFallback className="bg-secondary text-xs font-medium">{iniciais(usuario.nome)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1.5 font-normal">
          <span className="truncate text-sm font-medium">{usuario.nome}</span>
          <span className="truncate text-xs text-muted-foreground">{usuario.email}</span>
          <Badge variant="outline" className="mt-1">
            {rotuloPerfil(usuario.perfil.nome)}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={sair}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
