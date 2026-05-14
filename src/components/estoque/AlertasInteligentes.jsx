import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle, X, Eye, ShoppingCart } from "lucide-react";
import { format, parseISO, differenceInDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AlertasInteligentes() {
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);
  const [gerandoAlertas, setGerandoAlertas] = useState(false);
  const queryClient = useQueryClient();

  const { data: alertas = [], isLoading } = useQuery({
    queryKey: ['alertas-estoque'],
    queryFn: () => httpClient('/alertas-estoque'),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => httpClient('/produtos'),
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => httpClient('/ingredientes'),
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      const result = await httpClient('/vendas');
      return Array.isArray(result) ? result.slice(0, 100) : (result?.data || []).slice(0, 100);
    },
  });

  const { data: lotes = [] } = useQuery({
    queryKey: ['lotes'],
    queryFn: () => httpClient('/lotes'),
  });

  const updateAlertaMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/alertas-estoque/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-estoque'] });
    },
  });

  const createAlertaMutation = useMutation({
    mutationFn: (data) => httpClient('/alertas-estoque', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-estoque'] });
    },
  });

  // Gerar alertas automaticamente
  const gerarAlertas = async () => {
    setGerandoAlertas(true);
    const hoje = new Date();
    const novosAlertas = [];

    // 1. Alertas de estoque mínimo para produtos
    produtos.forEach(produto => {
      if (produto.ativo && produto.estoque_atual <= produto.estoque_minimo && produto.estoque_minimo > 0) {
        const vendasProduto = vendas.filter(v =>
          v.produto === produto.nome &&
          differenceInDays(hoje, parseISO(v.data_venda)) <= 30
        );
        const qtdVendida = vendasProduto.reduce((sum, v) => sum + (v.quantidade || 0), 0);
        const mediaDiaria = qtdVendida / 30;
        const sugestao = Math.ceil(mediaDiaria * 30);

        const prioridade = produto.estoque_atual === 0 ? 'critica' :
                          produto.estoque_atual < produto.estoque_minimo * 0.5 ? 'alta' : 'media';

        novosAlertas.push({
          produto_id: produto.id,
          produto_nome: produto.nome,
          tipo: 'produto',
          tipo_alerta: produto.estoque_atual === 0 ? 'sem_estoque' : 'estoque_minimo',
          nivel_prioridade: prioridade,
          mensagem: `${produto.nome} ${produto.estoque_atual === 0 ? 'está sem estoque' : 'atingiu estoque mínimo'} (${produto.estoque_atual} ${produto.unidade})`,
          quantidade_atual: produto.estoque_atual,
          quantidade_sugerida: Math.max(sugestao, produto.estoque_minimo * 2),
          data_alerta: new Date().toISOString(),
          status: 'pendente',
        });
      }
    });

    // 2. Alertas de estoque mínimo para ingredientes
    ingredientes.forEach(ing => {
      if (ing.ativo && ing.estoque_atual <= ing.estoque_minimo && ing.estoque_minimo > 0) {
        const prioridade = ing.estoque_atual === 0 ? 'critica' :
                          ing.estoque_atual < ing.estoque_minimo * 0.5 ? 'alta' : 'media';

        novosAlertas.push({
          produto_id: ing.id,
          produto_nome: ing.nome,
          tipo: 'ingrediente',
          tipo_alerta: ing.estoque_atual === 0 ? 'sem_estoque' : 'estoque_minimo',
          nivel_prioridade: prioridade,
          mensagem: `${ing.nome} ${ing.estoque_atual === 0 ? 'está sem estoque' : 'atingiu estoque mínimo'} (${ing.estoque_atual} kg)`,
          quantidade_atual: ing.estoque_atual,
          quantidade_sugerida: ing.estoque_minimo * 3,
          data_alerta: new Date().toISOString(),
          status: 'pendente',
        });
      }
    });

    // 3. Alertas de validade próxima (lotes)
    lotes.forEach(lote => {
      if (lote.status !== 'vencido' && lote.data_validade) {
        const diasRestantes = differenceInDays(parseISO(lote.data_validade), hoje);
        if (diasRestantes >= 0 && diasRestantes <= 7) {
          const prioridade = diasRestantes <= 2 ? 'critica' : diasRestantes <= 5 ? 'alta' : 'media';

          novosAlertas.push({
            produto_id: lote.produto_id,
            produto_nome: lote.produto_nome,
            tipo: lote.tipo,
            tipo_alerta: 'validade_proxima',
            nivel_prioridade: prioridade,
            mensagem: `Lote ${lote.codigo_lote} de ${lote.produto_nome} vence em ${diasRestantes} dia(s)`,
            quantidade_atual: lote.quantidade,
            data_alerta: new Date().toISOString(),
            data_validade: lote.data_validade,
            status: 'pendente',
          });
        }
      }
    });

    // 4. Detectar produtos com baixo giro (não vendidos nos últimos 60 dias)
    produtos.forEach(produto => {
      if (produto.ativo && produto.estoque_atual > 0) {
        const vendasRecentes = vendas.filter(v =>
          v.produto === produto.nome &&
          differenceInDays(hoje, parseISO(v.data_venda)) <= 60
        );

        if (vendasRecentes.length === 0) {
          novosAlertas.push({
            produto_id: produto.id,
            produto_nome: produto.nome,
            tipo: 'produto',
            tipo_alerta: 'giro_baixo',
            nivel_prioridade: 'baixa',
            mensagem: `${produto.nome} não teve vendas nos últimos 60 dias (estoque: ${produto.estoque_atual} ${produto.unidade})`,
            quantidade_atual: produto.estoque_atual,
            data_alerta: new Date().toISOString(),
            status: 'pendente',
          });
        }
      }
    });

    // Criar alertas que ainda não existem
    for (const alerta of novosAlertas) {
      const existe = alertas.some(a =>
        a.produto_id === alerta.produto_id &&
        a.tipo_alerta === alerta.tipo_alerta &&
        a.status === 'pendente'
      );

      if (!existe) {
        await createAlertaMutation.mutateAsync(alerta);
      }
    }

    setGerandoAlertas(false);
  };

  // Gerar alertas automaticamente ao carregar
  useEffect(() => {
    if (!isLoading && alertas.length === 0) {
      gerarAlertas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleMarcarResolvido = (alerta, acao) => {
    updateAlertaMutation.mutate({
      id: alerta.id,
      data: {
        ...alerta,
        status: 'resolvido',
        acao_tomada: acao
      }
    });
    setAlertaSelecionado(null);
  };

  const handleMarcarVisualizado = (alerta) => {
    updateAlertaMutation.mutate({
      id: alerta.id,
      data: {
        ...alerta,
        status: 'visualizado'
      }
    });
  };

  const alertasPendentes = alertas.filter(a => a.status === 'pendente');
  const alertasCriticos = alertasPendentes.filter(a => a.nivel_prioridade === 'critica');
  const alertasAltos = alertasPendentes.filter(a => a.nivel_prioridade === 'alta');

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      critica: "bg-red-100 text-red-800 border-red-300",
      alta: "bg-orange-100 text-orange-800 border-orange-300",
      media: "bg-yellow-100 text-yellow-800 border-yellow-300",
      baixa: "bg-blue-100 text-blue-800 border-blue-300"
    };
    return colors[prioridade] || colors.media;
  };

  const getTipoAlertaLabel = (tipo) => {
    const labels = {
      estoque_minimo: "Estoque Mínimo",
      estoque_maximo: "Estoque Máximo",
      validade_proxima: "Validade Próxima",
      sem_estoque: "Sem Estoque",
      giro_baixo: "Baixo Giro"
    };
    return labels[tipo] || tipo;
  };

  if (isLoading) {
    return <div className="p-8">Carregando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumo de alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Críticos</p>
                <p className="text-2xl font-bold text-red-900">{alertasCriticos.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Alta Prioridade</p>
                <p className="text-2xl font-bold text-orange-900">{alertasAltos.length}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Pendentes</p>
                <p className="text-2xl font-bold text-blue-900">{alertasPendentes.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de alertas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas Inteligentes
            </CardTitle>
            <Button onClick={gerarAlertas} disabled={gerandoAlertas} variant="outline" size="sm">
              {gerandoAlertas ? 'Gerando...' : 'Atualizar Alertas'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertasPendentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Nenhum alerta pendente! 🎉</p>
              </div>
            ) : (
              alertasPendentes.map(alerta => (
                <Card
                  key={alerta.id}
                  className={`border-2 ${getPrioridadeColor(alerta.nivel_prioridade)} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => setAlertaSelecionado(alerta)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPrioridadeColor(alerta.nivel_prioridade)}>
                            {alerta.nivel_prioridade.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {getTipoAlertaLabel(alerta.tipo_alerta)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(alerta.data_alerta), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>

                        <p className="font-medium">{alerta.mensagem}</p>

                        {alerta.quantidade_sugerida && (
                          <p className="text-sm text-gray-600 mt-1">
                            Sugestão de compra: {alerta.quantidade_sugerida} unidades
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarcarVisualizado(alerta);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalhes do alerta */}
      {alertaSelecionado && (
        <Dialog open={true} onOpenChange={() => setAlertaSelecionado(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Alerta</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Produto</p>
                <p className="font-semibold">{alertaSelecionado.produto_nome}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tipo de Alerta</p>
                  <Badge className={getPrioridadeColor(alertaSelecionado.nivel_prioridade)}>
                    {getTipoAlertaLabel(alertaSelecionado.tipo_alerta)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prioridade</p>
                  <Badge className={getPrioridadeColor(alertaSelecionado.nivel_prioridade)}>
                    {alertaSelecionado.nivel_prioridade.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {alertaSelecionado.quantidade_atual !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Quantidade Atual</p>
                  <p className="font-semibold">{alertaSelecionado.quantidade_atual}</p>
                </div>
              )}

              {alertaSelecionado.quantidade_sugerida && (
                <div>
                  <p className="text-sm text-gray-500">Quantidade Sugerida para Compra</p>
                  <p className="font-semibold text-green-600">{alertaSelecionado.quantidade_sugerida}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Ações</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleMarcarResolvido(alertaSelecionado, "Compra realizada")}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Compra Realizada
                  </Button>
                  <Button
                    onClick={() => handleMarcarResolvido(alertaSelecionado, "Ação tomada")}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar Resolvido
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}