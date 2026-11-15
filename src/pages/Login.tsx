import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, TriangleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { Logo } from '@/components/layout/Logo'
import { TemaToggle } from '@/components/layout/TemaToggle'
import { PainelImagem } from '@/components/login/PainelImagem'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/useAuth'
import { ehApiError } from '@/lib/api'

const esquema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.').pipe(z.email('Informe um e-mail válido.')),
  senha: z.string().min(1, 'Informe a senha.'),
})

type Campos = z.infer<typeof esquema>

export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({ resolver: zodResolver(esquema), defaultValues: { email: '', senha: '' } })

  const destino = (location.state as { destino?: string } | null)?.destino ?? '/'

  const enviar = handleSubmit(async ({ email, senha }) => {
    setErroApi(null)
    try {
      await entrar(email, senha)
      navigate(destino, { replace: true })
    } catch (erro) {
      setErroApi(ehApiError(erro) ? erro.message : 'Não foi possível entrar. Tente novamente.')
    }
  })

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute top-4 right-4">
          <TemaToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <form onSubmit={enviar} noValidate className="flex w-full max-w-sm flex-col gap-6">
            <Logo />

            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold tracking-tight">Pulso Dashboard</h1>
              <p className="text-muted-foreground">Faça seu login</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                autoFocus
                placeholder="voce@empresa.com"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-erro' : undefined}
                {...register('email')}
              />
              <p id="email-erro" aria-live="polite" className="text-sm text-destructive empty:hidden">
                {errors.email?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                  aria-invalid={errors.senha ? true : undefined}
                  aria-describedby={errors.senha ? 'senha-erro' : undefined}
                  {...register('senha')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                >
                  {mostrarSenha ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <p id="senha-erro" aria-live="polite" className="text-sm text-destructive empty:hidden">
                {errors.senha?.message}
              </p>
            </div>

            <div aria-live="polite">
              {erroApi && (
                <Alert variant="destructive">
                  <TriangleAlert />
                  <AlertDescription>{erroApi}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>
      </div>

      <PainelImagem />
    </div>
  )
}
