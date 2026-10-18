// Contexto do login: guarda quem está logado e oferece entrar, criar conta e sair.
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signOut, sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { salvarConfig } from '../firebase/banco'

const MENSAGENS = {
  'auth/invalid-email': 'Digite um e-mail válido.',
  'auth/missing-password': 'Digite a sua senha.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não existe conta com este e-mail.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/operation-not-allowed': 'O login por e-mail e senha ainda não foi ativado no Firebase (veja o README, passo 4).',
}
export const traduzirErroAuth = (e) => MENSAGENS[e?.code] || 'Não foi possível concluir. Tente novamente.'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  // undefined = ainda verificando | null = ninguém logado | objeto = pessoa logada
  const [usuario, setUsuario] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, (u) => setUsuario(u)), [])

  const entrar = (email, senha) => signInWithEmailAndPassword(auth, email, senha)

  const criarConta = async (nome, email, senha) => {
    const cred = await createUserWithEmailAndPassword(auth, email, senha)
    await updateProfile(cred.user, { displayName: nome })
    // guarda o nome nas configurações para aparecer no topo do sistema
    await salvarConfig(cred.user.uid, { usuario: nome })
  }

  const sair = () => signOut(auth)
  const recuperarSenha = (email) => sendPasswordResetEmail(auth, email)

  const valor = { usuario, carregando: usuario === undefined, entrar, criarConta, sair, recuperarSenha }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
