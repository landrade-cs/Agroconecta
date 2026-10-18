import { useNavigate } from 'react-router-dom'

export const caminhoDe = (id) => (id === 'inicio' ? '/' : `/${id}`)

// Devolve uma função go('produtos') que leva para a página escolhida
export function useIrPara() {
  const navigate = useNavigate()
  return (id) => {
    navigate(caminhoDe(id))
    window.scrollTo({ top: 0 })
  }
}
