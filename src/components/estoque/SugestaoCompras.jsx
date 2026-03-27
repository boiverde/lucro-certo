import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, Truck, CheckCircle } from "lucide-react";
import { subDays, parseISO } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SugestaoCompras() {
  const [comprasRealizadas, setComprasRealizadas] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const result = await base44.entities.Produto.filter(
        { created_by: user?.email },
        'nome'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const result = await base44.entities.Ingrediente.filter(
        { created_by: user?.email },
        'nome'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      const result = await base44.entities.Venda.filter(
        { created_by: user?.email },
        '-data_venda'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      const result = await base44.entities.Fornecedor.filter(
        { created_by: user?.email, ativo: true },
        'nome'
      );
      return result;
    },
    enabled: !!user,
  });

  // Calcular sugestões de compra
  const sugestoes = useMemo(() => {
    const hoje = new Date();
    const periodo30Dias = subDays(hoje, 30);
    const periodo60Dias = subDays(hoje, 60);
    
    const sugestoesProdutos = [];

    // Analisar produtos
    produtos.forEach(produto => {
      if (!produto.ativo || produto.estoque_atual > produto.estoque_minimo * 1.5) return;

      // Calcular média de vendas
      const vendasProduto = vendas.filter(v => 
        v.produto === produto.nome &&
        parseISO(v.data_venda) >= periodo60Dias
      );
      
      const qtdVendida60d = vendasProduto.reduce((sum, v) => sum + (v.quantidade || 0), 0);
      const mediaDiaria = qtdVendida60d / 60;
      const mediaMensal = mediaDiaria * 30;

      // Calcular sugestão de compra
      const estoqueIdeal = mediaMensal * 1.5; // 1.5 mês de estoque
      const quantidadeSugerida = Math.max(0, estoqueIdeal - produto.estoque_atual);

      if (quantidadeSugerida > 0) {
        // Buscar fornecedores que fornecem este produto
        const fornecedoresProduto = fornecedores.filter(f => 
          f.produtos_fornecidos?.some(p => p.produto_nome === produto.nome)
        );

        let melhorFornecedor = null;
        let precoUnitario = 0;

        if (fornecedoresProduto.length > 0) {
          // Escolher melhor fornecedor (menor prazo, melhor avaliação)
          melhorFornecedor = fornecedoresProduto.sort((a, b) => {
            if (a.prazo_entrega_dias !== b.prazo_entrega_dias) {
              return a.prazo_entrega_dias - b.prazo_entrega_dias;
            }
            return (b.avaliacao || 0) - (a.avaliacao || 0);
          })[0];

          const produtoFornecedor = melhorFornecedor.produtos_fornecidos.find(
            p => p.produto_nome === produto.nome
          );
          precoUnitario = produtoFornecedor?.preco_unitario || 0;
        }

        const urgencia = produto.estoque_atual <= produto.estoque_minimo ? 'alta' : 
                        produto.estoque_atual <= produto.estoque_minimo * 1.2 ? 'media' : 'baixa';

        sugestoesProdutos.push({
          tipo: 'produto',
          id: produto.id,
          nome: produto.nome,
          estoqueAtual: produto.estoque_atual,
          estoqueMinimo: produto.estoque_minimo,
          mediaDiaria,
          mediaMensal,
          quantidadeSugerida: Math.ceil(quantidadeSugerida),
          unidade: produto.unidade,
          fornecedor: melhorFornecedor,
          precoUnitario,
          valorTotal: precoUnitario * Math.ceil(quantidadeSugerida),
          urgencia,
          diasCobertura: mediaDiaria > 0 ? Math.floor(produto.estoque_atual / mediaDiaria) : 999
        });
      }
    });

    // Analisar ingredientes
    ingredientes.forEach(ingrediente => {
      if (!ingrediente.ativo || ingrediente.estoque_atual > ingrediente.estoque_minimo * 1.5) return;

      // Sugestão simplificada para ingredientes (3x o estoque mínimo)
      const quantidadeSugerida = Math.max(0, ingrediente.estoque_minimo * 3 - ingrediente.estoque_atual);

      if (quantidadeSugerida > 0) {
        const urgencia = ingrediente.estoque_atual <= ingrediente.estoque_minimo ? 'alta' : 
                        ingrediente.estoque_atual <= ingrediente.estoque_minimo * 1.2 ? 'media' : 'baixa';

        sugestoesProdutos.push({
          tipo: 'ingrediente',
          id: ingrediente.id,
          nome: ingrediente.nome,
          estoqueAtual: ingrediente.estoque_atual,
          estoqueMinimo: ingrediente.estoque_minimo,
          quantidadeSugerida: Math.ceil(quantidadeSugerida),
          unidade: 'kg',
          precoUnitario: ingrediente.preco_por_kg || 0,
          valorTotal: (ingrediente.preco_por_kg || 0) * Math.ceil(quantidadeSugerida),
          urgencia,
          diasCobertura: 30
        });
      }
    });

    // Ordenar por urgência e dias de cobertura
    return sugestoesProdutos.sort((a, b) => {
      const urgenciaOrder = { alta: 0, media: 1, baixa: 2 };
      if (urgenciaOrder[a.urgencia] !== urgenciaOrder[b.urgencia]) {
        return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
      }
      return a.diasCobertura - b.diasCobertura;
    });
  }, [produtos, ingredientes, vendas, fornecedores]);

  const createCompraMutation = useMutation({
    mutationFn: async (sugestao) => {
      const compraData = {
        produto: sugestao.nome,
        quantidade: sugestao.quantidadeSugerida,
        unidade_compra: sugestao.unidade,
        valor_por_unidade: sugestao.precoUnitario,
        valor_total: sugestao.valorTotal,
        data_compra: format(new Date(), 'yyyy-MM-dd'),
        fornecedor: sugestao.fornecedor?.nome || '',
        observacoes: `Compra sugerida automaticamente - Urgência ${sugestao.urgencia}`,
        created_by: user?.email
      };

      return base44.entities.Compra.create(compraData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
    },
  });

  const handleCriarCompra = async (sugestao) => {
    try {
      await createCompraMutation.mutateAsync(sugestao);
      setComprasRealizadas([...comprasRealizadas, sugestao.id]);
      alert(`✅ Compra de ${sugestao.nome} criada com sucesso!`);
    } catch (error) {
      alert('Erro ao criar compra');
    }
  };

  const sugestoesUrgentes = sugestoes.filter(s => s.urgencia === 'alta');
  const valorTotalSugestoes = sugestoes.reduce((sum, s) => sum + s.valorTotal, 0);

  const getUrgenciaColor = (urgencia) => {
    const colors = {
      alta: "bg-red-100 text-red-800",
      media: "bg-orange-100 text-orange-800",
      baixa: "bg-blue-100 text-blue-800"
    };
    return colors[urgencia] || colors.baixa;
  };

  if (isLoading) {
    return <div className="p-8">Calculando sugestões...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Sugestões</p>
                <p className="text-2xl font-bold text-blue-900">{sugestoes.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Urgentes</p>
                <p className="text-2xl font-bold text-red-900">{sugestoesUrgentes.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Valor Total</p>
                <p className="text-xl font-bold text-green-900">
                  R$ {valorTotalSugestoes.toFixed(2)}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de sugestões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Sugestões Inteligentes de Compra
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Baseado em histórico de vendas e níveis de estoque
          </p>
        </CardHeader>
        <CardContent>
          {sugestoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Nenhuma compra necessária no momento! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sugestoes.map(sugestao => {
                const foiRealizada = comprasRealizadas.includes(sugestao.id);
                
                return (
                  <Card 
                    key={sugestao.id} 
                    className={`border-2 ${foiRealizada ? 'bg-gray-50 opacity-60' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{sugestao.nome}</h4>
                            <Badge className={getUrgenciaColor(sugestao.urgencia)}>
                              {sugestao.urgencia.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{sugestao.tipo}</Badge>
                            {foiRealizada && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Realizada
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Estoque Atual</p>
                              <p className="font-medium text-orange-600">
                                {sugestao.estoqueAtual} {sugestao.unidade}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Quantidade Sugerida</p>
                              <p className="font-medium text-blue-600">
                                {sugestao.quantidadeSugerida} {sugestao.unidade}
                              </p>
                            </div>
                            {sugestao.mediaDiaria && (
                              <div>
                                <p className="text-gray-500">Média Diária</p>
                                <p className="font-medium">
                                  {sugestao.mediaDiaria.toFixed(1)} {sugestao.unidade}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">Cobertura</p>
                              <p className="font-medium">
                                {sugestao.diasCobertura >= 999 ? '∞' : `${sugestao.diasCobertura} dias`}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Valor Estimado</p>
                              <p className="font-bold text-green-600">
                                R$ {sugestao.valorTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {sugestao.fornecedor && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                              <Truck className="w-4 h-4" />
                              <span>{sugestao.fornecedor.nome}</span>
                              <span className="text-xs">
                                • Prazo: {sugestao.fornecedor.prazo_entrega_dias} dias
                              </span>
                              {sugestao.fornecedor.avaliacao && (
                                <span className="text-xs">
                                  • ⭐ {sugestao.fornecedor.avaliacao}/5
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {!foiRealizada && (
                          <Button 
                            onClick={() => handleCriarCompra(sugestao)}
                            className="bg-green-600 hover:bg-green-700 ml-4"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Criar Compra
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Como funcionam as sugestões</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Urgência Alta:</strong> Estoque abaixo do mínimo, comprar imediatamente</p>
            <p>• <strong>Urgência Média:</strong> Estoque próximo do mínimo, programar compra</p>
            <p>• <strong>Quantidade Sugerida:</strong> Baseada na média de vendas para 30-45 dias</p>
            <p>• <strong>Fornecedor Sugerido:</strong> Melhor combinação de prazo e avaliação</p>
            <p>• <strong>Cobertura:</strong> Por quantos dias o estoque atual durará</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}