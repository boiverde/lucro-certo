import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Save, X, User } from "lucide-react";

export default function FormCliente({ cliente, onSubmit, onCancel }) {
  const [dados, setDados] = useState(cliente || {
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cpf: "",
    data_nascimento: "",
    observacoes: "",
    ativo: true
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
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nome" className="text-base">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={dados.nome}
                    onChange={(e) => setDados({...dados, nome: e.target.value})}
                    placeholder="Ex: Maria Silva"
                    required
                    className="h-12 text-base"
                  />
                </div>

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
                    placeholder="cliente@email.com"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="cpf" className="text-base">CPF</Label>
                  <Input
                    id="cpf"
                    value={dados.cpf}
                    onChange={(e) => setDados({...dados, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="data_nascimento" className="text-base">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={dados.data_nascimento}
                    onChange={(e) => setDados({...dados, data_nascimento: e.target.value})}
                    className="h-12 text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="endereco" className="text-base">Endereço</Label>
                  <Input
                    id="endereco"
                    value={dados.endereco}
                    onChange={(e) => setDados({...dados, endereco: e.target.value})}
                    placeholder="Rua, número, bairro"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade" className="text-base">Cidade</Label>
                  <Input
                    id="cidade"
                    value={dados.cidade}
                    onChange={(e) => setDados({...dados, cidade: e.target.value})}
                    placeholder="São Paulo"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="estado" className="text-base">Estado (UF)</Label>
                  <Input
                    id="estado"
                    value={dados.estado}
                    onChange={(e) => setDados({...dados, estado: e.target.value})}
                    placeholder="SP"
                    maxLength={2}
                    className="h-12 text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="observacoes" className="text-base">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={dados.observacoes}
                    onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                    placeholder="Preferências, informações adicionais..."
                    className="h-24 text-base"
                  />
                </div>

                <div className="flex items-center justify-between md:col-span-2 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="ativo" className="text-base font-medium">Cliente Ativo</Label>
                    <p className="text-sm text-gray-500">Marque se o cliente está ativo</p>
                  </div>
                  <Switch
                    id="ativo"
                    checked={dados.ativo}
                    onCheckedChange={(checked) => setDados({...dados, ativo: checked})}
                  />
                </div>
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
                className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-5 h-5 mr-2" />
                {cliente ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}