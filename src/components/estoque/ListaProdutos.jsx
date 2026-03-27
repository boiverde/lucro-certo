import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Package, Plus, Minus, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const unidadeLabels = {
  kg: "kg",
  sacos: "sacos",
  caixas: "caixas",
  unidades: "un",
  litros: "L",
  pacotes: "pct"
};

export default function ListaProdutos({ produtos, loading, onEditar, onAdicionarEntrada, onAdicionarSaida }) {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Seus Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const produtosAtivos = produtos.filter(p => p.ativo);

  if (produtosAtivos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
          <p className="text-sm text-gray-400 mt-1">Adicione produtos para controlar seu estoque!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop View - Table */}
      <Card className="shadow-lg hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos em Estoque ({produtosAtivos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Produto</th>
                  <th className="text-left p-3 font-medium">Estoque Atual</th>
                  <th className="text-left p-3 font-medium">Estoque Mínimo</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosAtivos.map((produto) => {
                  const estoqueAbaixoMinimo = produto.estoque_minimo > 0 && produto.estoque_atual <= produto.estoque_minimo;
                  
                  return (
                    <tr key={produto.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          {produto.observacoes && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{produto.observacoes}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={`text-2xl font-bold ${estoqueAbaixoMinimo ? 'text-orange-600' : 'text-blue-600'}`}>
                          {produto.estoque_atual} <span className="text-sm font-normal text-gray-500">{unidadeLabels[produto.unidade]}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">
                          {produto.estoque_minimo > 0 ? `${produto.estoque_minimo} ${unidadeLabels[produto.unidade]}` : '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        {estoqueAbaixoMinimo ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Baixo
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            OK
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAdicionarEntrada(produto)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Adicionar entrada"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAdicionarSaida(produto)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            title="Adicionar saída"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditar(produto)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" />
          <h3 className="font-bold text-lg">Produtos em Estoque ({produtosAtivos.length})</h3>
        </div>
        {produtosAtivos.map((produto) => {
          const estoqueAbaixoMinimo = produto.estoque_minimo > 0 && produto.estoque_atual <= produto.estoque_minimo;
          
          return (
            <Card key={produto.id} className={`shadow-md ${estoqueAbaixoMinimo ? 'border-2 border-orange-300' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{produto.nome}</h4>
                    {estoqueAbaixoMinimo && (
                      <Badge className="bg-orange-100 text-orange-800 mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Estoque Baixo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-xs text-gray-600 mb-1">Estoque Atual</p>
                  <p className={`text-3xl font-bold ${estoqueAbaixoMinimo ? 'text-orange-600' : 'text-blue-600'}`}>
                    {produto.estoque_atual} <span className="text-base text-gray-500">{unidadeLabels[produto.unidade]}</span>
                  </p>
                  {produto.estoque_minimo > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo: {produto.estoque_minimo} {unidadeLabels[produto.unidade]}
                    </p>
                  )}
                </div>

                {produto.observacoes && (
                  <p className="text-sm text-gray-500 mb-3 italic">{produto.observacoes}</p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdicionarEntrada(produto)}
                    className="text-green-600 border-green-200"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Entrada
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdicionarSaida(produto)}
                    className="text-red-600 border-red-200"
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Saída
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditar(produto)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}