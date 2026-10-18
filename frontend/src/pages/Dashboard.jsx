// Página inicial: resumo dos números, gráfico de produção, ofertas x demandas e avisos.

import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
  Users, Sprout, ShoppingCart, Store, ArrowRight, ArrowUp, AlertTriangle, Megaphone,
  ChevronRight, MapPin, Leaf, CalendarDays, BarChart3, Share2, CloudSun, CheckCircle2,
} from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { Card, Tabs } from '../components/ui'
import Foto from '../components/Foto'
import { indicadores } from '../lib/metrics'
import { useWeather, describe, riscoChuva } from '../lib/weather'
import { sum, fmt, fmtDate, emojiOf, todayISO, daysBetween } from '../lib/utils'

const curMonth = () => todayISO().slice(0, 7)
const novos = (list) => list.filter((i) => String(i.createdAt || '').slice(0, 7) === curMonth()).length

// Faixa de boas-vindas com uma foto de fundo (arquivo public/imagens/hero.jpg).
function Hero({ go }) {
  return (
    <div className="hero">
      <Foto src="imagens/hero.jpg" className="hero-foto" />
      <div className="hero-sombra" />
      <h2>Conectando a agricultura familiar aos mercados</h2>
      <p>Mais oportunidades, melhores preços e um futuro sustentável para quem produz.</p>
      <button className="btn btn-light" onClick={() => go('produtos')}>
        Ver meus produtos <ArrowRight size={16} />
      </button>
    </div>
  )
}

function Weather({ go }) {
  const { state } = useDados()
  const { lat, lon, cidade, limiarChuva } = state.config
  const { loading, data, error } = useWeather(lat, lon)
  const risco = riscoChuva(data, limiarChuva)
  const cur = data?.current
  const d = cur ? describe(cur.weather_code) : null

  return (
    <Card title="Previsão do tempo" icon={CloudSun}>
      <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={13} /> {cidade} - PE
      </div>
      {loading && <p className="muted" style={{ marginTop: 12 }}>Carregando previsão…</p>}
      {error && <p className="muted" style={{ marginTop: 12 }}>Não foi possível carregar a previsão agora. Verifique sua conexão.</p>}
      {cur && (
        <div className="weather-main">
          <d.Icon size={46} color="#e6b53a" />
          <div>
            <div className="temp">{Math.round(cur.temperature_2m)}°C</div>
            <div className="muted">{d.texto}</div>
          </div>
          <div className="muted" style={{ marginLeft: 'auto', lineHeight: 1.7 }}>
            Máx: {Math.round(data.daily.temperature_2m_max[0])}°
            <br />
            Mín: {Math.round(data.daily.temperature_2m_min[0])}°
            <br />
            Umidade {cur.relative_humidity_2m}%
          </div>
        </div>
      )}
      {data &&
        (risco ? (
          <div className="alert-box">
            <b>
              <AlertTriangle size={16} /> Alerta de risco climático
            </b>
            <p>Há previsão de chuvas intensas (até {fmt(risco.max)} mm/dia) nos próximos 3 dias na sua região.</p>
            <button className="link" style={{ marginTop: 8 }} onClick={() => go('clima')}>
              Ver detalhes <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="alert-box ok">
            <b>
              <CheckCircle2 size={16} /> Sem risco de chuva intensa
            </b>
            <p>Nenhum dia dos próximos 3 passa de {limiarChuva} mm de chuva prevista.</p>
          </div>
        ))}
    </Card>
  )
}

