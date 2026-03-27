import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";

export default function FormGastoRevenda({ gasto, empresas = [], gastosAnteriores = [], onSubmit, onCancel }) {
  const [dados, setDados] = useState(gasto || {
    descricao: "",
    valor: "",
    data: "",
    empresa_id: "",
    empresa_nome: "",
    observacoes: ""
  });

  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Extrair descrições únicas dos gastos anteriores para autocomplete
  useEffect(() => {
    if (gastosAnteriores.length > 0) {
      const descricoesUnicas = [...new Set(gastosAnteriores.map(g => g.descricao))];
      setSugestoes(descricoesUnicas);
    }
  }, [gastosAnteriores]);

  const handleDescricaoChange = (value) => {
    setDados({...dados, descricao: value});
    setMostrarSugestoes(value.length > 0);
  };

  const selecionarSugestao = (sugestao) => {
    setDados({...dados, descricao: sugestao});
    setMostrarSugestoes(false);
  };

  const sugestoesFiltradas = sugestoes.filter(s => 
    s.toLowerCase().includes(dados.descricao.toLowerCase())
  );

  const handleEmpresaChange = (empresaId) => {
    const empresa = empresas.find(e => e.id === empresaId);
    setDados({
      ...dados,
      empresa_id: empresaId,
      empresa_nome: empresa ? empresa.nome : ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      valor: parseFloat(dados.valor)
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
          <CardTitle className="text-lg">
            {gasto ? 'Editar Gasto' : 'Novo Gasto de Revenda'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="descricao" className="text-base">Descrição do Gasto</Label>
                <Input
                  id="descricao"
                  value={dados.descricao}
                  onChange={(e) => handleDescricaoChange(e.target.value)}
                  onFocus={() => setMostrarSugestoes(dados.descricao.length > 0)}
                  onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                  placeholder="Ex: Transporte, Material de divulgação, Embalagens..."
                  required
                  className="h-12 text-base"
                />
                
                {/* Sugestões de autocomplete */}
                {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {sugestoesFiltradas.map((sugestao, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selecionarSugestao(sugestao)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        {sugestao}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Digite livremente ou selecione uma sugestão
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="valor" className="text-base">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={dados.valor}
                    onChange={(e) => setDados({...dados, valor: e.target.value})}
                    placeholder="Ex: 50.00"
                    required
                    className="h-12 text-base"
                  />
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
              </div>

              <div>
                <Label htmlFor="empresa" className="text-base">Empresa (Opcional)</Label>
                <Select 
                  value={dados.empresa_id} 
                  onValueChange={handleEmpresaChange}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhuma</SelectItem>
                    {empresas.filter(e => e.ativa).map(empresa => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Vincule o gasto a uma empresa específica (opcional)
                </p>
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Observações sobre o gasto..."
                  className="h-24 text-base"
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
                className="flex-1 h-12 text-base bg-orange-600 hover:bg-orange-700"
              >
                <Save className="w-5 h-5 mr-2" />
                {gasto ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}