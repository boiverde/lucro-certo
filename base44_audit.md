### Auditoria de Dependências do Base44

- **Total de arquivos afetados:** 34

### Resumo e Nível de Complexidade:
- .\src\api\base44Client.js [MÉDIO] (11 referências)
- .\src\api\entities.js [COMPLEXO] (27 referências)
- .\src\api\integrations.js [SIMPLES] (1 referências)
- .\src\components\compras\ListaCompras.jsx [SIMPLES] (4 referências)
- .\src\components\estoque\AlertasInteligentes.jsx [COMPLEXO] (17 referências)
- .\src\components\estoque\FormProduto.jsx [SIMPLES] (3 referências)
- .\src\components\estoque\GerenciadorFornecedores.jsx [MÉDIO] (11 referências)
- .\src\components\estoque\GerenciadorLotes.jsx [COMPLEXO] (17 referências)
- .\src\components\estoque\RelatorioGiroEstoque.jsx [MÉDIO] (9 referências)
- .\src\components\estoque\SugestaoCompras.jsx [MÉDIO] (13 referências)
- .\src\components\lanches\FormReceita.jsx [SIMPLES] (3 referências)
- .\src\components\relatorios\RelatorioVendasDetalhado.jsx [SIMPLES] (5 referências)
- .\src\components\revendas\ListaPagamentos.jsx [SIMPLES] (4 referências)
- .\src\components\revendas\ListaVendasRevenda.jsx [SIMPLES] (4 referências)
- .\src\components\vendas\ListaVendas.jsx [SIMPLES] (4 referências)
- .\src\pages\Clientes.jsx [MÉDIO] (13 referências)
- .\src\pages\Compras.jsx [SIMPLES] (2 referências)
- .\src\pages\Configuracoes.jsx [SIMPLES] (5 referências)
- .\src\pages\Controle.jsx [COMPLEXO] (164 referências)
- .\src\pages\CorrigirDNS.jsx [SIMPLES] (2 referências)
- .\src\pages\Dashboard.jsx [SIMPLES] (3 referências)
- .\src\pages\Estoque.jsx [COMPLEXO] (21 referências)
- .\src\pages\GuiaExportacao.jsx [SIMPLES] (4 referências)
- .\src\pages\GuiaGooglePlay.jsx [SIMPLES] (4 referências)
- .\src\pages\GuiaPlayStore.jsx [MÉDIO] (7 referências)
- .\src\pages\GuiaPublicacao.jsx [SIMPLES] (2 referências)
- .\src\pages\Home.jsx [SIMPLES] (1 referências)
- .\src\pages\Layout.jsx [SIMPLES] (4 referências)
- .\src\pages\Login.jsx [SIMPLES] (4 referências)
- .\src\pages\MarketingAssets.jsx [SIMPLES] (1 referências)
- .\src\pages\Pessoais.jsx [SIMPLES] (2 referências)
- .\src\pages\Register.jsx [SIMPLES] (3 referências)
- .\src\pages\Revendas.jsx [COMPLEXO] (31 referências)
- .\src\pages\Vendas.jsx [MÉDIO] (15 referências)

