# Contexto do Projeto: Lucro Certo (Migração e Otimização)

Olá ChatGPT, este documento contém o contexto atualizado do meu projeto **Lucro Certo**. Estou migrando o sistema de um modelo Backend-as-a-Service legado (Base44) para uma arquitetura independente.

**Contexto Histórico Importante:** Inicialmente o projeto era um monólito acoplado. Nós **dividimos o projeto original em 3 novos projetos menores/separados** para manter as coisas organizadas (Frontend, Backend, etc.). Agora estamos lidando especificamente com a maturação e a conexão dessa nova arquitetura fragmentada.

## 🛠️ Stack Tecnológica Atual
- **Frontend:** React.js (Vite), SPA, com React Query, TailwindCSS, Radix UI e Framer Motion.
- **Backend:** API isolada em Node.js, Fastify.js, e Zod para validação.
- **ORM:** Prisma
- **Banco de Dados Atual:** SQLite (usado provisoriamente para desenvolvimento e testes locais).
- **Integração de S3:** MinIO local configurado no Docker Compose.

---

## ✅ O que já foi feito na arquitetura e otimizações

1. **Tipagens TypeScript do Backend:** Foram declaradas e estendidas globalmente as instâncias seguras de tipagem JWT do `Fastify` (resolvendo falsos-positivos e bugs de compilação na validação).
2. **Correção do Prisma e SQL:** Limpamos chamadas específicas de Postgres (`mode: insensitive`) que impediam o ambiente de rodar com o SQLite localmente nas listagens do painel.
3. **Desempenho da UI (Code-Splitting):** Foi aplicado o pacote de `React.lazy()` e `Suspense`. O frontend foi quebrado de builds imensos (1.6 MB) para chunks ativados apenas sob demanda.
4. **Limpeza do Linter:** Corrigidos mais de 1000 alertas de código-fantasma de imports perdidos, declarações duplas e regras desnecessárias no Vite.
5. **Transações ACID Seguras (Estoque e Compras):**
   - Retiramos a regra perigosa do Frontend ser o responsável por enviar deduções de estoque independentemente. Em vez disso, as rotas do backend (ex: `POST /vendas` e `POST /compras`) usam o `$transaction` do Prisma para criar o registro pai e as movimentações de saídas/entradas, aplicando também um limitador via `throw new Error()` que impossibilita a venda se não houver saldo e `controla_estoque` for ativo.
   - O Form de compras foi melhorado para injetar automaticamente itens faltosos.

---

## 🎯 Nosso Próximo Foco (Por favor, ajude-me com isto a seguir)

Temos bloqueios pendentes antes de lançar o projeto na nuvem, divididos em Banco, Componentes e Negócio:

### 1. Migração Oficial: Banco SQLite Local para Servidor Supabase (PostgreSQL)
A transição exige scripts e suporte exato para virar a chave sem perder dados vitais e com a URL certa.
   - Como deve ficar o `schema.prisma` mudando de `"sqlite"` para `"postgresql"`. Quais adaptações? 
   - Como configuramos as conexões `DIRECT_URL` e `DATABASE_URL` (Pooler) oferecidas no Painel do Supabase no ambiente Prisma + Fastify?
   - Devemos re-executar `npx prisma db push` ou gerar migrações pesadas para ativar isso?

### 2. Implementação UI de Upload de Fotografia (Componentes faltantes)
A infraestrutura está pronta e tem mocks, mas nossos Formulários principais de Produto, Perfil ou Receitas ainda não possuem campo de Upload Visual.
   - Como criar um componente moderno dropzone reutilizável usando a biblioteca existente Radix e Tailwind.
   - Se agora que iremos pro Supabase, convém mudarmos o uso de `MinIO` docker antigo usando as funções de rotas locais para chamar as Libs do Supabase Storage diretamente do Frontend ou mantermos a subida de AWS-s3-sdk assinada pelo backend nas rotas de `/uploads/public`?

### 3. Ajustes de Balanço de Estoque Visual
A Rota para justificar Perdas foi programada (`POST /movimentacoes-estoque`) aceitando `"ajuste"` e `"perda"`, porém eu preciso do componente de "Ajustes Manuais".
   - Criar modal onde a pessoa edite manualmente ("Tinha 3, mas roubaram 1, ajuste para 2"), disparando a ação manual corretamente para nossa nova entidade na API.

---

**ChatGPT, a qual desses passos damos início primeiro, e qual a linha de estratégia adotamos com o modelo Supabase (passo 1)?**
