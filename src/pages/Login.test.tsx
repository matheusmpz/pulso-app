import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { TemaProvider } from '@/components/layout/TemaProvider'
import { ContextoAuth, type AuthContexto } from '@/hooks/auth-contexto'
import { ApiError } from '@/lib/api'
import Login from '@/pages/Login'

function renderizar(entrar: AuthContexto['entrar']) {
  const auth: AuthContexto = { token: null, usuario: null, carregandoUsuario: false, entrar, sair: vi.fn() }
  return render(
    <TemaProvider>
      <ContextoAuth.Provider value={auth}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </ContextoAuth.Provider>
    </TemaProvider>,
  )
}

describe('Login', () => {
  it('valida os campos em português antes de chamar a API', async () => {
    const entrar = vi.fn()
    renderizar(entrar)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
    expect(entrar).not.toHaveBeenCalled()
  })

  it('mostra a mensagem da API em caso de 401', async () => {
    const entrar = vi.fn().mockRejectedValue(new ApiError(401, 'E-mail ou senha inválidos'))
    renderizar(entrar)
    await userEvent.type(screen.getByLabelText('E-mail'), 'alguem@pulso.local')
    await userEvent.type(screen.getByLabelText('Senha'), 'errada')
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos')
    expect(entrar).toHaveBeenCalledWith('alguem@pulso.local', 'errada')
  })

  it('o foco inicial fica no e-mail', () => {
    renderizar(vi.fn())
    expect(screen.getByLabelText('E-mail')).toHaveFocus()
  })
})