export default function Dashboard({ go }) {
  const { state } = useDados()
  const [tab, setTab] = useState('producao')
  const [n, setN] = useState(6)
  const ind = useMemo(() => indicadores(state, { n }), [state, n])

  const topPor = (lista, campo, filtro) =>
    state.produtos
      .map((p) => ({ p, qtd: sum(lista.filter((i) => i.produtoId === p.id && filtro(i)), (i) => i[campo]) }))
      .filter((x) => x.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 3)
  const maisOferta = topPor(state.ofertas, 'disponivel', (o) => o.status === 'Disponível')
  const maisDemanda = topPor(state.demandas, 'quantidade', (d) => d.status !== 'Atendida')

  const hoje = todayISO()
  const oport = [...state.oportunidades].filter((o) => o.prazo >= hoje).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 3)

  const kpis = [
    { icon: Users, label: 'Produtores cadastrados', value: state.produtores.length, nv: novos(state.produtores), tone: 'green' },
    { icon: Sprout, label: 'Produtos cadastrados', value: state.produtos.length, nv: novos(state.produtos), tone: 'green' },
    { icon: ShoppingCart, label: 'Ofertas disponíveis', value: state.ofertas.filter((o) => o.status === 'Disponível').length, nv: novos(state.ofertas), tone: 'green' },
    { icon: Store, label: 'Demandas ativas', value: state.demandas.filter((d) => d.status !== 'Atendida').length, nv: novos(state.demandas), tone: 'green' },
  ]

  const chart = {
    producao: { data: ind.porMes, bars: [['prevista', '#2f7d4f', 'Prevista'], ['realizada', '#e6b53a', 'Realizada']], unit: 't' },
    comercializacao: { data: ind.porMes.map((m) => ({ ...m, valorMil: +(m.valor / 1000).toFixed(1) })), bars: [['valorMil', '#2f7d4f', 'Valor vendido']], unit: 'mil R$' },
    participacao: { data: ind.porMes, bars: [['participacao', '#e6b53a', 'Produtores com registro']], unit: '%' },
  }[tab]

  return (
    <>
      <div className="dash">
        <div className="dash-col">
          <Hero go={go} />

          <div className="grid grid-4">
            {kpis.map((k) => (
              <div className="stat" key={k.label}>
                <div className={`stat-icon tone-${k.tone}`}>
                  <k.icon size={22} />
                </div>
                <div>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-value">{k.value}</div>
                  <div className="stat-sub">
                    <ArrowUp size={12} /> {k.nv} novo(s) este mês
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid dash-mid">
            <Card
              title="Visão geral da produção"
              action={
                <select className="select" value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Período">
                  <option value={3}>Últimos 3 meses</option>
                  <option value={6}>Últimos 6 meses</option>
                  <option value={12}>Últimos 12 meses</option>
                </select>
              }
            >
              <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                  { id: 'producao', label: 'Produção' },
                  { id: 'comercializacao', label: 'Comercialização' },
                  { id: 'participacao', label: 'Participação' },
                ]}
              />
              <div className="chart-box" style={{ marginTop: 14 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e9ece6" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip formatter={(v, name) => [`${fmt(v, 1)} ${chart.unit}`, name]} />
                    {chart.bars.map(([key, color, name]) => (
                      <Bar key={key} dataKey={key} name={name} fill={color} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                {chart.bars.map(([k, c, name]) => (
                  <span key={k}>
                    <i className="dot" style={{ background: c }} />
                    {name}
                  </span>
                ))}
              </div>
            </Card>

            <Card
              title="Ofertas e demandas"
              icon={Sprout}
              action={
                <button className="link" onClick={() => go('demandas')}>
                  Ver todas <ArrowRight size={13} />
                </button>
              }
            >
              <div className="box">
                <div className="mini-title">Produtos com maior oferta</div>
                {maisOferta.length === 0 && <p className="muted">Sem ofertas cadastradas.</p>}
                {maisOferta.map(({ p, qtd }) => (
                  <div className="list-row" key={p.id}>
                    <span>
                      <span className="emoji">{emojiOf(p.nome)}</span>
                      {p.nome}
                    </span>
                    <b>
                      {fmt(qtd)} {p.unidade}
                    </b>
                  </div>
                ))}
              </div>
              <div className="box">
                <div className="mini-title">Produtos com maior demanda</div>
                {maisDemanda.length === 0 && <p className="muted">Sem demandas abertas.</p>}
                {maisDemanda.map(({ p, qtd }) => (
                  <div className="list-row" key={p.id}>
                    <span>
                      <span className="emoji">{emojiOf(p.nome)}</span>
                      {p.nome}
                    </span>
                    <b>
                      {fmt(qtd)} {p.unidade}
                    </b>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-4">
            {[
              { id: 'producao', icon: BarChart3, tone: 'green', t: 'Registrar produção', d: 'Atualize sua produção e planejamento de safras' },
              { id: 'calendario', icon: CalendarDays, tone: 'yellow', t: 'Calendário de plantio e colheita', d: 'Acompanhe as melhores épocas para sua região' },
              { id: 'mercados', icon: Store, tone: 'blue', t: 'Divulgar produtos', d: 'Mostre o que você produz e encontre novos mercados' },
              { id: 'demandas', icon: Share2, tone: 'purple', t: 'Cruzamento de oferta e demanda', d: 'Identifique oportunidades e evite perdas' },
            ].map((q) => (
              <button className="quick" key={q.id} onClick={() => go(q.id)}>
                <div className={`stat-icon tone-${q.tone}`}>
                  <q.icon size={22} />
                </div>
                <b>{q.t}</b>
                <span>{q.d}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="dash-col">
          <Weather go={go} />
          <Card
            title="Avisos e oportunidades"
            icon={Megaphone}
            action={
              <button className="link" onClick={() => go('mercados')}>
                Ver todos <ArrowRight size={13} />
              </button>
            }
          >
            {oport.length === 0 && <p className="muted">Nenhuma chamada aberta no momento.</p>}
            {oport.map((o) => (
              <button className="opp" key={o.id} onClick={() => go('mercados')}>
                <div className="stat-icon tone-green" style={{ width: 40, height: 40 }}>
                  <Leaf size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <b>{o.titulo}</b>
                  <small>{o.descricao}</small>
                  <small>
                    Inscrições até {fmtDate(o.prazo)} ({daysBetween(hoje, o.prazo)} dias)
                  </small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}
