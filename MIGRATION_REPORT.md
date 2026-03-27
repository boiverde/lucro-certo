# Relatório de Migração Frontend (Base44 -> Local)

## ✅ Status: Concluído
O frontend foi completamente desconectado da Base44 e agora aponta para o backend local.

### 1. Arquivos Alterados/Criados

#### Camada de API (Nova)
*   `src/api/httpClient.js`: Cliente HTTP genérico com suporte a JWT e Axios-like interface.
*   `src/api/auth.js`: Gerenciamento de Login/Logout e User Profile local.
*   `src/api/entities.js`: **Core da migração**. Mapeia chamadas antigas (`Venda.filter`, `Produto.create`) para rotas REST locais (`GET /vendas`, `POST /produtos`).
    *   Inclui `VendaEntityAdapter` para normalizar o payload de vendas simples do frontend para a estrutura relacional do backend (itens).
*   `src/api/integrations.js`: Mock das funções de IA/Upload (desativadas temporariamente).
*   `src/api/base44Client.js`: **Shim de Compatibilidade**. Redireciona importações legadas (`import { base44 } ...`) para os novos módulos locais.

#### Telas e Rotas
*   `src/pages/Login.jsx`: Nova tela de login simples (email/senha).
*   `src/pages/index.jsx`: Adicionada rota `/Login`.
*   `src/pages/Layout.jsx`: Marcada `/Login` como página pública (sem checagem de auth).
*   `package.json`: Removida dependência `@base44/sdk`.
*   `.env`: Configurado `VITE_API_URL=http://localhost:3333`.

### 2. Rotas Consumidas
O frontend agora consome as seguintes rotas do backend Fastify:
*   `POST /auth/login`
*   `GET /auth/me`
*   `GET/POST/PUT/DELETE /clientes`
*   `GET/POST/PUT/DELETE /produtos`
*   `GET/POST /vendas`

### 3. Pontos Pendentes (Próximos Passos)
Estes módulos foram mapeados para um `MockAdapter` e não funcionarão até que o backend implemente as rotas:
*   **Revendas:** Telas carregarão vazias. Necessário implementar `/revendas/*` no backend.
*   **Compras:** Necessário implementar `/compras`.
*   **Gestão de Estoque:** Movimentações manuais não persistirão ainda.
*   **Uploads:** Imagens de produtos não serão salvas.

### 4. Como Validar
1.  Certifique-se que o backend está rodando (`cd server && npm run dev`).
2.  Rode o frontend (`npm run dev`).
3.  Acesse `/Login`.
4.  Use `admin@lucrocerto.com` / `admin`.
5.  Navegue para **Vendas** e tente criar uma venda.
6.  Verifique no console do backend ou no banco se a venda foi criada.
