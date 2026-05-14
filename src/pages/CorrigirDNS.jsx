import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Copy, Check } from "lucide-react";

export default function CorrigirDNSPage() {
  const [urlApp, setUrlApp] = useState("");
  const [copiedSection, setCopiedSection] = useState("");
  const urlAtual = window.location.origin;

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(""), 2000);
  };

  const extrairHost = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "";
    }
  };

  const host = urlApp ? extrairHost(urlApp) : extrairHost(urlAtual);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Urgente */}
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong className="text-lg">🚨 APP FORA DO AR - DNS_PROBE_FINISHED_NXDOMAIN</strong>
            <br />
            <p className="mt-2">O app está tentando acessar um domínio que não existe. Siga este guia passo a passo para corrigir AGORA.</p>
          </AlertDescription>
        </Alert>

        {/* Passo 1 - Identificar URL Correta */}
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">1</span>
              Identificar a URL Correta do Seu App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-gray-700">
              A URL atual desta página é:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg flex items-center justify-between">
              <code className="font-mono text-lg">{urlAtual}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(urlAtual, 'url')}
              >
                {copiedSection === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>✅ Esta é provavelmente a URL correta!</strong>
                <br />
                Copie ela e use nos próximos passos.
              </AlertDescription>
            </Alert>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Atenção:</strong> Se você configurou um domínio personalizado (tipo www.seudominio.com), use esse domínio ao invés da URL do Base44.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Passo 2 - Abrir Terminal */}
        <Card className="border-2 border-purple-500">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center">2</span>
              Abrir o Terminal/Prompt de Comando
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-gray-700 font-medium">
              Dependendo do seu sistema operacional:
            </p>
            
            <div className="space-y-3">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">🪟 Windows:</p>
                <p className="text-sm text-gray-700">Pressione <kbd className="bg-gray-300 px-2 py-1 rounded">Windows + R</kbd>, digite <code>cmd</code> e pressione Enter</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">🍎 Mac/Linux:</p>
                <p className="text-sm text-gray-700">Abra o aplicativo "Terminal" (procure por "Terminal" no Spotlight/Pesquisa)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passo 3 - Navegar até pasta TWA */}
        <Card className="border-2 border-orange-500">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center">3</span>
              Navegar até a Pasta do Projeto TWA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-gray-700">
              Digite este comando no terminal para entrar na pasta do projeto:
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Comando:</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg flex items-center justify-between">
                  <code className="font-mono">cd twa</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('cd twa', 'cd')}
                  >
                    {copiedSection === 'cd' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>💡 Dica:</strong> Se der erro "pasta não encontrada", você precisa estar na pasta onde criou o projeto TWA. Use <code>cd</code> para navegar.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Passo 4 - Editar twa_manifest.json */}
        <Card className="border-2 border-red-500">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center">4</span>
              Corrigir o Arquivo twa_manifest.json (CRÍTICO!)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert className="border-red-300 bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>🎯 ESTE É O PASSO MAIS IMPORTANTE!</strong> É aqui que vamos corrigir o erro.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Abrir o arquivo para edição:</p>
                
                <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                  <p className="text-sm text-gray-700"><strong>Opção 1 - Editor Visual (Mais Fácil):</strong></p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded flex items-center justify-between">
                    <code className="font-mono text-sm">notepad twa_manifest.json</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('notepad twa_manifest.json', 'notepad')}
                    >
                      {copiedSection === 'notepad' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">Ou use outro editor: <code>code twa_manifest.json</code> (VS Code) ou <code>nano twa_manifest.json</code> (Mac/Linux)</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <p className="font-bold text-yellow-900 mb-3">📝 O que você vai ver e editar:</p>
                <p className="text-sm text-yellow-900 mb-2">Procure esta linha no arquivo:</p>
                <div className="bg-white p-3 rounded border border-yellow-300 mb-3">
                  <code className="text-red-600">"host": "localhost:3333https"</code>
                  <p className="text-xs text-gray-600 mt-1">☝️ Este é o domínio ERRADO que está causando o problema!</p>
                </div>

                <p className="font-semibold text-yellow-900 mb-2">Substitua por:</p>
                <div className="bg-white p-3 rounded border border-green-500">
                  <code className="text-green-600">"host": "{host}"</code>
                  <p className="text-xs text-gray-600 mt-1">✅ Este é o domínio CORRETO!</p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900">
                  <strong>Resumo:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Abra o arquivo twa_manifest.json</li>
                    <li>Procure a linha com <code>"host":</code></li>
                    <li>Troque o valor para: <code>"{host}"</code></li>
                    <li>Salve o arquivo (Ctrl+S ou Cmd+S)</li>
                    <li>Feche o editor</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Passo 5 - Atualizar e Rebuildar */}
        <Card className="border-2 border-green-500">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">5</span>
              Atualizar o Projeto e Fazer Novo Build
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-gray-700">Execute estes comandos EM ORDEM no terminal:</p>
            
            {[
              {
                titulo: "5.1 - Atualizar configuração do Bubblewrap",
                comando: "bubblewrap update",
                desc: "Isso vai aplicar as mudanças que você fez no twa_manifest.json"
              },
              {
                titulo: "5.2 - Incrementar Version Code",
                comando: `# Edite o arquivo: app/build.gradle
# Procure: versionCode = X
# Mude para: versionCode = ${new Date().getFullYear() + 100} (ou qualquer número maior que o atual)`,
                desc: "A Play Store exige um número de versão maior a cada atualização"
              },
              {
                titulo: "5.3 - Fazer novo Build",
                comando: "bubblewrap build",
                desc: "Gera o APK atualizado para testar"
              },
              {
                titulo: "5.4 - Gerar AAB para Play Store",
                comando: "./gradlew bundleRelease",
                desc: "Cria o arquivo .aab para upload na Play Store (Windows: gradlew.bat bundleRelease)"
              }
            ].map((cmd, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{cmd.titulo}</h4>
                    <p className="text-sm text-gray-600">{cmd.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(cmd.comando, `cmd${idx}`)}
                  >
                    {copiedSection === `cmd${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto text-sm">
                  {cmd.comando}
                </pre>
              </div>
            ))}

            <Alert className="bg-orange-50 border-orange-200">
              <AlertDescription className="text-orange-900">
                <strong>⏱️ Atenção:</strong> O comando <code>bundleRelease</code> pode demorar 2-5 minutos. É normal! Aguarde até terminar.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Passo 6 - Testar Localmente */}
        <Card className="border-2 border-indigo-500">
          <CardHeader className="bg-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center">6</span>
              Testar o APK ANTES de Publicar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong>🚨 CRUCIAL:</strong> Teste o APK em um celular Android ANTES de publicar na Play Store!
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Localizar o APK gerado:</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded">
                  <code className="text-sm">twa/app/build/outputs/apk/release/app-release-unsigned.apk</code>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">Como instalar no celular:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Envie o arquivo APK para o seu celular (por email, WhatsApp, etc)</li>
                  <li>No celular, vá em Configurações → Segurança → Ativar "Fontes desconhecidas"</li>
                  <li>Abra o arquivo APK no celular e clique em "Instalar"</li>
                  <li><strong>Abra o app e TESTE se funciona corretamente!</strong></li>
                </ol>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <strong>✅ Se o app abrir normalmente e você conseguir usar:</strong> SUCESSO! Pode seguir para o próximo passo.
                </AlertDescription>
              </Alert>

              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900">
                  <strong>❌ Se ainda der erro:</strong> Volte ao Passo 4 e verifique se colocou a URL correta no twa_manifest.json
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Passo 7 - Publicar na Play Store */}
        <Card className="border-2 border-pink-500">
          <CardHeader className="bg-pink-50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center">7</span>
              Publicar Atualização na Play Store
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-gray-700 font-medium">Agora que você testou e funcionou, vamos atualizar o app na loja:</p>
            
            <div className="space-y-3">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">7.1 - Localizar o arquivo AAB:</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded">
                  <code className="text-sm">twa/app/build/outputs/bundle/release/app-release.aab</code>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">7.2 - Upload na Play Store:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Acesse <a href="https://play.google.com/console" target="_blank" className="underline font-semibold">Google Play Console</a></li>
                  <li>Selecione seu app "Lucro Certo"</li>
                  <li>Clique em "Produção" (ou "Production") no menu lateral</li>
                  <li>Clique em "Criar nova versão" ou "Create new release"</li>
                  <li>Faça upload do arquivo <code>.aab</code></li>
                  <li>Adicione nota da versão: "Correção urgente - problema de conexão resolvido"</li>
                  <li>Clique em "Revisar versão" → "Iniciar lançamento para produção"</li>
                </ol>
              </div>

              <Alert className="bg-purple-50 border-purple-200">
                <AlertDescription className="text-purple-900">
                  <strong>⏰ Tempo de aprovação:</strong> Normalmente de 1 a 3 horas, mas pode levar até 24h. Os usuários receberão a atualização automaticamente.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="border-4 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 text-xl">✅ Checklist Final - Você Deve Ter Feito:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "✅ Identificado a URL correta do app",
                "✅ Editado o arquivo twa_manifest.json com a URL correta",
                "✅ Executado bubblewrap update",
                "✅ Incrementado o versionCode no build.gradle",
                "✅ Executado bubblewrap build",
                "✅ Executado ./gradlew bundleRelease",
                "✅ Testado o APK no celular e funcionou",
                "✅ Feito upload do .aab na Play Store",
                "✅ Iniciado o lançamento da nova versão"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded">
                  <span className="text-green-600 font-bold">{item}</span>
                </div>
              ))}
            </div>

            <Alert className="mt-6 bg-green-100 border-green-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong className="text-lg">🎉 PARABÉNS!</strong>
                <br />
                Se você completou todos os passos acima, o problema está resolvido! Os usuários receberão a atualização em breve.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* SOS */}
        <Card className="border-2 border-red-500">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-900">🆘 Ainda com problema?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">Se após seguir todos os passos o problema persistir:</p>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>1.</strong> Verifique se o domínio no twa_manifest.json está EXATAMENTE como: <code className="bg-yellow-200 px-2 py-1 rounded">{host}</code></p>
              <p><strong>2.</strong> Confirme que o versionCode foi incrementado (deve ser maior que a versão anterior)</p>
              <p><strong>3.</strong> Teste novamente o APK em um celular para confirmar que funciona</p>
              <p><strong>4.</strong> Aguarde algumas horas após o upload - a Play Store pode demorar para processar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}