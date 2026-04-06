# Lucro Certo

Sistema de gestao com arquitetura independente.

## Stack

* Frontend: React (Vite)
* Backend: Node.js (Fastify)
* ORM: Prisma
* Banco: PostgreSQL (Supabase)

## Estrutura

* /src -> Frontend (React SPA)
* /server -> Backend (API Fastify + Prisma)

## Execucao local

### Backend

\cd server
npm install
npm run dev
\
### Frontend

\npm install
npm run dev
\
## Banco de dados

O projeto utiliza PostgreSQL via Supabase.

As variaveis de ambiente necessarias estao em:

server/.env.example

## Observacoes

* Este projeto foi originalmente iniciado em outra plataforma, mas hoje opera com backend e banco independentes.
* Nao ha dependencia atual de Base44.
