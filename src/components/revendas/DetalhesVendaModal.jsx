import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Building2, 
  Calendar, 
  DollarSign, 
  CreditCard,
  ShoppingBag,
  Mail,
  MapPin,
  Clock,
  AlertCircle
} from "lucide-react";
import { format, addMonths, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DetalhesVendaModal({ venda, cliente, onClose }) {
  if (!venda) return null;

  const parcelasRestantes = venda.numero_parcelas - venda.parcelas_pagas;
  const valorRestante = parcelasRestantes * venda.valor_parcela;
  const comissaoRestante = (valorRestante * venda.porcentagem_comissao) / 100;
  
  const proximaParcelaData = addMonths(
    new Date(venda.data_primeira_parcela),
    venda.parcelas_pagas
  );
  
  const diasAteProximaParcela = differenceInDays(proximaParcelaData, new Date());
  const isAtrasada = diasAteProximaParcela < 0 && venda.status === 'ativa';
  const isProximaVencer = diasAteProximaParcela >= 0 && diasAteProximaParcela <= 7 && venda.status === 'ativa';

  const statusColors = {
    ativa: "bg-blue-100 text-blue-800",
    paga: "bg-green-100 text-green-800",
    cancelada: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    ativa: "Ativa",
    paga: "Paga",
    cancelada: "Cancelada"
  };

  return (
    <Dialog open={!!venda} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Detalhes da Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Alertas */}
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[venda.status]}>
              {statusLabels[venda.status]}
            </Badge>
            {isAtrasada && (
              <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                {Math.abs(diasAteProximaParcela)} dia(s) em atraso
              </Badge>
            )}
            {isProximaVencer && (
              <Badge className="bg-orange-100 text-orange-800">
                <Clock className="w-3 h-3 mr-1" />
                Vence em {diasAteProximaParcela} dia(s)
              </Badge>
            )}
          </div>

          {/* Dados do Cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Nome</p>
                <p className="font-medium text-base">{venda.cliente}</p>
              </div>
              {cliente?.telefone && (
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Telefone
                  </p>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
              )}
              {cliente?.email && (
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </p>
                  <p className="font-medium text-sm break-all">{cliente.email}</p>
                </div>
              )}
              {cliente?.endereco && (
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Endereço
                  </p>
                  <p className="font-medium text-sm">{cliente.endereco}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Nome</p>
                <p className="font-medium">{venda.empresa_nome}</p>
              </div>
              <div>
                <p className="text-gray-500">Comissão</p>
                <p className="font-medium">{venda.porcentagem_comissao}%</p>
              </div>
            </div>
          </div>

          {/* Produto Vendido */}
          {venda.produto && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Produto(s)
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{venda.produto}</p>
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Valor Total
              </p>
              <p className="text-2xl font-bold text-green-600">
                R$ {venda.valor_total.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Comissão Total
              </p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {venda.valor_comissao_total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Parcelas */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Parcelas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total de Parcelas</p>
                <p className="font-bold text-lg">{venda.numero_parcelas}x</p>
              </div>
              <div>
                <p className="text-gray-500">Valor/Parcela</p>
                <p className="font-bold text-lg">R$ {venda.valor_parcela.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Parcelas Pagas</p>
                <p className="font-bold text-lg text-green-600">{venda.parcelas_pagas}</p>
              </div>
              <div>
                <p className="text-gray-500">Parcelas Restantes</p>
                <p className="font-bold text-lg text-orange-600">{parcelasRestantes}</p>
              </div>
            </div>
          </div>

          {/* Valores Restantes */}
          {venda.status === 'ativa' && parcelasRestantes > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-gray-600 text-sm">Falta Receber</p>
                <p className="text-xl font-bold text-orange-600">
                  R$ {valorRestante.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {parcelasRestantes} parcela(s)
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-gray-600 text-sm">Comissão Restante</p>
                <p className="text-xl font-bold text-purple-600">
                  R$ {comissaoRestante.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {venda.porcentagem_comissao}% de {parcelasRestantes} parcela(s)
                </p>
              </div>
            </div>
          )}

          {/* Próxima Parcela */}
          {venda.status === 'ativa' && parcelasRestantes > 0 && (
            <div className={`rounded-lg p-4 ${
              isAtrasada ? 'bg-red-50 border border-red-200' : 
              isProximaVencer ? 'bg-orange-50 border border-orange-200' : 
              'bg-blue-50 border border-blue-200'
            }`}>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próxima Parcela
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Número</p>
                  <p className="font-bold text-lg">{venda.parcelas_pagas + 1}ª parcela</p>
                </div>
                <div>
                  <p className="text-gray-600">Vencimento</p>
                  <p className="font-bold text-lg">
                    {format(proximaParcelaData, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Datas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Primeira Parcela</p>
                <p className="font-medium">
                  {format(new Date(venda.data_primeira_parcela), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              {venda.status === 'ativa' && parcelasRestantes > 0 && (
                <div>
                  <p className="text-gray-500">Última Parcela Prevista</p>
                  <p className="font-medium">
                    {format(
                      addMonths(new Date(venda.data_primeira_parcela), venda.numero_parcelas - 1),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {venda.observacoes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Observações</h3>
              <p className="text-gray-700 whitespace-pre-line">{venda.observacoes}</p>
            </div>
          )}

          {/* Botão Fechar */}
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}