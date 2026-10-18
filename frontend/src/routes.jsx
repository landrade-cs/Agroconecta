import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  Home, Users, MapPinned, Package, CalendarDays, BarChart3, Store, ClipboardList,
  Share2, Truck, CloudSun, FileBarChart, Settings,
} from 'lucide-react'

import { useAuth } from './context/AuthContext'
import { DadosProvider } from './context/DadosContext'
import { caminhoDe, useIrPara } from './lib/navegacao'
import Layout from './components/Layout'
import Carregando from './components/Carregando'

import Login from './pages/Login'
import NaoEncontrada from './pages/NaoEncontrada'
import Dashboard from './pages/Dashboard'
import { Produtores, Propriedades, Produtos } from './pages/Cadastros'
import Calendario from './pages/Calendario'
import Producao from './pages/Producao'
import Mercados from './pages/Mercados'
import Demandas from './pages/Demandas'
import Canais from './pages/Canais'
import Logistica from './pages/Logistica'
import ClimaRiscos from './pages/ClimaRiscos'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'

// O Dashboard precisa da função "go" para levar a outras páginas (passada por props)
function Inicio() {
  const go = useIrPara()
  return <Dashboard go={go} />
}

// Itens do menu lateral: id (vira o endereço), texto, ícone e a página
export const MENU = [
  { id: 'inicio', rotulo: 'Início', icone: Home, Pagina: Inicio },
  { id: 'produtores', rotulo: 'Produtores', icone: Users, Pagina: Produtores },
  { id: 'propriedades', rotulo: 'Propriedades', icone: MapPinned, Pagina: Propriedades },
  { id: 'produtos', rotulo: 'Produtos', icone: Package, Pagina: Produtos },
  { id: 'calendario', rotulo: 'Calendário', icone: CalendarDays, Pagina: Calendario },
  { id: 'producao', rotulo: 'Produção', icone: BarChart3, Pagina: Producao },
  { id: 'mercados', rotulo: 'Mercados', icone: Store, Pagina: Mercados },
  { id: 'demandas', rotulo: 'Demandas', icone: ClipboardList, Pagina: Demandas },
  { id: 'canais', rotulo: 'Canais de Comercialização', icone: Share2, Pagina: Canais },
  { id: 'logistica', rotulo: 'Logística', icone: Truck, Pagina: Logistica },
  { id: 'clima', rotulo: 'Clima e Riscos', icone: CloudSun, Pagina: ClimaRiscos },
  { id: 'relatorios', rotulo: 'Relatórios', icone: FileBarChart, Pagina: Relatorios },
]
export const ITEM_CONFIG = { id: 'config', rotulo: 'Configurações', icone: Settings, Pagina: Configuracoes }

const TODAS_AS_PAGINAS = [...MENU, ITEM_CONFIG]

// Protege as páginas: quem não está logado é enviado para /login
function AreaLogada() {
  const { usuario, carregando } = useAuth()
  const local = useLocation()

  if (carregando) return <Carregando tela texto="Verificando seu acesso…" />
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />

  return (
    <DadosProvider>
      <Layout menu={MENU} itemConfig={ITEM_CONFIG} />
    </DadosProvider>
  )
}

// A tela de login só aparece para quem ainda não entrou
function AreaPublica({ children }) {
  const { usuario, carregando } = useAuth()
  const local = useLocation()

  if (carregando) return <Carregando tela texto="Verificando seu acesso…" />
  if (usuario) return <Navigate to={local.state?.de || '/'} replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AreaPublica>
            <Login />
          </AreaPublica>
        }
      />

      <Route element={<AreaLogada />}>
        {TODAS_AS_PAGINAS.map((p) => (
          <Route key={p.id} path={caminhoDe(p.id)} element={<p.Pagina />} />
        ))}
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
