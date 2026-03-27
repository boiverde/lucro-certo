# Lucro Certo - Backend Local

Este é o backend substituto da Base44, construído com Node.js, Fastify, Prisma e PostgreSQL.

## Pré-requisitos
- Node.js 18+
- Docker & Docker Compose (Recomendado para o banco de dados)
- Se não tiver Docker, instale PostgreSQL localmente e ajuste o `.env`.

## Instalação

1. Entre na pasta `server`:
   ```bash
   cd server
   npm install
   ```

2. Configure o banco de dados e ambiente:
   - O arquivo `.env` já está pré-configurado para Docker.
   - Se for usar Postgres local sem Docker, mude `DATABASE_URL` para sua string de conexão.

## Rodando

1. Suba o banco de dados (se usar Docker):
   ```bash
   docker compose up -d
   ```

2. Rode as migrações (cria as tabelas):
   ```bash
   npm run db:migrate
   ```

3. Crie o usuário inicial (seed):
   ```bash
   npm run seed
   ```
   *Usuário criado: `admin@lucrocerto.com` / `admin`*

4. Inicie o servidor:
   ```bash
   npm run dev
   ```
   O servidor rodará em `http://localhost:3333`.

## Endpoints Principais

### Auth
- `POST /auth/login` - { email, password } -> Retorna { token }
- `POST /auth/register` - { name, email, password }
- `GET /auth/me` - Dados do usuário logado (Requer Bearer Token)

### Clientes
- `GET /clientes` - Lista paginada
- `POST /clientes` - Cria cliente
- `PUT /clientes/:id`
- `DELETE /clientes/:id`

### Produtos
- `GET /produtos`
- `POST /produtos`

### Vendas
- `GET /vendas`
- `POST /vendas` (Criação transacional com itens)

## Estrutura
- `src/app.ts`: Configuração do Fastify
- `src/routes`: Definição das rotas API
- `src/lib/prisma.ts`: Conexão com DB
- `prisma/schema.prisma`: Modelagem do Banco de Dados
