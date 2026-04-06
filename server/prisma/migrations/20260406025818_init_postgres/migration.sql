-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(65,30) NOT NULL,
    "custo" DECIMAL(65,30),
    "estoque_atual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "controla_estoque" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "estoque_minimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "data_venda" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "valor_total" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "observacoes" TEXT,
    "cliente_nome" TEXT,
    "clienteId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_venda" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "produtoId" TEXT,
    "nome_produto" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "preco_unitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "itens_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacao_estoque" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "origem" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacoes" TEXT,
    "produtoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacao_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "data_compra" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "valor_total" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'concluida',
    "observacoes" TEXT,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "fornecedor_nome" TEXT,
    "fornecedorId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_compra" (
    "id" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "produtoId" TEXT,
    "nome_produto" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT,
    "preco_unitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "itens_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas_revenda" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "porcentagem_comissao" DOUBLE PRECISION NOT NULL,
    "cor" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "empresas_revenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas_revenda" (
    "id" TEXT NOT NULL,
    "data_primeira_parcela" TIMESTAMP(3) NOT NULL,
    "valor_total" DECIMAL(65,30) NOT NULL,
    "numero_parcelas" INTEGER NOT NULL DEFAULT 1,
    "valor_parcela" DECIMAL(65,30) NOT NULL,
    "comissao_total" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "descricao_produtos" TEXT,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT,
    "userId" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_revenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas_revenda" (
    "id" TEXT NOT NULL,
    "vendaRevendaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "paga" BOOLEAN NOT NULL DEFAULT false,
    "data_pagamento" TIMESTAMP(3),

    CONSTRAINT "parcelas_revenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_revenda" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "gastos_revenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_operacionais" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "gastos_operacionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_pessoais" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "gastos_pessoais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade_comprada" DOUBLE PRECISION NOT NULL,
    "valor_pago" DECIMAL(65,30) NOT NULL,
    "preco_por_kg" DECIMAL(65,30) NOT NULL,
    "fator_correcao" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "preco_corrigido_kg" DECIMAL(65,30) NOT NULL,
    "estoque_atual" DOUBLE PRECISION NOT NULL,
    "estoque_minimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receitas_produto" (
    "id" TEXT NOT NULL,
    "nome_produto" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tempo_preparo" INTEGER DEFAULT 0,
    "custo_total" DECIMAL(65,30) NOT NULL,
    "preco_venda_sugerido" DECIMAL(65,30) NOT NULL,
    "margem_lucro" DECIMAL(65,30) NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "receitas_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receitas_ingredientes" (
    "id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "quantidade_kg" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL,
    "receitaId" TEXT NOT NULL,
    "ingredienteId" TEXT NOT NULL,
    "ingrediente_nome" TEXT,

    CONSTRAINT "receitas_ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producoes_lanche" (
    "id" TEXT NOT NULL,
    "quantidade_produzida" DOUBLE PRECISION NOT NULL,
    "data_producao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "custo_total_producao" DECIMAL(65,30) NOT NULL,
    "observacoes" TEXT,
    "receitaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "producoes_lanche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "numero_lote" TEXT NOT NULL,
    "data_fabricacao" TIMESTAMP(3),
    "data_validade" TIMESTAMP(3) NOT NULL,
    "quantidade_inicial" DOUBLE PRECISION NOT NULL,
    "quantidade_atual" DOUBLE PRECISION NOT NULL,
    "produtoId" TEXT,
    "ingredienteId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_estoque" (
    "id" TEXT NOT NULL,
    "tipo_alerta" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "resolvido" BOOLEAN NOT NULL DEFAULT false,
    "produtoId" TEXT,
    "ingredienteId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "cliente_nome" TEXT,
    "status" TEXT NOT NULL,
    "valor_total" DECIMAL(65,30) NOT NULL,
    "data_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diarias" (
    "id" TEXT NOT NULL,
    "data_diaria" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" DECIMAL(65,30) NOT NULL,
    "foi_pago" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "funcionarioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "diarias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "movimentacao_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "movimentacao_estoque_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_compra" ADD CONSTRAINT "itens_compra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_compra" ADD CONSTRAINT "itens_compra_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_revenda" ADD CONSTRAINT "empresas_revenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas_revenda" ADD CONSTRAINT "vendas_revenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas_revenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas_revenda" ADD CONSTRAINT "vendas_revenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas_revenda" ADD CONSTRAINT "vendas_revenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas_revenda" ADD CONSTRAINT "parcelas_revenda_vendaRevendaId_fkey" FOREIGN KEY ("vendaRevendaId") REFERENCES "vendas_revenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_revenda" ADD CONSTRAINT "gastos_revenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas_revenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_revenda" ADD CONSTRAINT "gastos_revenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_operacionais" ADD CONSTRAINT "gastos_operacionais_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_pessoais" ADD CONSTRAINT "gastos_pessoais_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredientes" ADD CONSTRAINT "ingredientes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas_produto" ADD CONSTRAINT "receitas_produto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas_ingredientes" ADD CONSTRAINT "receitas_ingredientes_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "receitas_produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas_ingredientes" ADD CONSTRAINT "receitas_ingredientes_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producoes_lanche" ADD CONSTRAINT "producoes_lanche_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "receitas_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producoes_lanche" ADD CONSTRAINT "producoes_lanche_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "ingredientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_estoque" ADD CONSTRAINT "alertas_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_estoque" ADD CONSTRAINT "alertas_estoque_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "ingredientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_estoque" ADD CONSTRAINT "alertas_estoque_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diarias" ADD CONSTRAINT "diarias_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diarias" ADD CONSTRAINT "diarias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
