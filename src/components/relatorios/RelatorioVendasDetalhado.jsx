import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function RelatorioVendasDetalhado({ vendas, pedidos, filteredData }) {
  const [receitas, setReceitas] = React.useState([]);
  const [configuracoes, setConfiguracoes] = React.useState(null);

  React.useEffect(() => {
    const carregarDados = async () => {
      try {
        const [receitasData, user] = await Promise.all([
          base44.entities.ReceitaProduto.list(),
          base44.auth.me()
        ]);
        setReceitas(receitasData);
        setConfiguracoes(user);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    carregarDados();
  }, []);
  const [abaAtiva, setAbaAtiva] = useState("produtos");

  // Calcular custo total de uma receita
  const calcularCustoReceita = (receita) => {
    if (!receita) return 0;
    
    const custoIngredientes = receita.custo_total || 0;
    const tempoPreparo = receita.tempo_preparo || 0;
    const tempoHoras = tempoPreparo / 60;
    const custoMaoObra = tempoHoras * (configuracoes?.custo_mao_obra_hora || 0);
    const custoFixo = configuracoes?.custo_fixo_por_unidade || 0;
    
    return custoIngredientes + custoMaoObra + custoFixo;
  };

  // Processar vendas por produto
  const vendasPorProduto = useMemo(() => {
    const produtos = {};

    // Processar vendas normais
    vendas.forEach(venda => {
      const key = venda.produto;
      if (!produtos[key]) {
        produtos[key] = {
          nome: venda.produto,
          quantidade: 0,
          valorTotal: 0,
          custoTotal: 0,
          vendas: [],
          tipo: 'venda'
        };
      }
      produtos[key].quantidade += venda.quantidade || 0;
      produtos[key].valorTotal += venda.valor_total || 0;
      produtos[key].vendas.push(venda);
    });

    // Processar pedidos
    pedidos.forEach(pedido => {
      if (pedido.itens) {
        pedido.itens.forEach(item => {
          const key = item.nome;
          if (!produtos[key]) {
            produtos[key] = {
              nome: item.nome,
              quantidade: 0,
              valorTotal: 0,
              custoTotal: 0,
              vendas: [],
              tipo: item.tipo || 'produto',
              id_referencia: item.id_referencia
            };
          }
          produtos[key].quantidade += item.quantidade || 0;
          produtos[key].valorTotal += item.valor_total || 0;
          produtos[key].vendas.push({ 
            ...pedido, 
            quantidade: item.quantidade,
            valor_total: item.valor_total 
          });
        });
      }
    });

    // Calcular custos e lucros
    return Object.values(produtos).map(p => {
      let custoUnitario = 0;
      
      if (p.tipo === 'receita' && p.id_referencia) {
        const receita = receitas.find(r => r.id === p.id_referencia);
        custoUnitario = calcularCustoReceita(receita);
      }
      
      const custoTotal = custoUnitario * p.quantidade;
      const lucroTotal = p.valorTotal - custoTotal;
      const margemLucro = p.valorTotal > 0 ? (lucroTotal / p.valorTotal * 100) : 0;
      
      return {
        ...p,
        custoTotal,
        lucroTotal,
        margemLucro,
        ticketMedio: p.vendas.length > 0 ? p.valorTotal / p.vendas.length : 0,
        numeroVendas: p.vendas.length
      };
    }).sort((a, b) => b.valorTotal - a.valorTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendas, pedidos, receitas, configuracoes]);

  // Processar vendas por cliente
  const vendasPorCliente = useMemo(() => {
    const clientes = {};

    // Processar vendas normais
    vendas.forEach(venda => {
      const key = venda.cliente || 'Sem cliente';
      if (!clientes[key]) {
        clientes[key] = {
          nome: key,
          quantidade: 0,
          valorTotal: 0,
          vendas: [],
          produtos: new Set()
        };
      }
      clientes[key].quantidade += venda.quantidade || 0;
      clientes[key].valorTotal += venda.valor_total || 0;
      clientes[key].vendas.push(venda);
      clientes[key].produtos.add(venda.produto);
    });

    // Processar pedidos
    pedidos.forEach(pedido => {
      const key = pedido.cliente || 'Sem cliente';
      if (!clientes[key]) {
        clientes[key] = {
          nome: key,
          quantidade: 0,
          valorTotal: 0,
          vendas: [],
          produtos: new Set()
        };
      }
      clientes[key].valorTotal += pedido.valor_final || pedido.valor_total || 0;
      clientes[key].vendas.push(pedido);
      if (pedido.itens) {
        pedido.itens.forEach(item => {
          clientes[key].produtos.add(item.nome);
        });
      }
    });

    return Object.values(clientes).map(c => ({
      ...c,
      ticketMedio: c.vendas.length > 0 ? c.valorTotal / c.vendas.length : 0,
      numeroVendas: c.vendas.length,
      produtosUnicos: c.produtos.size
    })).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [vendas, pedidos]);

  // Totalizadores
  const totalizadores = useMemo(() => {
    const totalVendas = vendasPorProduto.reduce((acc, p) => acc + p.valorTotal, 0);
    const totalCustos = vendasPorProduto.reduce((acc, p) => acc + (p.custoTotal || 0), 0);
    const totalLucro = totalVendas - totalCustos;
    const totalQuantidade = vendasPorProduto.reduce((acc, p) => acc + p.quantidade, 0);
    const totalClientes = vendasPorCliente.length;
    const ticketMedioGeral = vendasPorCliente.length > 0 
      ? totalVendas / vendasPorCliente.reduce((acc, c) => acc + c.numeroVendas, 0)
      : 0;
    const margemGeralLucro = totalVendas > 0 ? (totalLucro / totalVendas * 100) : 0;

    return {
      totalVendas,
      totalCustos,
      totalLucro,
      totalQuantidade,
      totalClientes,
      ticketMedioGeral,
      margemGeralLucro
    };
  }, [vendasPorProduto, vendasPorCliente]);

  const exportarCSV = () => {
    let csv = '';
    
    if (abaAtiva === 'produtos') {
      csv = 'Produto,Quantidade Vendida,Valor Total,Custo Total,Lucro,Margem %,Nº Vendas,Ticket Médio\n';
      vendasPorProduto.forEach(p => {
        csv += `"${p.nome}",${p.quantidade},${p.valorTotal.toFixed(2)},${(p.custoTotal || 0).toFixed(2)},${(p.lucroTotal || 0).toFixed(2)},${(p.margemLucro || 0).toFixed(1)},${p.numeroVendas},${p.ticketMedio.toFixed(2)}\n`;
      });
      csv += `\nTOTAL,${totalizadores.totalQuantidade},${totalizadores.totalVendas.toFixed(2)},${totalizadores.totalCustos.toFixed(2)},${totalizadores.totalLucro.toFixed(2)},${totalizadores.margemGeralLucro.toFixed(1)},-,${totalizadores.ticketMedioGeral.toFixed(2)}\n`;
    } else {
      csv = 'Cliente,Valor Total,Nº Vendas,Ticket Médio,Produtos Únicos\n';
      vendasPorCliente.forEach(c => {
        csv += `"${c.nome}",${c.valorTotal.toFixed(2)},${c.numeroVendas},${c.ticketMedio.toFixed(2)},${c.produtosUnicos}\n`;
      });
      csv += `\nTOTAL,${totalizadores.totalVendas.toFixed(2)},${vendasPorCliente.reduce((acc, c) => acc + c.numeroVendas, 0)},-,-\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${abaAtiva}_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalizadores.totalVendas.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {vendasPorProduto.reduce((acc, p) => acc + p.numeroVendas, 0)} vendas
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quantidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {totalizadores.totalQuantidade}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unidades vendidas</p>
              </div>
              <Package className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {totalizadores.ticketMedioGeral.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Por venda</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lucro Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${totalizadores.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(totalizadores.totalLucro).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Margem: {totalizadores.margemGeralLucro.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {totalizadores.totalClientes}
                </p>
                <p className="text-xs text-gray-500 mt-1">Clientes únicos</p>
              </div>
              <Users className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhamento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhamento de Vendas</CardTitle>
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="produtos">Por Produto</TabsTrigger>
              <TabsTrigger value="clientes">Por Cliente</TabsTrigger>
            </TabsList>

            <TabsContent value="produtos" className="space-y-4">
              {vendasPorProduto.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma venda encontrada no período
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Qtd</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Receita</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Custo</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Lucro</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Margem</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Vendas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendasPorProduto.map((produto, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{produto.nome}</span>
                                {produto.tipo === 'receita' && (
                                  <Badge variant="outline" className="text-xs">Receita</Badge>
                                )}
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">{produto.quantidade}</td>
                            <td className="text-right py-3 px-4 font-semibold text-green-600">
                              R$ {produto.valorTotal.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 text-orange-600">
                              R$ {(produto.custoTotal || 0).toFixed(2)}
                            </td>
                            <td className={`text-right py-3 px-4 font-semibold ${(produto.lucroTotal || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              R$ {Math.abs(produto.lucroTotal || 0).toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 text-purple-600">
                              {(produto.margemLucro || 0).toFixed(1)}%
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">{produto.numeroVendas}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td className="py-3 px-4">TOTAL</td>
                          <td className="text-right py-3 px-4">{totalizadores.totalQuantidade}</td>
                          <td className="text-right py-3 px-4 text-green-600">
                            R$ {totalizadores.totalVendas.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-orange-600">
                            R$ {totalizadores.totalCustos.toFixed(2)}
                          </td>
                          <td className={`text-right py-3 px-4 ${totalizadores.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {Math.abs(totalizadores.totalLucro).toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-purple-600">
                            {totalizadores.margemGeralLucro.toFixed(1)}%
                          </td>
                          <td className="text-right py-3 px-4">
                            {vendasPorProduto.reduce((acc, p) => acc + p.numeroVendas, 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {vendasPorProduto.map((produto, idx) => (
                      <Card key={idx} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                              {produto.tipo === 'receita' && (
                                <Badge variant="outline" className="text-xs mt-1">Receita</Badge>
                              )}
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              R$ {produto.valorTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Quantidade</p>
                              <p className="font-semibold">{produto.quantidade}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Vendas</p>
                              <p className="font-semibold">{produto.numeroVendas}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Custo Total</p>
                              <p className="font-semibold text-orange-600">R$ {(produto.custoTotal || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Lucro</p>
                              <p className={`font-semibold ${(produto.lucroTotal || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {Math.abs(produto.lucroTotal || 0).toFixed(2)} ({(produto.margemLucro || 0).toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="clientes" className="space-y-4">
              {vendasPorCliente.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma venda encontrada no período
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Total</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Nº Vendas</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Ticket Médio</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Produtos Únicos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendasPorCliente.map((cliente, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{cliente.nome}</td>
                            <td className="text-right py-3 px-4 font-semibold text-green-600">
                              R$ {cliente.valorTotal.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">{cliente.numeroVendas}</td>
                            <td className="text-right py-3 px-4 text-blue-600">
                              R$ {cliente.ticketMedio.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">{cliente.produtosUnicos}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td className="py-3 px-4">TOTAL</td>
                          <td className="text-right py-3 px-4 text-green-600">
                            R$ {totalizadores.totalVendas.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {vendasPorCliente.reduce((acc, c) => acc + c.numeroVendas, 0)}
                          </td>
                          <td className="text-right py-3 px-4 text-blue-600">
                            R$ {totalizadores.ticketMedioGeral.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {vendasPorCliente.map((cliente, idx) => (
                      <Card key={idx} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-gray-900 flex-1">{cliente.nome}</h3>
                            <span className="text-lg font-bold text-green-600">
                              R$ {cliente.valorTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Vendas</p>
                              <p className="font-semibold">{cliente.numeroVendas}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Ticket Médio</p>
                              <p className="font-semibold text-blue-600">R$ {cliente.ticketMedio.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Produtos</p>
                              <p className="font-semibold">{cliente.produtosUnicos}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}