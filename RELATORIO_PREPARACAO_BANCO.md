# Relatório de Preparação de Migração (SQLite -> Postgres Supabase)

O `schema.prisma` foi devidamente ajustado. O backend está preparado para atuar de forma escalável com a poderosa engine do Postgres, suportando os devidos pools de conexão que o Supabase exige. Nenhuma migration perigosa foi rodada, como solicitado.

## 1. Schema.prisma Atualizado
As seguintes configurações foram adaptadas com sucesso no arquivo `server/prisma/schema.prisma` (todas as demais entidades do aplicativo foram preservadas).

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 2. Incompatibilidade Estrutural (SQLite vs PostgreSQL)
**Não foi encontrada e não houve incompatibilidade real no esquema.**
Todos os tipos usados na versão SQLite no seu arquivo prisma atual (`Decimal`, `Float`, `String`, `Boolean` e `DateTime`) são nativamente convertidos e super suportados pelo Provider de Postgres do Prisma (mapeando internamente e de forma transparente para `numeric` ou `double precision`, `varchar`, `boolean` e `timestamp(3)`). Você não precisará refatorar suas tabelas!

## 3. Configuração de Rede (.env.example recomendado)

O Supabase fornece, de modo nativo para databases novos, conexões diretas via **IPv6**. Porém, plataformas muito famosas de deploy do backend (Docker puro em VPS, Render, Railway, Fly.io via plano grátis) não lidam bem ou nem tem suporte completo a IPv6 em containers de dentro para fora. 
Portanto, a padronização oficial deve ser usar o **Connection Pooler (IPv4)** para as transações da Aplicação e a **Direct Connection** só para migrations (que contorna o bouncer).

### Sugestão de `.env.example` na pasta `/server`
```env
# 1. DATABASE_URL: Pooler Connection do Supabase (A porta costuma ser 6543)
# Usa IPv4 de forma escalável. Ela recebe todas as milhares requests de rotina (find, update, create).
DATABASE_URL="postgresql://postgres.[sua-conta]:[sua-senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# 2. DIRECT_URL: Direct Connection do Supabase (A porta costuma ser 5432)
# Usada APENAS e exclusivamente pela CLI do Prisma internamente para executar migrations. 
DIRECT_URL="postgresql://postgres.[sua-conta]:[sua-senha]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# Demais variáveis
JWT_SECRET="alguma-hash-segura-em-producao"
PORT=3333
```

## 4. Como versionar (Abolindo de vez o "db push")

O comando `npx prisma db push` tem um problema crônico na produção: Ele sincroniza esquemas forçadamente e perde toda a timeline de evolução do banco. Com o Postgres oficial, devemos mudar para **Migrations** de verdade.

**Comando exato para gerar a primeiríssima Migration do Projeto (Deve ser gerado após configurar as senhas no .env acima):**
Execute via terminal dentro da pasta `server/`:
```bash
npx prisma migrate dev --name inicializa_postgres_lucrocerto
```
*(Ele criará uma pasta local `prisma/migrations/DATA_inicializa.../migration.sql` e atualizará o cliente TS. Ela já vai conter TODAS as suas tabelas em sintaxe nativa postgres automaticamente).*

**Comando exato para aplicar essa mesma Migration (Quando subir pra Cloud ou CI/CD pipeline):**
```bash
npx prisma migrate deploy
```
*(No deploy o sistema só olha os `.sql` que faltam da nuvem e roda rápido, sem travar nem avisar).*)
