# 🌱 AgroConecta

Plataforma web que conecta a agricultura familiar aos mercados: o produtor cadastra o que produz, descobre quem está comprando, planeja a colheita, organiza as entregas e acompanha o clima.

**Disciplina:** NOME DA DISCIPLINA · **Professor(a):** NOME DO PROFESSOR

**Autores**
- **Stephanie Caroline** 01856266
front-end (React)
- **Lucas Gabriel: 91854148
  Joana Daniely - 01832586: back-end (Node.js + Express) e organização do projeto

## 1. Problema escolhido (Banco de BOs)

Pequenos produtores da agricultura familiar têm dificuldade para vender com regularidade e a bom preço. Faltam informações sobre quem compra, quanto procura e por qual preço; a produção e a colheita quase sempre não são planejadas; o clima causa perdas; e a entrega é desorganizada. Resultado: sobra de alguns produtos, falta de outros e muito desperdício.

## 2. Solução proposta

O AgroConecta reúne em um só lugar tudo o que o produtor precisa:

| Área | O que resolve |
|---|---|
| Produtores, propriedades e produtos | Cadastro da rede de produtores e da capacidade produtiva de cada um |
| Calendário | Linha do tempo de plantio e colheita |
| Produção | Previsto x realizado por mês e controle de perdas |
| Mercados | Ofertas (com divulgação por WhatsApp), preços de referência e chamadas públicas |
| Demandas | O que os compradores procuram e o cruzamento oferta x demanda |
| Canais | Sugestão do melhor canal de venda para cada produto e registro das vendas |
| Logística | Agenda de entregas, veículos, destinos e custo de frete |
| Clima e riscos | Previsão do tempo (Open-Meteo) e alertas de risco para os plantios |
| Relatórios | Indicadores de produção, perdas, vendas e participação (com CSV e impressão) |

Cada pessoa só enxerga os próprios registros.

## 3. Tecnologias

- **Front-end:** React 18 + Vite, React Router, Recharts (gráficos), Lucide (ícones), HTML, CSS responsivo e JavaScript. Usa `useState`, `useEffect`, `useMemo`, props, contexto e eventos.
- **Banco e login:** Firebase Authentication (e-mail e senha) e Cloud Firestore.
- **Back-end (opcional):** Node.js + Express + Firebase Admin SDK.

## 4. Estrutura do projeto

```
AgroConecta/
├── frontend/              # aplicação React
│   ├── src/
│   │   ├── components/    # Layout, ui, Foto, Carregando...
│   │   ├── context/       # AuthContext e DadosContext
│   │   ├── firebase/      # config e acesso aos dados
│   │   ├── lib/           # cálculos, clima, utilitários
│   │   ├── pages/         # uma página por arquivo
│   │   └── routes.jsx     # todas as rotas
│   ├── firestore.rules    # regras de segurança do banco
│   └── .env.example       # modelo das chaves do Firebase
└── backend/               # API Node + Express (opcional)
    ├── server.js
    ├── firebaseAdmin.js
    ├── middleware/auth.js # valida o token de login
    └── routes/dados.js    # rotas da API
```

## 5. Como executar (front-end)

Pré-requisitos: Node.js (versão LTS) e uma conta Google.

### Passo 1: Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com e crie um projeto (o Analytics pode ficar desativado).
2. Na tela inicial, clique no ícone **Web (`</>`)**, dê um apelido e registre o app. Vai aparecer o bloco `firebaseConfig`.
3. Em **Firestore Database**, clique em **Criar banco de dados** e escolha o **modo de produção**.
4. Em **Authentication → Método de login**, ative **E-mail/senha**.
5. Em **Firestore Database → Regras**, cole o conteúdo de `frontend/firestore.rules` e clique em **Publicar**.

### Passo 2: Configurar e rodar

```bash
cd frontend
npm install
copy .env.example .env        # no Linux/macOS: cp .env.example .env
```

Abra o `.env` e preencha com os valores do `firebaseConfig`, sem aspas e sem espaços:

| No Firebase | No .env |
|---|---|
| apiKey | `VITE_FIREBASE_API_KEY` |
| authDomain | `VITE_FIREBASE_AUTH_DOMAIN` |
| projectId | `VITE_FIREBASE_PROJECT_ID` |
| storageBucket | `VITE_FIREBASE_STORAGE_BUCKET` |
| messagingSenderId | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| appId | `VITE_FIREBASE_APP_ID` |

```bash
npm run dev
```

Abra http://localhost:5173, clique em **Criar conta**, entre e use **Carregar dados de exemplo**.

## 6. Back-end opcional (API Node + Express)

Por padrão, o front fala direto com o Firebase. O back-end é uma camada opcional: o front envia o token de login para a API, que valida o usuário e acessa o Firestore com o Firebase Admin SDK.

```bash
cd backend
npm install
```

1. No Firebase: ⚙️ **Configurações do projeto → Contas de serviço → Gerar nova chave privada**.
2. Salve o arquivo como `backend/serviceAccountKey.json`. **Nunca envie esse arquivo ao GitHub** (ele já está no `.gitignore`).
3. Inicie a API:

```bash
npm run dev
```

A API sobe em http://localhost:3001.

4. No `frontend/.env`, acrescente a linha abaixo e reinicie o front:

```
VITE_USAR_API=true
```

Para voltar ao modo direto, apague a linha ou troque por `false`.

**Observação:** no modo API, as telas atualizam depois de cada ação feita nelas, e não em tempo real como no modo direto.

## 7. Problemas comuns

| Mensagem / sintoma | O que fazer |
|---|---|
| Tela "Falta conectar ao Firebase" | Crie e preencha o `.env`, depois reinicie o `npm run dev` |
| Login por e-mail e senha não ativado | Ative em Authentication → Método de login |
| Sem permissão para acessar o banco | Publique as regras do `firestore.rules` |
| "Não foi possível conectar à API" | Suba o back-end (`cd backend && npm run dev`) ou remova `VITE_USAR_API` |
| A previsão do tempo não carrega | Verifique a internet (a Open-Meteo é gratuita e não usa chave) |
