import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

export default function RelatorioProdutos({ compras, vendas }) {
  // Calcular relatório por produto
  const produtos = {};

  // Função para normalizar nome do produto
  const normalizarProduto = (nome) => {
    return nome.trim().toLowerCase();
  };

  // Processar compras
  compras.forEach(compra => {
    const produtoNormalizado = normalizarProduto(compra.produto);
    
    if (!produtos[produtoNormalizado]) {
      produtos[produtoNormalizado] = {
        produto: compra.produto, // Usa o nome original da primeira ocorrência
        totalComprado: 0,
        valorTotalCompra: 0,
        totalVendido: 0,
        valorTotalVenda: 0,
        lucro: 0,
        margemLucro: 0
      };
    }
    
    produtos[produtoNormalizado].totalComprado += compra.quantidade || 0;
    produtos[produtoNormalizado].valorTotalCompra += compra.valor_total || 0;
  });

  // Processar vendas
  vendas.forEach(venda => {
    const produtoNormalizado = normalizarProduto(venda.produto);
    
    if (!produtos[produtoNormalizado]) {
      produtos[produtoNormalizado] = {
        produto: venda.produto, // Usa o nome original da primeira ocorrência
        totalComprado: 0,
        valorTotalCompra: 0,
        totalVendido: 0,
        valorTotalVenda: 0,
        lucro: 0,
        margemLucro: 0
      };
    }

    produtos[produtoNormalizado].totalVendido += venda.quantidade || 0;
    produtos[produtoNormalizado].valorTotalVenda += venda.valor_total || 0;
  });

  // Calcular lucro e margem
  Object.values(produtos).forEach(produto => {
    produto.lucro = produto.valorTotalVenda - produto.valorTotalCompra;
    produto.margemLucro = produto.valorTotalVenda > 0 
      ? (produto.lucro / produto.valorTotalVenda) * 100 
      : 0;
  });

  const dadosTabela = Object.values(produtos).sort((a, b) => b.lucro - a.lucro);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Relatório por Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd Comprada</TableHead>
                <TableHead>Valor Compra</TableHead>
                <TableHead>Qtd Vendida</TableHead>
                <TableHead>Valor Venda</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead>Margem (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosTabela.map((produto, idx) => (
                <TableRow key={`${produto.produto}-${idx}`} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{produto.produto}</TableCell>
                  <TableCell>
                    {produto.totalComprado.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    R$ {produto.valorTotalCompra.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {produto.totalVendido.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    R$ {produto.valorTotalVenda.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {produto.lucro >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-bold ${produto.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {Math.abs(produto.lucro).toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={produto.margemLucro >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {produto.margemLucro.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {dadosTabela.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum produto encontrado no período selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}