# Relatório: Migração de Dados de SQLite para PostgreSQL (Supabase)

Em conformidade à solicitação de execução sem danificação estrutural ou adulteração de regras de negócios, os scripts de Cópia Translacional (Migration) e Auditoria Volumétrica pós-migração foram desenvolvidos. Eles operam de maneria segura usando Inserção Contínua controlada.

## 1. Ordem de Migração Adotada (Hierarchy Tree)

Para evitar erros de Constraint (Chaves Estrangeiras faltando), a migração foi delineada obedecendo uma topologia piramidal do Nível 0 ao Nível 5 das suas tabelas:

1. **Nível 0 (Raiz Mestra):** `users`
2. **Nível 1 (Cadastros Base):** `clientes`, `fornecedores`, `empresas_revenda`, `funcionarios`, `gastos_operacionais`, `gastos_pessoais`, `ingredientes`
3. **Nível 2 (Produtos e Catálogos):** `produtos`, `receitas_produto`
4. **Nível 3 (Transações Origem):** `vendas`, `compras`, `movimentacao_estoque`, `diarias`, `pedidos`, `gastos_revenda`, `vendas_revenda`
5. **Nível 4 (Vinculações Fracionadas):** `itens_venda`, `itens_compra`, `parcelas_revenda`, `receitas_ingredientes`, `producoes_lanche`, `lotes`, `alertas_estoque`

> **Tabelas Ignoradas:** Nenhuma tabela foi excluída do escopo. Tabelas como `_prisma_migrations` (interna do Prisma) foram omitidas propositalmente, pois o Supabase passará a deter seu próprio versionamento após aplicar sua primeira migration.

## 2. Inventário de Contagem e Volume (Origem Detectada)

Eu acessei se arquivo `dev.db` atual via `better-sqlite3`. Notavelmente seu banco original tem quase pouquíssimos registros de teste. Abaixo estão os valores que deverão sincronizar rigorosamente no PostgreSQL:

| Tabela | Contagem Origem (SQLite) | Status |
| :--- | :---: | :--- |
| `users` | 1 | Aguardando injeção via Script |
| `compras` | 1 | Aguardando injeção via Script |
| `itens_compra`| 1 | Aguardando injeção via Script |
| `gastos_pessoais`| 1 | Aguardando injeção via Script |
| *20 outras tabelas* | 0 | Serão puladas ("0 registros") |

## 3. Scripts Entregues

Gerei dois scripts TypeScript independentes na pasta `server/scripts/`:

### A) Script de Cópia: `server/scripts/migrate-sqlite-to-pg.ts`
* Lê nativamente o arquivo dev.db contornando a Engine do Prisma.
* Limpa undefineds e tenta alocar os tipos nativos.
* Salva os lotes via Prisma `.createMany({ skipDuplicates: true })` apontando pra sua Connection Pool do `.env`. Dessa forma, identificações (PKs UUID e Datas de Criação) viajam intocados. 

### B) Script de Validação: `server/scripts/validate-migration.ts`
* Conta volumes batendo Banco A x Banco B.
* Faz auditoria em varredura de saldo físico na tabela `produtos` cruzando os dados de origem pra atestar se algum saldo fracionado (ex: `15.5 kg`) derreteu nos Datatypes do Postgress na tradução.

## 4. Riscos Pendentes e Observações Pré-Apontamento ⚠️

Antes de mudar a variável e colocar o Servidor no ar publicamente consumindo o Supabase, atente-se a:

1. **Fusão Decimal Prisma x Node:** O SQLite enviava dados Float genéricos. O Postgress lida com Types Decimal rígidos. Durante o CreateMany, erros de Cast se houver strings atípicas nos seus Mocks podem disparar. (O script barra e aponta a tabela causadora caso ocorra).
2. **Booleans em SQLite:** O `dev.db` armazena `1/0` e o Postgres armazena `true/false`. O prisma tentará "acertar" nativamente no Payload pelas definições do Model, mas o script de migração já conta com espaço de cast caso o batch de injeção falhe.
3. Não delete o arquivo `dev.db` antigo até que o script B (Avaliador) dê o veredito final com o checkmark verde (🟢).
