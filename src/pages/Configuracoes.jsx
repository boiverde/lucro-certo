import React, { useState, useEffect } from "react";
import { handleApiError } from '@/api/errorHandler';
import { toast } from 'sonner';
import { httpClient } from "@/api/httpClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, CheckCircle, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalculadoraMarkup from "../components/configuracoes/CalculadoraMarkup";
import TemplatesNegocio from "../components/configuracoes/TemplatesNegocio";

export default function ConfiguracoesPage() {
  const [user, setUser] = useState(null);
  const [margemPadrao, setMargemPadrao] = useState("");
  const [faturamentoMedio, setFaturamentoMedio] = useState("");
  const [custoFixo, setCustoFixo] = useState("");
  const [taxaImpostos, setTaxaImpostos] = useState("");
  const [taxaCartao, setTaxaCartao] = useState("");
  const [custoMaoObraHora, setCustoMaoObraHora] = useState("");
  const [custoFixoUnidade, setCustoFixoUnidade] = useState("");
  const [producaoMensalEstimada, setProducaoMensalEstimada] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);



  const { data: userData } = useQuery({ queryKey: ['auth-me-configs'], queryFn: () => httpClient('/auth/me'), staleTime: 1000 * 60 * 5 });

  useEffect(() => {
    if (userData) {
      setUser(userData);
      // Campos que existem no schema Prisma
      setTaxaImpostos(userData.taxa_impostos ?? 5);
      setTaxaCartao(userData.taxa_cartao ?? 4);
      setCustoFixo(userData.custo_fixo_mensal ?? "");
      setMargemPadrao(userData.margem_balcao ?? 30);
      // Campos locais de UX que nao sao persistidos — mantidos para calculo local
      setFaturamentoMedio(userData.faturamento_medio_mensal ?? "");
      setCustoMaoObraHora("");
      setCustoFixoUnidade("");
      setProducaoMensalEstimada("");
    }
  }, [userData]);

  const aplicarTemplate = async (config) => {
    setMargemPadrao(config.margem_lucro_padrao);
    setTaxaImpostos(config.taxa_impostos);
    setTaxaCartao(config.taxa_cartao);
    setCustoMaoObraHora(config.custo_mao_obra_hora);

    // Aplicar automaticamente
    try {
      await httpClient('/auth/me', { method: 'PATCH', body: JSON.stringify({
        taxa_impostos: config.taxa_impostos,
        taxa_cartao: config.taxa_cartao,
        custo_fixo_mensal: parseFloat(custoFixo) || 0,
        margem_balcao: config.margem_lucro_padrao,
        margem_delivery: config.margem_lucro_padrao,
        margem_marketplace: config.margem_lucro_padrao
      }) });

      toast.success('Template aplicado com sucesso!', { id: 'Template aplicado com sucesso!' })
    } catch (error) {
      handleApiError(error, 'aplicar o tema');
      console.error('Erro ao aplicar template:', error);
      toast.error('Erro ao aplicar template')
    }
  };

  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    try {
      const custoMaoObraVal = parseFloat(custoMaoObraHora) || 0;
      const producaoEstimada = parseFloat(producaoMensalEstimada) || 0;
      const custoFixoVal = parseFloat(custoFixo) || 0;

      const custoFixoPorUnidadeCalc = producaoEstimada > 0 
        ? custoFixoVal / producaoEstimada 
        : parseFloat(custoFixoUnidade) || 0;

      const faturamentoVal = parseFloat(faturamentoMedio) || 0;
      const impostosVal = parseFloat(taxaImpostos) || 5;
      const cartaoVal = parseFloat(taxaCartao) || 4;
      const margemVal = parseFloat(margemPadrao) || 30;

      let finalMarkup = 0;
      if (faturamentoVal > 0) {
        const custoFixoPct = (custoFixoVal / faturamentoVal) * 100;
        const custosTotais = custoFixoPct + impostosVal + cartaoVal;
        finalMarkup = (100 - custosTotais - margemVal) > 0 ? 100 / (100 - custosTotais - margemVal) : 0;
      }

      // Envia apenas campos que existem no schema Prisma User
      await httpClient('/auth/me', { method: 'PATCH', body: JSON.stringify({
        taxa_impostos: impostosVal,
        taxa_cartao: cartaoVal,
        custo_fixo_mensal: custoFixoVal,
        margem_balcao: margemVal,
        margem_delivery: margemVal,
        margem_marketplace: margemVal
      }) });

      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      handleApiError(error, 'salvar as configurações');
      console.error('Erro ao salvar:', error);
    }

    setSalvando(false);
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Configurações
          </h1>
          <p className="text-gray-500 mt-1">Personalize as configurações do sistema</p>
        </div>

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
            <TemplatesNegocio onAplicar={aplicarTemplate} />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Configuração Manual</h3>
              <p className="text-sm text-blue-800">
                Use os templates acima para configuração rápida baseada em benchmarks de mercado, 
                ou preencha manualmente os campos abaixo. Para margem de lucro das receitas, 
                vá em <strong>Controle → Lanches → Config</strong>.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Dados do Negócio</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={salvarConfiguracoes} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Faturamento Médio Mensal (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={faturamentoMedio}
                        onChange={(e) => setFaturamentoMedio(e.target.value)}
                        placeholder="50000.00"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Quanto você fatura por mês em média</p>
                    </div>

                    <div>
                      <Label>Custo Fixo Mensal (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={custoFixo}
                        onChange={(e) => setCustoFixo(e.target.value)}
                        placeholder="16000.00"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Aluguel, salários, energia, etc</p>
                    </div>

                    <div>
                      <Label>Taxa de Impostos (%) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaImpostos}
                        onChange={(e) => setTaxaImpostos(e.target.value)}
                        placeholder="5"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Simples Nacional, ISS, etc</p>
                    </div>

                    <div>
                      <Label>Taxa de Cartão/Delivery (%) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaCartao}
                        onChange={(e) => setTaxaCartao(e.target.value)}
                        placeholder="4"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Taxas de pagamento</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      💰 Custos de Produção
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Custo de Mão de Obra (R$/hora)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={custoMaoObraHora}
                          onChange={(e) => setCustoMaoObraHora(e.target.value)}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Custo médio por hora de trabalho (salário + encargos ÷ horas trabalhadas)
                        </p>
                      </div>

                      <div>
                        <Label>Produção Mensal Estimada (unidades)</Label>
                        <Input
                          type="number"
                          value={producaoMensalEstimada}
                          onChange={(e) => {
                            setProducaoMensalEstimada(e.target.value);
                            // Calcular custo fixo por unidade automaticamente
                            const prod = parseFloat(e.target.value) || 0;
                            const fixo = parseFloat(custoFixo) || 0;
                            if (prod > 0) {
                              setCustoFixoUnidade((fixo / prod).toFixed(2));
                            }
                          }}
                          placeholder="1000"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Quantas unidades você produz por mês em média
                        </p>
                      </div>

                      <div>
                        <Label>Custo Fixo por Unidade (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={custoFixoUnidade}
                          onChange={(e) => setCustoFixoUnidade(e.target.value)}
                          placeholder="Calculado automaticamente"
                          disabled={producaoMensalEstimada > 0}
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          {producaoMensalEstimada > 0 
                            ? `Calculado: R$ ${custoFixoUnidade || '0.00'} (Custo Fixo ÷ Produção Mensal)`
                            : "Informe a produção mensal para cálculo automático"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">⚠️ Importante</h4>
                    <p className="text-sm text-orange-800">
                      Estes dados são fundamentais para calcular o <strong>custo real</strong> e o <strong>markup ideal</strong> do seu negócio.
                      Com custos de mão de obra e overhead configurados, você terá uma precificação muito mais precisa.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={salvando}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {salvando ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {faturamentoMedio && custoFixo && (
              <CalculadoraMarkup
                faturamento={parseFloat(faturamentoMedio)}
                custoFixo={parseFloat(custoFixo)}
                taxaImpostos={parseFloat(taxaImpostos)}
                taxaCartao={parseFloat(taxaCartao)}
                margemLucro={parseFloat(margemPadrao)}
              />
            )}
        </div>

        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-gray-600">Nome</Label>
                <p className="font-medium">{user.full_name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">Função</Label>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


