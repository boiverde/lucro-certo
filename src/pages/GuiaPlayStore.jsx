import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  Download, 
  Smartphone, 
  Code, 
  Upload,
  AlertCircle,
  ExternalLink,
  Copy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GuiaPlayStore() {
  const [copiado, setCopiado] = React.useState(null);

  const copiarComando = (comando, id) => {
    navigator.clipboard.writeText(comando);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const passos = [
    {
      numero: 1,
      titulo: "Instalar Node.js e Bubblewrap",
      comandos: [
        { id: "node", texto: "# Verificar se tem Node.js instalado\nnode --version" },
        { id: "bubblewrap", texto: "# Instalar Bubblewrap CLI\nnpm install -g @bubblewrap/cli" }
      ],
      descricao: "Você precisa ter Node.js instalado (versão 14 ou superior)."
    },
    {
      numero: 2,
      titulo: "Inicializar o Projeto TWA",
      comandos: [
        { id: "init", texto: "# Criar pasta para o projeto\nmkdir lucro-certo-apk\ncd lucro-certo-apk\n\n# Inicializar Bubblewrap\nbubblewrap init --manifest https://seu-dominio.com.br/manifest.json" }
      ],
      descricao: "Substitua 'seu-dominio.com.br' pela URL real do seu app Lucro Certo."
    },
    {
      numero: 3,
      titulo: "Configurar o Projeto",
      info: [
        "Durante o init, você será perguntado sobre:",
        "• Nome do aplicativo: Lucro Certo",
        "• Package name: com.lucrocerto.app (ou seu domínio)",
        "• Host do app: URL do seu app no Lucro Certo",
        "• Nome para exibição: Lucro Certo",
        "• Cor do tema: #16a34a (verde)",
        "• Ícone: baixar de /icon-512.png",
        "• Cor de fundo: #ffffff"
      ]
    },
    {
      numero: 4,
      titulo: "Gerar a Keystore (Certificado)",
      comandos: [
        { 
          id: "keystore", 
          texto: "# Gerar keystore para assinar o APK\nkeytool -genkey -v -keystore lucro-certo.keystore -alias lucrocerto -keyalg RSA -keysize 2048 -validity 10000" 
        }
      ],
      descricao: "⚠️ IMPORTANTE: Guarde a senha em local seguro! Você precisará dela sempre que atualizar o app.",
      alert: true
    },
    {
      numero: 5,
      titulo: "Build do APK",
      comandos: [
        { id: "build", texto: "# Gerar o APK assinado\nbubblewrap build" }
      ],
      descricao: "O APK será gerado na pasta app-release-signed.apk"
    },
    {
      numero: 6,
      titulo: "Criar Conta no Google Play Console",
      info: [
        "1. Acesse: https://play.google.com/console",
        "2. Pague a taxa única de US$ 25",
        "3. Preencha os dados da sua conta de desenvolvedor",
        "4. Aguarde aprovação (pode levar alguns dias)"
      ]
    },
    {
      numero: 7,
      titulo: "Preparar Assets da Play Store",
      info: [
        "Você precisará de:",
        "• Ícone do app: 512x512 px (PNG)",
        "• Feature Graphic: 1024x500 px",
        "• Screenshots: mínimo 2, máximo 8 (entre 320-3840 px)",
        "• Descrição curta (80 caracteres)",
        "• Descrição completa (4000 caracteres)",
        "• Categoria: Negócios ou Finanças"
      ]
    },
    {
      numero: 8,
      titulo: "Criar Novo App na Play Console",
      info: [
        "1. Clique em 'Criar app'",
        "2. Preencha nome, idioma padrão, tipo (app/jogo)",
        "3. Selecione se é gratuito ou pago",
        "4. Aceite as políticas"
      ]
    },
    {
      numero: 9,
      titulo: "Upload do APK/AAB",
      comandos: [
        { id: "aab", texto: "# (Opcional) Gerar AAB em vez de APK\nbubblewrap build --packageFormat=bundle" }
      ],
      info: [
        "1. Vá em 'Produção' → 'Criar nova versão'",
        "2. Faça upload do arquivo APK ou AAB",
        "3. Preencha as notas da versão",
        "4. Google Play recomenda AAB (Android App Bundle)"
      ]
    },
    {
      numero: 10,
      titulo: "Preencher Informações da Loja",
      info: [
        "Configure todas as seções obrigatórias:",
        "• Conteúdo do app",
        "• Público-alvo e conteúdo",
        "• Política de privacidade (URL obrigatória)",
        "• Dados de segurança",
        "• Classificação de conteúdo"
      ]
    },
    {
      numero: 11,
      titulo: "Enviar para Revisão",
      info: [
        "1. Revise todas as informações",
        "2. Clique em 'Enviar para revisão'",
        "3. Aguarde análise (pode levar de 3-7 dias)",
        "4. Após aprovação, seu app estará na Play Store!"
      ]
    }
  ];

  const requisitos = [
    "✅ PWA funcionando corretamente (já temos!)",
    "✅ manifest.json configurado (já temos!)",
    "✅ Ícones 192x192 e 512x512 (já temos!)",
    "✅ HTTPS ativo (Lucro Certo já fornece)",
    "✅ Service Worker opcional",
    "🔧 Node.js instalado no seu computador",
    "🔧 JDK 8+ instalado",
    "🔧 Android SDK (ou Android Studio)",
    "💰 Taxa de US$ 25 para conta de desenvolvedor"
  ];

  const comandosRapidos = [
    { label: "Instalar Bubblewrap", cmd: "npm install -g @bubblewrap/cli" },
    { label: "Inicializar Projeto", cmd: "bubblewrap init --manifest https://seu-dominio.com.br/manifest.json" },
    { label: "Gerar Keystore", cmd: "keytool -genkey -v -keystore lucro-certo.keystore -alias lucrocerto -keyalg RSA -keysize 2048 -validity 10000" },
    { label: "Build APK", cmd: "bubblewrap build" },
    { label: "Build AAB", cmd: "bubblewrap build --packageFormat=bundle" }
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publicar na Play Store</h1>
              <p className="text-gray-500">Guia completo usando Bubblewrap (TWA)</p>
            </div>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>TWA (Trusted Web Activity):</strong> Converte seu PWA em um app Android nativo que pode ser publicado na Play Store. O app abrirá seu site dentro de uma webview otimizada.
            </AlertDescription>
          </Alert>
        </div>

        {/* Requisitos */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Requisitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requisitos.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-lg">{req.charAt(0)}</span>
                  <span className="text-sm">{req.slice(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comandos Rápidos */}
        <Card className="mb-6 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
              Comandos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comandosRapidos.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copiarComando(item.cmd, `quick-${idx}`)}
                      className="h-8"
                    >
                      {copiado === `quick-${idx}` ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <code className="text-xs bg-gray-900 text-green-400 p-2 rounded block overflow-x-auto">
                    {item.cmd}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Passo a Passo */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Passo a Passo Completo
          </h2>

          {passos.map((passo) => (
            <Card key={passo.numero} className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Passo {passo.numero}
                  </Badge>
                  <CardTitle className="text-xl">{passo.titulo}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {passo.comandos && (
                  <div className="space-y-3 mb-4">
                    {passo.comandos.map((cmd) => (
                      <div key={cmd.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Comando:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarComando(cmd.texto, cmd.id)}
                          >
                            {copiado === cmd.id ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                        <code className="text-sm bg-gray-900 text-green-400 p-3 rounded block overflow-x-auto whitespace-pre">
                          {cmd.texto}
                        </code>
                      </div>
                    ))}
                  </div>
                )}

                {passo.info && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {passo.info.map((info, idx) => (
                      <p key={idx} className="text-sm text-blue-900 mb-2 last:mb-0">
                        {info}
                      </p>
                    ))}
                  </div>
                )}

                {passo.descricao && (
                  <Alert className={passo.alert ? "bg-orange-50 border-orange-200" : ""}>
                    <AlertDescription className={passo.alert ? "text-orange-900" : ""}>
                      {passo.descricao}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Links Úteis */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Links Úteis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://github.com/GoogleChromeLabs/bubblewrap"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Bubblewrap GitHub</p>
                  <p className="text-xs text-gray-500">Documentação oficial</p>
                </div>
              </a>

              <a
                href="https://play.google.com/console"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Google Play Console</p>
                  <p className="text-xs text-gray-500">Publicar apps</p>
                </div>
              </a>

              <a
                href="https://developer.android.com/studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Android Studio</p>
                  <p className="text-xs text-gray-500">SDK e ferramentas</p>
                </div>
              </a>

              <a
                href="https://www.oracle.com/java/technologies/downloads/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Java JDK</p>
                  <p className="text-xs text-gray-500">Download JDK 8+</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Dicas Finais */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              Dicas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Guarde a keystore:</strong> Sem ela, você não consegue atualizar o app!</li>
              <li>• <strong>URL fixa:</strong> Use um domínio personalizado no Lucro Certo se possível</li>
              <li>• <strong>Política de privacidade:</strong> É obrigatória na Play Store</li>
              <li>• <strong>Atualizações:</strong> Use o mesmo comando de build para novas versões</li>
              <li>• <strong>Teste primeiro:</strong> Instale o APK no seu celular antes de enviar</li>
              <li>• <strong>AAB é melhor:</strong> Google Play prefere AAB em vez de APK</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}