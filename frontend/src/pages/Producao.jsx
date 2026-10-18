// Registro mensal de produção (prevista x realizada) e planejamento da capacidade.

import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useDados } from '../context/DadosContext'
import { Card, CrudSection, PageHeader, Badge, Tabs, optsFrom } from '../components/ui'
import { nameOf, fmt, pct, monthLabel, toKg, sum, todayISO } from '../lib/utils'

function Planejamento() {
  const { state } = useDados()
  const mesAtual = todayISO().slice(0, 7)

  // próxima previsão (mês futuro ainda sem produção realizada) por produtor + produto
  const linhas = useMemo(() => {
    return state.capacidades.map((c) => {
      const futuros = state.producao
        .filter((r) => r.produtorId === c.produtorId && r.produtoId === c.produtoId && r.mes >= mesAtual && !r.realizada)
        .sort((a, b) => a.mes.localeCompare(b.mes))
      const prox = futuros[0]
      return { c, prox, uso: prox && c.capacidadeMensal ? (prox.prevista / c.capacidadeMensal) * 100 : null }
    })
  }, [state, mesAtual])

  const porProduto = useMemo(
    () =>
      state.produtos
        .map((p) => {
          const rs = state.producao.filter((r) => r.produtoId === p.id && r.realizada > 0)
          return {
            nome: p.nome,
            Prevista: +(sum(rs, (r) => toKg(r.prevista, p)) / 1000).toFixed(2),
            Realizada: +(sum(rs, (r) => toKg(r.realizada, p)) / 1000).toFixed(2),
          }
        })
        .filter((x) => x.Prevista > 0),
    [state]
  )

  return (
    <div className="grid dash-mid">
      <Card title="Capacidade x previsão do próximo mês">
        <p className="muted" style={{ marginBottom: 10 }}>
          Compare a capacidade de cada produtor com o volume previsto para o próximo mês.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Produtor</th>
                <th>Produto</th>
                <th className="num">Capacidade</th>
                <th className="num">Previsto</th>
                <th>Uso da capacidade</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ c, prox, uso }) => {
                const prod = state.produtos.find((p) => p.id === c.produtoId)
                return (
                  <tr key={c.id}>
                    <td>{nameOf(state.produtores, c.produtorId)}</td>
                    <td>{prod?.nome}</td>
                    <td className="num">{fmt(c.capacidadeMensal)} {prod?.unidade}</td>
                    <td className="num">{prox ? `${fmt(prox.prevista)} (${monthLabel(prox.mes)})` : '—'}</td>
                    <td>
                      {uso == null ? (
                        <span className="muted">Sem previsão</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ flex: 1 }}>
                            <i style={{ width: `${Math.min(uso, 100)}%`, background: uso > 100 ? 'var(--red)' : undefined }} />
                          </div>
                          <Badge tone={uso > 100 ? 'danger' : 'ok'}>{pct(uso)}</Badge>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Prevista x realizada por produto (t)">
        <div className="chart-box" style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porProduto} layout="vertical" margin={{ left: 20, right: 12 }}>
              <CartesianGrid horizontal={false} stroke="#e9ece6" />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="nome" fontSize={12} width={80} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => `${fmt(v, 1)} t`} />
              <Legend />
              <Bar dataKey="Prevista" fill="#2f7d4f" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Realizada" fill="#e6b53a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

export default function Producao() {
  const [tab, setTab] = useState('registros')
  return (
    <>
      <PageHeader
        title="Produção"
        subtitle="Registre o volume previsto e o realizado de cada mês, além das perdas. Meses futuros podem ter só a previsão."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'registros', label: 'Registros mensais' },
          { id: 'planejamento', label: 'Planejamento' },
        ]}
      />
      {tab === 'planejamento' ? (
        <Planejamento />
      ) : (
        <CrudSection
          collection="producao"
          singular="registro de produção"
          addLabel="Registrar produção"
          defaults={{ realizada: 0, perdas: 0 }}
          columns={[
            { key: 'mes', label: 'Mês', value: (r) => monthLabel(r.mes) },
            { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
            { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId) },
            { key: 'prevista', label: 'Prevista', num: true, value: (r) => fmt(r.prevista) },
            { key: 'realizada', label: 'Realizada', num: true, value: (r) => fmt(r.realizada) },
            {
              key: 'ating',
              label: 'Atingimento',
              value: (r) => (r.realizada ? pct((r.realizada / r.prevista) * 100) : 'Previsto'),
              render: (r) =>
                r.realizada ? (
                  <Badge tone={r.realizada / r.prevista >= 0.9 ? 'ok' : 'warn'}>{pct((r.realizada / r.prevista) * 100)}</Badge>
                ) : (
                  <Badge tone="info">Previsto</Badge>
                ),
            },
            {
              key: 'perdas',
              label: 'Perdas',
              num: true,
              value: (r) => (r.realizada ? `${fmt(r.perdas)} (${pct((r.perdas / r.realizada) * 100, 1)})` : '—'),
            },
          ]}
          fields={[
            { key: 'mes', label: 'Mês de referência', type: 'month', required: true },
            { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
            { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true, wide: true },
            { key: 'prevista', label: 'Produção prevista', type: 'number', min: 0, required: true, hint: 'Na unidade de venda do produto.' },
            { key: 'realizada', label: 'Produção realizada', type: 'number', min: 0, hint: 'Deixe 0 enquanto o mês não terminou.' },
            { key: 'perdas', label: 'Perdas', type: 'number', min: 0, hint: 'Quanto foi perdido (pragas, chuva, transporte…).' },
          ]}
        />
      )}
    </>
  )
}
