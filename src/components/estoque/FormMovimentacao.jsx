import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, ArrowDown, ArrowUp, AlertCircle } from "lucide-react";

const unidadeLabels = {
  kg: "kg",
  sacos: "sacos",
  caixas: "caixas",
  unidades: "unidades",
  litros: "litros",
  pacotes: "pacotes"
};

export default function FormMovimentacao({ produto, onSubmit, onCancel }) {
  const dataHoje = new Date().toISOString().split('T')[0];
  
  const [dados, setDados] = useState({
    produto_id: produto.id,
    produto_nome: produto.nome,
    tipo: produto.tipoInicial || 'entrada',
    quantidade: "",
    data: dataHoje,
    origem: "manual",
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      quantidade: parseFloat(dados.quantidade)
    });
  };

  const tipoConfig = {
    entrada: {
      label: "Entrada",
      color: "green",
      icon: ArrowDown,
      description: "Adiciona ao estoque"
    },
    saida: {
      label: "Saída",
      color: "red",
      icon: ArrowUp,
      description: "Remove do estoque"
    },
    perda: {
      label: "Perda/Roubo",
      color: "orange",
      icon: AlertCircle,
      description: "Remove do estoque"
    },
    ajuste: {
      label: "Ajuste",
      color: "blue",
      icon: AlertCircle,
      description: "Define estoque exato"
    }
  };

  const config = tipoConfig[dados.tipo];
  const Icon = config.icon;

  // Calcular novo estoque
  let novoEstoque = produto.estoque_atual;
  const qtd = parseFloat(dados.quantidade) || 0;
  
  if (dados.tipo === 'entrada') {
    novoEstoque += qtd;
  } else if (dados.tipo === 'saida' || dados.tipo === 'perda') {
    novoEstoque -= qtd;
  } else if (dados.tipo === 'ajuste') {
    novoEstoque = qtd;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className={`shadow-lg border-2 border-${config.color}-200`}>
        <CardHeader className={`pb-4 bg-${config.color}-50`}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className={`w-5 h-5 text-${config.color}-600`} />
            {config.label} - {produto.nome}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Estoque atual: <strong>{produto.estoque_atual} {unidadeLabels[produto.unidade]}</strong>
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tipo" className="text-base">Tipo de Movimentação</Label>
                <Select 
                  value={dados.tipo} 
                  onValueChange={(value) => setDados({...dados, tipo: value})}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">
                      ➕ Entrada (adiciona ao estoque)
                    </SelectItem>
                    <SelectItem value="saida">
                      ➖ Saída (remove do estoque)
                    </SelectItem>
                    <SelectItem value="perda">
                      ⚠️ Perda/Roubo (remove do estoque)
                    </SelectItem>
                    <SelectItem value="ajuste">
                      🔧 Ajuste (define estoque exato)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">{config.description}</p>
              </div>

              <div>
                <Label htmlFor="quantidade" className="text-base">
                  Quantidade ({unidadeLabels[produto.unidade]})
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.1"
                  value={dados.quantidade}
                  onChange={(e) => setDados({...dados, quantidade: e.target.value})}
                  placeholder={dados.tipo === 'ajuste' ? 'Quantidade total no estoque' : 'Quantidade'}
                  required
                  className="h-12 text-base"
                />
                {dados.tipo === 'ajuste' && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Ajuste: informe a quantidade TOTAL que você tem no estoque agora
                  </p>
                )}
              </div>

              {dados.quantidade && (
                <div className={`bg-${config.color}-50 p-4 rounded-lg border border-${config.color}-200`}>
                  <Label className="text-sm text-gray-600">Novo Estoque</Label>
                  <div className={`text-3xl font-bold text-${config.color}-600 mt-1`}>
                    {Math.max(0, novoEstoque).toFixed(1)} {unidadeLabels[produto.unidade]}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {dados.tipo === 'entrada' && `+${qtd} ${unidadeLabels[produto.unidade]}`}
                    {dados.tipo === 'saida' && `-${qtd} ${unidadeLabels[produto.unidade]}`}
                    {dados.tipo === 'perda' && `-${qtd} ${unidadeLabels[produto.unidade]} (perda)`}
                    {dados.tipo === 'ajuste' && `Ajustado para ${qtd} ${unidadeLabels[produto.unidade]}`}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="data" className="text-base">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={dados.data}
                  onChange={(e) => setDados({...dados, data: e.target.value})}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Ex: Comprei caixa de maçã e fiz 30 sacos"
                  className="h-20 text-base"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 h-12 text-base"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className={`flex-1 h-12 text-base bg-${config.color}-600 hover:bg-${config.color}-700`}
              >
                <Save className="w-5 h-5 mr-2" />
                Confirmar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}