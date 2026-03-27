import { httpClient } from './httpClient';
import { auth } from './auth';

// Helper para converter filtros Base44 para Query String
function buildQueryString(filters = {}, sort) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        // Ignorar created_by pois o backend pega do token
        if (key === 'created_by') return;

        // Filtros de data (workaround simples para o adapter)
        if (value && typeof value === 'object') {
            // Se for algo complexo, talvez ignorar ou serializar
            // Base44 usa filtro mongo-like. Backend atual espera data_inicio/fim simples.
            // TODO: Melhorar adapter de datas se necessário.
            return;
        }

        if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    });

    if (sort) {
        // Backend atual ignora sort dinâmico na maioria das rotas, mas enviamos.
        params.append('sort', sort);
    }

    return params.toString();
}

// Classe Adapter Genérica
class EntityAdapter {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    mapItemToFrontend(item) {
        // Force Cast Decimals
        if (item.valor_total !== undefined) item.valor_total = Number(item.valor_total);
        if (item.valor !== undefined) item.valor = Number(item.valor);
        if (item.preco !== undefined) item.preco = Number(item.preco);
        if (item.custo !== undefined) item.custo = Number(item.custo);
        if (item.comissao_total !== undefined) item.comissao_total = Number(item.comissao_total);
        if (item.valor_parcela !== undefined) item.valor_parcela = Number(item.valor_parcela);
        return item;
    }

    async filter(filters, sort) {
        if (!this.endpoint) return [];

        const dateFilters = {};
        const query = buildQueryString(filters, sort);
        const data = await httpClient(`${this.endpoint}?${query}`);

        if (data && data.results) {
            return data.results.map(i => this.mapItemToFrontend(i));
        }
        if (Array.isArray(data)) {
            return data.map(i => this.mapItemToFrontend(i));
        }
        return [];
    }

    async create(data) {
        if (!this.endpoint) throw new Error('Endpoint não implementado');
        return httpClient(this.endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async update(id, data) {
        if (!this.endpoint) throw new Error('Endpoint não implementado');
        return httpClient(`${this.endpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(id) {
        if (!this.endpoint) throw new Error('Endpoint não implementado');
        return httpClient(`${this.endpoint}/${id}`, {
            method: 'DELETE',
        });
    }
}

// Adapter Específico para Vendas
class VendasEntityAdapter extends EntityAdapter {
    mapItemToFrontend(item) {
        let mapped = super.mapItemToFrontend(item);
        if (mapped.itens && mapped.itens.length > 0) {
            const principal = mapped.itens[0];
            mapped.produto = principal.nome_produto;
            mapped.quantidade = principal.quantidade;
            mapped.preco_por_unidade = Number(principal.preco_unitario);
            mapped.cliente = mapped.cliente_nome || (mapped.cliente ? mapped.cliente.nome : '');
            mapped.pago = mapped.status === 'paga' || !!mapped.data_pagamento;
        }
        return mapped;
    }

    async create(data) {
        if (!data.itens && data.produto) {
            const payload = {
                data_venda: data.data_venda,
                data_pagamento: data.data_pagamento || null,
                valor_total: data.valor_total,
                cliente_nome: data.cliente,
                observacoes: data.observacoes,
                itens: [
                    {
                        produtoId: data.produto_estoque_id || null,
                        nome_produto: data.produto,
                        quantidade: Number(data.quantidade),
                        preco_unitario: Number(data.preco_por_unidade),
                        subtotal: Number(data.valor_total) 
                    }
                ]
            };
            return super.create(payload);
        }
        return super.create(data);
    }
}

class ComprasEntityAdapter extends EntityAdapter {
    mapItemToFrontend(item) {
        let mapped = super.mapItemToFrontend(item);
        if (mapped.itens && mapped.itens.length > 0) {
            const principal = mapped.itens[0];
            mapped.produto = principal.nome_produto;
            mapped.quantidade = principal.quantidade;
            mapped.unidade_compra = principal.unidade;
            mapped.valor_por_unidade = Number(principal.preco_unitario);
            mapped.fornecedor = mapped.fornecedor_nome || (mapped.fornecedor ? mapped.fornecedor.nome : '');
        }
        return mapped;
    }
}

// Adapters Específicos
const ClientesAdapter = new EntityAdapter('/clientes');
const ProdutosAdapter = new EntityAdapter('/produtos');
const VendasAdapter = new VendasEntityAdapter('/vendas');
const ComprasAdapter = new ComprasEntityAdapter('/compras');
const MovimentacoesAdapter = new EntityAdapter('/movimentacoes-estoque');

// Entidades ainda não migradas (Mock que retorna vazio ou erro controlado)
const MockAdapter = new EntityAdapter(null);

// Adapters Específicos
const RevendasEmpresasAdapter = new EntityAdapter('/revendas/empresas');
const RevendasVendasAdapter = new EntityAdapter('/revendas/vendas');
const RevendasGastosAdapter = new EntityAdapter('/revendas/gastos');
const GastosOperacionaisAdapter = new EntityAdapter('/gastos-operacionais');
const GastosPessoaisAdapter = new EntityAdapter('/gastos-pessoais');

export const Compra = ComprasAdapter;
export const Venda = VendasAdapter;
export const GastoOperacional = GastosOperacionaisAdapter;
export const GastoPessoal = GastosPessoaisAdapter;
export const EmpresaRevenda = RevendasEmpresasAdapter;
export const VendaRevenda = RevendasVendasAdapter;
export const GastoRevenda = RevendasGastosAdapter;
export const Cliente = ClientesAdapter;
export const Produto = ProdutosAdapter;
export const MovimentacaoEstoque = MovimentacoesAdapter;

const IngredientesAdapter = new EntityAdapter('/ingredientes');
const ReceitasAdapter = new EntityAdapter('/receitas');
const ProducoesAdapter = new EntityAdapter('/producoes');

export const Ingrediente = IngredientesAdapter;
export const ReceitaProduto = ReceitasAdapter;
export const ProducaoLanche = ProducoesAdapter;

const LotesAdapter = new EntityAdapter('/lotes');
const AlertasAdapter = new EntityAdapter('/alertas');
const FornecedoresAdapter = new EntityAdapter('/fornecedores');
const PedidosAdapter = new EntityAdapter('/pedidos');
const FuncionariosAdapter = new EntityAdapter('/funcionarios');
const DiariasAdapter = new EntityAdapter('/diarias');

export const Funcionario = FuncionariosAdapter;
export const Diaria = DiariasAdapter;

export const Pedido = PedidosAdapter;
export const Lote = LotesAdapter;
export const Fornecedor = FornecedoresAdapter;
export const AlertaEstoque = AlertasAdapter;

// Auth
export const User = auth;