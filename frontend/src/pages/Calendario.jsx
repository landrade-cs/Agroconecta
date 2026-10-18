// Calendário de plantio e colheita, com linha do tempo (Gantt) e lista de plantios.

import { useDados } from '../context/DadosContext'
import { Card, CrudSection, PageHeader, Badge, optsFrom } from '../components/ui'
import { nameOf, parseDate, fmtDate, daysBetween, todayISO, MESES } from '../lib/utils'

const STATUS = ['Planejado', 'Plantado', 'Em colheita', 'Colhido']
const TONE = { Planejado: 'warn', Plantado: 'ok', 'Em colheita': 'info', Colhido: 'neutral' }
const BAR = { Planejado: 'planejado', Plantado: 'plantado', 'Em colheita': 'colheita', Colhido: 'colhido' }

function Timeline({ rows, state }) {
  const items = rows.filter((r) => r.plantio && r.colheita)
  if (!items.length) return null

  const min = new Date(Math.min(...items.map((r) => parseDate(r.plantio))))
  const max = new Date(Math.max(...items.map((r) => parseDate(r.colheita))))
  const start = new Date(min.getFullYear(), min.getMonth(), 1)
  const end = new Date(max.getFullYear(), max.getMonth() + 1, 1)
  const total = end - start
  const pos = (d) => ((d - start) / total) * 100

  const ticks = []
  for (let d = new Date(start); d < end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    ticks.push({ left: pos(d), label: d.getMonth() === 0 || ticks.length === 0 ? `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}` : MESES[d.getMonth()] })
  }
  const hoje = parseDate(todayISO())
  const showToday = hoje >= start && hoje <= end

  return (
    <div className="gantt">
      <div className="gantt-inner">
        <div className="gantt-row head">
          <div />
          <div className="gantt-track">
            {ticks.map((t, i) => (
              <span key={i} className="tick" style={{ left: `${t.left}%` }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
        {items.map((r) => {
          const a = pos(parseDate(r.plantio))
          const b = pos(parseDate(r.colheita))
          return (
            <div className="gantt-row" key={r.id}>
              <div className="gantt-label">
                {nameOf(state.produtos, r.produtoId)}
                <small>{nameOf(state.produtores, r.produtorId)}</small>
              </div>
              <div className="gantt-track">
                {ticks.map((t, i) => (
                  <span key={i} className="tick" style={{ left: `${t.left}%` }} />
                ))}
                {showToday && <span className="today" style={{ left: `${pos(hoje)}%` }} title="Hoje" />}
                <span
                  className={`bar bar-${BAR[r.status] || 'plantado'}`}
                  style={{ left: `${a}%`, width: `${Math.max(b - a, 0.6)}%` }}
                  title={`Plantio ${fmtDate(r.plantio)} → colheita ${fmtDate(r.colheita)}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Calendario() {
  const { state } = useDados()
  const hoje = todayISO()
  const proximas = state.calendario
    .filter((c) => c.status !== 'Colhido' && c.colheita >= hoje)
    .sort((a, b) => a.colheita.localeCompare(b.colheita))
    .slice(0, 4)

  return (
    <>
      <PageHeader
        title="Calendário de plantio e colheita"
        subtitle="Registre o que foi plantado e quando será colhido. A linha vermelha marca o dia de hoje."
      />

      <div className="grid grid-4">
        {proximas.map((c) => {
          const dias = daysBetween(hoje, c.colheita)
          return (
            <div className="stat" key={c.id}>
              <div>
                <div className="stat-label">
                  Colheita de {nameOf(state.produtos, c.produtoId)}
                </div>
                <div className="stat-value">{dias === 0 ? 'Hoje' : `${dias} dias`}</div>
                <div className="muted">
                  {nameOf(state.produtores, c.produtorId)} • {fmtDate(c.colheita)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Card title="Linha do tempo dos plantios">
        {state.calendario.length ? (
          <>
            <Timeline rows={state.calendario} state={state} />
            <div className="legend">
              <span><i className="dot" style={{ background: 'var(--y500)' }} />Planejado</span>
              <span><i className="dot" style={{ background: 'var(--g600)' }} />Plantado</span>
              <span><i className="dot" style={{ background: 'var(--g900)' }} />Em colheita</span>
              <span><i className="dot" style={{ background: '#b9c2bb' }} />Colhido</span>
            </div>
          </>
        ) : (
          <p className="muted">Cadastre um plantio para ver a linha do tempo.</p>
        )}
      </Card>

      <CrudSection
        collection="calendario"
        singular="plantio"
        addLabel="Novo plantio"
        defaults={{ status: 'Planejado' }}
        columns={[
          { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId) },
          { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
          { key: 'plantio', label: 'Plantio', value: (r) => fmtDate(r.plantio) },
          { key: 'colheita', label: 'Colheita prevista', value: (r) => fmtDate(r.colheita) },
          {
            key: 'ciclo',
            label: 'Ciclo (dias)',
            num: true,
            value: (r) => (r.plantio && r.colheita ? daysBetween(r.plantio, r.colheita) : ''),
          },
          { key: 'status', label: 'Situação', value: (r) => r.status, render: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
        ]}
        fields={[
          { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
          { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
          { key: 'plantio', label: 'Data de plantio', type: 'date', required: true },
          { key: 'colheita', label: 'Colheita prevista', type: 'date', required: true },
          { key: 'status', label: 'Situação', type: 'select', options: STATUS, required: true },
        ]}
      />
    </>
  )
}
