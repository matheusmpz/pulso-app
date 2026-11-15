import { EstadoPagina } from '@/components/layout/EstadoPagina'

export default function NaoEncontrado() {
  return (
    <EstadoPagina
      tipo="nao-encontrado"
      titulo="Página não encontrada"
      descricao="O endereço que você abriu não existe ou foi removido."
    />
  )
}
