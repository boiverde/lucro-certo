-- CreateIndex
CREATE INDEX "compras_userId_data_compra_idx" ON "compras"("userId", "data_compra");

-- CreateIndex
CREATE INDEX "gastos_operacionais_userId_data_idx" ON "gastos_operacionais"("userId", "data");

-- CreateIndex
CREATE INDEX "gastos_pessoais_userId_data_idx" ON "gastos_pessoais"("userId", "data");

-- CreateIndex
CREATE INDEX "gastos_revenda_userId_data_idx" ON "gastos_revenda"("userId", "data");

-- CreateIndex
CREATE INDEX "movimentacao_estoque_userId_data_idx" ON "movimentacao_estoque"("userId", "data");

-- CreateIndex
CREATE INDEX "vendas_userId_data_venda_idx" ON "vendas"("userId", "data_venda");

-- CreateIndex
CREATE INDEX "vendas_revenda_userId_data_primeira_parcela_idx" ON "vendas_revenda"("userId", "data_primeira_parcela");
