// Entregas: datas, veículos, destinos e custo de frete.

import { Truck, CalendarClock, PackageCheck, Wallet } from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { CrudSection, PageHeader, Badge, Stat, optsFrom } from '../components/ui'
import { nameOf, fmt, brl, fmtDate, sum } from '../lib/utils'

const TONE = { Agendada: 'warn', 'Em trânsito': 'info', Entregue: 'ok', Cancelada: 'neutral' }

export default function Logistica() {
  const { state } = useDados()
  const conta = (s) => state.entregas.filter((e) => e.status === s).length
  const custo = sum(state.entregas.filter((e) => e.status !== 'Cancelada'), (e) => e.custo)

  return (
    <>
      <PageHeader
        title="Logística e entrega"
        subtitle="Organize datas, veículos e destinos das entregas para que o produto chegue fresco ao comprador."
      />
      <div className="grid grid-4">
        <Stat icon={CalendarClock} tone="yellow" label="Entregas agendadas" value={conta('Agendada')} />
        <Stat icon={Truck} tone="blue" label="Em trânsito" value={conta('Em trânsito')} />
        <Stat icon={PackageCheck} tone="green" label="Entregues" value={conta('Entregue')} />
        <Stat icon={Wallet} tone="purple" label="Custo de frete" value={brl(custo)} />
      </div>
      <CrudSection
        collection="entregas"
        singular="entrega"
        addLabel="Nova entrega"
        defaults={{ status: 'Agendada' }}
        columns={[
          { key: 'data', label: 'Data', value: (r) => fmtDate(r.data) },
          { key: 'janela', label: 'Horário', value: (r) => r.janela },
          { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
          { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId) },
          { key: 'quantidade', label: 'Quantidade', num: true, value: (r, s) => `${fmt(r.quantidade)} ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}` },
          { key: 'comprador', label: 'Comprador', value: (r) => r.comprador },
          { key: 'destino', label: 'Destino', value: (r) => r.destino },
          { key: 'transporte', label: 'Transporte', value: (r) => r.transporte },
          { key: 'custo', label: 'Custo', num: true, value: (r) => brl(r.custo) },
          { key: 'status', label: 'Situação', value: (r) => r.status, render: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
        ]}
        fields={[
          { key: 'data', label: 'Data da entrega', type: 'date', required: true },
          { key: 'janela', label: 'Janela de horário', placeholder: '06:00–08:00' },
          { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
          { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
          { key: 'quantidade', label: 'Quantidade', type: 'number', min: 0, required: true },
          { key: 'comprador', label: 'Comprador', required: true },
          { key: 'destino', label: 'Município de destino' },
          { key: 'transporte', label: 'Veículo / transportador' },
          { key: 'custo', label: 'Custo do frete (R$)', type: 'number', step: '0.01', min: 0 },
          { key: 'status', label: 'Situação', type: 'select', options: ['Agendada', 'Em trânsito', 'Entregue', 'Cancelada'], required: true },
        ]}
      />
    </>
  )
}
