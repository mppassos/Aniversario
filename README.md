````markdown
# Aniversário Seguro (PWA)

Sistema web mobile-first para corretor de seguros, com cadastro de clientes, verificação diária de aniversários, geração de mensagens com IA (Mistral), e integração com WhatsApp.

## Stack

- Backend: Node.js + Express (JavaScript)
- Banco: MongoDB Atlas + Mongoose
- Frontend: React + Vite + Tailwind CSS
- Agendamento: node-cron
- IA: Mistral AI (`mistral-small-latest`)
- Cache: node-cache
- Variáveis de ambiente: dotenv

## Estrutura do Projeto

```txt
/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── mistral.js
│   │   ├── controllers/
│   │   │   ├── aniversarioController.js
│   │   │   ├── clientesController.js
│   │   │   ├── iaMistralController.js
│   │   │   └── whatsappController.js
│   │   ├── models/
│   │   │   ├── Cliente.js
│   │   │   └── Historico.js
│   │   ├── routes/
│   │   │   ├── aniversario.js
│   │   │   ├── clientes.js
│   │   │   ├── ia.js
│   │   │   └── whatsapp.js
│   │   └── services/
│   │       └── agendamentoService.js
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── vercel.json
│
└── frontend/
    ├── public/
    │   ├── manifest.json
    │   ├── offline.html
    │   ├── sw.js
    │   └── icons/ (gerados via script)
    ├── src/
    │   ├── components/
    │   │   ├── AniversarianteDoDia.jsx
    │   │   ├── CalendarioMensal.jsx
    │   │   ├── GeradorMensagem.jsx
    │   │   ├── ListaClientes.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Notificacao.jsx
    │   │   └── PullToRefreshIndicator.jsx
    │   ├── hooks/
    │   │   ├── useAniversariantes.js
    │   │   ├── useClientes.js
    │   │   └── usePullToRefresh.js
    │   ├── pages/
    │   │   ├── Cadastro.jsx
    │   │   ├── ClienteForm.jsx
    │   │   └── Home.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── test/
    │   │   └── setup.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── vercel.json
```
````

## Regras de Negócio Implementadas

1. Cliente marcado como parabenizado (`parabenizadoHoje=true`) não aparece mais na lista do dia.
2. Comparação de aniversário ignora ano (somente dia e mês).
3. `parabenizadoHoje` é resetado automaticamente todos os dias à meia-noite (cron).
4. Cache em memória (`node-cache`) para aniversariantes do dia (TTL: 5 minutos).
5. Paginação na lista de clientes (50 por página).
6. Busca de clientes com debounce no frontend.
7. Se a IA falhar, o sistema retorna fallback com mensagens pré-definidas.
8. Se não houver aniversariantes, a tela mostra mensagem amigável.

## Pré-Requisitos

- Node.js 20+
- npm 10+
- Conta MongoDB Atlas (free tier)
- Chave de API Mistral

## 1) Configurar MongoDB Atlas

1. Crie conta em https://www.mongodb.com/atlas
2. Crie um cluster gratuito (`M0`).
3. Em `Database Access`, crie usuário e senha.
4. Em `Network Access`, permita seu IP (ou `0.0.0.0/0` para testes).
5. Copie a string de conexão:

```txt
mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/aniversarioseguro?retryWrites=true&w=majority
```

## 2) Configurar Mistral AI

1. Acesse: https://console.mistral.ai/
2. Crie uma conta e gere uma API Key
3. Salve em `MISTRAL_API_KEY` no backend

## 3) Configuração de .env

### backend/.env

```env
PORT=3001
APP_TIMEZONE=America/Sao_Paulo
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=sua-string-mongodb
MISTRAL_API_KEY=sua-chave-mistral
NOME_CORRETOR= Joao Carlos
```

### frontend/.env

```env
VITE_API_URL=http://localhost:3001/api
VITE_NOME_CORRETOR=Joao Carlos
```

## 4) Instalação

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## 5) Rodar em Desenvolvimento

### Terminal 1 (backend)

```bash
cd backend
npm run dev
```

### Terminal 2 (frontend)

```bash
cd frontend
npm run dev
```

Abra: http://localhost:5173

## 6) Fluxo de Uso

1. Vá em `Clientes` e cadastre/edite clientes.
2. No `Início`, veja aniversariantes do dia.
3. Clique em um dia no calendário para ver todos os aniversariantes daquele dia.
4. Clique `Gerar Mensagem com IA` para obter 3 estilos de mensagem.
5. Use `Copiar Mensagem` ou `Enviar WhatsApp`.
6. Clique `Já Enviei` para remover da lista do dia.

## 7) Endpoints Principais

- `GET /api/clientes?page=1&limit=50&search=`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`
- `GET /api/aniversario/hoje`
- `POST /api/aniversario/marcar-enviado/:clienteId`
- `POST /api/aniversario/executar-agora`
- `POST /api/ia/gerar-mensagens`
- `POST /api/whatsapp/enviar`

## 8) Deploy

### Backend (Vercel)

```bash
cd backend
vercel --prod
```

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Variáveis de Ambiente (Produção)

Configure no painel da Vercel:

**Backend:**

- `MONGODB_URI`
- `MISTRAL_API_KEY`
- `NOME_CORRETOR`
- `CORS_ORIGIN` (URL do frontend)

**Frontend:**

- `VITE_API_URL` (URL do backend)
- `VITE_NOME_CORRETOR`

## 9) Licença

MIT

## Comandos Rápidos

```bash
# Instalar dependências
cd backend && npm install
cd ../frontend && npm install

# Rodar em desenvolvimento
cd backend && npm run dev
cd frontend && npm run dev

# Deploy
cd backend && vercel --prod
cd frontend && vercel --prod
```
