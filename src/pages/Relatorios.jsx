import React, { useState, useEffect } from "react";
import { handleApiError } from '@/api/errorHandler';
import { toast } from 'sonner';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Download, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Store,
  Package,
  Users
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, addMonths, startOfYear, endOfYear, startOfQuarter, endOfQuarter, subQuarters, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";

import RelatorioLucros from "../components/relatorios/RelatorioLucros";
import RelatorioGastos from "../components/relatorios/RelatorioGastos";
import RelatorioProdutos from "../components/relatorios/RelatorioProdutos";
import RelatorioVendasCliente from "../components/relatorios/RelatorioVendasCliente";
import RelatorioVendasDetalhado from "../components/relatorios/RelatorioVendasDetalhado";

const STORAGE_KEY = 'relatorio_preferido';

export default function RelatoriosPage() {
  const [compras, setCompras] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [gastosRevenda, setGastosRevenda] = useState([]);
  const [vendasRevenda, setVendasRevenda] = useState([]);
  const [user, setUser] = useState(null);
  const [periodo, setPeriodo] = useState("mes_atual");
  const [dataPersonalizada, setDataPersonalizada] = useState(null);
  const [dataPersonalizadaInicio, setDataPersonalizadaInicio] = useState(null);
  const [dataPersonalizadaFim, setDataPersonalizadaFim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipoRelatorio, setTipoRelatorio] = useState(() => {
    // Carregar preferência do localStorage
    return localStorage.getItem(STORAGE_KEY) || 'controle';
  });
  const [categoriaGastoFiltro, setCategoriaGastoFiltro] = useState("todas");
  const [tipoTransacaoFiltro, setTipoTransacaoFiltro] = useState("todas");

  useEffect(() => {
    carregarDados();
  }, []);

  // Salvar preferência quando mudar de tab
  const handleTabChange = (value) => {
    setTipoRelatorio(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me(); 
      setUser(currentUser);

      const [comprasData, vendasData, pedidosData, gastosData, gastosRevendaData, vendasRevendaData] = await Promise.all([
        base44.entities.Compra.filter({ created_by: currentUser.email }, '-data_compra'),
        base44.entities.Venda.filter({ created_by: currentUser.email }, '-data_venda'),
        base44.entities.Pedido.filter({ created_by: currentUser.email }, '-data_pedido'),
        base44.entities.GastoOperacional.filter({ created_by: currentUser.email }, '-data'),
        base44.entities.GastoRevenda.filter({ created_by: currentUser.email }, '-data'),
        base44.entities.VendaRevenda.filter({ created_by: currentUser.email }, '-created_date')
      ]);
      
      setCompras(comprasData);
      setVendas(vendasData);
      setPedidos(pedidosData);
      setGastos(gastosData);
      setGastosRevenda(gastosRevendaData);
      setVendasRevenda(vendasRevendaData);
    } catch (error) {
      handleApiError(error, 'carregar dados')
      handleApiError(error, 'carregar dados')
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const filtrarPorPeriodo = (dados, campoData) => {
    const hoje = new Date();
    let dataInicio, dataFim;

    switch (periodo) {
      case "hoje":
        dataInicio = startOfDay(hoje);
        dataFim = endOfDay(hoje);
        break;
      case "esta_semana":
        dataInicio = startOfWeek(hoje, { locale: ptBR });
        dataFim = endOfWeek(hoje, { locale: ptBR });
        break;
      case "semana_anterior":
        const semanaAnteriorDate = subWeeks(hoje, 1);
        dataInicio = startOfWeek(semanaAnteriorDate, { locale: ptBR });
        dataFim = endOfWeek(semanaAnteriorDate, { locale: ptBR });
        break;
      case "mes_atual":
        dataInicio = startOfMonth(hoje);
        dataFim = endOfMonth(hoje);
        break;
      case "mes_anterior":
        const mesAnterior = subMonths(hoje, 1);
        dataInicio = startOfMonth(mesAnterior);
        dataFim = endOfMonth(mesAnterior);
        break;
      case "ultimos_3_meses":
        dataInicio = startOfMonth(subMonths(hoje, 2));
        dataFim = endOfMonth(hoje);
        break;
      case "ultimos_6_meses":
        dataInicio = startOfMonth(subMonths(hoje, 5));
        dataFim = endOfMonth(hoje);
        break;
      case "trimestre_atual":
        dataInicio = startOfQuarter(hoje);
        dataFim = endOfQuarter(hoje);
        break;
      case "trimestre_anterior":
        const trimestreAnterior = subQuarters(hoje, 1);
        dataInicio = startOfQuarter(trimestreAnterior);
        dataFim = endOfQuarter(trimestreAnterior);
        break;
      case "ano_atual":
        dataInicio = startOfYear(hoje);
        dataFim = endOfYear(hoje);
        break;
      case "ano_anterior":
        const anoAnterior = subYears(hoje, 1);
        dataInicio = startOfYear(anoAnterior);
        dataFim = endOfYear(anoAnterior);
        break;
      case "personalizado":
        if (!dataPersonalizada) return [];
        dataInicio = startOfDay(dataPersonalizada);
        dataFim = endOfDay(dataPersonalizada);
        break;
      case "periodo_customizado":
        if (!dataPersonalizadaInicio || !dataPersonalizadaFim) return [];
        dataInicio = startOfDay(dataPersonalizadaInicio);
        dataFim = endOfDay(dataPersonalizadaFim);
        break;
      case "todos":
      default:
        return dados;
    }

    return dados.filter(item => {
      const data = new Date(item[campoData]);
      return data >= dataInicio && data <= dataFim;
    });
  };

  let comprasFiltradas = filtrarPorPeriodo(compras, 'data_compra');
  let vendasFiltradas = filtrarPorPeriodo(vendas, 'data_venda');
  let pedidosFiltrados = filtrarPorPeriodo(pedidos, 'data_pedido');
  let gastosFiltrados = filtrarPorPeriodo(gastos, 'data');
  let gastosRevendaFiltrados = filtrarPorPeriodo(gastosRevenda, 'data');
  let vendasRevendaFiltradas = filtrarPorPeriodo(vendasRevenda, 'created_date');

  // Filtro por tipo de transação
  if (tipoTransacaoFiltro !== "todas") {
    if (tipoTransacaoFiltro === "vendas") {
      comprasFiltradas = [];
      gastosFiltrados = [];
    } else if (tipoTransacaoFiltro === "compras") {
      vendasFiltradas = [];
      gastosFiltrados = [];
    } else if (tipoTransacaoFiltro === "gastos") {
      comprasFiltradas = [];
      vendasFiltradas = [];
    }
  }

  // Filtro por categoria de gasto
  if (categoriaGastoFiltro !== "todas") {
    gastosFiltrados = gastosFiltrados.filter(g => g.tipo === categoriaGastoFiltro);
  }

  let comissoesRevendaPeriodo = 0;
  vendasRevenda.forEach(venda => {
    if (venda.status === 'cancelada') return; 
    if (!venda.data_primeira_parcela || !venda.numero_parcelas || !venda.valor_comissao_total) return;

    const dataPrimeiraParcela = new Date(venda.data_primeira_parcela);
    const comissaoPorParcela = typeof venda.valor_comissao_total === 'number' && typeof venda.numero_parcelas === 'number' && venda.numero_parcelas > 0
      ? venda.valor_comissao_total / venda.numero_parcelas
      : 0;

    for (let i = 0; i < venda.parcelas_pagas; i++) {
      const dataParcelaAtual = addMonths(dataPrimeiraParcela, i);
      
      let dataInicio, dataFim;
      const hoje = new Date();
      
      switch (periodo) {
        case "hoje":
          dataInicio = startOfDay(hoje);
          dataFim = endOfDay(hoje);
          break;
        case "esta_semana":
          dataInicio = startOfWeek(hoje, { locale: ptBR });
          dataFim = endOfWeek(hoje, { locale: ptBR });
          break;
        case "semana_anterior":
          const semanaAnteriorDate = subWeeks(hoje, 1);
          dataInicio = startOfWeek(semanaAnteriorDate, { locale: ptBR });
          dataFim = endOfWeek(semanaAnteriorDate, { locale: ptBR });
          break;
        case "mes_atual":
          dataInicio = startOfMonth(hoje);
          dataFim = endOfMonth(hoje);
          break;
        case "mes_anterior":
          const mesAnterior = subMonths(hoje, 1);
          dataInicio = startOfMonth(mesAnterior);
          dataFim = endOfMonth(mesAnterior);
          break;
        case "ultimos_3_meses":
          dataInicio = startOfMonth(subMonths(hoje, 2));
          dataFim = endOfMonth(hoje);
          break;
        case "ultimos_6_meses":
          dataInicio = startOfMonth(subMonths(hoje, 5));
          dataFim = endOfMonth(hoje);
          break;
        case "trimestre_atual":
          dataInicio = startOfQuarter(hoje);
          dataFim = endOfQuarter(hoje);
          break;
        case "trimestre_anterior":
          const trimestreAnterior2 = subQuarters(hoje, 1);
          dataInicio = startOfQuarter(trimestreAnterior2);
          dataFim = endOfQuarter(trimestreAnterior2);
          break;
        case "ano_atual":
          dataInicio = startOfYear(hoje);
          dataFim = endOfYear(hoje);
          break;
        case "ano_anterior":
          const anoAnterior2 = subYears(hoje, 1);
          dataInicio = startOfYear(anoAnterior2);
          dataFim = endOfYear(anoAnterior2);
          break;
        case "personalizado":
          if (!dataPersonalizada) return;
          dataInicio = startOfDay(dataPersonalizada);
          dataFim = endOfDay(dataPersonalizada);
          break;
        case "periodo_customizado":
          if (!dataPersonalizadaInicio || !dataPersonalizadaFim) return;
          dataInicio = startOfDay(dataPersonalizadaInicio);
          dataFim = endOfDay(dataPersonalizadaFim);
          break;
        case "todos":
        default:
          comissoesRevendaPeriodo += comissaoPorParcela;
          continue;
      }

      if (dataParcelaAtual >= dataInicio && dataParcelaAtual <= dataFim) {
        comissoesRevendaPeriodo += comissaoPorParcela;
      }
    }
  });

  // Métricas Controle
  const totalCompras = comprasFiltradas.reduce((sum, c) => sum + c.valor_total, 0);
  const totalVendas = vendasFiltradas.reduce((sum, v) => sum + v.valor_total, 0);
  const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
  const lucroControle = totalVendas - totalCompras - totalGastos;
  const margemControle = totalVendas > 0 ? ((lucroControle / totalVendas) * 100) : 0;

  // Métricas Revendas
  const totalVendasRevenda = vendasRevendaFiltradas.reduce((sum, v) => sum + v.valor_total, 0);
  const totalGastosRevenda = gastosRevendaFiltrados.reduce((sum, g) => sum + g.valor, 0);
  const lucroRevendas = comissoesRevendaPeriodo - totalGastosRevenda;
  const margemRevendas = comissoesRevendaPeriodo > 0 ? ((lucroRevendas / comissoesRevendaPeriodo) * 100) : 0;

  const exportarCSV = () => {
    let csvData = [['Tipo', 'Produto/Descrição', 'Valor', 'Data', 'Categoria', 'Observações']];

    if (tipoRelatorio === 'controle') {
      csvData = [
        ...csvData,
        ...comprasFiltradas.map(c => ['Compra', c.produto, c.valor_total, format(new Date(c.data_compra), 'dd/MM/yyyy'), '-', c.observacoes || '']),
        ...vendasFiltradas.map(v => ['Venda', v.produto, v.valor_total, format(new Date(v.data_venda), 'dd/MM/yyyy'), '-', v.observacoes || '']),
        ...gastosFiltrados.map(g => ['Gasto', g.descricao, g.valor, format(new Date(g.data), 'dd/MM/yyyy'), g.tipo || '-', g.observacoes || ''])
      ];
    } else {
      csvData = [
        ...csvData,
        ...vendasRevendaFiltradas.map(v => ['Venda Revenda', `${v.cliente} - ${v.empresa_nome}`, v.valor_total, format(new Date(v.created_date), 'dd/MM/yyyy'), '-', v.observacoes || '']),
        ...gastosRevendaFiltrados.map(g => ['Gasto Revenda', g.descricao, g.valor, format(new Date(g.data), 'dd/MM/yyyy'), '-', g.observacoes || ''])
      ];
      if (comissoesRevendaPeriodo > 0) {
        csvData.push(['Comissão Recebida', 'Total de comissões de revenda pagas no período', comissoesRevendaPeriodo, format(new Date(), 'dd/MM/yyyy'), '-', '']);
      }
    }

    const csvContent = csvData.map(row => row.map(cell => {
      const escapedCell = String(cell).replace(/"/g, '""');
      return `"${escapedCell}"`;
    }).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${tipoRelatorio}_${periodo}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = async () => {
    // Import dinamicamente para não aumentar bundle inicial
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título
    doc.setFontSize(18);
    doc.text(`Relatório - ${tipoRelatorio.toUpperCase()}`, pageWidth / 2, 15, { align: 'center' });
    
    // Período
    doc.setFontSize(10);
    let periodoTexto = periodo.replace('_', ' ').toUpperCase();
    if (periodo === 'personalizado' && dataPersonalizada) {
      periodoTexto = format(dataPersonalizada, 'dd/MM/yyyy');
    } else if (periodo === 'periodo_customizado' && dataPersonalizadaInicio && dataPersonalizadaFim) {
      periodoTexto = `${format(dataPersonalizadaInicio, 'dd/MM/yyyy')} - ${format(dataPersonalizadaFim, 'dd/MM/yyyy')}`;
    }
    doc.text(`Período: ${periodoTexto}`, pageWidth / 2, 22, { align: 'center' });
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Cards de resumo
    let yPos = 35;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Resumo Financeiro', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    if (tipoRelatorio === 'controle') {
      doc.text(`Vendas: R$ ${totalVendas.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Compras: R$ ${totalCompras.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Gastos: R$ ${totalGastos.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'bold');
      doc.text(`Lucro: R$ ${lucroControle.toFixed(2)} (${margemControle.toFixed(1)}%)`, 14, yPos);
      yPos += 10;
    } else if (tipoRelatorio === 'revendas') {
      doc.text(`Vendas: R$ ${totalVendasRevenda.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Comissões: R$ ${comissoesRevendaPeriodo.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Gastos: R$ ${totalGastosRevenda.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'bold');
      doc.text(`Lucro: R$ ${lucroRevendas.toFixed(2)} (${margemRevendas.toFixed(1)}%)`, 14, yPos);
      yPos += 10;
    }
    
    // Tabela de transações
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Transações Detalhadas', 14, yPos);
    yPos += 5;
    
    const tableData = [];
    
    if (tipoRelatorio === 'controle') {
      comprasFiltradas.forEach(c => {
        tableData.push(['Compra', c.produto, `R$ ${c.valor_total.toFixed(2)}`, format(new Date(c.data_compra), 'dd/MM/yyyy')]);
      });
      vendasFiltradas.forEach(v => {
        tableData.push(['Venda', v.produto, `R$ ${v.valor_total.toFixed(2)}`, format(new Date(v.data_venda), 'dd/MM/yyyy')]);
      });
      gastosFiltrados.forEach(g => {
        tableData.push(['Gasto', g.descricao, `R$ ${g.valor.toFixed(2)}`, format(new Date(g.data), 'dd/MM/yyyy')]);
      });
    } else if (tipoRelatorio === 'revendas') {
      vendasRevendaFiltradas.forEach(v => {
        tableData.push(['Venda', `${v.cliente} - ${v.empresa_nome}`, `R$ ${v.valor_total.toFixed(2)}`, format(new Date(v.created_date), 'dd/MM/yyyy')]);
      });
      gastosRevendaFiltrados.forEach(g => {
        tableData.push(['Gasto', g.descricao, `R$ ${g.valor.toFixed(2)}`, format(new Date(g.data), 'dd/MM/yyyy')]);
      });
    }
    
    doc.autoTable({
      startY: yPos,
      head: [['Tipo', 'Descrição', 'Valor', 'Data']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 9 },
      margin: { top: 10 }
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`relatorio_${tipoRelatorio}_${periodo}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-500 mt-1">Análise detalhada do seu negócio</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select value={periodo} onValueChange={(val) => {
              setPeriodo(val);
              if (val !== 'personalizado') setDataPersonalizada(null);
              if (val !== 'periodo_customizado') {
                setDataPersonalizadaInicio(null);
                setDataPersonalizadaFim(null);
              }
            }}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="esta_semana">Esta Semana</SelectItem>
                <SelectItem value="semana_anterior">Semana Anterior</SelectItem>
                <SelectItem value="mes_atual">Mês Atual</SelectItem>
                <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                <SelectItem value="ultimos_3_meses">Últimos 3 Meses</SelectItem>
                <SelectItem value="ultimos_6_meses">Últimos 6 Meses</SelectItem>
                <SelectItem value="trimestre_atual">Trimestre Atual</SelectItem>
                <SelectItem value="trimestre_anterior">Trimestre Anterior</SelectItem>
                <SelectItem value="ano_atual">Ano Atual</SelectItem>
                <SelectItem value="ano_anterior">Ano Anterior</SelectItem>
                <SelectItem value="todos">Todo o Período</SelectItem>
                <SelectItem value="personalizado">Dia Específico</SelectItem>
                <SelectItem value="periodo_customizado">Período Customizado</SelectItem>
              </SelectContent>
            </Select>

            {periodo === 'personalizado' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataPersonalizada ? format(dataPersonalizada, 'dd/MM/yyyy') : 'Escolha a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarUI
                    mode="single"
                    selected={dataPersonalizada}
                    onSelect={setDataPersonalizada}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}

            {periodo === 'periodo_customizado' && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataPersonalizadaInicio ? format(dataPersonalizadaInicio, 'dd/MM/yyyy') : 'Data Início'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarUI
                      mode="single"
                      selected={dataPersonalizadaInicio}
                      onSelect={setDataPersonalizadaInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataPersonalizadaFim ? format(dataPersonalizadaFim, 'dd/MM/yyyy') : 'Data Fim'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarUI
                      mode="single"
                      selected={dataPersonalizadaFim}
                      onSelect={setDataPersonalizadaFim}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}

            <Select value={tipoTransacaoFiltro} onValueChange={setTipoTransacaoFiltro}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Transações</SelectItem>
                <SelectItem value="vendas">Apenas Vendas</SelectItem>
                <SelectItem value="compras">Apenas Compras</SelectItem>
                <SelectItem value="gastos">Apenas Gastos</SelectItem>
              </SelectContent>
            </Select>

            {tipoRelatorio === 'controle' && (
              <Select value={categoriaGastoFiltro} onValueChange={setCategoriaGastoFiltro}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                  <SelectItem value="diaria_funcionario">Diárias</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="salarios">Salários</SelectItem>
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" onClick={exportarCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            
            <Button variant="outline" onClick={exportarPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <Tabs value={tipoRelatorio} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="controle">
              <Package className="w-4 h-4 mr-2" />
              Controle
            </TabsTrigger>
            <TabsTrigger value="vendas">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="revendas">
              <Store className="w-4 h-4 mr-2" />
              Revendas
            </TabsTrigger>
            <TabsTrigger value="clientes">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
          </TabsList>

          {/* RELATÓRIO CONTROLE */}
          <TabsContent value="controle" className="space-y-6">
            {/* Cards de Resumo - Controle */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ {totalVendas.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {vendasFiltradas.length} vendas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compras</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">R$ {totalCompras.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {comprasFiltradas.length} compras
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">R$ {totalGastos.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {gastosFiltrados.length} gastos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${lucroControle >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {Math.abs(lucroControle).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Margem: {margemControle.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Relatórios Detalhados - Controle */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <RelatorioLucros 
                compras={comprasFiltradas}
                vendas={vendasFiltradas}
                gastos={gastosFiltrados}
                vendasRevenda={[]}
              />
              <RelatorioGastos gastos={gastosFiltrados} />
            </div>

            <RelatorioProdutos 
              compras={comprasFiltradas}
              vendas={vendasFiltradas}
            />
          </TabsContent>

          {/* RELATÓRIO VENDAS DETALHADO */}
          <TabsContent value="vendas" className="space-y-6">
            <RelatorioVendasDetalhado 
              vendas={vendasFiltradas}
              pedidos={pedidosFiltrados}
            />
          </TabsContent>

          {/* RELATÓRIO REVENDAS */}
          <TabsContent value="revendas" className="space-y-6">
            {/* Cards de Resumo - Revendas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Revendas</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">R$ {totalVendasRevenda.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {vendasRevendaFiltradas.length} vendas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comissões Recebidas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ {comissoesRevendaPeriodo.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Parcelas pagas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gastos Revenda</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">R$ {totalGastosRevenda.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {gastosRevendaFiltrados.length} gastos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${lucroRevendas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {Math.abs(lucroRevendas).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Margem: {margemRevendas.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Relatórios Detalhados - Revendas */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Comissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Total em Vendas</span>
                      <span className="text-lg font-bold text-purple-600">R$ {totalVendasRevenda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Comissões Recebidas</span>
                      <span className="text-lg font-bold text-green-600">R$ {comissoesRevendaPeriodo.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Gastos Operacionais</span>
                      <span className="text-lg font-bold text-orange-600">R$ {totalGastosRevenda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <span className="text-sm font-medium">Lucro Líquido</span>
                      <span className={`text-lg font-bold ${lucroRevendas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {Math.abs(lucroRevendas).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <RelatorioGastos gastos={gastosRevendaFiltrados} titulo="Gastos de Revenda" />
            </div>
          </TabsContent>

          {/* RELATÓRIO CLIENTES */}
          <TabsContent value="clientes" className="space-y-6">
            <RelatorioVendasCliente vendas={vendasFiltradas} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}