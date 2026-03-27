import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Save, X, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function FormFuncionario({ funcionario, onSubmit, onCancel }) {
  const [dados, setDados] = useState(funcionario || {
    nome: "",
    telefone: "",
    ativo: true,
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(dados);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="shadow-lg border-2 border-indigo-200">
        <CardHeader className="pb-4 bg-indigo-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Adicionar Informações - {funcionario?.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm text-gray-600">Nome do Funcionário</Label>
                <p className="font-bold text-lg mt-1">{dados.nome}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Para alterar o nome, edite as diárias existentes
                </p>
              </div>

              <div>
                <Label htmlFor="telefone" className="text-base">Telefone</Label>
                <Input
                  id="telefone"
                  value={dados.telefone}
                  onChange={(e) => setDados({...dados, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Ex: Trabalha nas quartas e sábados, prefere receber em dinheiro"
                  className="h-24 text-base"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="ativo" className="text-base font-medium">Funcionário Ativo</Label>
                  <p className="text-xs text-gray-500">Funcionários inativos não aparecem nas sugestões</p>
                </div>
                <Switch
                  id="ativo"
                  checked={dados.ativo}
                  onCheckedChange={(checked) => setDados({...dados, ativo: checked})}
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
                className="flex-1 h-12 text-base bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-5 h-5 mr-2" />
                Salvar Informações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}