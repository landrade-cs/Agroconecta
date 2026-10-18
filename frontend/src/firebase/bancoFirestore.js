import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDocs, writeBatch,
} from 'firebase/firestore'
import { db } from './config'

const colecao = (uid, nome) => collection(db, 'usuarios', uid, nome)
const documento = (uid, nome, id) => doc(db, 'usuarios', uid, nome, id)
const docConfig = (uid) => doc(db, 'usuarios', uid, 'configuracoes', 'geral')

// O Firestore não aceita "undefined" e não precisa guardar o id dentro do documento.
const limpar = ({ id, ...resto }) => Object.fromEntries(Object.entries(resto).filter(([, v]) => v !== undefined))

// Divide uma lista em pedaços (o Firestore aceita até 500 operações por lote).
const emPedacos = (lista, tamanho = 400) => {
  const out = []
  for (let i = 0; i < lista.length; i += tamanho) out.push(lista.slice(i, i + tamanho))
  return out
}

// Avisa sempre que a coleção muda (inclusive quando outra aba ou pessoa altera).
export function ouvirColecao(uid, nome, aoMudar, aoFalhar) {
  return onSnapshot(
    colecao(uid, nome),
    (snap) => aoMudar(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
    aoFalhar
  )
}

export function ouvirConfig(uid, aoMudar, aoFalhar) {
  return onSnapshot(docConfig(uid), (snap) => aoMudar(snap.exists() ? snap.data() : null), aoFalhar)
}

export const criar = (uid, nome, item) =>
  addDoc(colecao(uid, nome), { ...limpar(item), createdAt: new Date().toISOString() })

export const atualizar = (uid, nome, id, dados) => updateDoc(documento(uid, nome, id), limpar(dados))

export const excluir = (uid, nome, id) => deleteDoc(documento(uid, nome, id))

export const salvarConfig = (uid, dados) => setDoc(docConfig(uid), dados, { merge: true })

export async function apagarTudo(uid, nomes) {
  for (const nome of nomes) {
    const snap = await getDocs(colecao(uid, nome))
    for (const grupo of emPedacos(snap.docs)) {
      const lote = writeBatch(db)
      grupo.forEach((d) => lote.delete(d.ref))
      await lote.commit()
    }
  }
}

export async function gravarTudo(uid, nomes, dados) {
  for (const nome of nomes) {
    const lista = Array.isArray(dados[nome]) ? dados[nome] : []
    for (const grupo of emPedacos(lista)) {
      const lote = writeBatch(db)
      grupo.forEach((item) => {
        // usa o id que veio no arquivo; se não tiver, o Firestore cria um novo
        const ref = item.id ? documento(uid, nome, String(item.id)) : doc(colecao(uid, nome))
        lote.set(ref, limpar(item))
      })
      await lote.commit()
    }
  }
  if (dados.config) await salvarConfig(uid, limpar(dados.config))
}

export async function substituirTudo(uid, nomes, dados) {
  await apagarTudo(uid, nomes)
  await gravarTudo(uid, nomes, dados)
}

export function mensagemDeErro(e) {
  switch (e?.code) {
    case 'permission-denied':
      return 'Sem permissão para acessar o banco. Publique as regras do Firestore (veja o README, passo 7).'
    case 'unavailable':
      return 'Sem conexão com o Firebase. Verifique sua internet.'
    case 'failed-precondition':
      return 'O Firestore ainda não foi criado neste projeto (veja o README, passo 3).'
    default:
      return 'Não foi possível falar com o banco de dados. Tente novamente.'
  }
}
