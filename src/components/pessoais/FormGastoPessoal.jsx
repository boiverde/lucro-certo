import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";

export default function FormGastoPessoal({ gasto, onSubmit, onCancel }) {
  const [dados, setDados] = useState(gasto || {
    categoria: "",
    descricao: "",
    valor: "",
    data: "",
    metodo_pagamento: "",
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      valor: parseFloat(dados.valor)
    });
  };

  const categorias = [
    { value: "aluguel", label: "Aluguel" },
    { value: "gasolina", label: "Gasolina" },
    { value: "mercado", label: "Mercado" },
    { value: "luz", label: "Luz" },
    { value: "agua", label: "Água" },
    { value: "internet", label: "Internet" },
    { value: "telefone", label: "Telefone" },
    { value: "saude", label: "Saúde" },
    { value: "educacao", label: "Educação" },
    { value: "lazer", label: "Lazer" },
    { value: "transporte", label: "Transporte" },
    { value: "roupas", label: "Roupas" },
    { value: "outros", label: "Outros" }
  ];

  const metodosPagamento = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "pix", label: "PIX" },
    { value: "transferencia", label: "Transferência" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {gasto ? 'Editar Gasto Pessoal' : 'Novo Gasto Pessoal'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={dados.categoria}
                  onValueChange={(value) => setDados({...dados, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={dados.valor}
                  onChange={(e) => setDados({...dados, valor: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={dados.data}
                  onChange={(e) => setDados({...dados, data: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
                <Select
                  value={dados.metodo_pagamento}
                  onValueChange={(value) => setDados({...dados, metodo_pagamento: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Como você pagou?" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPagamento.map((metodo) => (
                      <SelectItem key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={dados.descricao}
                onChange={(e) => setDados({...dados, descricao: e.target.value})}
                placeholder="Ex: Conta de luz da casa"
                required
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={dados.observacoes}
                onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                placeholder="Observações adicionais..."
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                {gasto ? 'Atualizar' : 'Salvar'} Gasto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}