### Detalhamento por Arquivo:

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\api\base44Client.js
- **Total de referências no arquivo:** 11
- **Referências (linhas exatas):**
  - Linha 1: import * as entities from './entities';
  - Linha 2: import * as integrations from './integrations';
  - Linha 5: // Mock do objeto base44 para manter compatibilidade sem alterar todas as páginas
  - Linha 6: export const base44 = {
  - Linha 8: entities: entities, // entities.js agora exporta os Adapters (Cliente, Venda, etc)
  - Linha 9: integrations: {
  - Linha 10: Core: integrations

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\api\entities.js
- **Total de referências no arquivo:** 27
- **Referências (linhas exatas):**
  - Linha 4: // Helper para converter filtros Base44 para Query String
  - Linha 15: // Base44 usa filtro mongo-like. Backend atual espera data_inicio/fim simples.
  - Linha 34: class EntityAdapter {
  - Linha 113: class VendasEntityAdapter extends EntityAdapter {
  - Linha 151: class ComprasEntityAdapter extends EntityAdapter {
  - Linha 167: const ClientesAdapter = new EntityAdapter('/clientes');
  - Linha 168: const ProdutosAdapter = new EntityAdapter('/produtos');
  - Linha 169: const VendasAdapter = new VendasEntityAdapter('/vendas');
  - Linha 170: const ComprasAdapter = new ComprasEntityAdapter('/compras');
  - Linha 171: const MovimentacoesAdapter = new EntityAdapter('/movimentacoes-estoque');
  - Linha 174: const MockAdapter = new EntityAdapter(null);
  - Linha 177: const RevendasEmpresasAdapter = new EntityAdapter('/revendas/empresas');
  - Linha 178: const RevendasVendasAdapter = new EntityAdapter('/revendas/vendas');
  - Linha 179: const RevendasGastosAdapter = new EntityAdapter('/revendas/gastos');
  - Linha 180: const GastosOperacionaisAdapter = new EntityAdapter('/gastos-operacionais');
  - Linha 181: const GastosPessoaisAdapter = new EntityAdapter('/gastos-pessoais');
  - Linha 194: const IngredientesAdapter = new EntityAdapter('/ingredientes');
  - Linha 195: const ReceitasAdapter = new EntityAdapter('/receitas');
  - Linha 196: const ProducoesAdapter = new EntityAdapter('/producoes');
  - Linha 202: const LotesAdapter = new EntityAdapter('/lotes');
  - Linha 203: const AlertasAdapter = new EntityAdapter('/alertas');
  - Linha 204: const FornecedoresAdapter = new EntityAdapter('/fornecedores');
  - Linha 205: const PedidosAdapter = new EntityAdapter('/pedidos');
  - Linha 206: const FuncionariosAdapter = new EntityAdapter('/funcionarios');
  - Linha 207: const DiariasAdapter = new EntityAdapter('/diarias');

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\api\integrations.js
- **Total de referências no arquivo:** 1
- **Referências (linhas exatas):**
  - Linha 33: // Base44 retornava { url, fileId, ... }

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\compras\ListaCompras.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 9: import { base44 } from "@/api/base44Client";
  - Linha 28: return base44.entities.Compra.update(id, {

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\estoque\AlertasInteligentes.jsx
- **Total de referências no arquivo:** 17
- **Referências (linhas exatas):**
  - Linha 3: import { base44 } from "@/api/base44Client";
  - Linha 25: queryFn: () => base44.auth.me(),
  - Linha 31: const result = await base44.entities.AlertaEstoque.filter(
  - Linha 43: const result = await base44.entities.Produto.filter(
  - Linha 55: const result = await base44.entities.Ingrediente.filter(
  - Linha 67: const result = await base44.entities.Venda.filter(
  - Linha 79: const result = await base44.entities.Lote.filter(
  - Linha 89: mutationFn: ({ id, data }) => base44.entities.AlertaEstoque.update(id, data),
  - Linha 96: mutationFn: (data) => base44.entities.AlertaEstoque.create(data),

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\estoque\FormProduto.jsx
- **Total de referências no arquivo:** 3
- **Referências (linhas exatas):**
  - Linha 14: import { base44 } from "@/api/base44Client";
  - Linha 23: const user = await base44.auth.me();

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\estoque\GerenciadorFornecedores.jsx
- **Total de referências no arquivo:** 11
- **Referências (linhas exatas):**
  - Linha 3: import { base44 } from "@/api/base44Client";
  - Linha 26: queryFn: () => base44.auth.me(),
  - Linha 32: const result = await base44.entities.Fornecedor.filter(
  - Linha 42: mutationFn: (id) => base44.entities.Fornecedor.delete(id),
  - Linha 201: mutationFn: (data) => base44.entities.Fornecedor.create(data),
  - Linha 209: mutationFn: ({ id, data }) => base44.entities.Fornecedor.update(id, data),

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\estoque\GerenciadorLotes.jsx
- **Total de referências no arquivo:** 17
- **Referências (linhas exatas):**
  - Linha 3: import { base44 } from "@/api/base44Client";
  - Linha 32: queryFn: () => base44.auth.me(),
  - Linha 38: const result = await base44.entities.Lote.filter(
  - Linha 50: const result = await base44.entities.Produto.filter(
  - Linha 62: const result = await base44.entities.Ingrediente.filter(
  - Linha 74: const result = await base44.entities.Fornecedor.filter(
  - Linha 84: mutationFn: (id) => base44.entities.Lote.delete(id),
  - Linha 354: mutationFn: (data) => base44.entities.Lote.create(data),
  - Linha 362: mutationFn: ({ id, data }) => base44.entities.Lote.update(id, data),

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\estoque\RelatorioGiroEstoque.jsx
- **Total de referências no arquivo:** 9
- **Referências (linhas exatas):**
  - Linha 3: import { base44 } from "@/api/base44Client";
  - Linha 12: queryFn: () => base44.auth.me(),
  - Linha 18: const result = await base44.entities.Produto.filter(
  - Linha 30: const result = await base44.entities.Venda.filter(
  - Linha 42: const result = await base44.entities.MovimentacaoEstoque.filter(

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\estoque\SugestaoCompras.jsx
- **Total de referências no arquivo:** 13
- **Referências (linhas exatas):**
  - Linha 4: import { base44 } from "@/api/base44Client";
  - Linha 19: queryFn: () => base44.auth.me(),
  - Linha 25: const result = await base44.entities.Produto.filter(
  - Linha 37: const result = await base44.entities.Ingrediente.filter(
  - Linha 49: const result = await base44.entities.Venda.filter(
  - Linha 61: const result = await base44.entities.Fornecedor.filter(
  - Linha 193: return base44.entities.Compra.create(compraData);

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\lanches\FormReceita.jsx
- **Total de referências no arquivo:** 3
- **Referências (linhas exatas):**
  - Linha 11: import { base44 } from "@/api/base44Client";
  - Linha 48: const user = await base44.auth.me();

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\relatorios\RelatorioVendasDetalhado.jsx
- **Total de referências no arquivo:** 5
- **Referências (linhas exatas):**
  - Linha 9: import { base44 } from "@/api/base44Client";
  - Linha 19: base44.entities.ReceitaProduto.list(),
  - Linha 20: base44.auth.me()

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\revendas\ListaPagamentos.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 9: import { base44 } from "@/api/base44Client";
  - Linha 20: return base44.entities.VendaRevenda.update(id, {

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\revendas\ListaVendasRevenda.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 9: import { base44 } from "@/api/base44Client";
  - Linha 42: return base44.entities.VendaRevenda.update(id, {

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\components\vendas\ListaVendas.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 9: import { base44 } from "@/api/base44Client";
  - Linha 35: return base44.entities.Venda.update(id, {

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Clientes.jsx
- **Total de referências no arquivo:** 13
- **Referências (linhas exatas):**
  - Linha 2: import { base44 } from "@/api/base44Client";
  - Linha 27: const currentUser = await base44.auth.me();
  - Linha 36: const result = await base44.entities.Cliente.filterPaginated(
  - Linha 53: const result = await base44.entities.VendaRevenda.filter(
  - Linha 63: mutationFn: (data) => base44.entities.Cliente.create(data),
  - Linha 72: mutationFn: ({ id, data }) => base44.entities.Cliente.update(id, data),
  - Linha 81: mutationFn: (id) => base44.entities.Cliente.delete(id),

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Compras.jsx
- **Total de referências no arquivo:** 2
- **Referências (linhas exatas):**
  - Linha 4: import { Compra } from "@/api/entities";
  - Linha 5: import { User } from "@/api/entities";

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Configuracoes.jsx
- **Total de referências no arquivo:** 5
- **Referências (linhas exatas):**
  - Linha 4: import { base44 } from "@/api/base44Client";
  - Linha 31: const { data: userData } = useQuery({ queryKey: ['auth-me-configs'], queryFn: () => base44.auth.me(), staleTime: 1000 * 60 * 5 });
  - Linha 43: await base44.auth.updateMe({
  - Linha 89: await base44.auth.updateMe({

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Controle.jsx
- **Total de referências no arquivo:** 164
- **Referências (linhas exatas):**
  - Linha 4: import { base44 } from "@/api/base44Client";
  - Linha 90: const currentUser = await base44.auth.me();
  - Linha 100: const result = await base44.entities.Compra.filter(
  - Linha 112: const result = await base44.entities.Venda.filter(
  - Linha 124: const result = await base44.entities.Produto.filter(
  - Linha 136: const result = await base44.entities.MovimentacaoEstoque.filter(
  - Linha 148: const result = await base44.entities.GastoOperacional.filter(
  - Linha 160: const result = await base44.entities.Funcionario.filter(
  - Linha 172: const result = await base44.entities.Diaria.filter(
  - Linha 184: const result = await base44.entities.Ingrediente.filter(
  - Linha 196: const result = await base44.entities.ReceitaProduto.filter(
  - Linha 208: const result = await base44.entities.ProducaoLanche.filter(
  - Linha 220: const result = await base44.entities.Pedido.filter(
  - Linha 236: const compraCriada = await base44.entities.Compra.create(data);
  - Linha 245: await base44.entities.Produto.update(produto.id, {
  - Linha 249: await base44.entities.MovimentacaoEstoque.create({
  - Linha 262: const novoProduto = await base44.entities.Produto.create({
  - Linha 274: await base44.entities.MovimentacaoEstoque.create({
  - Linha 306: mutationFn: ({ id, data }) => base44.entities.Compra.update(id, data),
  - Linha 315: mutationFn: (id) => base44.entities.Compra.delete(id),
  - Linha 331: const clientesExistentes = await base44.entities.Cliente.filter({
  - Linha 337: await base44.entities.Cliente.create({
  - Linha 345: const vendaCriada = await base44.entities.Venda.create(data);
  - Linha 352: await base44.entities.Produto.update(produto.id, {
  - Linha 356: await base44.entities.MovimentacaoEstoque.create({
  - Linha 389: mutationFn: ({ id, data }) => base44.entities.Venda.update(id, data),
  - Linha 398: mutationFn: (id) => base44.entities.Venda.delete(id),
  - Linha 410: return base44.entities.Produto.create({ ...data, created_by: user?.email });
  - Linha 427: mutationFn: ({ id, data }) => base44.entities.Produto.update(id, data),
  - Linha 442: await base44.entities.MovimentacaoEstoque.create({ ...data, created_by: user?.email });
  - Linha 456: await base44.entities.Produto.update(produto.id, {
  - Linha 485: const funcionariosExistentes = await base44.entities.Funcionario.filter({
  - Linha 491: await base44.entities.Funcionario.create({
  - Linha 499: return base44.entities.GastoOperacional.create({ ...data, created_by: user?.email });
  - Linha 517: mutationFn: ({ id, data }) => base44.entities.GastoOperacional.update(id, data),
  - Linha 526: mutationFn: (id) => base44.entities.GastoOperacional.delete(id),
  - Linha 538: return base44.entities.Funcionario.create({ ...data, created_by: user?.email });
  - Linha 555: mutationFn: ({ id, data }) => base44.entities.Funcionario.update(id, data),
  - Linha 571: const funcionariosExistentes = await base44.entities.Funcionario.filter({
  - Linha 578: const novoFuncionario = await base44.entities.Funcionario.create({
  - Linha 588: return base44.entities.Diaria.create({
  - Linha 610: mutationFn: ({ id, data }) => base44.entities.Diaria.update(id, data),
  - Linha 619: mutationFn: (id) => base44.entities.Diaria.delete(id),
  - Linha 736: mutationFn: (data) => base44.entities.Ingrediente.create({ ...data, created_by: user?.email }),
  - Linha 746: await base44.entities.Ingrediente.update(id, data);
  - Linha 779: await base44.entities.ReceitaProduto.update(receita.id, {
  - Linha 799: mutationFn: (id) => base44.entities.Ingrediente.delete(id),
  - Linha 827: mutationFn: (data) => base44.entities.ReceitaProduto.create({ ...data, created_by: user?.email }),
  - Linha 836: mutationFn: ({ id, data }) => base44.entities.ReceitaProduto.update(id, data),
  - Linha 845: mutationFn: (id) => base44.entities.ReceitaProduto.delete(id),
  - Linha 875: await base44.entities.ProducaoLanche.create({ ...data, created_by: user?.email });
  - Linha 885: await base44.entities.Ingrediente.update(ing.id, { estoque_atual: novoEstoque });
  - Linha 927: await base44.entities.Pedido.create({ ...data, created_by: user?.email });
  - Linha 934: await base44.entities.Produto.update(produto.id, { estoque_atual: novoEstoque });
  - Linha 936: await base44.entities.MovimentacaoEstoque.create({
  - Linha 962: await base44.entities.Ingrediente.update(ing.id, { estoque_atual: novoEstoque });
  - Linha 985: mutationFn: ({ id, data }) => base44.entities.Pedido.update(id, data),
  - Linha 992: mutationFn: (id) => base44.entities.Pedido.delete(id),
  - Linha 1016: await base44.entities.Compra.create(data);
  - Linha 1020: const productData = await base44.entities.Produto.get(data.produto_estoque_id);
  - Linha 1023: await base44.entities.Produto.update(productData.id, { estoque_atual: novoEstoque });
  - Linha 1024: await base44.entities.MovimentacaoEstoque.create({
  - Linha 1036: const novoProduto = await base44.entities.Produto.create({
  - Linha 1047: await base44.entities.MovimentacaoEstoque.create({
  - Linha 1069: const clientesExistentes = await base44.entities.Cliente.filter({
  - Linha 1075: await base44.entities.Cliente.create({
  - Linha 1083: await base44.entities.Venda.create(data);
  - Linha 1086: const productData = await base44.entities.Produto.get(data.produto_estoque_id);
  - Linha 1089: await base44.entities.Produto.update(productData.id, { estoque_atual: novoEstoque });
  - Linha 1090: await base44.entities.MovimentacaoEstoque.create({
  - Linha 1108: await base44.entities.Produto.create(item.data);
  - Linha 1111: await base44.entities.MovimentacaoEstoque.create(item.data);
  - Linha 1112: const productData = await base44.entities.Produto.get(item.data.produto_id);
  - Linha 1118: await base44.entities.Produto.update(productData.id, { estoque_atual: Math.max(0, novoEstoque) });
  - Linha 1125: const funcionariosExistentes = await base44.entities.Funcionario.filter({
  - Linha 1130: await base44.entities.Funcionario.create({
  - Linha 1137: await base44.entities.GastoOperacional.create(item.data);
  - Linha 1141: await base44.entities.Funcionario.create(item.data);
  - Linha 1145: const funcionariosExistentes = await base44.entities.Funcionario.filter({
  - Linha 1152: const novoFuncionario = await base44.entities.Funcionario.create({
  - Linha 1162: await base44.entities.Diaria.create({
  - Linha 1465: await base44.auth.updateMe({
  - Linha 1492: await base44.auth.updateMe({
  - Linha 1519: await base44.auth.updateMe({

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\CorrigirDNS.jsx
- **Total de referências no arquivo:** 2
- **Referências (linhas exatas):**
  - Linha 77: <strong>⚠️ Atenção:</strong> Se você configurou um domínio personalizado (tipo www.seudominio.com), use esse domínio ao invés da URL do Base44.
  - Linha 187: <code className="text-red-600">"host": "lucro-certo.base44.apphttps"</code>

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Dashboard.jsx
- **Total de referências no arquivo:** 3
- **Referências (linhas exatas):**
  - Linha 2: import { base44 } from "@/api/base44Client";
  - Linha 31: queryFn: async () => await base44.auth.me(),

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Estoque.jsx
- **Total de referências no arquivo:** 21
- **Referências (linhas exatas):**
  - Linha 3: import { base44 } from "@/api/base44Client";
  - Linha 32: const currentUser = await base44.auth.me();
  - Linha 41: const result = await base44.entities.Produto.filterPaginated(
  - Linha 58: const result = await base44.entities.MovimentacaoEstoque.filter(
  - Linha 73: return base44.entities.Produto.create(data);
  - Linha 90: mutationFn: ({ id, data }) => base44.entities.Produto.update(id, data),
  - Linha 106: await base44.entities.MovimentacaoEstoque.create(data);
  - Linha 121: await base44.entities.Produto.update(produto.id, {
  - Linha 165: await base44.entities.Produto.create(item.data);
  - Linha 168: await base44.entities.MovimentacaoEstoque.create(item.data);
  - Linha 182: await base44.entities.Produto.update(produto.id, {

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\GuiaExportacao.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 38: descricao: "Faça upgrade para o plano Builder da Base44",
  - Linha 40: "Acesse o dashboard da Base44",
  - Linha 45: link: "https://base44.com/pricing",
  - Linha 55: "No dashboard da Base44, vá no seu app",

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\GuiaGooglePlay.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 43: onClick={() => copiarTexto('https://lucro-certo.base44.app/PoliticaDePrivacidade', 'privacy-url')}
  - Linha 54: https://lucro-certo.base44.app/PoliticaDePrivacidade
  - Linha 556: <p className="text-sm">https://lucro-certo.base44.app</p>
  - Linha 561: onClick={() => copiarTexto("https://lucro-certo.base44.app", 'website')}

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\GuiaPlayStore.jsx
- **Total de referências no arquivo:** 7
- **Referências (linhas exatas):**
  - Linha 40: { id: "init", texto: "# Criar pasta para o projeto\nmkdir lucro-certo-apk\ncd lucro-certo-apk\n\n# Inicializar Bubblewrap\nbubblewrap init --manifest https://seu-app.base44.app/manifest.json" }
  - Linha 42: descricao: "Substitua 'seu-app.base44.app' pela URL real do seu app Base44."
  - Linha 51: "• Host do app: URL do seu app na Base44",
  - Linha 152: "✅ HTTPS ativo (Base44 já fornece)",
  - Linha 162: { label: "Inicializar Projeto", cmd: "bubblewrap init --manifest https://seu-app.base44.app/manifest.json" },
  - Linha 401: <li>• <strong>URL fixa:</strong> Use um domínio personalizado na Base44 se possível</li>

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\GuiaPublicacao.jsx
- **Total de referências no arquivo:** 2
- **Referências (linhas exatas):**
  - Linha 55: "Base44 já fornece domínio HTTPS automático",
  - Linha 56: "Domínio padrão: seu-app.base44.app",

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Home.jsx
- **Total de referências no arquivo:** 1
- **Referências (linhas exatas):**
  - Linha 3: import { User } from "@/api/entities";

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Layout.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 7: import { base44 } from "@/api/base44Client";
  - Linha 87: const currentUser = await base44.auth.me();
  - Linha 103: await base44.auth.logout();

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Login.jsx
- **Total de referências no arquivo:** 4
- **Referências (linhas exatas):**
  - Linha 4: import { base44 } from '@/api/base44Client';
  - Linha 25: const success = await base44.auth.loginWithGoogleToken(session.access_token);
  - Linha 78: const success = await base44.auth.login(email, password);

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\MarketingAssets.jsx
- **Total de referências no arquivo:** 1
- **Referências (linhas exatas):**
  - Linha 772: - **Backend:** Base44 (BaaS)

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Pessoais.jsx
- **Total de referências no arquivo:** 2
- **Referências (linhas exatas):**
  - Linha 4: import { GastoPessoal } from "@/api/entities";
  - Linha 5: import { User } from "@/api/entities";

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Register.jsx
- **Total de referências no arquivo:** 3
- **Referências (linhas exatas):**
  - Linha 2: import { base44 } from '@/api/base44Client';
  - Linha 41: const success = await base44.auth.register(validatedData);

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Revendas.jsx
- **Total de referências no arquivo:** 31
- **Referências (linhas exatas):**
  - Linha 2: import { base44 } from "@/api/base44Client";
  - Linha 40: const currentUser = await base44.auth.me();
  - Linha 88: const result = await base44.entities.EmpresaRevenda.filter(
  - Linha 100: const result = await base44.entities.VendaRevenda.filter(
  - Linha 112: const result = await base44.entities.GastoRevenda.filter(
  - Linha 124: const result = await base44.entities.Cliente.filter(
  - Linha 134: mutationFn: (data) => base44.entities.EmpresaRevenda.create(data),
  - Linha 143: mutationFn: ({ id, data }) => base44.entities.EmpresaRevenda.update(id, data),
  - Linha 157: const clientesExistentes = await base44.entities.Cliente.filter({
  - Linha 164: await base44.entities.Cliente.create({
  - Linha 171: return base44.entities.VendaRevenda.create(data);
  - Linha 182: mutationFn: ({ id, data }) => base44.entities.VendaRevenda.update(id, data),
  - Linha 191: mutationFn: (id) => base44.entities.VendaRevenda.delete(id),
  - Linha 198: mutationFn: (data) => base44.entities.GastoRevenda.create(data),
  - Linha 207: mutationFn: ({ id, data }) => base44.entities.GastoRevenda.update(id, data),
  - Linha 216: mutationFn: (id) => base44.entities.GastoRevenda.delete(id),

#### C:\Users\merca\Downloads\lucro-certo-copy-8dd4f485-main\src\pages\Vendas.jsx
- **Total de referências no arquivo:** 15
- **Referências (linhas exatas):**
  - Linha 3: import { base44 } from "@/api/base44Client";
  - Linha 27: const currentUser = await base44.auth.me();
  - Linha 36: const result = await base44.entities.Venda.filterPaginated(
  - Linha 53: const result = await base44.entities.Produto.filter(
  - Linha 70: const vendaCriada = await base44.entities.Venda.create(data);
  - Linha 92: mutationFn: ({ id, data }) => base44.entities.Venda.update(id, data),
  - Linha 101: mutationFn: (id) => base44.entities.Venda.delete(id),
  - Linha 128: await base44.entities.Venda.create(data);

