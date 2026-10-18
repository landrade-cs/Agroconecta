// Ofertas, preços de referência, chamadas públicas e informações de mercado.

import { useMemo, useState } from 'react'
import { Megaphone, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { Card, CrudSection, PageHeader, Badge, Tabs, optsFrom } from '../components/ui'
import { nameOf, fmt, brl, fmtDate, todayISO, sum, emojiOf } from '../lib/utils'

function Ofertas() {
  const divulgar = (o, s) => {
    const p = s.produtos.find((x) => x.id === o.produtoId)
    const prod = s.produtores.find((x) => x.id === o.produtorId)
    const texto =
      `🌱 *${p?.nome}* disponível!\n` +
      `Quantidade: ${fmt(o.disponivel)} ${p?.unidade}\n` +
      `Preço: ${brl(o.preco)} por ${p?.unidade}\n` +
      `A partir de: ${fmtDate(o.desde)}\n` +
      `Produtor(a): ${prod?.nome} — ${prod?.municipio}\n` +
      (prod?.telefone ? `Contato: ${prod.telefone}\n` : '') +
      `Agricultura familiar via AgroConecta`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <CrudSection
      collection="ofertas"
      singular="oferta"
      addLabel="Nova oferta"
      defaults={{ status: 'Disponível', desde: todayISO() }}
      intro="Compare a oferta prevista com a efetivamente disponível. Use “Divulgar” para enviar o anúncio pelo WhatsApp."
      actions={[{ label: 'Divulgar', icon: Megaphone, onClick: divulgar }]}
      columns={[
        { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId), render: (r, s) => `${emojiOf(nameOf(s.produtos, r.produtoId))} ${nameOf(s.produtos, r.produtoId)}` },
        { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
        { key: 'prevista', label: 'Oferta prevista', num: true, value: (r, s) => `${fmt(r.prevista)} ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}` },
        { key: 'disponivel', label: 'Disponível agora', num: true, value: (r, s) => `${fmt(r.disponivel)} ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}` },
        {
          key: 'dif',
          label: 'Efetivação',
          value: (r) => (r.prevista ? `${fmt((r.disponivel / r.prevista) * 100)}%` : '—'),
          render: (r) => (r.prevista ? <Badge tone={r.disponivel / r.prevista >= 0.9 ? 'ok' : 'warn'}>{fmt((r.disponivel / r.prevista) * 100)}%</Badge> : '—'),
        },
        { key: 'preco', label: 'Preço', num: true, value: (r) => brl(r.preco) },
        { key: 'desde', label: 'Disponível desde', value: (r) => fmtDate(r.desde) },
        { key: 'status', label: 'Situação', value: (r) => r.status, render: (r) => <Badge tone={r.status === 'Disponível' ? 'ok' : r.status === 'Reservada' ? 'warn' : 'neutral'}>{r.status}</Badge> },
      ]}
      fields={[
        { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
        { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
        { key: 'prevista', label: 'Oferta prevista', type: 'number', min: 0, required: true },
        { key: 'disponivel', label: 'Oferta disponível', type: 'number', min: 0, required: true },
        { key: 'preco', label: 'Preço por unidade (R$)', type: 'number', step: '0.01', min: 0, required: true },
        { key: 'desde', label: 'Disponível desde', type: 'date' },
        { key: 'status', label: 'Situação', type: 'select', options: ['Disponível', 'Reservada', 'Esgotada'], required: true },
      ]}
    />
  )
}

function Precos() {
  const { state } = useDados()

  const resumo = useMemo(
    () =>
      state.produtos
        .map((p) => {
          const refs = state.precos.filter((x) => x.produtoId === p.id)
          const ofs = state.ofertas.filter((o) => o.produtoId === p.id && o.status === 'Disponível')
          if (!refs.length) return null
          const media = sum(refs, (x) => x.preco) / refs.length
          const meuPreco = ofs.length ? sum(ofs, (o) => o.preco) / ofs.length : null
          return {
            p,
            min: Math.min(...refs.map((x) => x.preco)),
            max: Math.max(...refs.map((x) => x.preco)),
            media,
            meuPreco,
            dif: meuPreco ? ((meuPreco - media) / media) * 100 : null,
          }
        })
        .filter(Boolean),
    [state]
  )

  return (
    <>
      <Card title="Resumo por produto: referência x meu preço">
        <p className="muted" style={{ marginBottom: 10 }}>
          Os preços abaixo são de exemplo. Atualize com valores de fontes oficiais (CEASA-PE, Conab, prefeituras) no cadastro mais abaixo.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="num">Mínimo</th>
                <th className="num">Média</th>
                <th className="num">Máximo</th>
                <th className="num">Preço médio ofertado</th>
                <th>Comparação</th>
              </tr>
            </thead>
            <tbody>
              {resumo.map((r) => (
                <tr key={r.p.id}>
                  <td>
                    {emojiOf(r.p.nome)} {r.p.nome} <span className="muted">(por {r.p.unidade})</span>
                  </td>
                  <td className="num">{brl(r.min)}</td>
                  <td className="num">{brl(r.media)}</td>
                  <td className="num">{brl(r.max)}</td>
                  <td className="num">{r.meuPreco ? brl(r.meuPreco) : '—'}</td>
                  <td>
                    {r.dif == null ? (
                      <span className="muted">Sem oferta</span>
                    ) : (
                      <Badge tone={r.dif > 15 ? 'warn' : r.dif < -15 ? 'info' : 'ok'}>
                        {r.dif > 15 ? 'Acima da referência' : r.dif < -15 ? 'Abaixo da referência' : 'Na média'} ({r.dif > 0 ? '+' : ''}
                        {fmt(r.dif)}%)
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CrudSection
        collection="precos"
        singular="preço de referência"
        addLabel="Novo preço"
        defaults={{ data: todayISO(), variacao: 0 }}
        columns={[
          { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId) },
          { key: 'mercado', label: 'Mercado', value: (r) => r.mercado },
          { key: 'preco', label: 'Preço', num: true, value: (r, s) => `${brl(r.preco)} / ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}` },
          {
            key: 'variacao',
            label: 'Variação',
            value: (r) => `${r.variacao}%`,
            render: (r) => {
              const I = r.variacao > 0 ? TrendingUp : r.variacao < 0 ? TrendingDown : Minus
              return (
                <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: r.variacao > 0 ? 'var(--g700)' : r.variacao < 0 ? 'var(--red)' : 'var(--muted)' }}>
                  <I size={14} /> {r.variacao}%
                </span>
              )
            },
          },
          { key: 'data', label: 'Data da coleta', value: (r) => fmtDate(r.data) },
          { key: 'fonte', label: 'Fonte', value: (r) => r.fonte },
        ]}
        fields={[
          { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
          { key: 'mercado', label: 'Mercado', required: true, placeholder: 'Ex.: CEASA-PE (Recife)' },
          { key: 'preco', label: 'Preço (R$ por unidade)', type: 'number', step: '0.01', min: 0, required: true },
          { key: 'variacao', label: 'Variação vs. período anterior (%)', type: 'number', step: '0.1' },
          { key: 'data', label: 'Data da coleta', type: 'date' },
          { key: 'fonte', label: 'Fonte', placeholder: 'Ex.: Conab, CEASA-PE' },
        ]}
      />
    </>
  )
}

function Oportunidades() {
  const hoje = todayISO()
  return (
    <CrudSection
      collection="oportunidades"
      singular="oportunidade"
      addLabel="Nova oportunidade"
      defaults={{ tipo: 'Chamada pública' }}
      intro="Divulgue chamadas públicas, programas institucionais, feiras e outras oportunidades de comercialização."
      columns={[
        { key: 'titulo', label: 'Título', value: (r) => r.titulo },
        { key: 'tipo', label: 'Tipo', value: (r) => r.tipo },
        { key: 'orgao', label: 'Órgão / organizador', value: (r) => r.orgao },
        { key: 'descricao', label: 'Descrição', value: (r) => r.descricao },
        { key: 'prazo', label: 'Prazo', value: (r) => fmtDate(r.prazo) },
        {
          key: 'situacao',
          label: 'Situação',
          value: (r) => (r.prazo >= hoje ? 'Aberta' : 'Encerrada'),
          render: (r) => <Badge tone={r.prazo >= hoje ? 'ok' : 'neutral'}>{r.prazo >= hoje ? 'Aberta' : 'Encerrada'}</Badge>,
        },
        {
          key: 'link',
          label: 'Mais informações',
          value: (r) => r.link,
          render: (r) =>
            r.link ? (
              <a className="link" href={r.link} target="_blank" rel="noreferrer">
                Abrir link
              </a>
            ) : (
              '—'
            ),
        },
      ]}
      fields={[
        { key: 'titulo', label: 'Título', required: true, wide: true },
        { key: 'tipo', label: 'Tipo', type: 'select', options: ['Chamada pública', 'Programa', 'Feira', 'Outro'], required: true },
        { key: 'orgao', label: 'Órgão / organizador' },
        { key: 'prazo', label: 'Prazo de inscrição', type: 'date', required: true },
        { key: 'link', label: 'Link do edital ou página', placeholder: 'https://…' },
        { key: 'descricao', label: 'Descrição', type: 'textarea', wide: true },
      ]}
    />
  )
}

function Notas() {
  return (
    <CrudSection
      collection="notas"
      singular="nota de mercado"
      addLabel="Nova nota"
      defaults={{ data: todayISO() }}
      columns={[
        { key: 'titulo', label: 'Assunto', value: (r) => r.titulo },
        { key: 'texto', label: 'Informação', value: (r) => r.texto },
        { key: 'data', label: 'Data', value: (r) => fmtDate(r.data) },
      ]}
      fields={[
        { key: 'titulo', label: 'Assunto', required: true, wide: true },
        { key: 'texto', label: 'Informação de mercado', type: 'textarea', wide: true, required: true },
        { key: 'data', label: 'Data', type: 'date' },
      ]}
    />
  )
}

export default function Mercados() {
  const [tab, setTab] = useState('ofertas')
  return (
    <>
      <PageHeader
        title="Mercados"
        subtitle="Divulgue o que está disponível, consulte preços de referência e acompanhe chamadas e programas de compra."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'ofertas', label: 'Ofertas de produtos' },
          { id: 'precos', label: 'Preços de referência' },
          { id: 'oportunidades', label: 'Chamadas e oportunidades' },
          { id: 'notas', label: 'Informações de mercado' },
        ]}
      />
      {tab === 'ofertas' && <Ofertas />}
      {tab === 'precos' && <Precos />}
      {tab === 'oportunidades' && <Oportunidades />}
      {tab === 'notas' && <Notas />}
    </>
  )
}
