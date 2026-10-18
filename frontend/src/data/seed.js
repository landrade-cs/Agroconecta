// Dados de EXEMPLO, carregados no Firebase pelo botão "Carregar dados de exemplo".
// Todos podem ser editados, apagados ou restaurados em Configurações.

export const CATEGORIAS = ['Hortaliça', 'Fruta', 'Grãos', 'Raiz e tubérculo', 'Erva e tempero', 'Outros']
export const UNIDADES = ['kg', 'un.', 'maço', 'dúzia', 'L']
export const TIPOS_COMPRADOR = ['Institucional', 'Feira', 'Varejo', 'Restaurante', 'Atacado', 'Agroindústria']
export const CERTIFICACOES = ['Convencional', 'Agroecológico', 'Orgânico certificado']
export const NIVEIS = ['Baixo', 'Médio', 'Alto']

const MESES_PROD = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']

// atribui datas de criação (usadas nos indicadores "novos este mês")
const withDates = (list) =>
  list.map((it, i) => ({
    ...it,
    createdAt: i % 4 === 0 ? `2026-10-0${(i % 8) + 1}` : `2026-0${4 + (i % 5)}-15`,
  }))

export function seed() {
  const produtores = withDates([
    { id: 'pr1', nome: 'Stephanie Caroline', documento: 'CAF-0001', telefone: '(81) 99999-0001', municipio: 'Gravatá', associacao: 'Assoc. Vale Verde', ativo: 'Sim' },
    { id: 'pr2', nome: 'Maria das Dores Silva', documento: 'CAF-0002', telefone: '(81) 99999-0002', municipio: 'Bezerros', associacao: 'Coop. Agreste Vivo', ativo: 'Sim' },
    { id: 'pr3', nome: 'José Antônio Pereira', documento: 'CAF-0003', telefone: '(81) 99999-0003', municipio: 'Chã Grande', associacao: 'Assoc. Vale Verde', ativo: 'Sim' },
    { id: 'pr4', nome: 'Francisca Lima', documento: 'CAF-0004', telefone: '(81) 99999-0004', municipio: 'Vitória de Santo Antão', associacao: 'Coop. Mata Sul', ativo: 'Sim' },
    { id: 'pr5', nome: 'Severino Rocha', documento: 'CAF-0005', telefone: '(81) 99999-0005', municipio: 'Glória do Goitá', associacao: 'Coop. Mata Sul', ativo: 'Sim' },
    { id: 'pr6', nome: 'Ana Paula Barros', documento: 'CAF-0006', telefone: '(81) 99999-0006', municipio: 'São Lourenço da Mata', associacao: 'Independente', ativo: 'Sim' },
    { id: 'pr7', nome: 'Carlos Eduardo Nunes', documento: 'CAF-0007', telefone: '(81) 99999-0007', municipio: 'Pombos', associacao: 'Coop. Agreste Vivo', ativo: 'Sim' },
    { id: 'pr8', nome: 'Luzia Ferreira', documento: 'CAF-0008', telefone: '(81) 99999-0008', municipio: 'Camocim de São Félix', associacao: 'Independente', ativo: 'Não' },
  ])

  const propriedades = withDates([
    { id: 'pp1', produtorId: 'pr1', nome: 'Sítio Boa Esperança', municipio: 'Gravatá', areaTotal: 6, areaProdutiva: 4.5, irrigacao: 'Sim', certificacao: 'Agroecológico' },
    { id: 'pp2', produtorId: 'pr2', nome: 'Sítio Nova Vida', municipio: 'Bezerros', areaTotal: 4, areaProdutiva: 3, irrigacao: 'Não', certificacao: 'Convencional' },
    { id: 'pp3', produtorId: 'pr3', nome: 'Sítio Água Clara', municipio: 'Chã Grande', areaTotal: 8, areaProdutiva: 5.5, irrigacao: 'Sim', certificacao: 'Agroecológico' },
    { id: 'pp4', produtorId: 'pr4', nome: 'Sítio Recanto', municipio: 'Vitória de Santo Antão', areaTotal: 5, areaProdutiva: 4, irrigacao: 'Sim', certificacao: 'Convencional' },
    { id: 'pp5', produtorId: 'pr5', nome: 'Sítio São José', municipio: 'Glória do Goitá', areaTotal: 10, areaProdutiva: 7, irrigacao: 'Não', certificacao: 'Convencional' },
    { id: 'pp6', produtorId: 'pr6', nome: 'Sítio Horta Viva', municipio: 'São Lourenço da Mata', areaTotal: 2.5, areaProdutiva: 2, irrigacao: 'Sim', certificacao: 'Orgânico certificado' },
    { id: 'pp7', produtorId: 'pr7', nome: 'Sítio Santa Luzia', municipio: 'Pombos', areaTotal: 7, areaProdutiva: 5, irrigacao: 'Sim', certificacao: 'Agroecológico' },
    { id: 'pp8', produtorId: 'pr8', nome: 'Sítio Bom Jardim', municipio: 'Camocim de São Félix', areaTotal: 3, areaProdutiva: 2.5, irrigacao: 'Não', certificacao: 'Agroecológico' },
    { id: 'pp9', produtorId: 'pr1', nome: 'Sítio Serra Verde', municipio: 'Gravatá', areaTotal: 3, areaProdutiva: 2, irrigacao: 'Não', certificacao: 'Convencional' },
  ])

  const produtos = withDates([
    { id: 'pd1', nome: 'Alface', categoria: 'Hortaliça', unidade: 'un.', pesoKg: 0.3 },
    { id: 'pd2', nome: 'Tomate', categoria: 'Hortaliça', unidade: 'kg', pesoKg: 1 },
    { id: 'pd3', nome: 'Feijão', categoria: 'Grãos', unidade: 'kg', pesoKg: 1 },
    { id: 'pd4', nome: 'Cenoura', categoria: 'Raiz e tubérculo', unidade: 'kg', pesoKg: 1 },
    { id: 'pd5', nome: 'Mandioca', categoria: 'Raiz e tubérculo', unidade: 'kg', pesoKg: 1 },
    { id: 'pd6', nome: 'Banana', categoria: 'Fruta', unidade: 'kg', pesoKg: 1 },
    { id: 'pd7', nome: 'Coentro', categoria: 'Erva e tempero', unidade: 'maço', pesoKg: 0.1 },
    { id: 'pd8', nome: 'Batata-doce', categoria: 'Raiz e tubérculo', unidade: 'kg', pesoKg: 1 },
    { id: 'pd9', nome: 'Milho verde', categoria: 'Grãos', unidade: 'kg', pesoKg: 1 },
  ])

  const capacidades = withDates(
    [
      ['pr1', 'pp1', 'pd1', 3200, 1.2],
      ['pr1', 'pp1', 'pd7', 900, 0.4],
      ['pr1', 'pp9', 'pd4', 1800, 0.8],
      ['pr2', 'pp2', 'pd2', 2200, 1.0],
      ['pr3', 'pp3', 'pd3', 1700, 2.5],
      ['pr3', 'pp3', 'pd5', 900, 0.8],
      ['pr4', 'pp4', 'pd4', 2000, 1.0],
      ['pr5', 'pp5', 'pd5', 3800, 3.5],
      ['pr6', 'pp6', 'pd1', 2800, 0.8],
      ['pr7', 'pp7', 'pd6', 2600, 3.0],
      ['pr7', 'pp7', 'pd2', 1500, 0.9],
      ['pr8', 'pp8', 'pd8', 1400, 1.0],
    ].map(([produtorId, propriedadeId, produtoId, capacidadeMensal, areaHa], i) => ({
      id: 'cp' + (i + 1),
      produtorId,
      propriedadeId,
      produtoId,
      capacidadeMensal,
      areaHa,
    }))
  )

  const calendario = withDates([
    { id: 'ca1', produtorId: 'pr1', produtoId: 'pd1', plantio: '2026-09-10', colheita: '2026-10-20', status: 'Plantado' },
    { id: 'ca2', produtorId: 'pr1', produtoId: 'pd7', plantio: '2026-09-20', colheita: '2026-10-25', status: 'Plantado' },
    { id: 'ca3', produtorId: 'pr2', produtoId: 'pd2', plantio: '2026-08-15', colheita: '2026-11-10', status: 'Plantado' },
    { id: 'ca4', produtorId: 'pr3', produtoId: 'pd3', plantio: '2026-08-01', colheita: '2026-10-30', status: 'Plantado' },
    { id: 'ca5', produtorId: 'pr4', produtoId: 'pd4', plantio: '2026-08-25', colheita: '2026-11-25', status: 'Plantado' },
    { id: 'ca6', produtorId: 'pr5', produtoId: 'pd5', plantio: '2026-02-01', colheita: '2026-12-01', status: 'Plantado' },
    { id: 'ca7', produtorId: 'pr6', produtoId: 'pd1', plantio: '2026-09-28', colheita: '2026-11-05', status: 'Plantado' },
    { id: 'ca8', produtorId: 'pr7', produtoId: 'pd6', plantio: '2026-05-01', colheita: '2026-10-12', status: 'Em colheita' },
    { id: 'ca9', produtorId: 'pr8', produtoId: 'pd8', plantio: '2026-06-10', colheita: '2026-10-05', status: 'Colhido' },
    { id: 'ca10', produtorId: 'pr3', produtoId: 'pd5', plantio: '2026-10-20', colheita: '2027-06-20', status: 'Planejado' },
    { id: 'ca11', produtorId: 'pr2', produtoId: 'pd4', plantio: '2026-10-15', colheita: '2027-01-20', status: 'Planejado' },
  ])

  // Produção mensal: abril a setembro (realizada) + outubro e novembro (apenas previsão)
  const producao = []
  capacidades.forEach((c, ci) => {
    MESES_PROD.forEach((mes, mi) => {
      const prevista = Math.round(c.capacidadeMensal * (0.8 + 0.03 * mi))
      const realizada = Math.round(prevista * (0.84 + 0.025 * ((mi + ci) % 5)))
      const perdas = Math.round(realizada * (0.03 + 0.01 * ((mi * (ci + 1)) % 4)))
      producao.push({ id: `pdc-${ci}-${mi}`, mes, produtorId: c.produtorId, produtoId: c.produtoId, prevista, realizada, perdas })
    })
    ;['2026-10', '2026-11'].forEach((mes, k) => {
      producao.push({
        id: `pdc-${ci}-f${k}`,
        mes,
        produtorId: c.produtorId,
        produtoId: c.produtoId,
        prevista: Math.round(c.capacidadeMensal * (0.97 + 0.02 * k)),
        realizada: 0,
        perdas: 0,
      })
    })
  })

  const ofertas = withDates([
    { id: 'of1', produtorId: 'pr1', produtoId: 'pd1', prevista: 6800, disponivel: 6000, preco: 2.0, desde: '2026-10-10', status: 'Disponível' },
    { id: 'of2', produtorId: 'pr6', produtoId: 'pd1', prevista: 7000, disponivel: 6500, preco: 2.4, desde: '2026-10-08', status: 'Disponível' },
    { id: 'of3', produtorId: 'pr2', produtoId: 'pd2', prevista: 6000, disponivel: 5200, preco: 4.8, desde: '2026-10-12', status: 'Disponível' },
    { id: 'of4', produtorId: 'pr7', produtoId: 'pd2', prevista: 3300, disponivel: 3000, preco: 5.0, desde: '2026-10-09', status: 'Disponível' },
    { id: 'of5', produtorId: 'pr3', produtoId: 'pd3', prevista: 6200, disponivel: 5600, preco: 9.5, desde: '2026-10-30', status: 'Disponível' },
    { id: 'of6', produtorId: 'pr1', produtoId: 'pd4', prevista: 1800, disponivel: 1500, preco: 3.9, desde: '2026-10-15', status: 'Disponível' },
    { id: 'of7', produtorId: 'pr4', produtoId: 'pd4', prevista: 2200, disponivel: 1900, preco: 4.0, desde: '2026-10-18', status: 'Disponível' },
    { id: 'of8', produtorId: 'pr5', produtoId: 'pd5', prevista: 3500, disponivel: 3000, preco: 3.2, desde: '2026-10-10', status: 'Disponível' },
    { id: 'of9', produtorId: 'pr3', produtoId: 'pd5', prevista: 1000, disponivel: 800, preco: 3.4, desde: '2026-10-20', status: 'Disponível' },
    { id: 'of10', produtorId: 'pr7', produtoId: 'pd6', prevista: 4800, disponivel: 4200, preco: 3.4, desde: '2026-10-09', status: 'Disponível' },
    { id: 'of11', produtorId: 'pr1', produtoId: 'pd7', prevista: 700, disponivel: 600, preco: 2.5, desde: '2026-10-12', status: 'Disponível' },
    { id: 'of12', produtorId: 'pr8', produtoId: 'pd8', prevista: 1300, disponivel: 1100, preco: 3.6, desde: '2026-10-06', status: 'Disponível' },
  ])

  const demandas = withDates([
    { id: 'dm1', comprador: 'Alimentação escolar – Prefeitura do Recife', tipo: 'Institucional', produtoId: 'pd1', quantidade: 5000, precoMax: 2.5, prazo: '2026-11-05', municipio: 'Recife', status: 'Aberta' },
    { id: 'dm2', comprador: 'Rede Mercadinho Nova Safra', tipo: 'Varejo', produtoId: 'pd1', quantidade: 5000, precoMax: 2.6, prazo: '2026-10-30', municipio: 'Recife', status: 'Aberta' },
    { id: 'dm3', comprador: 'Restaurante Sabor da Terra', tipo: 'Restaurante', produtoId: 'pd1', quantidade: 300, precoMax: 3.0, prazo: '2026-10-20', municipio: 'Olinda', status: 'Em negociação' },
    { id: 'dm4', comprador: 'Alimentação escolar – Prefeitura de Caruaru', tipo: 'Institucional', produtoId: 'pd4', quantidade: 4800, precoMax: 4.2, prazo: '2026-11-15', municipio: 'Caruaru', status: 'Aberta' },
    { id: 'dm5', comprador: 'Rede Hortifruti Sul', tipo: 'Varejo', produtoId: 'pd4', quantidade: 3000, precoMax: 4.4, prazo: '2026-11-01', municipio: 'Jaboatão dos Guararapes', status: 'Aberta' },
    { id: 'dm6', comprador: 'Cozinha Comunitária Casa Branca', tipo: 'Institucional', produtoId: 'pd5', quantidade: 1200, precoMax: 3.5, prazo: '2026-11-10', municipio: 'Recife', status: 'Aberta' },
    { id: 'dm7', comprador: 'Casa de Farinha Boa Safra', tipo: 'Agroindústria', produtoId: 'pd5', quantidade: 3000, precoMax: 3.3, prazo: '2026-12-01', municipio: 'Glória do Goitá', status: 'Aberta' },
    { id: 'dm8', comprador: 'Mercado de Casa Amarela', tipo: 'Atacado', produtoId: 'pd6', quantidade: 1500, precoMax: 3.6, prazo: '2026-10-25', municipio: 'Recife', status: 'Aberta' },
    { id: 'dm9', comprador: 'Restaurante Sabor da Terra', tipo: 'Restaurante', produtoId: 'pd7', quantidade: 700, precoMax: 2.8, prazo: '2026-10-22', municipio: 'Olinda', status: 'Aberta' },
    { id: 'dm10', comprador: 'Rede Mercadinho Nova Safra', tipo: 'Varejo', produtoId: 'pd2', quantidade: 6000, precoMax: 5.2, prazo: '2026-11-08', municipio: 'Recife', status: 'Aberta' },
    { id: 'dm11', comprador: 'Compras institucionais – Governo do Estado', tipo: 'Institucional', produtoId: 'pd3', quantidade: 5000, precoMax: 10, prazo: '2026-11-30', municipio: 'Recife', status: 'Aberta' },
    { id: 'dm12', comprador: 'Festival Junino de Caruaru', tipo: 'Feira', produtoId: 'pd9', quantidade: 2000, precoMax: 3, prazo: '2026-11-20', municipio: 'Caruaru', status: 'Aberta' },
    { id: 'dm13', comprador: 'Mercearia Bem-Querer', tipo: 'Varejo', produtoId: 'pd8', quantidade: 400, precoMax: 3.8, prazo: '2026-09-20', municipio: 'Olinda', status: 'Atendida' },
  ])

  // Preços de referência (EXEMPLO — substitua por fontes oficiais como CEASA-PE, CONAB ou Prefeituras)
  const precoBase = { pd1: 2.2, pd2: 4.9, pd3: 9.8, pd4: 4.0, pd5: 3.3, pd6: 3.5, pd7: 2.6, pd8: 3.7, pd9: 3.0 }
  const precos = withDates(
    Object.entries(precoBase).flatMap(([produtoId, p], i) => [
      { id: `pf${i}a`, produtoId, mercado: 'CEASA-PE (Recife)', preco: +(p * 0.92).toFixed(2), data: '2026-10-05', variacao: ((i * 7) % 11) - 4, fonte: 'Exemplo' },
      { id: `pf${i}b`, produtoId, mercado: 'Feira livre (varejo)', preco: +(p * 1.18).toFixed(2), data: '2026-10-05', variacao: ((i * 5) % 9) - 3, fonte: 'Exemplo' },
    ])
  )

  const notas = withDates([
    { id: 'nt1', titulo: 'Folhosas e oferta concentrada', texto: 'Quando muitos produtores colhem folhosas na mesma semana, o preço tende a cair. Combine a data de colheita com o contrato institucional antes de ofertar no varejo.', data: '2026-10-01' },
    { id: 'nt2', titulo: 'Raízes têm demanda estável', texto: 'Cenoura, mandioca e batata-doce costumam ter compra recorrente de programas institucionais e agroindústrias.', data: '2026-09-22' },
    { id: 'nt3', titulo: 'Chuvas e qualidade', texto: 'Períodos chuvosos aumentam perdas pós-colheita. Priorize embalagens ventiladas e entrega no mesmo dia.', data: '2026-09-10' },
  ])

  const oportunidades = withDates([
    { id: 'op1', titulo: 'Chamada Pública – PAA', tipo: 'Chamada pública', orgao: 'Órgão executor (exemplo)', descricao: 'Aquisição de alimentos da agricultura familiar.', prazo: '2026-10-30', link: '' },
    { id: 'op2', titulo: 'Programa de Compras Institucionais', tipo: 'Programa', orgao: 'Governo do Estado (exemplo)', descricao: 'Oportunidade para fornecimento de produtos.', prazo: '2026-11-15', link: '' },
    { id: 'op3', titulo: 'Feira Agroecológica de Pernambuco', tipo: 'Feira', orgao: 'Organização da feira (exemplo)', descricao: 'Espaço para comercialização direta.', prazo: '2026-11-20', link: '' },
    { id: 'op4', titulo: 'Chamada pública – Alimentação escolar', tipo: 'Chamada pública', orgao: 'Secretaria de Educação (exemplo)', descricao: 'Fornecimento de hortaliças e frutas para escolas da rede.', prazo: '2026-12-05', link: '' },
  ])

  const canais = withDates([
    { id: 'cn1', nome: 'PAA – Aquisição de Alimentos', tipo: 'Institucional', categorias: 'Hortaliça, Fruta, Grãos, Raiz e tubérculo, Erva e tempero', escala: 'Média', pagamento: 'Conforme edital', requisitos: 'Cadastro de agricultor familiar ativo; participação via chamada pública; entrega programada.' },
    { id: 'cn2', nome: 'PNAE – Alimentação escolar', tipo: 'Institucional', categorias: 'Hortaliça, Fruta, Grãos, Raiz e tubérculo', escala: 'Média', pagamento: 'Conforme contrato', requisitos: 'Cadastro ativo; chamada pública da prefeitura ou do estado; regularidade na entrega.' },
    { id: 'cn3', nome: 'Feiras agroecológicas', tipo: 'Feira', categorias: 'Hortaliça, Fruta, Raiz e tubérculo, Erva e tempero', escala: 'Pequena', pagamento: 'À vista', requisitos: 'Inscrição na feira; barraca; produtos frescos e identificados.' },
    { id: 'cn4', nome: 'Venda direta (cestas e grupos de consumo)', tipo: 'Consumidor final', categorias: 'Hortaliça, Fruta, Erva e tempero', escala: 'Pequena', pagamento: 'À vista / Pix', requisitos: 'Divulgação em redes sociais; rota de entrega organizada.' },
    { id: 'cn5', nome: 'Mercados públicos e CEASA', tipo: 'Atacado', categorias: 'Hortaliça, Fruta, Grãos, Raiz e tubérculo, Erva e tempero, Outros', escala: 'Grande', pagamento: 'À vista', requisitos: 'Embalagem padronizada; volume regular; transporte próprio ou compartilhado.' },
    { id: 'cn6', nome: 'Agroindústrias e casas de farinha', tipo: 'Agroindústria', categorias: 'Raiz e tubérculo, Grãos', escala: 'Grande', pagamento: '15 a 30 dias', requisitos: 'Contrato de fornecimento; volume mínimo por entrega.' },
    { id: 'cn7', nome: 'Restaurantes e varejo local', tipo: 'Varejo', categorias: 'Hortaliça, Fruta, Erva e tempero', escala: 'Média', pagamento: '7 a 15 dias', requisitos: 'Entrega regular; nota fiscal do produtor.' },
  ])

  // Vendas geradas a partir da produção realizada (um canal por mês, de acordo com o produtor)
  const canaisProdutor = {
    pr1: ['cn1', 'cn3', 'cn4'],
    pr2: ['cn2', 'cn5'],
    pr3: ['cn1', 'cn2'],
    pr4: ['cn2'],
    pr5: ['cn5', 'cn6'],
    pr6: ['cn3', 'cn4', 'cn7'],
    pr7: ['cn5', 'cn1'],
    pr8: ['cn3'],
  }
  const vendas = []
  producao
    .filter((r) => r.realizada > 0)
    .forEach((r, i) => {
      const set = canaisProdutor[r.produtorId] || ['cn5']
      const mi = MESES_PROD.indexOf(r.mes)
      const qtd = r.realizada - r.perdas
      vendas.push({
        id: 'vd' + i,
        data: `${r.mes}-20`,
        produtorId: r.produtorId,
        produtoId: r.produtoId,
        canalId: set[(mi + i) % set.length],
        quantidade: qtd,
        valor: Math.round(qtd * (precoBase[r.produtoId] || 3) * 100) / 100,
      })
    })

  const entregas = withDates([
    { id: 'en1', data: '2026-10-10', produtorId: 'pr1', produtoId: 'pd1', comprador: 'Alimentação escolar – Prefeitura do Recife', quantidade: 1500, transporte: 'Caminhonete da associação', destino: 'Recife', janela: '06:00–08:00', custo: 180, status: 'Agendada' },
    { id: 'en2', data: '2026-10-09', produtorId: 'pr2', produtoId: 'pd2', comprador: 'Rede Mercadinho Nova Safra', quantidade: 2000, transporte: 'Caminhão baú (cooperativa)', destino: 'Recife', janela: '05:00–07:00', custo: 320, status: 'Em trânsito' },
    { id: 'en3', data: '2026-10-07', produtorId: 'pr3', produtoId: 'pd3', comprador: 'Compras institucionais – Governo do Estado', quantidade: 1800, transporte: 'Caminhão baú (cooperativa)', destino: 'Recife', janela: '07:00–09:00', custo: 250, status: 'Entregue' },
    { id: 'en4', data: '2026-10-14', produtorId: 'pr7', produtoId: 'pd6', comprador: 'Mercado de Casa Amarela', quantidade: 1500, transporte: 'Frete contratado', destino: 'Recife', janela: '04:30–06:00', custo: 200, status: 'Agendada' },
    { id: 'en5', data: '2026-10-05', produtorId: 'pr6', produtoId: 'pd1', comprador: 'Restaurante Sabor da Terra', quantidade: 300, transporte: 'Veículo próprio', destino: 'Olinda', janela: '08:00–10:00', custo: 60, status: 'Entregue' },
  ])

  const alertas = withDates([
    { id: 'al1', tipo: 'Chuvas intensas', regiao: 'Agreste e Região Metropolitana', nivel: 'Alto', inicio: '2026-10-09', fim: '2026-10-12', descricao: 'Previsão de chuvas acima da média, com risco de encharcamento e perda de folhosas.', produtos: 'Alface, Coentro', acao: 'Antecipar a colheita das folhosas e reforçar a drenagem dos canteiros.' },
    { id: 'al2', tipo: 'Estiagem', regiao: 'Sertão', nivel: 'Médio', inicio: '2026-10-15', fim: '2026-10-31', descricao: 'Redução de chuvas e aumento da temperatura.', produtos: 'Feijão, Milho verde', acao: 'Planejar irrigação e reserva de água.' },
    { id: 'al3', tipo: 'Vento forte', regiao: 'Litoral', nivel: 'Baixo', inicio: '2026-10-20', fim: '2026-10-21', descricao: 'Rajadas de vento podem derrubar bananeiras.', produtos: 'Banana', acao: 'Escorar as plantas e adiantar a colheita dos cachos maduros.' },
  ])

  return {
    produtores,
    propriedades,
    produtos,
    capacidades,
    calendario,
    producao,
    ofertas,
    demandas,
    precos,
    notas,
    oportunidades,
    canais,
    vendas,
    entregas,
    alertas,
    config: { usuario: 'Stephanie Caroline', perfil: 'Produtora', cidade: 'Recife', lat: -8.05, lon: -34.88, limiarChuva: 30 },
  }
}
