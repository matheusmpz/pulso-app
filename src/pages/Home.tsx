import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

// Provisório: a home com os tiles dos dashboards vem no próximo bloco.
export default function Home() {
  const { usuario, sair } = useAuth()
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <p>Olá, {usuario?.nome}</p>
      <Button variant="outline" onClick={sair}>
        Sair
      </Button>
    </main>
  )
}
