import { auth } from './config'

// Endereço da API (pode ser trocado por VITE_API_URL no .env)
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Faz a chamada à API enviando o token de login do Firebase
async function requisicao(caminho, opcoes = {}) {
  const usuario = auth?.currentUser
  if (!usuario) {
    const e = new Error('Não autenticado')
    e.code = 'unauthenticated'
    throw e
  }
  const token = await usuario.getIdToken()

  let resposta
  try {
    resposta = await fetch(`${API}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
  } catch {
    const e = new Error('API fora do ar')
    e.code = 'api-offline'
    throw e
  }

  if (!resposta.ok) {
    const e = new Error(`Erro ${resposta.status}`)
    e.code = resposta.status === 401 ? 'unauthenticated' : 'api-error'
    throw e
  }
  return resposta.status === 204 ? null : resposta.json()
}


const ouvintes = new Set()

async function carregar(o) {
  try {
    const dados = o.tipo === 'config' ? await requisicao('/configuracoes') : await requisicao(`/${o.nome}`)
    if (o.ativo) o.aoMudar(dados)
  } catch (e) {
    if (o.ativo) o.aoFalhar(e)
  }
}

function ouvir(o) {
  o.ativo = true
  ouvintes.add(o)
  carregar(o)
  return () => {
    o.ativo = false
    ouvintes.delete(o)
  }
}

// nome = recarrega só aquela coleção; sem nome = recarrega tudo
const recarregar = (nome) =>
  Promise.all([...ouvintes].filter((o) => !nome || o.nome === nome).map(carregar))

export const ouvirColecao = (uid, nome, aoMudar, aoFalhar) =>
  ouvir({ tipo: 'colecao', nome, aoMudar, aoFalhar })

export const ouvirConfig = (uid, aoMudar, aoFalhar) =>
  ouvir({ tipo: 'config', nome: 'configuracoes', aoMudar, aoFalhar })

// ---------- Operações (o uid vem do token, no backend) ----------
export async function criar(uid, nome, item) {
  await requisicao(`/${nome}`, { method: 'POST', body: JSON.stringify(item) })
  await recarregar(nome)
}

export async function atualizar(uid, nome, id, dados) {
  await requisicao(`/${nome}/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
  await recarregar(nome)
}

export async function excluir(uid, nome, id) {
  await requisicao(`/${nome}/${id}`, { method: 'DELETE' })
  await recarregar(nome)
}

export async function salvarConfig(uid, dados) {
  await requisicao('/configuracoes', { method: 'PUT', body: JSON.stringify(dados) })
  await recarregar('configuracoes')
}

export async function apagarTudo(uid, nomes) {
  await requisicao('/apagar-tudo', { method: 'POST', body: JSON.stringify({ colecoes: nomes }) })
  await recarregar()
}

export async function substituirTudo(uid, nomes, dados) {
  await requisicao('/substituir', { method: 'POST', body: JSON.stringify({ colecoes: nomes, dados }) })
  await recarregar()
}

export function mensagemDeErro(e) {
  switch (e?.code) {
    case 'api-offline':
      return 'Não foi possível conectar à API. Verifique se o backend está rodando (cd backend && npm run dev).'
    case 'unauthenticated':
      return 'Sua sessão expirou. Saia e entre novamente.'
    default:
      return 'Não foi possível falar com o servidor. Tente novamente.'
  }
}