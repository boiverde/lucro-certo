import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ShoppingBag, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RelatorioVendasCliente({ vendas }) {
  const [clienteSelecionado, setClienteSelecionado] = useState('todos');

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const dataComHora = dataString.includes('T') ? dataString : `${dataString}T00:00:00`;
    return format(new Date(dataComHora), "dd/MM/yyyy", { locale: ptBR });
  };

  // Agrupar vendas por cliente
  const vendasPorCliente = {};
  
  vendas.forEach(venda => {
    const nomeCliente = venda.cliente || 'Sem cliente';
    
    if (!vendasPorCliente[nomeCliente]) {
      vendasPorCliente[nomeCliente] = {
        cliente: nomeCliente,
        vendas: [],
        totalGasto: 0,
        quantidadeCompras: 0,
        ultimaCompra: null
      };
    }

    vendasPorCliente[nomeCliente].vendas.push(venda);
    vendasPorCliente[nomeCliente].totalGasto += venda.valor_total || 0;
    vendasPorCliente[nomeCliente].quantidadeCompras += 1;

    // Atualizar última compra
    const dataVenda = new Date(venda.data_venda);
    if (!vendasPorCliente[nomeCliente].ultimaCompra || dataVenda > new Date(vendasPorCliente[nomeCliente].ultimaCompra)) {
      vendasPorCliente[nomeCliente].ultimaCompra = venda.data_venda;
    }
  });

  // Ordenar clientes por total gasto
  const clientesOrdenados = Object.values(vendasPorCliente).sort((a, b) => b.totalGasto - a.totalGasto);

  // Filtrar vendas do cliente selecionado
  const vendasFiltradas = clienteSelecionado === 'todos' 
    ? [] 
    : vendasPorCliente[clienteSelecionado]?.vendas.sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda)) || [];

  const dadosCliente = clienteSelecionado !== 'todos' ? vendasPorCliente[clienteSelecionado] : null;

  return (
    <div className="space-y-6">
      {/* Seletor de Cliente e Resumo */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Vendas por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selecione um Cliente</label>
            <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Clientes - Resumo</SelectItem>
                {clientesOrdenados.map((cliente) => (
                  <SelectItem key={cliente.cliente} value={cliente.cliente}>
                    {cliente.cliente} - R$ {cliente.totalGasto.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dadosCliente && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Gasto</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  R$ {dadosCliente.totalGasto.toFixed(2)}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm font-medium">Compras Realizadas</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {dadosCliente.quantidadeCompras}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Última Compra</span>
                </div>
                <p className="text-lg font-bold text-purple-700">
                  {formatarData(dadosCliente.ultimaCompra)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Resumo de Todos os Clientes */}
      {clienteSelecionado === 'todos' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Resumo de Todos os Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Qtd Compras</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead>Última Compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesOrdenados.map((cliente, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => setClienteSelecionado(cliente.cliente)}>
                      <TableCell className="font-medium">{cliente.cliente}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cliente.quantidadeCompras}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-bold">
                        R$ {cliente.totalGasto.toFixed(2)}
                      </TableCell>
                      <TableCell>{formatarData(cliente.ultimaCompra)}</TableCell>
                    </TableRow>
                  ))}
                  {clientesOrdenados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Nenhuma venda com cliente registrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Compras do Cliente Selecionado */}
      {clienteSelecionado !== 'todos' && vendasFiltradas.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Histórico de Compras - {clienteSelecionado}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.map((venda) => (
                    <TableRow key={venda.id} className="hover:bg-gray-50">
                      <TableCell>{formatarData(venda.data_venda)}</TableCell>
                      <TableCell className="font-medium">{venda.produto}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {venda.quantidade || 0} {venda.unidade_venda || 'un'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-bold">
                        R$ {venda.valor_total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={venda.pago ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {venda.pago ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}