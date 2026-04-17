import React, { useState } from "react";
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormProducao({ receita, ingredientes, onSubmit, onCancel }) {
  const [dados, setDados] = useState({
    quantidade: "1",
    data_producao: format(new Date(), 'yyyy-MM-dd'),
    descontar_estoque: true,
    observacoes: ""
  });

  const custoUnitario = receita.custo_total || 0;
  const custoTotal = custoUnitario * (parseFloat(dados.quantidade) || 0);

  const converterParaKg = (quantidade, unidade) => {
    switch(unidade) {
      case 'g':
      case 'gramas': 
        return quantidade / 1000;
      case 'ml': 
        return quantidade / 1000;
      case 'l':
      case 'litros': 
        return quantidade;
      case 'kg': 
        return quantidade;
      default: 
        return quantidade;
    }
  };

  const verificarEstoque = () => {
    const faltando = [];
    
    receita.ingredientes?.forEach(item => {
      const ing = ingredientes.find(i => i.id === item.ingrediente_id);
      if (!ing) return;
      
      let necessario;
      if (item.quantidade_kg) {
        necessario = item.quantidade_kg * (parseFloat(dados.quantidade) || 0);
      } else {
        const qtdConvertida = converterParaKg(item.quantidade, item.unidade || 'kg');
        necessario = qtdConvertida * (parseFloat(dados.quantidade) || 0);
      }
      
      if (ing.estoque_atual < necessario) {
        faltando.push({
          nome: ing.nome,
          necessario: necessario.toFixed(3),
          disponivel: ing.estoque_atual.toFixed(3)
        });
      }
    });

    return faltando;
  };

  const estoqueInsuficiente = dados.descontar_estoque ? verificarEstoque() : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (estoqueInsuficiente.length > 0) {
      toast.warning('Estoque insuficiente para produção!', { id: 'Estoque insuficiente para produção!' })
      return;
    }

    onSubmit({
      receita_id: receita.id,
      nome_produto: receita.nome_produto,
      quantidade: parseFloat(dados.quantidade),
      data_producao: dados.data_producao,
      custo_unitario: custoUnitario,
      custo_total: custoTotal,
      descontar_estoque: dados.descontar_estoque,
      observacoes: dados.observacoes
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produzir: {receita.nome_produto}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Ingredientes Necessários:</h4>
              <div className="space-y-1 text-sm">
                {receita.ingredientes?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.ingrediente_nome}</span>
                    <span className="text-gray-600">{item.quantidade} {item.unidade}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Custo Unitário:</span>
                  <span className="text-red-600">R$ {custoUnitario.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Quantidade a Produzir *</Label>
                <Input
                  type="number"
                  min="1"
                  value={dados.quantidade}
                  onChange={(e) => setDados({...dados, quantidade: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Data da Produção *</Label>
                <Input
                  type="date"
                  value={dados.data_producao}
                  onChange={(e) => setDados({...dados, data_producao: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">Custo Total da Produção:</span>
                <span className="text-xl font-bold text-blue-900">R$ {custoTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="descontar"
                checked={dados.descontar_estoque}
                onCheckedChange={(checked) => setDados({...dados, descontar_estoque: checked})}
              />
              <label htmlFor="descontar" className="text-sm cursor-pointer">
                Descontar ingredientes do estoque
              </label>
            </div>

            {estoqueInsuficiente.length > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Estoque insuficiente:</strong>
                  <ul className="mt-2 space-y-1">
                    {estoqueInsuficiente.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        • {item.nome}: Necessário {item.necessario} kg, Disponível {item.disponivel} kg
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Observações</Label>
              <Textarea
                value={dados.observacoes}
                onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                placeholder="Alguma observação sobre esta produção..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={estoqueInsuficiente.length > 0}
              >
                Confirmar Produção
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}