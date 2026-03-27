# Relatório Final: Módulo Estoque e Compras

## ✅ Status: Implementado
As funcionalidades de **Compras** e **Estoque** foram portadas para o backend local e integradas ao frontend.

### 1. Rotas Implementadas
*   `POST /compras`: Criação transacional de Compra + Item + Atualização de Estoque + Movimentação de Entrada.
    *   Suporta o formato simplificado do form atual (1 item por compra).
*   `GET /compras`: Listagem com filtros de data e fornecedor.
*   `DELETE /compras/:id`: Remoção simples (não estorna estoque automaticamente neste MVP).
*   `GET /movimentacoes-estoque`: Histórico completo de alterações.
*   `POST /movimentacoes-estoque`: Ajustes manuais de saldo (entrada, saída, perda, ajuste).
*   `GET /estoque` (via `/produtos`): O endpoint de produtos já retorna `estoque_atual`.

### 2. Integração com Frontend (`Entities Adapter`)
O arquivo `src/api/entities.js` foi atualizado para apontar `Compra` e `MovimentacaoEstoque` para as novas rotas. Nenhum arquivo de página (`src/pages/*.jsx`) foi modificado.

### 3. Lógica de Estoque
*   **Compra:** Aumenta o estoque e gera registro de entrada.
*   **Venda:** Diminui o estoque e gera registro de saída na criação.
*   **Manual:** Usuário pode ajustar saldo na tela de Estoque, gerando histórico.

### 4. Modelo de Dados (Schema Changes)
*   Criada tabela `ItemCompra` (embora o frontend use 1:1, o backend prepara para N:1).
*   Adicionados campos `pago`, `data_pagamento` e `observacoes` em `Compra`.
*   Adicionado campo `estoque_minimo` em `Produto` (suportado no form).

### 5. Próximos Passos (TODOs)
*   **Revendas:** O adapter ainda aponta para `MockAdapter`. As telas carregarão vazias.
*   **Uploads:** Imagens não são salvas no backend.
*   **Validação de Estoque Negativo:** Atualmente permitido (gera saldo negativo), sem bloqueio.

### 6. Como Validar
Simulação de Fluxo Completo:
1.  Vá em **Estoque** > Criar Produto "Teste" (Estoque: 0).
2.  Vá em **Compras** > Nova Compra > Produto "Teste", Qtd 10, "Adicionar ao Estoque" (Sim).
3.  Vá em **Estoque**: O saldo deve ser 10.
4.  Vá em **Vendas** > Nova Venda > Produto "Teste", Qtd 3.
5.  Vá em **Estoque**: O saldo deve ser 7.
6.  Aba "Histórico" em Estoque deve mostrar: Entrada (Compra) e Saída (Venda).
