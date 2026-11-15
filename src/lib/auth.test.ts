import { describe, expect, it } from 'vitest'

import { expiracaoDoJwt, iniciais, primeiroNome, rotuloPerfil, sessaoExpirada } from '@/lib/auth'

function jwt(payload: object) {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.assinatura`
}

describe('auth', () => {
  it('lê a expiração do JWT', () => {
    expect(expiracaoDoJwt(jwt({ exp: 1794843898 }))).toBe(new Date(1794843898 * 1000).toISOString())
    expect(expiracaoDoJwt('lixo')).toBeNull()
  })

  it('sessão expirada', () => {
    const agora = new Date('2026-11-15T12:00:00Z')
    expect(sessaoExpirada({ token: 't', expiraEm: '2026-11-15T11:59:59Z' }, agora)).toBe(true)
    expect(sessaoExpirada({ token: 't', expiraEm: '2026-11-16T12:00:00Z' }, agora)).toBe(false)
    expect(sessaoExpirada({ token: 't', expiraEm: 'invalida' }, agora)).toBe(true)
  })

  it('iniciais e primeiro nome', () => {
    expect(iniciais('Matheus Pereira Soares')).toBe('MS')
    expect(iniciais('Diretoria (dev)')).toBe('DD')
    expect(iniciais('Matheus')).toBe('MA')
    expect(primeiroNome('Matheus Pereira')).toBe('Matheus')
  })

  it('rótulo do perfil', () => {
    expect(rotuloPerfil('diretoria')).toBe('Diretoria')
    expect(rotuloPerfil('lider_tecnologia')).toBe('Líder de tecnologia')
    expect(rotuloPerfil('financeiro_geral')).toBe('Financeiro geral')
  })
})
