import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { format } from "date-fns";

export default function FormGasto({ gasto, onSubmit, onCancel }) {
  const [dados, setDados] = useState(gasto || {
    tipo: "outros",
    categoria_custo: "variavel",
    descricao: "",
    valor: "",
    data: format(new Date(), 'yyyy-MM-dd'),
    funcionario: "",
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      valor: parseFloat(dados.valor)
    });
  };

  const tiposGasto = [
    { value: "aluguel", label: "Aluguel" },
    { value: "salarios", label: "Salários" },
    { value: "energia", label: "Energia" },
    { value: "agua", label: "Água" },
    { value: "internet", label: "Internet" },
    { value: "marketing", label: "Marketing" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "gasolina", label: "Gasolina" },
    { value: "diaria_funcionario", label: "Diária de Funcionário" },
    { value: "transporte", label: "Transporte" },
    { value: "manutencao", label: "Manutenção" },
    { value: "outros", label: "Outros" }
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
            {gasto ? 'Editar Gasto' : 'Novo Gasto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo do Gasto</Label>
                <Select
                  value={dados.tipo}
                  onValueChange={(value) => setDados({...dados, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposGasto.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria_custo">Categoria</Label>
                <Select
                  value={dados.categoria_custo}
                  onValueChange={(value) => setDados({...dados, categoria_custo: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixo">Custo Fixo</SelectItem>
                    <SelectItem value="variavel">Custo Variável</SelectItem>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {dados.tipo === 'diaria_funcionario' && (
                <div>
                  <Label htmlFor="funcionario">Nome do Funcionário</Label>
                  <Input
                    id="funcionario"
                    value={dados.funcionario}
                    onChange={(e) => setDados({...dados, funcionario: e.target.value})}
                    placeholder="Nome do funcionário"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={dados.descricao}
                onChange={(e) => setDados({...dados, descricao: e.target.value})}
                placeholder="Descrição do gasto"
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
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
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