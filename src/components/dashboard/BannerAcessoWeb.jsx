import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Smartphone } from "lucide-react";

export default function BannerAcessoWeb() {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Globe className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg md:text-xl mb-2">
              Acesse de Qualquer Lugar! 🌐
            </h3>
            <p className="text-sm md:text-base opacity-90 mb-3">
              Este sistema pode ser acessado pelo navegador do seu celular, tablet ou computador.
              Basta acessar o link abaixo:
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
              <code className="flex-1 text-sm md:text-base font-mono break-all">
                {window.location.origin}
              </code>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('✅ Link copiado!');
                }}
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
              >
                Copiar
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs md:text-sm opacity-90">
              <Smartphone className="w-4 h-4" />
              <span>Funciona em iPhone, Android, Windows, Mac e Linux</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}