import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  Home,
  Chrome,
  X
} from "lucide-react";

export default function InstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState('');

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      setDeviceType('ios');
    } else if (userAgent.includes('android')) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
    setShowInstructions(true);
  };

  if (!showInstructions) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={detectDevice}
          className="bg-green-600 hover:bg-green-700 shadow-lg rounded-full px-6 py-3"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Usar como App
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Instalar App
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowInstructions(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>📱 Use como um app real!</strong>
              </p>
              <p className="text-sm text-green-700">
                Instale na sua tela inicial para acesso rápido, sem navegador.
              </p>
            </div>

            {deviceType === 'ios' && (
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  iPhone/iPad - Safari
                </Badge>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Abra no Safari</p>
                      <p className="text-sm text-gray-600">Certifique-se de estar usando o Safari (não Chrome)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Toque no botão Compartilhar</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Share className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Quadrado com seta para cima</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Adicionar à Tela de Início</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Plus className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Role para baixo e encontre a opção</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Confirmar</p>
                      <p className="text-sm text-gray-600">Toque em "Adicionar" - pronto! 🎉</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {deviceType === 'android' && (
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Android - Chrome
                </Badge>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Abra no Chrome</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Chrome className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Use o navegador Chrome</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Menu do Chrome</p>
                      <p className="text-sm text-gray-600">Toque nos 3 pontinhos (⋮) no canto superior</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">"Adicionar à tela inicial"</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Home className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Ou "Instalar app"</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Confirmar instalação</p>
                      <p className="text-sm text-gray-600">Toque em "Adicionar" - pronto! 🎉</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {deviceType === 'desktop' && (
              <div className="text-center py-4">
                <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">
                  <strong>Melhor experiência no celular!</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Acesse este link no seu smartphone para instalar como app.
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                💡 Depois de instalado, o app funcionará como qualquer outro no seu celular!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}