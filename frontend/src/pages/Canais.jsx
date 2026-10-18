// Canais de comercialização, vendas registradas e sugestão de canais para cada produto.

import { useMemo, useState } from 'react'
import { useDados } from '../context/DadosContext'
import { Card, CrudSection, PageHeader, Badge, Tabs, Empty, optsFrom } from '../components/ui'
import { TIPOS_COMPRADOR } from '../data/seed'
import { nameOf, fmt, brl, fmtDate, todayISO, sum, emojiOf } from '../lib/utils'

const escalaDe = (qtd) => (qtd < 2000 ? 'Pequena' : qtd < 6000 ? 'Média' : 'Grande')

function Identificar() {
  const { state } = useDados()
  const [produtoId, setProdutoId] = useState(state.produtos[0]?.id || '')
  const produto = state.produtos.find((p) => p.id === produtoId)

  const info = useMemo(() => {
    if (!produto) return null
    const disponivel = sum(
      state.ofertas.filter((o) => o.produtoId === produto.id && o.status === 'Disponível'),
      (o) => o.disponivel
    )
    const escala = escalaDe(disponivel)
    const ranking = state.canais
      .map((c) => {
        const cats = c.categorias.split(',').map((x) => x.trim().toLowerCase())
        const categoriaOk = cats.includes(produto.categoria.toLowerCase())
        const escalaOk = c.escala === escala
        const demanda = state.demandas.filter(
          (d) => d.produtoId === produto.id && d.status !== 'Atendida' && d.tipo === c.tipo
        )
        const score = (categoriaOk ? 2 : 0) + (escalaOk ? 1 : 0) + (demanda.length ? 2 : 0)
        return { c, categoriaOk, escalaOk, demanda, score }
      })
      .filter((r) => r.categoriaOk)
      .sort((a, b) => b.score - a.score)
    return { disponivel, escala, ranking }
  }, [state, produto])

  return (
    <>
      <Card title="Qual canal combina com o meu produto?">
        <p className="muted" style={{ marginBottom: 12 }}>
          Escolha um produto. O sistema cruza a categoria, o volume ofertado e as demandas abertas para sugerir canais.
        </p>
        <select className="select" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} aria-label="Produto">
          {state.produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        {info && (
          <p style={{ marginTop: 12 }}>
            {emojiOf(produto.nome)} <b>{produto.nome}</b>: {fmt(info.disponivel)} {produto.unidade} disponíveis (escala <b>{info.escala.toLowerCase()}</b>).
          </p>
        )}
      </Card>

      {info && info.ranking.length === 0 && <Empty title="Nenhum canal compatível" text="Cadastre canais que aceitem a categoria deste produto." />}
      <div className="grid grid-3">
        {info?.ranking.map(({ c, escalaOk, demanda, score }, i) => (
          <div className="box" key={c.id} style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
              <b>{c.nome}</b>
              {i === 0 && score >= 3 && <Badge tone="ok">Melhor opção</Badge>}
            </div>
            <p className="muted" style={{ margin: '6px 0' }}>
              {c.tipo} • escala {c.escala.toLowerCase()} • pagamento: {c.pagamento}
            </p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Aceita a categoria “{produto.categoria}”.</li>
              <li>{escalaOk ? 'O volume ofertado combina com a escala do canal.' : `Escala do canal (${c.escala.toLowerCase()}) difere do seu volume.`}</li>
              {demanda.length > 0 && (
                <li>
                  <b>{demanda.length} comprador(es)</b> com demanda aberta: {demanda.map((d) => d.comprador).join('; ')}.
                </li>
              )}
            </ul>
            <p className="muted" style={{ marginTop: 8 }}>
              <b>Requisitos:</b> {c.requisitos}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Canais() {
  const [tab, setTab] = useState('canais')
  return (
    <>
      <PageHeader
        title="Canais de comercialização"
        subtitle="Conheça os canais, registre as vendas e descubra onde cada produto tem mais chance de ser vendido."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'canais', label: 'Canais' },
          { id: 'vendas', label: 'Vendas registradas' },
          { id: 'identificar', label: 'Identificar canais' },
        ]}
      />
      {tab === 'identificar' && <Identificar />}
      {tab === 'canais' && (
        <CrudSection
          collection="canais"
          singular="canal"
          addLabel="Novo canal"
          defaults={{ escala: 'Média' }}
          columns={[
            { key: 'nome', label: 'Canal', value: (r) => r.nome },
            { key: 'tipo', label: 'Tipo', value: (r) => r.tipo },
            { key: 'categorias', label: 'Categorias aceitas', value: (r) => r.categorias },
            { key: 'escala', label: 'Escala', value: (r) => r.escala },
            { key: 'pagamento', label: 'Pagamento', value: (r) => r.pagamento },
            { key: 'requisitos', label: 'Requisitos', value: (r) => r.requisitos },
          ]}
          fields={[
            { key: 'nome', label: 'Nome do canal', required: true, wide: true },
            { key: 'tipo', label: 'Tipo', type: 'select', options: [...TIPOS_COMPRADOR, 'Consumidor final'], required: true },
            { key: 'escala', label: 'Escala', type: 'select', options: ['Pequena', 'Média', 'Grande'], required: true },
            { key: 'categorias', label: 'Categorias aceitas', wide: true, hint: 'Separe por vírgula. Ex.: Hortaliça, Fruta, Grãos' },
            { key: 'pagamento', label: 'Forma de pagamento' },
            { key: 'requisitos', label: 'Requisitos para participar', type: 'textarea', wide: true },
          ]}
        />
      )}
      {tab === 'vendas' && (
        <CrudSection
          collection="vendas"
          singular="venda"
          addLabel="Registrar venda"
          defaults={{ data: todayISO() }}
          intro="Registre cada venda para acompanhar valores comercializados e a diversidade de canais de cada produtor."
          columns={[
            { key: 'data', label: 'Data', value: (r) => fmtDate(r.data) },
            { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
            { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId) },
            { key: 'canal', label: 'Canal', value: (r, s) => nameOf(s.canais, r.canalId) },
            { key: 'quantidade', label: 'Quantidade', num: true, value: (r, s) => `${fmt(r.quantidade)} ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}` },
            { key: 'valor', label: 'Valor', num: true, value: (r) => brl(r.valor) },
          ]}
          fields={[
            { key: 'data', label: 'Data da venda', type: 'date', required: true },
            { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
            { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
            { key: 'canalId', label: 'Canal', type: 'select', options: (s) => optsFrom(s.canais), required: true },
            { key: 'quantidade', label: 'Quantidade vendida', type: 'number', min: 0, required: true },
            { key: 'valor', label: 'Valor total (R$)', type: 'number', step: '0.01', min: 0, required: true },
          ]}
        />
      )}
    </>
  )
}
