// Estrutura que aparece em todas as telas depois do login:
// barra de cima (busca, avisos, perfil), menu lateral e a área onde a página é mostrada.
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, Sprout, Menu, LogOut, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDados } from '../context/DadosContext'
import { caminhoDe } from '../lib/navegacao'
import { todayISO, daysBetween, fmtDate } from '../lib/utils'
import Carregando from './Carregando'
import Foto from './Foto'
import { Empty } from './ui'

// "menu" e "itemConfig" chegam por props, vindos do arquivo routes.jsx
export default function Layout({ menu, itemConfig }) {
  const { sair } = useAuth()
  const { state, carregando, erro, vazio, ocupado, aviso, restaurarExemplo } = useDados()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [menuAberto, setMenuAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [mostrarAvisos, setMostrarAvisos] = useState(false)

  // Ao trocar de página: fecha menus, limpa a busca e volta ao topo
  useEffect(() => {
    setMenuAberto(false)
    setMostrarAvisos(false)
    setBusca('')
    window.scrollTo({ top: 0 })
  }, [pathname])

  const ir = (id) => navigate(caminhoDe(id))

  // Busca global (produtores, produtos, ofertas e demandas)
  const resultados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (t.length < 2) return []
    const nomeProduto = (id) => state.produtos.find((p) => p.id === id)?.nome || ''
    const achados = []
    state.produtores.forEach((p) => {
      if (`${p.nome} ${p.municipio} ${p.associacao}`.toLowerCase().includes(t))
        achados.push({ k: 'pr' + p.id, titulo: p.nome, sub: `Produtor • ${p.municipio}`, pagina: 'produtores' })
    })
    state.produtos.forEach((p) => {
      if (`${p.nome} ${p.categoria}`.toLowerCase().includes(t))
        achados.push({ k: 'pd' + p.id, titulo: p.nome, sub: `Produto • ${p.categoria}`, pagina: 'produtos' })
    })
    state.ofertas.forEach((o) => {
      if (nomeProduto(o.produtoId).toLowerCase().includes(t))
        achados.push({ k: 'of' + o.id, titulo: `Oferta de ${nomeProduto(o.produtoId)}`, sub: 'Mercados • oferta', pagina: 'mercados' })
    })
    state.demandas.forEach((d) => {
      if (`${d.comprador} ${nomeProduto(d.produtoId)}`.toLowerCase().includes(t))
        achados.push({ k: 'dm' + d.id, titulo: d.comprador, sub: `Demanda • ${nomeProduto(d.produtoId)}`, pagina: 'demandas' })
    })
    return achados.slice(0, 10)
  }, [busca, state])

  // Notificações: alertas climáticos ativos + oportunidades com prazo nos próximos 21 dias
  const avisos = useMemo(() => {
    const hoje = todayISO()
    const lista = []
    state.alertas
      .filter((a) => a.fim >= hoje)
      .forEach((a) =>
        lista.push({ k: a.id, titulo: `Alerta: ${a.tipo} (${a.nivel})`, sub: `${a.regiao} • até ${fmtDate(a.fim)}`, pagina: 'clima' })
      )
    state.oportunidades
      .filter((o) => o.prazo >= hoje && daysBetween(hoje, o.prazo) <= 21)
      .forEach((o) => lista.push({ k: o.id, titulo: o.titulo, sub: `Inscrições até ${fmtDate(o.prazo)}`, pagina: 'mercados' }))
    return lista
  }, [state])

  const iniciais = (state.config.usuario || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')

  const link = (item) => (
    <NavLink key={item.id} to={caminhoDe(item.id)} end={item.id === 'inicio'} className={({ isActive }) => (isActive ? 'active' : '')}>
      <item.icone size={20} /> {item.rotulo}
    </NavLink>
  )

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setMenuAberto((o) => !o)} aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        <button className="logo" onClick={() => ir('inicio')} aria-label="AgroConecta — ir para o início">
          <Sprout size={34} />
          <span>AgroConecta</span>
        </button>

        <div className="searchbox">
          <Search size={18} />
          <input
            placeholder="Buscar produtores, produtos, mercados…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          {busca.trim().length >= 2 && (
            <div className="dropdown">
              {resultados.length === 0 ? (
                <div style={{ padding: 14 }} className="muted">
                  Nada encontrado para “{busca}”.
                </div>
              ) : (
                resultados.map((r) => (
                  <button key={r.k} onClick={() => ir(r.pagina)}>
                    {r.titulo}
                    <small>{r.sub}</small>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="top-right">
          <div style={{ position: 'relative' }}>
            <button className="bell" onClick={() => setMostrarAvisos((s) => !s)} aria-label="Notificações">
              <Bell size={22} />
              {avisos.length > 0 && <span className="bell-count">{avisos.length}</span>}
            </button>
            {mostrarAvisos && (
              <div className="notif">
                {avisos.length === 0 ? (
                  <div style={{ padding: 14 }} className="muted">
                    Nenhuma notificação por enquanto.
                  </div>
                ) : (
                  avisos.map((n) => (
                    <button key={n.k} onClick={() => ir(n.pagina)}>
                      <b>{n.titulo}</b>
                      <small className="muted" style={{ display: 'block' }}>
                        {n.sub}
                      </small>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="user">
            <div className="avatar">{iniciais}</div>
            <div>
              <b>{state.config.usuario}</b>
              <small>{state.config.perfil}</small>
            </div>
            <button className="icon-btn" onClick={sair} aria-label="Sair da conta" title="Sair da conta">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <aside className={menuAberto ? 'sidebar open' : 'sidebar'}>
        <nav className="nav" aria-label="Menu principal">
          {menu.map(link)}
          <hr />
          {link(itemConfig)}
        </nav>
        <div className="side-foot">
          Conectando
          <br />a agricultura familiar
          <br />
          aos mercados
          <Foto src="imagens/menu.jpg" className="menu-foto" />
        </div>
      </aside>

      <main className="main">
        <div className="page">
          {carregando ? (
            <Carregando texto="Carregando seus dados…" />
          ) : erro ? (
            <Empty title="Não foi possível carregar os dados" text={erro} />
          ) : (
            <>
              {vazio && (
                <div className="banner">
                  <Database size={22} />
                  <div>
                    <b>Seu banco de dados ainda está vazio.</b>
                    <p>Quer começar com dados de exemplo? Você pode apagá-los ou trocá-los quando quiser.</p>
                  </div>
                  <button className="btn btn-primary" onClick={restaurarExemplo} disabled={ocupado}>
                    {ocupado ? 'Carregando…' : 'Carregar dados de exemplo'}
                  </button>
                </div>
              )}
              <Outlet />
            </>
          )}
        </div>
      </main>

      {aviso && (
        <div className={`toast toast-${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      )}
    </div>
  )
}
