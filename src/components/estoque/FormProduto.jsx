import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Package, Scan } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import BarcodeScanner from "../mobile/BarcodeScanner";
import PricingAssistant from "../configuracoes/PricingAssistant";
import { usePlan } from "@/api/usePlan";
import { base44 } from "@/api/base44Client";

export default function FormProduto({ produto, onSubmit, onCancel }) {
  const [configuracoes, setConfiguracoes] = useState(null);
  const { plan } = usePlan();

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const user = await base44.auth.me();
        setConfiguracoes(user);
      } catch (e) {
        console.error('Erro ao carregar configurações');
      }
    };
    loadConfigs();
  }, []);

  const [dados, setDados] = useState(produto || {
    nome: "",
    codigo_barras: "",
    unidade: "unidades",
    estoque_atual: 0,
    estoque_minimo: 0,
    notificar_estoque_baixo: true,
    controla_estoque: true,
    ativo: true,
    observacoes: "",
    preco: 0,
    custo: 0
  });

  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      estoque_atual: parseFloat(dados.estoque_atual) || 0,
      estoque_minimo: parseFloat(dados.estoque_minimo) || 0,
      preco: parseFloat(dados.preco) || 0,
      custo: parseFloat(dados.custo) || 0
    });
  };

  const handleBarcodeScanned = (code) => {
    setDados({...dados, codigo_barras: code});
    setShowScanner(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="pb-4 bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-blue-600" />
              {produto ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-base">Nome do Produto</Label>
                  <Input
                    id="nome"
                    value={dados.nome}
                    onChange={(e) => setDados({...dados, nome: e.target.value})}
                    placeholder="Ex: Maçã em Sacos, Banana, etc"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="codigo_barras" className="text-base">Código de Barras</Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo_barras"
                      value={dados.codigo_barras}
                      onChange={(e) => setDados({...dados, codigo_barras: e.target.value})}
                      placeholder="Digite ou escaneie"
                      className="h-12 text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScanner(true)}
                      className="h-12 px-4"
                    >
                      <Scan className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use o leitor para adicionar produtos rapidamente
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unidade" className="text-base">Unidade de Medida</Label>
                    <Select 
                      value={dados.unidade} 
                      onValueChange={(value) => setDados({...dados, unidade: value})}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Quilos (kg)</SelectItem>
                        <SelectItem value="sacos">Sacos</SelectItem>
                        <SelectItem value="caixas">Caixas</SelectItem>
                        <SelectItem value="unidades">Unidades</SelectItem>
                        <SelectItem value="litros">Litros</SelectItem>
                        <SelectItem value="pacotes">Pacotes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="estoque_minimo" className="text-base">Estoque Mínimo (Alerta)</Label>
                    <Input
                      id="estoque_minimo"
                      type="number"
                      step="0.1"
                      value={dados.estoque_minimo}
                      onChange={(e) => setDados({...dados, estoque_minimo: e.target.value})}
                      placeholder="0"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <Label htmlFor="custo" className="text-base">Custo de Aquisição (R$)</Label>
                    <Input
                      id="custo"
                      type="number"
                      step="0.01"
                      value={dados.custo}
                      onChange={(e) => setDados({...dados, custo: e.target.value})}
                      placeholder="0.00"
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preco" className="text-base">Preço de Venda (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={dados.preco}
                      onChange={(e) => setDados({...dados, preco: e.target.value})}
                      placeholder="0.00"
                      className="h-12 text-base font-bold text-blue-700"
                    />
                  </div>
                </div>

                <PricingAssistant 
                  cost={parseFloat(dados.custo) || 0}
                  configs={configuracoes}
                  isPro={plan === 'pro'}
                  onApply={(val) => setDados({...dados, preco: val})}
                />

                {!produto && (
                  <div>
                    <Label htmlFor="estoque_atual" className="text-base">Estoque Inicial</Label>
                    <Input
                      id="estoque_atual"
                      type="number"
                      step="0.1"
                      value={dados.estoque_atual}
                      onChange={(e) => setDados({...dados, estoque_atual: e.target.value})}
                      placeholder="0"
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se já tem estoque deste produto, informe aqui
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="observacoes" className="text-base">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={dados.observacoes}
                    onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                    placeholder="Observações sobre o produto..."
                    className="h-20 text-base"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <Label htmlFor="notificar_estoque_baixo" className="text-base font-medium">Notificar Estoque Baixo</Label>
                    <p className="text-xs text-gray-500">Receber notificação push quando atingir estoque mínimo</p>
                  </div>
                  <Switch
                    id="notificar_estoque_baixo"
                    checked={dados.notificar_estoque_baixo}
                    onCheckedChange={(checked) => setDados({...dados, notificar_estoque_baixo: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Label htmlFor="controla_estoque" className="text-base font-medium">Controlar Estoque nas Vendas</Label>
                    <p className="text-xs text-gray-500">Desconta automaticamente quando registrar uma venda</p>
                  </div>
                  <Switch
                    id="controla_estoque"
                    checked={dados.controla_estoque}
                    onCheckedChange={(checked) => setDados({...dados, controla_estoque: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="ativo" className="text-base font-medium">Produto Ativo</Label>
                    <p className="text-xs text-gray-500">Produtos inativos não aparecem nas listas</p>
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
                  className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {produto ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}