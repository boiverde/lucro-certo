import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  Smartphone,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WelcomeMessage({ user, hasData }) {
  if (hasData) return null; // Só mostra se não tem dados

  return (
    <Card className="mb-6 md:mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2">
              Bem-vindo ao Controle de Gastos, {user?.full_name?.split(' ')[0] || 'Usuário'}! 🎉
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              Vamos começar organizando suas finanças? Aqui estão os próximos passos:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
              <Link to={createPageUrl("Controle") + "?tab=compras"}>
                <Button variant="outline" className="w-full justify-start h-auto p-3 md:p-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-sm md:text-base font-medium">1. Registre uma Compra</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Comece adicionando suas primeiras compras de produtos
                    </p>
                  </div>
                </Button>
              </Link>

              <Link to={createPageUrl("Controle") + "?tab=vendas"}>
                <Button variant="outline" className="w-full justify-start h-auto p-3 md:p-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-sm md:text-base font-medium">2. Adicione Vendas</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Registre suas vendas para calcular os lucros
                    </p>
                  </div>
                </Button>
              </Link>

              <Link to={createPageUrl("Controle")}>
                <Button variant="outline" className="w-full justify-start h-auto p-3 md:p-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-sm md:text-base font-medium">3. Controle Gastos</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Registre gastos operacionais e pessoais
                    </p>
                  </div>
                </Button>
              </Link>
            </div>

            <div className="bg-white/70 p-2.5 md:p-3 rounded-lg border border-green-200">
              <div className="flex items-start gap-2 md:gap-3">
                <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    💡 Dica: Instale como App no seu celular!
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">
                    Para acesso mais rápido, adicione este site à tela inicial do seu celular. 
                    Funcionará como um aplicativo real!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}