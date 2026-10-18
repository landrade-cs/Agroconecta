// Demandas dos compradores e cruzamento entre oferta e demanda.

import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useDados } from '../context/DadosContext'
import { Card, CrudSection, PageHeader, Badge, Tabs, Stat, optsFrom } from '../components/ui'
import { cruzar, STATUS_TONE } from '../lib/metrics'
import { TIPOS_COMPRADOR } from '../data/seed'
import { nameOf, fmt, brl, fmtDate, todayISO, emojiOf } from '../lib/utils'
import { TrendingUp, TrendingDown, Lightbulb, Scale } from 'lucide-react'

function Cruzamento() {
  const { state } = useDados()
  const rows = useMemo(() => cruzar(state), [state])
  const conta = (s) => rows.filter((r) => r.status === s).length

  const chart = rows.map((r) => ({
    nome: r.produto.nome,
    Oferta: +(r.ofertaKg / 1000).toFixed(2),
    Demanda: +(r.demandaKg / 1000).toFixed(2),
  }))

  const dica = (r) => {
    const u = r.produto.unidade
    if (r.status === 'Excedente' && r.demanda === 0) return 'Há oferta, mas nenhuma demanda aberta. Divulgue o produto e procure novos canais.'
    if (r.status === 'Excedente') return `Sobram ${fmt(r.saldo)} ${u}. Busque novos compradores para evitar perdas.`
    if (r.status === 'Falta') return `Faltam ${fmt(-r.saldo)} ${u}. Aumente a oferta ou reúna mais produtores.`
    if (r.status === 'Oportunidade') return 'Há compradores procurando, mas ninguém ofertou ainda. Oportunidade para planejar o plantio.'
    return 'Oferta e demanda estão próximas.'
  }

  return (
    <>
      <div className="grid grid-4">
        <Stat icon={TrendingUp} tone="yellow" label="Produtos com excedente" value={conta('Excedente')} />
        <Stat icon={TrendingDown} tone="red" label="Produtos em falta" value={conta('Falta')} />
        <Stat icon={Lightbulb} tone="blue" label="Oportunidades sem oferta" value={conta('Oportunidade')} />
        <Stat icon={Scale} tone="green" label="Em equilíbrio" value={conta('Equilibrado')} />
      </div>

      <div className="grid dash-mid">
        <Card title="Oferta disponível x demanda aberta (t)">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ left: -12, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e9ece6" />
                <XAxis dataKey="nome" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => `${fmt(v, 1)} t`} />
                <Legend />
                <Bar dataKey="Oferta" fill="#2f7d4f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Demanda" fill="#e6b53a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Como ler o cruzamento">
          <p className="muted" style={{ lineHeight: 1.6 }}>
            A oferta soma as ofertas com situação “Disponível”. A demanda soma os pedidos que ainda não foram atendidos.
            <br />
            <br />
            <b>Excedente:</b> oferta mais de 15% acima da demanda, ou sem demanda.
            <br />
            <b>Falta:</b> demanda mais de 15% acima da oferta.
            <br />
            <b>Oportunidade:</b> há demanda e nenhuma oferta.
            <br />
            <b>Equilibrado:</b> diferença de até 15%.
          </p>
        </Card>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th className="num">Oferta disponível</th>
              <th className="num">Demanda aberta</th>
              <th className="num">Saldo</th>
              <th>Situação</th>
              <th>O que fazer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.produto.id}>
                <td>
                  {emojiOf(r.produto.nome)} {r.produto.nome}
                </td>
                <td className="num">{fmt(r.oferta)} {r.produto.unidade}</td>
                <td className="num">{fmt(r.demanda)} {r.produto.unidade}</td>
                <td className="num">{r.saldo > 0 ? '+' : ''}{fmt(r.saldo)}</td>
                <td>
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                </td>
                <td className="muted">{dica(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function Demandas() {
  const [tab, setTab] = useState('demandas')
  const hoje = todayISO()
  return (
    <>
      <PageHeader
        title="Demandas"
        subtitle="Cadastre o que os compradores procuram e veja onde há excedentes, faltas e oportunidades."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'demandas', label: 'Demandas de compradores' },
          { id: 'cruzamento', label: 'Cruzamento oferta x demanda' },
        ]}
      />
      {tab === 'cruzamento' ? (
        <Cruzamento />
      ) : (
        <CrudSection
          collection="demandas"
          singular="demanda"
          addLabel="Nova demanda"
          defaults={{ status: 'Aberta', tipo: 'Varejo' }}
          columns={[
            { key: 'comprador', label: 'Comprador', value: (r) => r.comprador },
            { key: 'tipo', label: 'Tipo', value: (r) => r.tipo },
            { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId), render: (r, s) => `${emojiOf(nameOf(s.produtos, r.produtoId))} ${nameOf(s.produtos, r.produtoId)}` },
            { key: 'quantidade', label: 'Quantidade', num: true, value: (r, s) => `${fmt(r.quantidade)} ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}` },
            { key: 'precoMax', label: 'Preço máximo', num: true, value: (r) => (r.precoMax ? brl(r.precoMax) : '—') },
            { key: 'municipio', label: 'Local de entrega', value: (r) => r.municipio },
            {
              key: 'prazo',
              label: 'Prazo',
              value: (r) => fmtDate(r.prazo),
              render: (r) => (
                <span style={{ color: r.status !== 'Atendida' && r.prazo < hoje ? 'var(--red)' : undefined }}>{fmtDate(r.prazo)}</span>
              ),
            },
            {
              key: 'status',
              label: 'Situação',
              value: (r) => r.status,
              render: (r) => <Badge tone={r.status === 'Aberta' ? 'info' : r.status === 'Em negociação' ? 'warn' : 'ok'}>{r.status}</Badge>,
            },
          ]}
          fields={[
            { key: 'comprador', label: 'Comprador', required: true, wide: true },
            { key: 'tipo', label: 'Tipo de comprador', type: 'select', options: TIPOS_COMPRADOR, required: true },
            { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
            { key: 'quantidade', label: 'Quantidade desejada', type: 'number', min: 0, required: true },
            { key: 'precoMax', label: 'Preço máximo (R$)', type: 'number', step: '0.01', min: 0 },
            { key: 'municipio', label: 'Local de entrega' },
            { key: 'prazo', label: 'Prazo', type: 'date' },
            { key: 'status', label: 'Situação', type: 'select', options: ['Aberta', 'Em negociação', 'Atendida'], required: true },
          ]}
        />
      )}
    </>
  )
}
