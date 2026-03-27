import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Save, X, DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function FormDiaria({ diaria, funcionarios = [], onSubmit, onCancel }) {
  const dataHoje = new Date().toISOString().split('T')[0];
  
  const [dados, setDados] = useState(diaria || {
    funcionario_nome: "",
    data: dataHoje,
    valor_diaria: "",
    valor_passagem: "",
    valor_alimentacao: "",
    valor_total: 0,
    pago: false,
    observacoes: ""
  });

  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Filtrar sugestões baseado no que foi digitado
    if (dados.funcionario_nome.length > 0) {
      const filtradas = funcionarios.filter(f => 
        f.ativo && f.nome.toLowerCase().includes(dados.funcionario_nome.toLowerCase())
      );
      setSugestoes(filtradas);
      setMostrarSugestoes(filtradas.length > 0);
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
    }
  }, [dados.funcionario_nome, funcionarios]);

  const calcularTotal = (diaria, passagem, alimentacao) => {
    return (parseFloat(diaria) || 0) + (parseFloat(passagem) || 0) + (parseFloat(alimentacao) || 0);
  };

  const handleValorChange = (field, value) => {
    const novosDados = { ...dados, [field]: value };
    novosDados.valor_total = calcularTotal(
      field === 'valor_diaria' ? value : dados.valor_diaria,
      field === 'valor_passagem' ? value : dados.valor_passagem,
      field === 'valor_alimentacao' ? value : dados.valor_alimentacao
    );
    setDados(novosDados);
  };

  const selecionarSugestao = (funcionario) => {
    setDados({
      ...dados,
      funcionario_nome: funcionario.nome
    });
    setMostrarSugestoes(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      valor_diaria: parseFloat(dados.valor_diaria) || 0,
      valor_passagem: parseFloat(dados.valor_passagem) || 0,
      valor_alimentacao: parseFloat(dados.valor_alimentacao) || 0,
      valor_total: parseFloat(dados.valor_total) || 0
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="shadow-lg border-2 border-green-200">
        <CardHeader className="pb-4 bg-green-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            {diaria ? 'Editar Diária' : 'Registrar Diária'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="funcionario_nome" className="text-base">Nome do Funcionário</Label>
                <Input
                  ref={inputRef}
                  id="funcionario_nome"
                  value={dados.funcionario_nome}
                  onChange={(e) => setDados({...dados, funcionario_nome: e.target.value})}
                  onFocus={() => dados.funcionario_nome.length > 0 && setSugestoes(funcionarios.filter(f => 
                    f.ativo && f.nome.toLowerCase().includes(dados.funcionario_nome.toLowerCase())
                  )) && setMostrarSugestoes(true)}
                  placeholder="Ex: João Silva"
                  required
                  className="h-12 text-base"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite o nome - sugestões aparecerão automaticamente
                </p>

                {/* Sugestões de autocomplete */}
                {mostrarSugestoes && sugestoes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {sugestoes.map((func) => (
                      <button
                        key={func.id}
                        type="button"
                        onClick={() => selecionarSugestao(func)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <p className="font-medium">{func.nome}</p>
                        {func.telefone && (
                          <p className="text-xs text-gray-500">{func.telefone}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="valor_diaria" className="text-base">Valor da Diária</Label>
                  <Input
                    id="valor_diaria"
                    type="number"
                    step="0.01"
                    value={dados.valor_diaria}
                    onChange={(e) => handleValorChange('valor_diaria', e.target.value)}
                    placeholder="Ex: 150.00"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="valor_passagem" className="text-base">Passagem</Label>
                  <Input
                    id="valor_passagem"
                    type="number"
                    step="0.01"
                    value={dados.valor_passagem}
                    onChange={(e) => handleValorChange('valor_passagem', e.target.value)}
                    placeholder="Ex: 15.00"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="valor_alimentacao" className="text-base">Alimentação</Label>
                  <Input
                    id="valor_alimentacao"
                    type="number"
                    step="0.01"
                    value={dados.valor_alimentacao}
                    onChange={(e) => handleValorChange('valor_alimentacao', e.target.value)}
                    placeholder="Ex: 25.00"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Label className="text-sm text-gray-600">Valor Total</Label>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  R$ {(dados.valor_total || 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Diária + Passagem + Alimentação
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="pago" className="text-base font-medium">Já foi pago?</Label>
                  <p className="text-xs text-gray-500">Marque se já pagou ao funcionário</p>
                </div>
                <Switch
                  id="pago"
                  checked={dados.pago}
                  onCheckedChange={(checked) => setDados({...dados, pago: checked})}
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Ex: Trabalhou na feira do sábado"
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
                className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
              >
                <Save className="w-5 h-5 mr-2" />
                {diaria ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}