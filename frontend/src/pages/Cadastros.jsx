// Telas de cadastro: Produtores, Propriedades e Produtos (catálogo + capacidade produtiva).

import { useState } from 'react'
import { useDados } from '../context/DadosContext'
import { CrudSection, PageHeader, Badge, Tabs, optsFrom } from '../components/ui'
import { CATEGORIAS, UNIDADES, CERTIFICACOES } from '../data/seed'
import { nameOf, fmt } from '../lib/utils'

export function Produtores() {
  return (
    <>
      <PageHeader title="Produtores" subtitle="Cadastre os agricultores e agricultoras familiares que fazem parte da rede." />
      <CrudSection
        collection="produtores"
        singular="produtor"
        addLabel="Novo produtor"
        defaults={{ ativo: 'Sim' }}
        columns={[
          { key: 'nome', label: 'Nome', value: (r) => r.nome },
          { key: 'documento', label: 'CAF / DAP', value: (r) => r.documento },
          { key: 'municipio', label: 'Município', value: (r) => r.municipio },
          { key: 'associacao', label: 'Associação / cooperativa', value: (r) => r.associacao },
          { key: 'telefone', label: 'Telefone', value: (r) => r.telefone },
          {
            key: 'ativo',
            label: 'Situação',
            value: (r) => (r.ativo === 'Sim' ? 'Ativo' : 'Inativo'),
            render: (r) => <Badge tone={r.ativo === 'Sim' ? 'ok' : 'neutral'}>{r.ativo === 'Sim' ? 'Ativo' : 'Inativo'}</Badge>,
          },
        ]}
        fields={[
          { key: 'nome', label: 'Nome completo', required: true, wide: true },
          { key: 'documento', label: 'CAF / DAP', hint: 'Cadastro Nacional da Agricultura Familiar' },
          { key: 'telefone', label: 'Telefone / WhatsApp', placeholder: '(81) 90000-0000' },
          { key: 'municipio', label: 'Município', required: true },
          { key: 'associacao', label: 'Associação / cooperativa' },
          { key: 'ativo', label: 'Situação', type: 'select', options: [{ value: 'Sim', label: 'Ativo' }, { value: 'Não', label: 'Inativo' }], required: true },
        ]}
      />
    </>
  )
}

export function Propriedades() {
  return (
    <>
      <PageHeader title="Propriedades" subtitle="Registre as áreas de cada produtor: tamanho, irrigação e certificação." />
      <CrudSection
        collection="propriedades"
        singular="propriedade"
        addLabel="Nova propriedade"
        defaults={{ irrigacao: 'Não', certificacao: 'Convencional' }}
        columns={[
          { key: 'nome', label: 'Propriedade', value: (r) => r.nome },
          { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
          { key: 'municipio', label: 'Município', value: (r) => r.municipio },
          { key: 'areaTotal', label: 'Área total (ha)', num: true, value: (r) => fmt(r.areaTotal, 1) },
          { key: 'areaProdutiva', label: 'Área produtiva (ha)', num: true, value: (r) => fmt(r.areaProdutiva, 1) },
          { key: 'irrigacao', label: 'Irrigação', value: (r) => r.irrigacao },
          { key: 'certificacao', label: 'Certificação', value: (r) => r.certificacao },
        ]}
        fields={[
          { key: 'nome', label: 'Nome da propriedade', required: true, wide: true },
          { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
          { key: 'municipio', label: 'Município', required: true },
          { key: 'areaTotal', label: 'Área total (ha)', type: 'number', step: '0.1', min: 0 },
          { key: 'areaProdutiva', label: 'Área produtiva (ha)', type: 'number', step: '0.1', min: 0 },
          { key: 'irrigacao', label: 'Possui irrigação?', type: 'select', options: ['Sim', 'Não'] },
          { key: 'certificacao', label: 'Certificação', type: 'select', options: CERTIFICACOES },
        ]}
      />
    </>
  )
}

export function Produtos() {
  const [tab, setTab] = useState('catalogo')
  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="Mantenha o catálogo de produtos e a capacidade produtiva de cada produtor."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'catalogo', label: 'Catálogo de produtos' },
          { id: 'capacidade', label: 'Capacidade produtiva' },
        ]}
      />
      {tab === 'catalogo' ? (
        <CrudSection
          collection="produtos"
          singular="produto"
          addLabel="Novo produto"
          defaults={{ unidade: 'kg', pesoKg: 1 }}
          intro="O peso por unidade permite somar produtos medidos de formas diferentes (kg, unidades, maços) nos gráficos e relatórios, sempre em toneladas."
          columns={[
            { key: 'nome', label: 'Produto', value: (r) => r.nome },
            { key: 'categoria', label: 'Categoria', value: (r) => r.categoria },
            { key: 'unidade', label: 'Unidade de venda', value: (r) => r.unidade },
            { key: 'pesoKg', label: 'Peso por unidade (kg)', num: true, value: (r) => fmt(r.pesoKg, 2) },
          ]}
          fields={[
            { key: 'nome', label: 'Nome do produto', required: true, wide: true },
            { key: 'categoria', label: 'Categoria', type: 'select', options: CATEGORIAS, required: true },
            { key: 'unidade', label: 'Unidade de venda', type: 'select', options: UNIDADES, required: true },
            { key: 'pesoKg', label: 'Peso por unidade (kg)', type: 'number', step: '0.01', min: 0, hint: 'Use 1 para produtos vendidos por kg.' },
          ]}
        />
      ) : (
        <CapacidadeProdutiva />
      )}
    </>
  )
}

function CapacidadeProdutiva() {
  return (
    <CrudSection
      collection="capacidades"
      singular="capacidade produtiva"
      addLabel="Nova capacidade"
      intro="Informe quanto cada produtor consegue produzir por mês de cada produto. Esse número é usado no planejamento da produção."
      columns={[
        { key: 'produtor', label: 'Produtor', value: (r, s) => nameOf(s.produtores, r.produtorId) },
        { key: 'propriedade', label: 'Propriedade', value: (r, s) => nameOf(s.propriedades, r.propriedadeId) },
        { key: 'produto', label: 'Produto', value: (r, s) => nameOf(s.produtos, r.produtoId) },
        {
          key: 'cap',
          label: 'Capacidade mensal',
          num: true,
          value: (r, s) => `${fmt(r.capacidadeMensal)} ${s.produtos.find((p) => p.id === r.produtoId)?.unidade || ''}`,
        },
        { key: 'areaHa', label: 'Área plantada (ha)', num: true, value: (r) => fmt(r.areaHa, 1) },
      ]}
      fields={[
        { key: 'produtorId', label: 'Produtor', type: 'select', options: (s) => optsFrom(s.produtores), required: true },
        { key: 'propriedadeId', label: 'Propriedade', type: 'select', options: (s) => optsFrom(s.propriedades), required: true },
        { key: 'produtoId', label: 'Produto', type: 'select', options: (s) => optsFrom(s.produtos), required: true },
        { key: 'capacidadeMensal', label: 'Capacidade mensal', type: 'number', min: 0, required: true, hint: 'Na unidade de venda do produto.' },
        { key: 'areaHa', label: 'Área plantada (ha)', type: 'number', step: '0.1', min: 0 },
      ]}
    />
  )
}
