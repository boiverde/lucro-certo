import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Package } from "lucide-react";
import { differenceInDays, parseISO, subDays } from "date-fns";

export default function RelatorioGiroEstoque() {
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

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: async () => {
      const result = await base44.entities.MovimentacaoEstoque.filter(
        { created_by: user?.email },
        '-data'
      );
      return result;
    },
    enabled: !!user,
  });

  // Análise de giro de estoque
  const analiseGiro = useMemo(() => {
    const hoje = new Date();
    const periodo30Dias = subDays(hoje, 30);
    const periodo60Dias = subDays(hoje, 60);
    const periodo90Dias = subDays(hoje, 90);

    return produtos.map(produto => {
      // Vendas do período
      const vendas30d = vendas.filter(v => 
        v.produto === produto.nome &&
        parseISO(v.data_venda) >= periodo30Dias
      );
      const vendas60d = vendas.filter(v => 
        v.produto === produto.nome &&
        parseISO(v.data_venda) >= periodo60Dias
      );
      const vendas90d = vendas.filter(v => 
        v.produto === produto.nome &&
        parseISO(v.data_venda) >= periodo90Dias
      );

      const qtdVendida30d = vendas30d.reduce((sum, v) => sum + (v.quantidade || 0), 0);
      const qtdVendida60d = vendas60d.reduce((sum, v) => sum + (v.quantidade || 0), 0);
      const qtdVendida90d = vendas90d.reduce((sum, v) => sum + (v.quantidade || 0), 0);

      // Valor total vendido
      const valorVendido30d = vendas30d.reduce((sum, v) => sum + (v.valor_total || 0), 0);

      // Estoque médio (simplificado - usando estoque atual)
      const estoqueAtual = produto.estoque_atual || 0;
      const estoqueMinimo = produto.estoque_minimo || 0;

      // Taxa de giro (vendas / estoque médio)
      const taxaGiro30d = estoqueAtual > 0 ? (qtdVendida30d / estoqueAtual).toFixed(2) : 0;
      const taxaGiro90d = estoqueAtual > 0 ? (qtdVendida90d / estoqueAtual).toFixed(2) : 0;

      // Cobertura de estoque (dias que o estoque durará)
      const mediaDiaria30d = qtdVendida30d / 30;
      const coberturaDias = mediaDiaria30d > 0 ? Math.floor(estoqueAtual / mediaDiaria30d) : 999;

      // Status do giro
      let statusGiro = "medio";
      let classificacao = "Normal";
      if (qtdVendida60d === 0) {
        statusGiro = "obsoleto";
        classificacao = "Obsoleto";
      } else if (taxaGiro30d < 0.5) {
        statusGiro = "baixo";
        classificacao = "Baixo";
      } else if (taxaGiro30d > 2) {
        statusGiro = "alto";
        classificacao = "Alto";
      }

      // Último movimento
      const movsProduto = movimentacoes.filter(m => m.produto_id === produto.id);
      const ultimoMov = movsProduto.length > 0 ? movsProduto[0] : null;
      const diasSemMovimento = ultimoMov ? differenceInDays(hoje, parseISO(ultimoMov.data)) : 999;

      return {
        id: produto.id,
        nome: produto.nome,
        estoqueAtual,
        estoqueMinimo,
        qtdVendida30d,
        qtdVendida60d,
        qtdVendida90d,
        valorVendido30d,
        taxaGiro30d: parseFloat(taxaGiro30d),
        taxaGiro90d: parseFloat(taxaGiro90d),
        mediaDiaria30d,
        coberturaDias,
        statusGiro,
        classificacao,
        diasSemMovimento,
        ativo: produto.ativo
      };
    }).filter(p => p.ativo);
  }, [produtos, vendas, movimentacoes]);

  // Ordenar por status de giro e valor vendido
  const produtosOrdenados = [...analiseGiro].sort((a, b) => {
    // Priorizar obsoletos e baixo giro
    const statusOrder = { obsoleto: 0, baixo: 1, medio: 2, alto: 3 };
    if (statusOrder[a.statusGiro] !== statusOrder[b.statusGiro]) {
      return statusOrder[a.statusGiro] - statusOrder[b.statusGiro];
    }
    return b.valorVendido30d - a.valorVendido30d;
  });

  const produtosObsoletos = analiseGiro.filter(p => p.statusGiro === "obsoleto");
  const produtosBaixoGiro = analiseGiro.filter(p => p.statusGiro === "baixo");
  const produtosAltoGiro = analiseGiro.filter(p => p.statusGiro === "alto");

  const getStatusColor = (status) => {
    const colors = {
      obsoleto: "bg-red-100 text-red-800",
      baixo: "bg-orange-100 text-orange-800",
      medio: "bg-blue-100 text-blue-800",
      alto: "bg-green-100 text-green-800"
    };
    return colors[status] || colors.medio;
  };

  if (isLoading) {
    return <div className="p-8">Carregando análise de giro...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Obsoletos</p>
                <p className="text-2xl font-bold text-red-900">{produtosObsoletos.length}</p>
                <p className="text-xs text-red-600 mt-1">Sem vendas em 60d</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Baixo Giro</p>
                <p className="text-2xl font-bold text-orange-900">{produtosBaixoGiro.length}</p>
                <p className="text-xs text-orange-600 mt-1">Giro &lt; 0.5</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Alto Giro</p>
                <p className="text-2xl font-bold text-green-900">{produtosAltoGiro.length}</p>
                <p className="text-xs text-green-600 mt-1">Giro &gt; 2.0</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Produtos</p>
                <p className="text-2xl font-bold text-blue-900">{analiseGiro.length}</p>
                <p className="text-xs text-blue-600 mt-1">Ativos</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Análise de Giro de Estoque
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Baseado em vendas e movimentações dos últimos 90 dias
          </p>
        </CardHeader>
        <CardContent>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Estoque</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Vendas 30d</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Taxa Giro</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Cobertura</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor 30d</th>
                </tr>
              </thead>
              <tbody>
                {produtosOrdenados.map(produto => (
                  <tr key={produto.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{produto.nome}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(produto.statusGiro)}>
                        {produto.classificacao}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">{produto.estoqueAtual}</td>
                    <td className="py-3 px-4 text-right">{produto.qtdVendida30d}</td>
                    <td className="py-3 px-4 text-right font-semibold">{produto.taxaGiro30d}x</td>
                    <td className="py-3 px-4 text-right">
                      {produto.coberturaDias >= 999 ? '∞' : `${produto.coberturaDias}d`}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">
                      R$ {produto.valorVendido30d.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {produtosOrdenados.map(produto => (
              <Card key={produto.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{produto.nome}</h4>
                    <Badge className={getStatusColor(produto.statusGiro)}>
                      {produto.classificacao}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Estoque</p>
                      <p className="font-medium">{produto.estoqueAtual}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vendas 30d</p>
                      <p className="font-medium">{produto.qtdVendida30d}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Taxa Giro</p>
                      <p className="font-medium">{produto.taxaGiro30d}x</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cobertura</p>
                      <p className="font-medium">
                        {produto.coberturaDias >= 999 ? '∞' : `${produto.coberturaDias}d`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">Valor Vendido (30d)</p>
                    <p className="font-semibold text-green-600">R$ {produto.valorVendido30d.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Entendendo os Indicadores</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Taxa de Giro:</strong> Quantas vezes o estoque foi renovado (vendas ÷ estoque)</p>
            <p>• <strong>Alto Giro (&gt;2):</strong> Produto vende rápido, considere aumentar estoque</p>
            <p>• <strong>Baixo Giro (&lt;0.5):</strong> Produto vende devagar, considere reduzir estoque</p>
            <p>• <strong>Obsoleto:</strong> Sem vendas em 60 dias, avaliar descontinuar ou promover</p>
            <p>• <strong>Cobertura:</strong> Quantos dias o estoque atual durará no ritmo atual de vendas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}