import { RotateCcw } from 'lucide-react'

import { DashboardTile } from '@/components/dashboard/DashboardTile'
import { EstadoPagina } from '@/components/layout/EstadoPagina'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useDashboards } from '@/hooks/useDashboards'
import { primeiroNome } from '@/lib/auth'

export default function Home() {
  const { usuario } = useAuth()
  const { data: dashboards, isPending, isError, error, refetch, isFetching } = useDashboards()

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 flex flex-col gap-2">
        {usuario && <p className="text-sm text-muted-foreground">Olá, {primeiroNome(usuario.nome)}</p>}
        <h1 className="text-3xl font-semibold tracking-tight">Pulso Dashboard</h1>
        <p className="max-w-2xl text-muted-foreground">
          Acompanhe projetos, vendas e consumo de IA da Fábrica de Software em tempo real.
        </p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EstadoPagina
          tipo="erro"
          titulo="Não foi possível carregar os dashboards"
          descricao={error.message}
          acoes={
            <Button onClick={() => refetch()} disabled={isFetching}>
              <RotateCcw />
              Tentar novamente
            </Button>
          }
        />
      ) : dashboards.length === 0 ? (
        <EstadoPagina
          tipo="sem-acesso"
          titulo="Nenhum dashboard disponível"
          descricao="Seu perfil ainda não tem acesso a nenhum dashboard. Fale com o administrador."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {dashboards.map((d) => (
            <DashboardTile key={d.chave} dashboard={d} />
          ))}
        </div>
      )}
    </main>
  )
}
