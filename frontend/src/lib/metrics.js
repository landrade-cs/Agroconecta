// Cálculos dos indicadores (produção, perdas, vendas) e do cruzamento oferta x demanda.

import { sum, toKg, monthKey, lastMonths, monthLabel } from './utils'

export function maxMonth(state) {
  const keys = [...state.producao.filter((p) => p.realizada > 0).map((p) => p.mes), ...state.vendas.map((v) => monthKey(v.data))].filter(Boolean)
  if (!keys.length) return monthKey(new Date().toISOString())
  return keys.sort()[keys.length - 1]
}

// Cruzamento oferta x demanda por produto
export function cruzar(state) {
  return state.produtos
    .map((p) => {
      const oferta = sum(
        state.ofertas.filter((o) => o.produtoId === p.id && o.status === 'Disponível'),
        (o) => o.disponivel
      )
      const demanda = sum(
        state.demandas.filter((d) => d.produtoId === p.id && d.status !== 'Atendida'),
        (d) => d.quantidade
      )
      const saldo = oferta - demanda
      let status = 'Equilibrado'
      if (!oferta && !demanda) status = 'Sem movimento'
      else if (!oferta) status = 'Oportunidade'
      else if (!demanda) status = 'Excedente'
      else {
        const r = saldo / demanda
        if (r > 0.15) status = 'Excedente'
        else if (r < -0.15) status = 'Falta'
      }
      return { produto: p, oferta, demanda, saldo, status, ofertaKg: toKg(oferta, p), demandaKg: toKg(demanda, p) }
    })
    .filter((r) => r.status !== 'Sem movimento')
}

export const STATUS_TONE = { Excedente: 'warn', Falta: 'danger', Oportunidade: 'info', Equilibrado: 'ok' }

// Indicadores de acompanhamento: produção, perdas, vendas, participação, regularidade e canais
export function indicadores(state, { n = 6, produtorId = '' } = {}) {
  const meses = lastMonths(maxMonth(state), n)
  const setM = new Set(meses)
  const pm = new Map(state.produtos.map((p) => [p.id, p]))
  const prod = state.producao.filter((r) => setM.has(r.mes) && (!produtorId || r.produtorId === produtorId))
  const vendas = state.vendas.filter((v) => setM.has(monthKey(v.data)) && (!produtorId || v.produtorId === produtorId))
  const kg = (r, f) => toKg(r[f], pm.get(r.produtoId))

  const prevista = sum(prod, (r) => kg(r, 'prevista')) / 1000
  const realizada = sum(prod, (r) => kg(r, 'realizada')) / 1000
  const perdas = sum(prod, (r) => kg(r, 'perdas')) / 1000
  const valor = sum(vendas, (v) => v.valor)

  const produtores = state.produtores.filter((p) => !produtorId || p.id === produtorId)
  const ativos = produtores.filter((p) => p.ativo === 'Sim')

  const porMes = meses.map((m) => {
    const rs = prod.filter((r) => r.mes === m)
    const comReg = new Set(rs.filter((r) => r.realizada > 0).map((r) => r.produtorId))
    return {
      mes: m,
      label: monthLabel(m),
      prevista: +(sum(rs, (r) => kg(r, 'prevista')) / 1000).toFixed(2),
      realizada: +(sum(rs, (r) => kg(r, 'realizada')) / 1000).toFixed(2),
      valor: sum(
        vendas.filter((v) => monthKey(v.data) === m),
        (v) => v.valor
      ),
      participacao: ativos.length
        ? Math.round((ativos.filter((p) => comReg.has(p.id)).length / ativos.length) * 100)
        : 0,
    }
  })

  const porProdutor = produtores.map((p) => {
    const rs = prod.filter((r) => r.produtorId === p.id)
    const vs = vendas.filter((v) => v.produtorId === p.id)
    const mesesOfertados = new Set(rs.filter((r) => r.realizada > 0).map((r) => r.mes)).size
    const real = sum(rs, (r) => kg(r, 'realizada')) / 1000
    const per = sum(rs, (r) => kg(r, 'perdas')) / 1000
    return {
      produtor: p,
      producao: real,
      perdasPct: real ? (per / real) * 100 : 0,
      regularidade: meses.length ? (mesesOfertados / meses.length) * 100 : 0,
      canais: new Set(vs.map((v) => v.canalId)).size,
      valor: sum(vs, (v) => v.valor),
    }
  })

  const porCanal = state.canais
    .map((c) => ({
      nome: c.nome,
      valor: sum(
        vendas.filter((v) => v.canalId === c.id),
        (v) => v.valor
      ),
    }))
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor)

  const perdasPorProduto = state.produtos
    .map((p) => {
      const rs = prod.filter((r) => r.produtoId === p.id)
      const real = sum(rs, (r) => r.realizada)
      return {
        nome: p.nome,
        perdasPct: real ? +((sum(rs, (r) => r.perdas) / real) * 100).toFixed(1) : 0,
        tem: real > 0,
      }
    })
    .filter((p) => p.tem)
    .sort((a, b) => b.perdasPct - a.perdasPct)

  const comRegistro = new Set(prod.filter((r) => r.realizada > 0).map((r) => r.produtorId))
  const ativosComReg = ativos.filter((p) => comRegistro.has(p.id)).length
  const ativosRows = porProdutor.filter((r) => r.produtor.ativo === 'Sim')
  const media = (f) => (ativosRows.length ? sum(ativosRows, f) / ativosRows.length : 0)

  return {
    meses,
    prevista,
    realizada,
    perdas,
    valor,
    atingimento: prevista ? (realizada / prevista) * 100 : 0,
    perdasPct: realizada ? (perdas / realizada) * 100 : 0,
    participacao: {
      ativos: ativos.length,
      comRegistro: ativosComReg,
      pct: ativos.length ? (ativosComReg / ativos.length) * 100 : 0,
    },
    regularidade: media((r) => r.regularidade),
    canaisMedia: media((r) => r.canais),
    canaisTotal: porCanal.length,
    porMes,
    porProdutor,
    porCanal,
    perdasPorProduto,
  }
}
