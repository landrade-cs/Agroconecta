// Página mostrada quando o endereço digitado não existe (erro 404).
import { Link } from 'react-router-dom'
import { Empty, PageHeader } from '../components/ui'

export default function NaoEncontrada() {
  return (
    <>
      <PageHeader title="Página não encontrada" subtitle="O endereço que você tentou abrir não existe." />
      <Empty title="Ops, não achamos essa página" text="Volte para o início e escolha uma opção no menu." />
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', width: 'fit-content' }}>
        Voltar ao início
      </Link>
    </>
  )
}
