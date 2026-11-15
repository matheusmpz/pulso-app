import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { ContextoAuth } from '@/hooks/auth-contexto'
import { api, configurarAutenticacao } from '@/lib/api'
import { expiracaoDoJwt, lerSessao, limparSessao, salvarSessao, type Sessao } from '@/lib/auth'
import { chaves } from '@/lib/query'

/** setTimeout aceita no máximo ~24,8 dias */
const MAX_TIMEOUT = 2 ** 31 - 1

type Motivo = 'manual' | 'expirada'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao)
  const sessaoRef = useRef(sessao)

  useEffect(() => {
    sessaoRef.current = sessao
  }, [sessao])

  /** Encerra a sessão local. Nunca depende da API. */
  const encerrar = useCallback(
    (motivo: Motivo) => {
      if (!sessaoRef.current) return // já encerrada (vários 401 ao mesmo tempo)
      sessaoRef.current = null
      limparSessao()
      setSessao(null)
      queryClient.clear()
      if (motivo === 'expirada') {
        toast.warning('Sua sessão expirou. Entre novamente.', { id: 'sessao-expirada' })
      } else {
        navigate('/login', { replace: true })
      }
    },
    [queryClient, navigate],
  )

  // Liga o cliente HTTP à sessão: token no Bearer e logout em qualquer 401.
  useEffect(() => {
    configurarAutenticacao({
      obterToken: () => sessaoRef.current?.token ?? null,
      aoNaoAutorizado: () => encerrar('expirada'),
    })
  }, [encerrar])

  // Logout agendado para a expiração do token.
  useEffect(() => {
    if (!sessao) return
    const restante = new Date(sessao.expiraEm).getTime() - Date.now()
    const id = window.setTimeout(() => encerrar('expirada'), Math.min(Math.max(restante, 0), MAX_TIMEOUT))
    return () => window.clearTimeout(id)
  }, [sessao, encerrar])

  // GET /auth/me: carregado uma vez ao abrir o app (também valida o token).
  const consultaMe = useQuery({
    queryKey: chaves.me,
    queryFn: ({ signal }) => api.me(signal),
    enabled: sessao !== null,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const resposta = await api.login(email, senha)
      const expiraEm = resposta.expira_em || expiracaoDoJwt(resposta.token)
      if (!expiraEm) throw new Error('Resposta de login sem expiração.')
      const nova: Sessao = { token: resposta.token, expiraEm: new Date(expiraEm).toISOString() }
      queryClient.clear()
      salvarSessao(nova)
      sessaoRef.current = nova
      setSessao(nova)
    },
    [queryClient],
  )

  const sair = useCallback(() => {
    const token = sessaoRef.current?.token
    // Melhor esforço: revoga o token na API; falhas (rede, 401) são ignoradas.
    if (token) api.logout(token).catch(() => undefined)
    encerrar('manual')
  }, [encerrar])

  const valor = useMemo(
    () => ({
      token: sessao?.token ?? null,
      usuario: sessao ? (consultaMe.data ?? null) : null,
      carregandoUsuario: sessao !== null && consultaMe.isPending,
      entrar,
      sair,
    }),
    [sessao, consultaMe.data, consultaMe.isPending, entrar, sair],
  )

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}
