import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { seed } from '../data/seed'
import * as banco from '../firebase/banco'

// Descobre os nomes das coleções a partir dos dados de exemplo
const MODELO = seed()
export const COLECOES = Object.keys(MODELO).filter((k) => Array.isArray(MODELO[k]))
const CONFIG_PADRAO = MODELO.config
const vazias = () => Object.fromEntries(COLECOES.map((c) => [c, []]))

const Ctx = createContext(null)

export function DadosProvider({ children }) {
  const { usuario } = useAuth()
  const uid = usuario.uid

  const [colecoes, setColecoes] = useState(vazias)
  const [configSalva, setConfigSalva] = useState(null)
  const [prontas, setProntas] = useState([]) // coleções que já chegaram pela 1ª vez
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false) // true durante operações demoradas
  const [aviso, setAviso] = useState(null) // { texto, tipo } mostrado no canto da tela
  const timer = useRef(null)

  const avisar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAviso(null), 4000)
  }, [])

  // Passo 1: "assina" cada coleção do Firestore. Qualquer mudança chega aqui sozinha.
  useEffect(() => {
    setColecoes(vazias())
    setConfigSalva(null)
    setProntas([])
    setErro('')

    const marcar = (nome) => setProntas((p) => (p.includes(nome) ? p : [...p, nome]))
    const falhou = (e) => {
      console.error(e)
      setErro(banco.mensagemDeErro(e))
    }

    const cancelar = COLECOES.map((nome) =>
      banco.ouvirColecao(
        uid,
        nome,
        (lista) => {
          setColecoes((atual) => ({ ...atual, [nome]: lista }))
          marcar(nome)
        },
        falhou
      )
    )
    cancelar.push(
      banco.ouvirConfig(
        uid,
        (cfg) => {
          setConfigSalva(cfg)
          marcar('config')
        },
        falhou
      )
    )
    return () => cancelar.forEach((parar) => parar())
  }, [uid])

  // Configurações = padrão + o que a pessoa já salvou
  const config = useMemo(
    () => ({
      ...CONFIG_PADRAO,
      usuario: usuario.displayName || (usuario.email || '').split('@')[0] || 'Usuário',
      ...configSalva,
    }),
    [configSalva, usuario]
  )

  const carregando = !erro && prontas.length < COLECOES.length + 1
  const vazio = !carregando && !erro && COLECOES.every((c) => colecoes[c].length === 0)

  // Executa uma tarefa do banco e avisa se der erro
  const executar = useCallback(
    async (tarefa, mensagemOk) => {
      try {
        await tarefa()
        if (mensagemOk) avisar(mensagemOk)
      } catch (e) {
        console.error(e)
        avisar(banco.mensagemDeErro(e), 'erro')
      }
    },
    [avisar]
  )

  const emMassa = useCallback(
    async (tarefa, mensagemOk) => {
      setOcupado(true)
      await executar(tarefa, mensagemOk)
      setOcupado(false)
    },
    [executar]
  )

  const api = useMemo(
    () => ({
      state: { ...colecoes, config },
      uid,
      carregando,
      erro,
      vazio,
      ocupado,
      aviso,

      // cadastro simples (a tela atualiza sozinha, pois o Firestore avisa a mudança)
      add: (col, item) => executar(() => banco.criar(uid, col, item)),
      update: (col, id, dados) => executar(() => banco.atualizar(uid, col, id, dados)),
      remove: (col, id) => executar(() => banco.excluir(uid, col, id)),
      setConfig: (dados) => executar(() => banco.salvarConfig(uid, dados)),

      // operações em massa
      restaurarExemplo: () => {
        const exemplo = seed()
        delete exemplo.config.usuario // mantém o nome de quem está logado
        return emMassa(() => banco.substituirTudo(uid, COLECOES, exemplo), 'Dados de exemplo carregados.')
      },
      apagarTudo: () => emMassa(() => banco.apagarTudo(uid, COLECOES), 'Todos os registros foram apagados.'),
      substituir: (dados) => emMassa(() => banco.substituirTudo(uid, COLECOES, dados), 'Backup importado com sucesso.'),
    }),
    [colecoes, config, uid, carregando, erro, vazio, ocupado, aviso, executar, emMassa]
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useDados = () => useContext(Ctx)
