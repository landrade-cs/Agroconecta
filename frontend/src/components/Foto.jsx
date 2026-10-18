// Mostra uma foto da pasta public/imagens. Se o arquivo ainda não existir,
// a foto simplesmente não aparece e o fundo verde continua bonito.
import { useState } from 'react'

export default function Foto({ src, alt = '', className = '' }) {
  const [falhou, setFalhou] = useState(false)
  if (falhou) return null
  return <img className={`foto ${className}`} src={`${import.meta.env.BASE_URL}${src}`} alt={alt} onError={() => setFalhou(true)} />
}
