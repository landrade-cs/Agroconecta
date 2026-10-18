// Relatórios e indicadores da produção e da comercialização (com CSV e impressão).

import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Printer, Download, Wheat, TrendingDown, Banknote, Users, CalendarCheck, Share2 } from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { Card, PageHeader, Stat, Badge } from '../components/ui'
import { indicadores } from '../lib/metrics'
import { fmt, brl, pct, downloadFile, toCSV, monthLabel } from '../lib/utils'

export default function Relatorios() {
  const { state } = useDados()
  const [n, setN] = useState(6)
  const [produtorId, setProdutorId] = useState('')
  const ind = useMemo(() => indicadores(state, { n, produtorId }), [state, n, produtorId])
  const periodo = `${monthLabel(ind.meses[0])} a ${monthLabel(ind.meses[ind.meses.length - 1])}`

  const exportar = () =>
    downloadFile(
      'relatorio-produtores.csv',
      toCSV(
        ['Produtor', 'Município', 'Produção (t)', 'Perdas (%)', 'Regularidade da oferta (%)', 'Canais utilizados', 'Valor comercializado (R$)'],
        ind.porProdutor.map((r) => [
          r.produtor.nome,
          r.produtor.municipio,
          r.producao.toFixed(2),
          r.perdasPct.toFixed(1),
          r.regularidade.toFixed(0),
          r.canais,
          r.valor.toFixed(2),
        ])
      ),
      'text/csv;charset=utf-8'
    )

  return (
    <>
      <PageHeader
        title="Relatórios e indicadores"
        subtitle={`Acompanhamento da produção e da comercialização — ${periodo}.`}
        actions={
          <>
            <select className="select" value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Período">
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
            </select>
            <select className="select" value={produtorId} onChange={(e) => setProdutorId(e.target.value)} aria-label="Produtor">
              <option value="">Todos os produtores</option>
              {state.produtores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost" onClick={exportar}>
              <Download size={16} /> Exportar CSV
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={16} /> Imprimir
            </button>
          </>
        }
      />

      <div className="grid grid-3">
        <Stat icon={Wheat} label="Produção realizada" value={`${fmt(ind.realizada, 1)} t`} sub={`${pct(ind.atingimento)} da prevista (${fmt(ind.prevista, 1)} t)`} />
        <Stat icon={TrendingDown} tone="red" label="Perdas" value={`${fmt(ind.perdas, 1)} t`} sub={`${pct(ind.perdasPct, 1)} da produção`} />
        <Stat icon={Banknote} tone="yellow" label="Valor comercializado" value={brl(ind.valor)} />
        <Stat icon={Users} tone="blue" label="Participação dos produtores" value={pct(ind.participacao.pct)} sub={`${ind.participacao.comRegistro} de ${ind.participacao.ativos} ativos registraram produção`} />
        <Stat icon={CalendarCheck} tone="purple" label="Regularidade da oferta" value={pct(ind.regularidade)} sub="média dos meses com produção" />
        <Stat icon={Share2} label="Diversidade de canais" value={fmt(ind.canaisMedia, 1)} sub={`canais por produtor • ${ind.canaisTotal} canais usados`} />
      </div>

      <div className="grid grid-2">
        <Card title="Valor comercializado por mês (R$)">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ind.porMes} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e9ece6" />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${fmt(v / 1000)} mil`} />
                <Tooltip formatter={(v) => brl(v)} />
                <Bar dataKey="valor" name="Valor" fill="#2f7d4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Valor por canal de comercialização (R$)">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ind.porCanal} layout="vertical" margin={{ left: 30, right: 12 }}>
                <CartesianGrid horizontal={false} stroke="#e9ece6" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${fmt(v / 1000)} mil`} />
                <YAxis type="category" dataKey="nome" fontSize={11} width={150} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => brl(v)} />
                <Bar dataKey="valor" name="Valor" fill="#e6b53a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Perdas por produto (% da produção)">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ind.perdasPorProduto} margin={{ left: -10, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e9ece6" />
                <XAxis dataKey="nome" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip formatter={(v) => `${fmt(v, 1)}%`} />
                <Bar dataKey="perdasPct" name="Perdas" fill="#b83a2e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Participação mensal dos produtores (%)">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ind.porMes} margin={{ left: -10, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e9ece6" />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="participacao" name="Participação" fill="#3a8a58" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Desempenho por produtor" pad={false}>
        <div className="table-wrap" style={{ border: 0, borderRadius: 0, marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Produtor</th>
                <th className="num">Produção (t)</th>
                <th className="num">Perdas</th>
                <th>Regularidade da oferta</th>
                <th className="num">Canais</th>
                <th className="num">Valor comercializado</th>
              </tr>
            </thead>
            <tbody>
              {ind.porProdutor.map((r) => (
                <tr key={r.produtor.id}>
                  <td>
                    {r.produtor.nome} {r.produtor.ativo !== 'Sim' && <Badge>Inativo</Badge>}
                  </td>
                  <td className="num">{fmt(r.producao, 2)}</td>
                  <td className="num">{pct(r.perdasPct, 1)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress" style={{ flex: 1 }}>
                        <i style={{ width: `${r.regularidade}%` }} />
                      </div>
                      <span>{pct(r.regularidade)}</span>
                    </div>
                  </td>
                  <td className="num">{r.canais}</td>
                  <td className="num">{brl(r.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
