import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Store } from "lucide-react";

export default function FormEmpresa({ empresa, onSubmit, onCancel }) {
  const [dados, setDados] = useState(empresa || {
    nome: "",
    porcentagem_comissao: "",
    telefone: "",
    email: "",
    nome_gerente: "",
    cor: "blue",
    ativa: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      porcentagem_comissao: parseFloat(dados.porcentagem_comissao)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5" />
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-base">Nome da Empresa</Label>
                <Input
                  id="nome"
                  value={dados.nome}
                  onChange={(e) => setDados({...dados, nome: e.target.value})}
                  placeholder="Ex: Natura, Boticário, Hinode"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="porcentagem_comissao" className="text-base">Porcentagem de Comissão (%)</Label>
                <Input
                  id="porcentagem_comissao"
                  type="number"
                  step="0.01"
                  value={dados.porcentagem_comissao}
                  onChange={(e) => setDados({...dados, porcentagem_comissao: e.target.value})}
                  placeholder="Ex: 30"
                  required
                  className="h-12 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quanto você ganha de comissão nesta empresa
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone" className="text-base">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={dados.telefone}
                    onChange={(e) => setDados({...dados, telefone: e.target.value})}
                    placeholder="(11) 98888-8888"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={dados.email}
                    onChange={(e) => setDados({...dados, email: e.target.value})}
                    placeholder="contato@empresa.com"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nome_gerente" className="text-base">Nome do Gerente/Representante</Label>
                <Input
                  id="nome_gerente"
                  value={dados.nome_gerente}
                  onChange={(e) => setDados({...dados, nome_gerente: e.target.value})}
                  placeholder="Ex: João Silva"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="cor" className="text-base">Cor de Identificação</Label>
                <Select
                  value={dados.cor}
                  onValueChange={(value) => setDados({...dados, cor: value})}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Escolha uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="pink">Rosa</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                className="flex-1 h-12 text-base bg-pink-600 hover:bg-pink-700"
              >
                <Save className="w-5 h-5 mr-2" />
                {empresa ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}