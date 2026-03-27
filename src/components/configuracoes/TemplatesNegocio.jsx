import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pizza, Beef, Cake, Coffee, Croissant, Check } from "lucide-react";

/**
 * Templates de negócio baseados em pesquisa de mercado 2024/2025
 * Fontes: Goomer, Yooga, mercado brasileiro de food service
 */
const TEMPLATES_NEGOCIO = [
  {
    id: "hamburgueria",
    nome: "Hamburgueria",
    icone: Beef,
    cor: "orange",
    descricao: "Especializada em hambúrgueres artesanais",
    configuracoes: {
      margem_lucro_padrao: 35,
      markup_sugerido: 2.8,
      cmv_ideal: 32, // 30-35%
      taxa_impostos: 5,
      taxa_cartao: 4.5,
      custo_mao_obra_hora: 20,
      observacoes: [
        "CMV ideal: 30-35%",
        "Markup típico: 2.5 a 3.0",
        "Margem líquida esperada: 8-12%",
        "Considerar custo de embalagem (3-5%)"
      ]
    }
  },
  {
    id: "pizzaria",
    nome: "Pizzaria",
    icone: Pizza,
    cor: "red",
    descricao: "Pizzas tradicionais e gourmet",
    configuracoes: {
      margem_lucro_padrao: 40,
      markup_sugerido: 3.0,
      cmv_ideal: 28, // 25-30%
      taxa_impostos: 5,
      taxa_cartao: 4.5,
      custo_mao_obra_hora: 22,
      observacoes: [
        "CMV ideal: 25-30%",
        "Markup típico: 2.8 a 3.5",
        "Margem líquida esperada: 10-15%",
        "Pizza tem maior margem que hambúrguer"
      ]
    }
  },
  {
    id: "lanchonete_salgados",
    nome: "Lanchonete de Salgados",
    icone: Cake,
    cor: "yellow",
    descricao: "Salgados assados e fritos",
    configuracoes: {
      margem_lucro_padrao: 45,
      markup_sugerido: 3.2,
      cmv_ideal: 25, // 23-28%
      taxa_impostos: 5,
      taxa_cartao: 4,
      custo_mao_obra_hora: 18,
      observacoes: [
        "CMV ideal: 23-28%",
        "Markup típico: 3.0 a 3.5",
        "Margem líquida esperada: 12-18%",
        "Salgados têm alta margem"
      ]
    }
  },
  {
    id: "cafeteria",
    nome: "Cafeteria / Coffee Shop",
    icone: Coffee,
    cor: "brown",
    descricao: "Cafés especiais e confeitaria",
    configuracoes: {
      margem_lucro_padrao: 50,
      markup_sugerido: 3.5,
      cmv_ideal: 22, // 20-25%
      taxa_impostos: 5,
      taxa_cartao: 4,
      custo_mao_obra_hora: 19,
      observacoes: [
        "CMV ideal: 20-25%",
        "Markup típico: 3.5 a 4.5",
        "Margem líquida esperada: 15-20%",
        "Bebidas têm margem muito alta"
      ]
    }
  },
  {
    id: "padaria",
    nome: "Padaria / Panificação",
    icone: Croissant,
    cor: "amber",
    descricao: "Panificação e confeitaria tradicional",
    configuracoes: {
      margem_lucro_padrao: 35,
      markup_sugerido: 2.9,
      cmv_ideal: 30, // 28-32%
      taxa_impostos: 5,
      taxa_cartao: 4,
      custo_mao_obra_hora: 17,
      observacoes: [
        "CMV ideal: 28-32%",
        "Markup típico: 2.8 a 3.2",
        "Margem líquida esperada: 8-15%",
        "Pães artesanais têm maior margem",
        "Setor faturou R$ 153,3 bi em 2024"
      ]
    }
  }
];

export default function TemplatesNegocio({ onAplicar, configuracaoAtual }) {
  const [selecionado, setSelecionado] = React.useState(null);

  const handleAplicar = (template) => {
    if (window.confirm(`Aplicar template "${template.nome}"? Isso irá sobrescrever as configurações atuais.`)) {
      onAplicar(template.configuracoes);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Templates por Tipo de Negócio
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Valores baseados em pesquisas de mercado 2024/2025 para food service no Brasil
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES_NEGOCIO.map((template) => {
            const Icon = template.icone;
            const isAtivo = selecionado === template.id;
            
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${
                  isAtivo 
                    ? 'border-2 border-blue-500 shadow-lg' 
                    : 'hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setSelecionado(isAtivo ? null : template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${template.cor}-100`}>
                        <Icon className={`w-6 h-6 text-${template.cor}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.nome}</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">{template.descricao}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {isAtivo && (
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Margem Lucro</p>
                        <p className="font-bold text-green-700">
                          {template.configuracoes.margem_lucro_padrao}%
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Markup</p>
                        <p className="font-bold text-blue-700">
                          {template.configuracoes.markup_sugerido.toFixed(1)}x
                        </p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-xs text-gray-600">CMV Ideal</p>
                        <p className="font-bold text-orange-700">
                          {template.configuracoes.cmv_ideal}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Mão de Obra</p>
                        <p className="font-bold text-purple-700">
                          R$ {template.configuracoes.custo_mao_obra_hora}/h
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                      <p className="font-semibold text-gray-700 mb-2">📊 Benchmarks do Setor:</p>
                      {template.configuracoes.observacoes.map((obs, idx) => (
                        <p key={idx} className="text-gray-600 flex items-start gap-2">
                          <Check className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{obs}</span>
                        </p>
                      ))}
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAplicar(template);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Aplicar Template
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Como usar os templates</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Escolha o template mais próximo do seu negócio</li>
            <li>• Os valores são baseados em estudos de mercado reais</li>
            <li>• Você pode ajustar manualmente depois de aplicar</li>
            <li>• Recomendamos revisar mensalmente seus números</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📚 Fontes de Pesquisa</h4>
          <p className="text-xs text-blue-800">
            Dados compilados de: Goomer (2025), Yooga Blog (2024), 
            benchmarks de food service brasileiro e consultorias especializadas.
            Valores médios para estabelecimentos de pequeno/médio porte.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}