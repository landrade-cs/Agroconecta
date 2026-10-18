// Funções de apoio: formatação de números, moeda e datas, conversão para kg, download de arquivos.

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const fmt = (n, d = 0) =>
  Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })
export const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const pct = (n, d = 0) => `${fmt(n, d)}%`

export const parseDate = (s) => (s ? new Date(String(s).slice(0, 10) + 'T00:00:00') : null)
export const fmtDate = (s) => {
  const d = parseDate(s)
  return d ? d.toLocaleDateString('pt-BR') : '—'
}
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const monthKey = (s) => String(s).slice(0, 7)
export const monthLabel = (k) => {
  const [y, m] = k.split('-')
  return `${MESES[Number(m) - 1]}/${y.slice(2)}`
}
export const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000)

export function lastMonths(maxKey, n) {
  const [y, m] = maxKey.split('-').map(Number)
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export const sum = (arr, f = (x) => x) => arr.reduce((t, x) => t + (Number(f(x)) || 0), 0)
export const byId = (list, id) => list.find((i) => i.id === id)
export const nameOf = (list, id, key = 'nome') => byId(list, id)?.[key] ?? '—'
// converte a quantidade para quilos, usando o peso por unidade do produto
export const toKg = (qtd, produto) => Number(qtd || 0) * Number(produto?.pesoKg || 1)

const EMOJI = {
  alface: '🥬',
  tomate: '🍅',
  'feijão': '🫘',
  cenoura: '🥕',
  mandioca: '🍠',
  banana: '🍌',
  coentro: '🌿',
  'batata-doce': '🍠',
  'milho verde': '🌽',
}
export const emojiOf = (nome) => EMOJI[(nome || '').toLowerCase()] || '🌱'

export function downloadFile(name, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function toCSV(headers, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(';')).join('\n')
}
