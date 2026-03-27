import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Download, 
  Globe, 
  Smartphone, 
  Upload,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

export default function GuiaPublicacao() {
  const [etapaConcluida, setEtapaConcluida] = useState({});
  const [copiado, setCopiado] = useState(null);

  const toggleEtapa = (id) => {
    setEtapaConcluida(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copiarTexto = (texto, id) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const etapas = [
    {
      id: "preparacao",
      titulo: "1. Preparação Inicial",
      icone: <Globe className="w-6 h-6" />,
      cor: "blue",
      passos: [
        {
          titulo: "Verificar funcionamento",
          descricao: "Teste todas as funcionalidades do app em diferentes dispositivos",
          detalhes: [
            "✓ Testar em Chrome (Android)",
            "✓ Testar em Safari (iOS)", 
            "✓ Verificar responsividade",
            "✓ Testar modo offline (se aplicável)"
          ]
        },
        {
          titulo: "Preparar domínio",
          descricao: "Seu app precisa estar em um domínio HTTPS",
          detalhes: [
            "Base44 já fornece domínio HTTPS automático",
            "Domínio padrão: seu-app.base44.app",
            "Você pode usar domínio próprio (opcional)"
          ]
        }
      ]
    },
    {
      id: "assets",
      titulo: "2. Criar Assets (Ícones e Screenshots)",
      icone: <Download className="w-6 h-6" />,
      cor: "purple",
      passos: [
        {
          titulo: "Ícone do aplicativo",
          descricao: "Criar ícone em diferentes tamanhos",
          detalhes: [
            "192x192px - Ícone principal",
            "512x512px - Ícone de alta resolução",
            "Formato PNG com fundo",
            "Use ferramentas como Canva ou Figma"
          ],
          link: "https://www.canva.com",
          linkTexto: "Abrir Canva"
        },
        {
          titulo: "Screenshots",
          descricao: "Tirar capturas de tela do app",
          detalhes: [
            "Tire 4-8 screenshots das principais telas",
            "Tamanho recomendado: 1080x1920px (mobile)",
            "Mostre as funcionalidades principais",
            "Use o DevTools do Chrome (F12) para simular mobile"
          ]
        },
        {
          titulo: "Feature Graphic (Play Store)",
          descricao: "Banner promocional da loja",
          detalhes: [
            "Tamanho: 1024x500px",
            "Deve conter nome do app e visual atraente",
            "Sem texto muito pequeno (fica ilegível)",
            "Use cores chamativas"
          ]
        }
      ]
    },
    {
      id: "manifest",
      titulo: "3. Configurar Manifest e PWA",
      icone: <Smartphone className="w-6 h-6" />,
      cor: "green",
      passos: [
        {
          titulo: "Manifest.json já está configurado",
          descricao: "Verifique as configurações atuais",
          codigo: `{
  "name": "Lucro Certo",
  "short_name": "Lucro Certo",
  "description": "Gestão completa do seu negócio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`
        },
        {
          titulo: "Upload dos ícones",
          descricao: "Fazer upload dos arquivos icon-192.png e icon-512.png",
          detalhes: [
            "Acesse Dashboard > Arquivos",
            "Faça upload de icon-192.png",
            "Faça upload de icon-512.png",
            "Os ícones devem estar na raiz do projeto"
          ]
        }
      ]
    },
    {
      id: "pwa",
      titulo: "4. Publicar como PWA (Web)",
      icone: <Globe className="w-6 h-6" />,
      cor: "orange",
      passos: [
        {
          titulo: "App já está pronto para PWA!",
          descricao: "Seu app já pode ser instalado diretamente do navegador",
          detalhes: [
            "✓ No Chrome Android: Menu > Instalar app",
            "✓ No Safari iOS: Compartilhar > Adicionar à Tela Inicial",
            "✓ Funciona offline automaticamente",
            "✓ Aparece na tela inicial como app nativo"
          ]
        },
        {
          titulo: "Compartilhar o link",
          descricao: "Envie o link do app para usuários instalarem",
          link: window.location.origin,
          linkTexto: "Link do seu app",
          copiavel: true
        }
      ]
    },
    {
      id: "playstore",
      titulo: "5. Publicar na Google Play Store (Opcional)",
      icone: <Upload className="w-6 h-6" />,
      cor: "red",
      passos: [
        {
          titulo: "Criar conta de desenvolvedor",
          descricao: "Taxa única de $25 USD",
          detalhes: [
            "Acesse console.play.google.com",
            "Crie uma conta de desenvolvedor",
            "Pague a taxa de registro ($25)",
            "Aguarde aprovação (1-2 dias)"
          ],
          link: "https://play.google.com/console",
          linkTexto: "Abrir Play Console"
        },
        {
          titulo: "Usar Bubblewrap (TWA)",
          descricao: "Converter PWA em APK para Play Store",
          detalhes: [
            "Instalar Node.js no seu computador",
            "Instalar Bubblewrap via npm",
            "Gerar APK do seu PWA",
            "Assinar o APK com chave"
          ],
          codigo: `# Instalar Bubblewrap
npm i -g @bubblewrap/cli

# Inicializar projeto
bubblewrap init --manifest=${window.location.origin}/manifest.json

# Gerar APK
bubblewrap build

# APK estará em app/build/outputs/`
        },
        {
          titulo: "Alternativa: PWABuilder",
          descricao: "Ferramenta online mais simples",
          detalhes: [
            "1. Acesse pwabuilder.com",
            "2. Cole o URL do seu app",
            "3. Clique em 'Package For Stores'",
            "4. Escolha 'Google Play'",
            "5. Baixe o pacote gerado",
            "6. Faça upload na Play Console"
          ],
          link: "https://www.pwabuilder.com",
          linkTexto: "Abrir PWABuilder"
        },
        {
          titulo: "Criar ficha na Play Store",
          descricao: "Preencher informações do app",
          detalhes: [
            "Nome do aplicativo",
            "Descrição curta e completa",
            "Screenshots (mínimo 2)",
            "Feature graphic (1024x500px)",
            "Ícone (512x512px)",
            "Categoria do app",
            "Classificação de conteúdo",
            "Upload do APK/AAB"
          ]
        },
        {
          titulo: "Revisar e publicar",
          descricao: "Enviar para revisão do Google",
          detalhes: [
            "Revisar todas as informações",
            "Aceitar termos e políticas",
            "Enviar para revisão",
            "Aguardar aprovação (1-7 dias)",
            "App ficará disponível na Play Store"
          ]
        }
      ]
    },
    {
      id: "marketing",
      titulo: "6. Divulgação e Marketing",
      icone: <ExternalLink className="w-6 h-6" />,
      cor: "pink",
      passos: [
        {
          titulo: "Criar materiais de divulgação",
          descricao: "Prepare conteúdo para divulgar",
          detalhes: [
            "Crie posts para redes sociais",
            "Grave vídeo demonstrativo",
            "Prepare textos explicativos",
            "Monte apresentação do app"
          ]
        },
        {
          titulo: "Estratégias de divulgação",
          descricao: "Como promover seu app",
          detalhes: [
            "Compartilhe em grupos do WhatsApp",
            "Poste em redes sociais (Instagram, Facebook)",
            "Envie para clientes via email/SMS",
            "Peça avaliações de usuários",
            "Ofereça período de teste grátis"
          ]
        }
      ]
    }
  ];

  const getCorBadge = (cor) => {
    const cores = {
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      green: "bg-green-100 text-green-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
      pink: "bg-pink-100 text-pink-800"
    };
    return cores[cor] || cores.blue;
  };

  const progressoTotal = () => {
    const total = etapas.length;
    const concluidas = Object.values(etapaConcluida).filter(Boolean).length;
    return Math.round((concluidas / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            📱 Guia de Publicação
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Passo a passo completo para publicar seu aplicativo
          </p>
          
          {/* Barra de progresso */}
          <div className="bg-white rounded-full p-1 shadow-sm max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2 px-3">
              <span className="text-sm font-medium text-gray-600">Seu progresso</span>
              <span className="text-sm font-bold text-green-600">{progressoTotal()}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressoTotal()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Etapas */}
        <div className="space-y-6">
          {etapas.map((etapa) => (
            <Card key={etapa.id} className="shadow-lg overflow-hidden">
              <CardHeader 
                className={`cursor-pointer ${etapaConcluida[etapa.id] ? 'bg-green-50' : 'bg-white'} border-b`}
                onClick={() => toggleEtapa(etapa.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getCorBadge(etapa.cor)}`}>
                      {etapa.icone}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{etapa.titulo}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {etapa.passos.length} passo{etapa.passos.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {etapaConcluida[etapa.id] ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <Circle className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-6">
                  {etapa.passos.map((passo, idx) => (
                    <div key={idx} className="border-l-4 border-gray-200 pl-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {passo.titulo}
                      </h3>
                      <p className="text-gray-600 mb-3">{passo.descricao}</p>

                      {passo.detalhes && (
                        <ul className="space-y-2 mb-3">
                          {passo.detalhes.map((detalhe, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{detalhe}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {passo.codigo && (
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-3">
                          <pre>{passo.codigo}</pre>
                        </div>
                      )}

                      {passo.link && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(passo.link, '_blank')}
                            className="gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {passo.linkTexto}
                          </Button>
                          {passo.copiavel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copiarTexto(passo.link, `link-${idx}`)}
                              className="gap-2"
                            >
                              {copiado === `link-${idx}` ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copiar
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Pronto para publicar?
            </h3>
            <p className="text-gray-600 mb-4">
              Seu app está configurado como PWA e pronto para ser compartilhado!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => copiarTexto(window.location.origin, 'link-app')}
              >
                {copiado === 'link-app' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link do App
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://www.pwabuilder.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir PWABuilder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dicas importantes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas Importantes</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• A publicação como PWA é gratuita e imediata</li>
            <li>• Play Store cobra $25 uma única vez</li>
            <li>• Teste bem antes de publicar</li>
            <li>• Peça feedback dos primeiros usuários</li>
            <li>• Atualize o app regularmente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}