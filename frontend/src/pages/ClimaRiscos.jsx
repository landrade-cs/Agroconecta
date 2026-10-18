// Previsão do tempo (Open-Meteo), alertas de risco e plantios que podem ser afetados.

import { AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { Card, CrudSection, PageHeader, Badge } from '../components/ui'
import { NIVEIS } from '../data/seed'
import { useWeather, describe, riscoChuva } from '../lib/weather'
import { fmt, fmtDate, todayISO, nameOf, parseDate } from '../lib/utils'

const TONE = { Baixo: 'info', Médio: 'warn', Alto: 'danger' }
const diaSemana = (s) => parseDate(s).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })

function Previsao() {
  const { state } = useDados()
  const { cidade, lat, lon, limiarChuva } = state.config
  const { loading, data, error } = useWeather(lat, lon)
  const risco = riscoChuva(data, limiarChuva)
  const cur = data?.current
  const d = cur ? describe(cur.weather_code) : null

  return (
    <Card title={`Previsão do tempo — ${cidade}`}>
      <div className="muted" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <MapPin size={13} /> Dados da Open-Meteo. Troque a cidade em Configurações.
      </div>
      {loading && <p className="muted" style={{ marginTop: 12 }}>Carregando previsão…</p>}
      {error && <p className="muted" style={{ marginTop: 12 }}>Não foi possível carregar a previsão agora. Verifique sua conexão.</p>}
      {cur && (
        <>
          <div className="weather-main">
            <d.Icon size={48} color="#e6b53a" />
            <div>
              <div className="temp">{Math.round(cur.temperature_2m)}°C</div>
              <div className="muted">
                {d.texto} • umidade {cur.relative_humidity_2m}%
              </div>
            </div>
          </div>

          {risco ? (
            <div className="alert-box high">
              <b>
                <AlertTriangle size={16} /> Chuva intensa prevista
              </b>
              <p>
                Pelo menos um dos próximos 3 dias tem {fmt(risco.max)} mm ou mais, acima do limite de {limiarChuva} mm definido em Configurações.
                Antecipe colheitas de folhosas e proteja o produto no transporte.
              </p>
            </div>
          ) : (
            <div className="alert-box ok">
              <b>
                <CheckCircle2 size={16} /> Sem risco de chuva intensa nos próximos 3 dias
              </b>
            </div>
          )}

          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Tempo</th>
                  <th className="num">Mín.</th>
                  <th className="num">Máx.</th>
                  <th className="num">Chuva</th>
                </tr>
              </thead>
              <tbody>
                {data.daily.time.map((t, i) => {
                  const dd = describe(data.daily.weather_code[i])
                  const mm = data.daily.precipitation_sum[i] || 0
                  return (
                    <tr key={t}>
                      <td>{diaSemana(t)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <dd.Icon size={16} /> {dd.texto}
                        </span>
                      </td>
                      <td className="num">{Math.round(data.daily.temperature_2m_min[i])}°</td>
                      <td className="num">{Math.round(data.daily.temperature_2m_max[i])}°</td>
                      <td className="num">
                        <Badge tone={mm >= limiarChuva ? 'danger' : mm >= limiarChuva / 2 ? 'warn' : 'ok'}>{fmt(mm, 1)} mm</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}

function Afetados() {
  const { state } = useDados()
  const hoje = todayISO()
  const ativos = state.alertas.filter((a) => a.fim >= hoje)

  return (
    <Card title="Plantios que podem ser afetados pelos alertas ativos">
      {ativos.length === 0 && <p className="muted">Nenhum alerta ativo no momento.</p>}
      {ativos.map((a) => {
        const nomes = (a.produtos || '').toLowerCase()
        const lista = state.calendario.filter(
          (c) => c.status !== 'Colhido' && nomes.includes(nameOf(state.produtos, c.produtoId).toLowerCase())
        )
        return (
          <div className="box" key={a.id}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <b>{a.tipo}</b>
              <Badge tone={TONE[a.nivel]}>{a.nivel}</Badge>
              <span className="muted">
                {a.regiao} • {fmtDate(a.inicio)} a {fmtDate(a.fim)}
              </span>
            </div>
            {a.acao && (
              <p style={{ marginTop: 6 }}>
                <b>O que fazer:</b> {a.acao}
              </p>
            )}
            {lista.length > 0 ? (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                {lista.map((c) => (
                  <li key={c.id}>
                    {nameOf(state.produtos, c.produtoId)} de {nameOf(state.produtores, c.produtorId)} — colheita prevista em {fmtDate(c.colheita)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ marginTop: 6 }}>Nenhum plantio em andamento com os produtos citados.</p>
            )}
          </div>
        )
      })}
    </Card>
  )
}

export default function ClimaRiscos() {
  const hoje = todayISO()
  return (
    <>
      <PageHeader
        title="Clima e riscos"
        subtitle="Acompanhe a previsão e registre alertas que possam afetar a produção e a entrega."
      />
      <div className="grid dash-mid">
        <Previsao />
        <Afetados />
      </div>
      <CrudSection
        collection="alertas"
        singular="alerta"
        addLabel="Novo alerta"
        defaults={{ nivel: 'Médio', inicio: hoje, fim: hoje }}
        columns={[
          { key: 'tipo', label: 'Tipo de risco', value: (r) => r.tipo },
          { key: 'regiao', label: 'Região', value: (r) => r.regiao },
          { key: 'nivel', label: 'Nível', value: (r) => r.nivel, render: (r) => <Badge tone={TONE[r.nivel]}>{r.nivel}</Badge> },
          { key: 'periodo', label: 'Período', value: (r) => `${fmtDate(r.inicio)} a ${fmtDate(r.fim)}` },
          { key: 'produtos', label: 'Produtos afetados', value: (r) => r.produtos },
          { key: 'descricao', label: 'Descrição', value: (r) => r.descricao },
          {
            key: 'ativo',
            label: 'Situação',
            value: (r) => (r.fim >= hoje ? 'Ativo' : 'Encerrado'),
            render: (r) => <Badge tone={r.fim >= hoje ? 'danger' : 'neutral'}>{r.fim >= hoje ? 'Ativo' : 'Encerrado'}</Badge>,
          },
        ]}
        fields={[
          { key: 'tipo', label: 'Tipo de risco', required: true, placeholder: 'Chuvas intensas, estiagem, geada…' },
          { key: 'regiao', label: 'Região', required: true },
          { key: 'nivel', label: 'Nível', type: 'select', options: NIVEIS, required: true },
          { key: 'produtos', label: 'Produtos afetados', hint: 'Separe por vírgula. Ex.: Alface, Coentro' },
          { key: 'inicio', label: 'Início', type: 'date', required: true },
          { key: 'fim', label: 'Fim', type: 'date', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea', wide: true },
          { key: 'acao', label: 'O que fazer', type: 'textarea', wide: true },
        ]}
      />
    </>
  )
}
