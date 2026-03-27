# Mapa de Migração: Lucro Certo (Base44 -> Standalone)

Este documento detalha o plano técnico para remover a dependência da Base44 e tornar o aplicativo independente.

## 1. Visão Geral
O aplicativo é uma SPA (Single Page Application) em React/Vite que atualmente delega todo o backend (banco de dados, autenticação e funções) para a Base44.
Não há lógica de backend local. A migração exigirá a construção de uma API do zero.

**Estatísticas do Projeto:**
*   **Entidades de Banco de Dados:** ~20 tabelas necessárias.
*   **Integrações Externas:** Nenhuma ativa no código funcional (IA e E-mail são apenas mocks/links externos).
*   **Autenticação:** Atualmente via Redirecionamento Base44 (OAuth flow).

---

## 2. Escopo de Migração

### MVP (Mínimo para Funcionar)
O foco é restaurar as funcionalidades principais de gestão (Vendas, Estoque e Revendas).
1.  **Backend API:** Servidor Node.js simples.
2.  **Banco de Dados:** PostgreSQL.
3.  **Auth Própria:** Login/Senha simples (JWT).
4.  **Tabelas Core:** Users, Clientes, Produtos, Vendas, Estoque.

### Escopo Completo
Inclui módulos secundários que aparecem no código mas podem não ser usados por todos.
1.  **Módulo Revenda:** Empresas, VendasRevenda, GastosRevenda.
2.  **Módulo Produção:** Receitas, Ingredientes, Lanches (se usado).
3.  **Relatórios:** Endpoints de agregação (Soma de vendas, lucros).

---

## 3. Checklist de Implementação (Ordem Recomendada)

### Fase 1: Fundação (Backend + Auth)
- [ ] Inicializar projeto Node.js (Fastify ou NestJS).
- [ ] Subir banco PostgreSQL (Docker local).
- [ ] Criar tabela `users` (id, email, password_hash, name).
- [ ] Implementar rotas `/auth/login`, `/auth/register`, `/auth/me`.
- [ ] Frontend: Criar página de Login (`src/pages/Login.jsx`).
- [ ] Frontend: Substituir `User.loginWithRedirect` e `User.me()` para usar a nova API.

### Fase 2: Dados Mestres (Cadastros)
Criar tabelas e CRUDs para:
- [ ] **Clientes**: `id`, `nome`, `user_id`, `ativo`, `created_at`.
- [ ] **Produtos**: `id`, `nome`, `preco`, `custo`, `estoque_atual`, `unidade`, `controla_estoque`, `user_id`.
- [ ] **Fornecedores**: `id`, `nome`, `tel`, `user_id`.

### Fase 3: Core Business (Transações)
- [ ] **Vendas**: `id`, `cliente_nome` (ou fk), `total`, `data`, `itens` (JSON ou tabela separada `venda_itens`), `pagamento_status`.
- [ ] **MovimentacaoEstoque**: `id`, `produto_id`, `qtd`, `tipo` (entrada/saida), `origem` (venda/compra).
- [ ] **Compras**: `id`, `fornecedor_id`, `total`, `data`, `itens`.

### Fase 4: Módulo Revendas (Diferencial do App)
- [ ] **EmpresaRevenda**: `id`, `nome`, `comissao_pct`, `cor`, `ativa`.
- [ ] **VendaRevenda**: `id`, `empresa_id`, `cliente_nome`, `total`, `comissao_valor`, `parcelas`, `status`.
- [ ] **GastosRevenda**: `id`, `valor`, `descricao`.

---

## 4. Modelagem de Dados (Schema Sugerido)

Baseado na análise de `src/api/entities.js` e formulários (`src/components/**/*.jsx`):

### Tabela: `users`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| email | String | Unique |
| password_hash | String | |
| name | String | |

### Tabela: `produtos`
*Referência: `src/components/vendas/FormVenda.jsx`*
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK -> users |
| nome | String | |
| estoque_atual | Float | Default 0 |
| preco | Decimal | |
| custo | Decimal | |
| unidade | String | Enum: 'kg', 'un', 'cx', etc |
| controla_estoque | Boolean | |
| ativo | Boolean | Default true |

### Tabela: `vendas` (Venda Direta)
*Nota: Vendas parecem armazenar itens de forma desnormalizada ou simplificada no frontend atual, mas recomenda-se criar tabela `venda_itens`.*
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK |
| cliente_nome | String | Texto livre ou FK opcional |
| data_venda | Timestamp | |
| valor_total | Decimal | |
| desconto | Decimal | |
| obs | Text | |

### Tabela: `movimentacao_estoque`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| produto_id | UUID | FK |
| quantidade | Float | |
| tipo | String | 'entrada' / 'saida' |
| origem | String | 'venda', 'compra', 'ajuste' |
| data | Timestamp | |

### Tabela: `vendas_revenda` (Módulo Específico)
*Referência: `src/components/revendas/FormVendaRevenda.jsx`*
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| empresa_id | UUID | FK -> `empresas_revenda` |
| cliente_nome | String | |
| valor_total | Decimal | |
| comissao_pct | Float | Snapshot da comissão na época |
| comissao_valor | Decimal | |
| numero_parcelas | Int | |
| parcelas_pagas | Int | |
| status | String | 'ativa', 'paga', 'cancelada' |

---

## 5. Padrões de Query Identificados

O frontend espera APIs com as seguintes capacidades:
1.  **Filtragem por Usuário:** `created_by: user.email` (No novo backend, isso deve ser forçado via token JWT, nunca enviado pelo cliente).
2.  **Ordenação:** Ex: `title`, `-created_at` (desc). O backend deve suportar `?sort=-data`.
3.  **Paginação:** O Base44 faz paginação automática. O frontend pode esperar arrays diretos ou envoltos em `{ results: [], count: 0 }`. Verificar a resposta do hook `useQuery`.
4.  **Busca/Filtro:** Ex: `Cliente.filter({ nome: 'Maria' })`. Backend deve aceitar `?nome=Maria`.

---

## 6. Stack Recomendada

**Backend:** Node.js com **Fastify**.
*   **Por que:** Fastify é extremamente performático e possui ótima integração com TypeScript e validação de schema (Zod), o que combina com o frontend que já usa Zod. É mais leve que NestJS para um projeto deste porte (MVP) mas escala bem.

**Banco:** PostgreSQL.
*   Padrão de mercado, robusto para dados relacionais (Vendas -> Produtos) e financeiro (Tipos Decimal/Money precisos).

**ORM:** Prisma.
*   Acelera muito a migração gerando tipos TypeScript compatíveis com o que o Frontend espera.
