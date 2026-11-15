import { useState, type ReactNode } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router'

import { GradeCards } from '@/components/dashboard/GradeCards'
import { EstadoPagina } from '@/components/layout/EstadoPagina'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAtualizarCard } from '@/hooks/useAtualizarCard'
import { useDashboard, useDashboardDados } from '@/hooks/useDashboard'
import { useDashboards } from '@/hooks/useDashboards'
import { useFiltros } from '@/hooks/useFiltros'
import { ehApiError } from '@/lib/api'
import { corDoDashboard } from '@/lib/cores'
import { intervalo } from '@/lib/formatadores'
import type { RespostaDadosDashboard } from '@/types/api'

export default function Dashboard() {
  const { chave = '' } = useParams()
  // A key reinicia o estado da página ao trocar de dashboard.
  return <PaginaDashboard key={chave} chave={chave} />
}

function PaginaDashboard({ chave }: { chave: string }) {
  const { filtros } = useFiltros(chave)
  const meta = useDashboard(chave)
  const { data: dashboards } = useDashboards()

  // escopo=sprint exige id: sem id a requisição espera a sprint ser escolhida.
  const filtrosProntos = !(filtros.escopo === 'sprint' && !filtros.id)
  const dados = useDashboardDados(chave, filtros, meta.isSuccess && filtrosProntos)
  const { atualizar, pendentes } = useAtualizarCard(chave, filtros)

  // Último resultado bom: continua na tela se um filtro inválido devolver 400.
  const [ultimoBom, setUltimoBom] = useState<RespostaDadosDashboard | undefined>(undefined)
  if (dados.data && !dados.isPlaceholderData && dados.data !== ultimoBom) setUltimoBom(dados.data)
  const resposta = dados.data ?? ultimoBom

  const resumo = dashboards?.find((d) => d.chave === chave)
  const cor = corDoDashboard({ chave, cor: meta.data?.cor ?? resumo?.cor })

  if (meta.isError) {
    const status = ehApiError(meta.error) ? meta.error.status : 0
    const primeiro = dashboards?.[0]
    if (status === 403) {
      return (
        <EstadoPagina
          tipo="sem-acesso"
          titulo="Você não tem acesso a este dashboard"
          descricao="Seu perfil não pode ver este dashboard. Escolha outro no início."
          destinoVoltar={primeiro ? `/dashboards/${primeiro.chave}` : '/'}
          rotuloVoltar={primeiro ? `Ir para ${primeiro.titulo}` : 'Voltar para o início'}
        />
      )
    }
    if (status === 404) {
      return (
        <EstadoPagina
          tipo="nao-encontrado"
          titulo="Dashboard não encontrado"
          descricao="Este dashboard não existe ou foi desativado."
        />
      )
    }
    return (
      <EstadoPagina
        tipo="erro"
        titulo="Não foi possível carregar o dashboard"
        descricao={meta.error.message}
        acoes={
          <Button onClick={() => meta.refetch()} disabled={meta.isFetching}>
            <RotateCcw />
            Tentar novamente
          </Button>
        }
      />
    )
  }

  const erroDados = dados.isError ? dados.error : null
  const erroFiltro = erroDados && ehApiError(erroDados) && erroDados.status === 400 ? erroDados.message : null
  const aplicados = resposta?.filtros_aplicados

  return (
    <main data-cor={cor} className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-12 md:px-6">
      <div className="flex flex-col gap-4 pt-6 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          {meta.data ? (
            <>
              <h1 className="text-3xl font-semibold tracking-tight">{meta.data.titulo}</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">{meta.data.descricao}</p>
            </>
          ) : (
            <>
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </>
          )}
        </div>
        <SlotCabecalho>
          {aplicados && (
            <span className="text-sm text-muted-foreground tabular-nums">
              Período: {intervalo(aplicados.de, aplicados.ate)}
            </span>
          )}
        </SlotCabecalho>
      </div>

      {erroFiltro && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Filtro inválido</AlertTitle>
          <AlertDescription>{erroFiltro}</AlertDescription>
        </Alert>
      )}

      {erroDados && !erroFiltro && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>
            <p>{erroDados.message}</p>
            <Button variant="outline" size="sm" onClick={() => dados.refetch()} disabled={dados.isFetching}>
              <RotateCcw />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {meta.data ? (
        <GradeCards
          metas={meta.data.cards}
          resultados={resposta?.cards}
          carregando={!resposta && (dados.isPending || !filtrosProntos)}
          recarregando={dados.isPlaceholderData && dados.isFetching}
          pendentes={pendentes}
          aoTentarNovamente={atualizar}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}
    </main>
  )
}

function SlotCabecalho({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-3">{children}</div>
}
