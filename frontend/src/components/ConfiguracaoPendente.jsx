// Tela de ajuda mostrada quando o arquivo ".env" ainda não foi preenchido.
import { Sprout } from 'lucide-react'

export default function ConfiguracaoPendente() {
  return (
    <div className="tela-carregando">
      <div className="login-form" style={{ maxWidth: 560 }}>
        <div className="login-marca">
          <Sprout size={30} /> <span>AgroConecta</span>
        </div>
        <h1>Falta conectar ao Firebase</h1>
        <p className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
          O sistema não encontrou as chaves do Firebase. Siga estes passos:
        </p>
        <ol className="passos">
          <li>
            Copie o arquivo <b>.env.example</b> e renomeie a cópia para <b>.env</b>.
          </li>
          <li>
            Preencha cada linha com os valores do seu projeto (Firebase → Configurações do projeto → Seus apps).
          </li>
          <li>
            Pare o servidor (<b>Ctrl + C</b>) e rode <b>npm run dev</b> de novo.
          </li>
        </ol>
        <p className="muted">O passo a passo completo está no arquivo README.md.</p>
      </div>
    </div>
  )
}
