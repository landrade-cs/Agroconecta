// Tela de entrada: login, criação de conta e recuperação de senha.
import { useState } from 'react'
import { Sprout, Mail, Lock, User } from 'lucide-react'
import { useAuth, traduzirErroAuth } from '../context/AuthContext'
import Foto from '../components/Foto'

export default function Login() {
  const { entrar, criarConta, recuperarSenha } = useAuth()
  const [modo, setModo] = useState('entrar') // 'entrar' ou 'criar'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [info, setInfo] = useState('')
  const [enviando, setEnviando] = useState(false)

  const criando = modo === 'criar'

  const trocarModo = () => {
    setModo(criando ? 'entrar' : 'criar')
    setErro('')
    setInfo('')
  }

  const enviar = async (e) => {
    e.preventDefault()
    setErro('')
    setInfo('')
    if (criando && !nome.trim()) return setErro('Digite o seu nome.')
    setEnviando(true)
    try {
      if (criando) await criarConta(nome.trim(), email.trim(), senha)
      else await entrar(email.trim(), senha)
      // depois de entrar, a rota leva para o sistema sozinha (veja routes.jsx)
    } catch (err) {
      setErro(traduzirErroAuth(err))
      setEnviando(false)
    }
  }

  const esqueciSenha = async () => {
    setErro('')
    setInfo('')
    if (!email.trim()) return setErro('Digite o seu e-mail acima e clique em "Esqueci a senha" de novo.')
    try {
      await recuperarSenha(email.trim())
      setInfo('Enviamos um link para redefinir a senha. Confira também a caixa de spam.')
    } catch (err) {
      setErro(traduzirErroAuth(err))
    }
  }

  return (
    <div className="login">
      <aside className="login-lado">
        <Foto src="imagens/login.jpg" className="hero-foto" />
        <div className="hero-sombra" />
        <div className="login-lado-texto">
          <div className="login-marca claro">
            <Sprout size={32} /> <span>AgroConecta</span>
          </div>
          <h2>Conectando a agricultura familiar aos mercados</h2>
          <p>Cadastre sua produção, descubra quem está comprando e planeje a entrega com mais segurança.</p>
        </div>
      </aside>

      <main className="login-painel">
        <form className="login-form" onSubmit={enviar}>
          <div className="login-marca">
            <Sprout size={28} /> <span>AgroConecta</span>
          </div>
          <h1>{criando ? 'Criar conta' : 'Entrar'}</h1>
          <p className="muted" style={{ fontSize: 14 }}>
            {criando ? 'Preencha os dados abaixo para começar.' : 'Use o e-mail e a senha cadastrados.'}
          </p>

          {criando && (
            <label className="field">
              <span>Seu nome</span>
              <div className="campo-icone">
                <User size={16} />
                <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Ex.: Maria da Silva" />
              </div>
            </label>
          )}

          <label className="field">
            <span>E-mail</span>
            <div className="campo-icone">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="campo-icone">
              <Lock size={16} />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={criando ? 'new-password' : 'current-password'}
                placeholder={criando ? 'Mínimo de 6 caracteres' : 'Sua senha'}
                required
              />
            </div>
          </label>

          {erro && <p className="form-error">{erro}</p>}
          {info && <p className="form-ok">{info}</p>}

          <button type="submit" className="btn btn-primary btn-grande" disabled={enviando}>
            {enviando ? 'Aguarde…' : criando ? 'Criar conta' : 'Entrar'}
          </button>

          {!criando && (
            <button type="button" className="link" onClick={esqueciSenha}>
              Esqueci a senha
            </button>
          )}

          <p className="login-troca">
            {criando ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <button type="button" className="link" onClick={trocarModo}>
              {criando ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </form>
      </main>
    </div>
  )
}
