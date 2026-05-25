# Lucro Certo — Contexto do Projeto

SaaS de controle financeiro/operacional para distribuidora de vegetais.

## Arquitetura
- Frontend: React + Vite + TanStack Query + Tailwind CSS + Shadcn/UI
- Backend: Node.js + Fastify + TypeScript + Prisma ORM + JWT auth
- Banco de dados: PostgreSQL via Supabase (db.qfahagyxugfjzrigkmkp.supabase.co)
- Deploy: Render com auto-deploy na branch main do GitHub
  - Frontend: https://lucro-certolucro-certo-web.onrender.com
  - Backend: https://lucro-certolucro-certo-api.onrender.com
- Repositório: https://github.com/boiverde/lucro-certo

## Estrutura de Pastas
- src/pages/ — Páginas principais (Clientes, Estoque, Vendas, Compras, etc. )
- src/components/controle/ — Módulos do PDV (TabVendas, TabCompras, TabEstoque, TabPagamentos, TabLanches)
- src/api/httpClient.js — Cliente HTTP (usa VITE_API_URL em dev, fallback para URL do Render em produção )
- server/src/routes/ — Rotas do backend Fastify
- server/prisma/schema.prisma — Schema do banco PostgreSQL

## Convenções Obrigatórias
- httpClient para TODAS as chamadas à API (nunca usar fetch direto )
- Backend retorna listagens paginadas no formato: { results: [...], meta: {...} } ou { results: [...], total, page, totalPages }
- Frontend extrai dados com: Array.isArray(data) ? data : (data?.results || [])
- IDs vazios devem ser enviados como null (não string vazia) para evitar erro UUID
- Valores financeiros convertidos para Number antes do envio
- Token JWT enviado automaticamente pelo httpClient no header Authorization
- Backend filtra dados por userId via JWT — NÃO filtrar por email no frontend
- Todos os modelos do Prisma têm campo userId para multi-tenancy

## Padrões de Código
- Componentes React: function components com hooks
- Estado do servidor: TanStack Query (useQuery/useMutation )
- Validação no backend: Zod schemas
- Estilização: Tailwind CSS + classes utilitárias
- UI Components: Shadcn/UI (Button, Card, Input, etc.)

## Comandos Úteis
- Frontend dev: cd C:\Users\merca\Documents\lucrocertoapp && npm run dev
- Backend dev: cd C:\Users\merca\Documents\lucrocertoapp\server && npm run dev
- Build frontend: npm run build
- Push para deploy: git add -A && git commit -m "mensagem" && git push origin main
- Prisma migrate: cd server && npx prisma migrate dev
- Prisma generate: cd server && npx prisma generate

## O QUE NUNCA FAZER
- NÃO refatorar código sem ser explicitamente pedido
- NÃO instalar pacotes novos sem autorização
- NÃO alterar o schema do Prisma sem autorização
- NÃO mexer em arquivos não relacionados à tarefa atual
- NÃO alterar o httpClient.js sem autorização
- NÃO mudar a estrutura de pastas
- NÃO fazer commit com mensagens genéricas (sempre descrever o que foi feito )
- NÃO deletar arquivos sem autorização
