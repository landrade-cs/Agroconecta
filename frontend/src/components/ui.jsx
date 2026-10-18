import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Download, Search } from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { downloadFile, toCSV } from '../lib/utils'

export function Card({ title, icon: Icon, action, children, className = '', pad = true }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-head">
          <h3>
            {Icon && <Icon size={18} />}
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className={pad ? 'card-body' : ''}>{children}</div>
    </section>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={value === t.id ? 'tab active' : 'tab'}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Stat({ icon: Icon, label, value, sub, tone = 'green' }) {
  return (
    <div className="stat">
      <div className={`stat-icon tone-${tone}`}>{Icon && <Icon size={22} />}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

export function Empty({ title, text }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}

const normOptions = (opts, state) => {
  const list = typeof opts === 'function' ? opts(state) : opts || []
  return list.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

export const optsFrom = (list, key = 'nome') => list.map((i) => ({ value: i.id, label: i[key] }))

function RecordForm({ title, fields, initial, state, onSave, onClose }) {
  const [v, setV] = useState(initial)
  const [err, setErr] = useState('')
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }))

  const submit = (e) => {
    e.preventDefault()
    const miss = fields.find((f) => f.required && (v[f.key] === '' || v[f.key] == null))
    if (miss) return setErr(`Preencha o campo "${miss.label}".`)
    const out = { ...v }
    fields.forEach((f) => {
      if (f.type === 'number') out[f.key] = out[f.key] === '' ? 0 : Number(out[f.key])
    })
    onSave(out)
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="form-grid">
          {fields.map((f) => (
            <label key={f.key} className={`field ${f.wide ? 'wide' : ''}`}>
              <span>
                {f.label}
                {f.required && ' *'}
              </span>
              {f.type === 'select' ? (
                <select value={v[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                  <option value="">Selecione</option>
                  {normOptions(f.options, state).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows={3} value={v[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
              ) : (
                <input
                  type={f.type || 'text'}
                  step={f.step}
                  min={f.min}
                  placeholder={f.placeholder}
                  value={v[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.hint && <small>{f.hint}</small>}
            </label>
          ))}
        </div>
        {err && <p className="form-error">{err}</p>}
        <footer>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </footer>
      </form>
    </Modal>
  )
}

/**
 * Tela de cadastro genérica: tabela + busca + formulário de criar/editar + exportar CSV.
 * columns: [{ key, label, value(row,state), render?(row,state), num? }]
 * fields:  [{ key, label, type, options, required, wide, step, hint }]
 */
export function CrudSection({ collection, singular, columns, fields, defaults = {}, actions = [], filterFn, intro, addLabel }) {
  const { state, add, update, remove } = useDados()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)

  const rows = state[collection]
    .filter((r) => !filterFn || filterFn(r, state))
    .filter((r) => !q || columns.map((c) => String(c.value(r, state) ?? '')).join(' ').toLowerCase().includes(q.toLowerCase()))

  const blank = () => {
    const o = {}
    fields.forEach((f) => (o[f.key] = ''))
    return { ...o, ...defaults }
  }

  const save = (data) => {
    if (editing.id) update(collection, editing.id, data)
    else add(collection, data)
    setEditing(null)
  }

  const exportCsv = () =>
    downloadFile(
      `${collection}.csv`,
      toCSV(
        columns.map((c) => c.label),
        rows.map((r) => columns.map((c) => c.value(r, state))),
      ),
      'text/csv;charset=utf-8'
    )

  return (
    <div className="crud">
      {intro && <p className="intro">{intro}</p>}
      <div className="toolbar">
        <div className="search-inline">
          <Search size={16} />
          <input placeholder="Filtrar registros…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="muted">{rows.length} registro(s)</span>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!rows.length}>
          <Download size={16} /> Exportar CSV
        </button>
        <button className="btn btn-primary" onClick={() => setEditing(blank())}>
          <Plus size={16} /> {addLabel || `Novo ${singular}`}
        </button>
      </div>

      {rows.length === 0 ? (
        <Empty title={`Nenhum ${singular} encontrado`} text={`Use o botão "${addLabel || `Novo ${singular}`}" para cadastrar o primeiro.`} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={c.num ? 'num' : ''}>
                    {c.label}
                  </th>
                ))}
                <th className="actions-col" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.num ? 'num' : ''}>
                      {c.render ? c.render(r, state) : c.value(r, state)}
                    </td>
                  ))}
                  <td className="actions-col">
                    {actions.map((a) => (
                      <button key={a.label} className="btn btn-small btn-ghost" onClick={() => a.onClick(r, state)}>
                        {a.icon && <a.icon size={14} />} {a.label}
                      </button>
                    ))}
                    <button className="icon-btn" aria-label="Editar" onClick={() => setEditing({ ...r })}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn danger"
                      aria-label="Excluir"
                      onClick={() => window.confirm(`Excluir este ${singular}?`) && remove(collection, r.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RecordForm
          title={editing.id ? `Editar ${singular}` : `Novo ${singular}`}
          fields={fields}
          initial={editing}
          state={state}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
