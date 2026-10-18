import * as direto from './bancoFirestore'
import * as viaApi from './bancoApi'

const usarApi = import.meta.env.VITE_USAR_API === 'true'
const impl = usarApi ? viaApi : direto

export const ouvirColecao = impl.ouvirColecao
export const ouvirConfig = impl.ouvirConfig
export const criar = impl.criar
export const atualizar = impl.atualizar
export const excluir = impl.excluir
export const salvarConfig = impl.salvarConfig
export const apagarTudo = impl.apagarTudo
export const substituirTudo = impl.substituirTudo
export const mensagemDeErro = impl.mensagemDeErro
