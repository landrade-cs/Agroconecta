// Indicador de "carregando". Use tela={true} para ocupar a tela inteira.
export default function Carregando({ texto = 'Carregando…', tela = false }) {
  return (
    <div className={tela ? 'tela-carregando' : 'carregando'} role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  )
}
