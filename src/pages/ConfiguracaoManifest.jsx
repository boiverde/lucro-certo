import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ConfiguracaoManifestPage() {
  const [copiedSection, setCopiedSection] = useState("");

  const manifestJson = {
    name: "Lucro Certo - Gestão Financeira Completa",
    short_name: "Lucro Certo",
    description: "App completo para gestão financeira do seu negócio: controle de compras, vendas, estoque, funcionários, revendas (Natura, Boticário, etc), clientes, gastos operacionais e pessoais, com relatórios detalhados e modo offline.",
    version: "4.0.0",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    lang: "pt-BR",
    dir: "ltr",
    icons: [
      { src: "/icon-72.png", sizes: "72x72", type: "image/png", purpose: "any maskable" },
      { src: "/icon-96.png", sizes: "96x96", type: "image/png", purpose: "any maskable" },
      { src: "/icon-128.png", sizes: "128x128", type: "image/png", purpose: "any maskable" },
      { src: "/icon-144.png", sizes: "144x144", type: "image/png", purpose: "any maskable" },
      { src: "/icon-152.png", sizes: "152x152", type: "image/png", purpose: "any maskable" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Ver visão geral do negócio",
        url: "/Dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Controle",
        short_name: "Controle",
        description: "Compras, Vendas, Estoque e Funcionários",
        url: "/Controle",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Revendas",
        short_name: "Revendas",
        description: "Comissões e pagamentos de revendas",
        url: "/Revendas",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Relatórios",
        short_name: "Relatórios",
        description: "Ver relatórios financeiros",
        url: "/Relatorios",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      }
    ],
    categories: ["business", "finance", "productivity"],
    prefer_related_applications: false
  };

  const assetsSW = `// Service Worker para PWA - Salve como service-worker.js na raiz
const CACHE_NAME = 'lucro-certo-v4';
const urlsToCache = [
  '/',
  '/Dashboard',
  '/Controle',
  '/Revendas',
  '/Clientes',
  '/Gastos',
  '/Pessoais',
  '/Relatorios'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(""), 2000);
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Comandos Bubblewrap
  const comandos = [
    {
      titulo: "1. Instalar/Atualizar Bubblewrap",
      comando: `npm install -g @bubblewrap/cli`,
      descricao: "Garanta que tem a versão mais recente"
    },
    {
      titulo: "2. Atualizar Projeto TWA (Se já existe)",
      comando: `cd twa
bubblewrap update --manifest ${window.location.origin}/manifest.json`,
      descricao: "Atualiza o projeto com as novas configurações"
    },
    {
      titulo: "3. OU Inicializar Projeto Novo",
      comando: `bubblewrap init --manifest ${window.location.origin}/manifest.json`,
      descricao: "Use este comando se ainda não criou o projeto TWA"
    },
    {
      titulo: "4. Build do APK/AAB",
      comando: `cd twa
bubblewrap build`,
      descricao: "Gera o APK e AAB atualizados"
    },
    {
      titulo: "5. Gerar AAB Release (Play Store)",
      comando: `cd twa
./gradlew bundleRelease`,
      descricao: "Cria o arquivo .aab para upload na Play Store"
    },
    {
      titulo: "6. Localizar Arquivos Gerados",
      comando: `# APK (para testes):
twa/app/build/outputs/apk/release/app-release-unsigned.apk

# AAB (para Play Store):
twa/app/build/outputs/bundle/release/app-release.aab`,
      descricao: "Arquivos prontos para distribuição"
    },
    {
      titulo: "7. Incrementar Version Code (Play Store)",
      comando: `# Edite: twa/app/build.gradle
# Encontre: versionCode = 3 (ou sua versão atual)
# Altere para: versionCode = 4
# E: versionName = "4.0.0"`,
      descricao: "IMPORTANTE: Incremente antes de fazer upload!"
    }
  ];

  const checksPrePublicacao = [
    { item: "✅ manifest.json atualizado (v4.0.0)", ok: true },
    { item: "✅ Descrição inclui todas as features novas", ok: true },
    { item: "✅ Shortcuts atualizados (Dashboard, Controle, Revendas)", ok: true },
    { item: "✅ Service Worker com cache atualizado", ok: true },
    { item: "Ícones em todos os tamanhos (72px a 512px)", ok: false, acao: "Verifique se estão na pasta public/" },
    { item: "Screenshots atualizados com novas telas", ok: false, acao: "Tire prints: Estoque, Funcionários, Revendas" },
    { item: "Version Code incrementado", ok: false, acao: "Edite twa/app/build.gradle" },
    { item: "Testado em dispositivo Android", ok: false, acao: "Instale o APK e teste" }
  ];

  const novidades = [
    { feature: "📦 Estoque", desc: "Controle completo de produtos, entradas, saídas e alertas" },
    { feature: "👥 Funcionários", desc: "Gestão de diárias, passagens e alimentação" },
    { feature: "📱 Modo Offline", desc: "Registre vendas e compras sem internet" },
    { feature: "🔔 Notificações Push", desc: "Alertas de estoque baixo" },
    { feature: "📸 Leitor de Código", desc: "Escaneie produtos com a câmera" },
    { feature: "🏪 Revendas", desc: "Gerenciamento completo de revendas (Natura, etc)" },
    { feature: "📊 Calendário", desc: "Visualize pagamentos de revendas" },
    { feature: "💰 Controle de Comissões", desc: "Acompanhe o que receberá" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Update v4.0.0 - Pronto para Build
          </h1>
          <p className="text-gray-600">
            Manifest atualizado com TODAS as novas funcionalidades!
          </p>
        </div>

        {/* Novidades desta Versão */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✨ Novidades da Versão 4.0.0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {novidades.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">{item.feature.split(' ')[0]}</span>
                  <div>
                    <p className="font-medium text-gray-900">{item.feature.substring(3)}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Importante */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>IMPORTANTE:</strong> Se você já publicou a v3.0.0 na Play Store, você PRECISA:
            <br />
            1. Incrementar o <code className="bg-orange-200 px-2 py-1 rounded">versionCode</code> no build.gradle (use 4 ou superior)
            <br />
            2. Atualizar o <code className="bg-orange-200 px-2 py-1 rounded">versionName</code> para "4.0.0"
            <br />
            3. Fazer novo build e enviar como atualização
          </AlertDescription>
        </Alert>

        {/* Manifest.json */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📄 manifest.json ATUALIZADO (v4.0.0)</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(manifestJson, null, 2), 'manifest')}
                >
                  {copiedSection === 'manifest' ? (
                    <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadFile(JSON.stringify(manifestJson, null, 2), 'manifest.json')}
                >
                  <Download className="w-4 h-4 mr-2" /> Baixar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
              {JSON.stringify(manifestJson, null, 2)}
            </pre>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Mudanças principais:</strong>
                <br />• Version: 4.0.0
                <br />• Descrição completa com todas as features
                <br />• Shortcuts atualizados (Dashboard, Controle, Revendas)
                <br />• Cache name atualizado (v4)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Worker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>⚙️ Service Worker Atualizado</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(assetsSW, 'sw')}
              >
                {copiedSection === 'sw' ? (
                  <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-80">
              {assetsSW}
            </pre>
          </CardContent>
        </Card>

        {/* Comandos Bubblewrap */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Comandos para Atualizar e Buildar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comandos.map((cmd, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{cmd.titulo}</h3>
                    <p className="text-sm text-gray-600">{cmd.descricao}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(cmd.comando, `cmd-${idx}`)}
                  >
                    {copiedSection === `cmd-${idx}` ? (
                      <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                    )}
                  </Button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto text-sm">
                  {cmd.comando}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Checklist de Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checksPrePublicacao.map((check, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      check.ok ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {check.ok ? '✓' : '○'}
                    </div>
                    <span className={check.ok ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                      {check.item}
                    </span>
                  </div>
                  {!check.ok && check.acao && (
                    <span className="text-sm text-blue-600">{check.acao}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guia Rápido */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>🎯 Guia Rápido - Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2">1️⃣ Antes de Buildar:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>Copie o manifest.json e substitua o antigo</li>
                  <li>Tire screenshots das novas telas (Estoque, Funcionários, Revendas)</li>
                  <li>Verifique se todos os ícones estão na pasta public/</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">2️⃣ Fazer o Build:</h4>
                <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                  <li>Execute os comandos Bubblewrap em ordem</li>
                  <li>Edite o versionCode no build.gradle (use 4)</li>
                  <li>Altere versionName para "4.0.0"</li>
                  <li>Execute ./gradlew bundleRelease</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">3️⃣ Testar:</h4>
                <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                  <li>Instale o APK em um dispositivo Android</li>
                  <li>Teste todas as novas funcionalidades</li>
                  <li>Verifique o modo offline</li>
                  <li>Teste as notificações de estoque</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-bold text-orange-900 mb-2">4️⃣ Publicar:</h4>
                <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                  <li>Acesse Google Play Console</li>
                  <li>Faça upload do .aab</li>
                  <li>Atualize as screenshots</li>
                  <li>Adicione changelog: "Nova versão com estoque, funcionários e modo offline"</li>
                  <li>Envie para revisão!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changelog Sugerido */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Changelog para Play Store</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-800 whitespace-pre-line">
{`🎉 VERSÃO 4.0.0 - GRANDE ATUALIZAÇÃO!

✨ Novidades:
📦 Gestão de Estoque
   • Controle completo de produtos
   • Alertas de estoque baixo
   • Leitor de código de barras
   
👥 Funcionários
   • Registro de diárias
   • Controle de passagens e alimentação
   
📱 Modo Offline
   • Funciona sem internet
   • Sincronização automática
   
🔔 Notificações Push
   • Alertas inteligentes
   
🏪 Melhorias em Revendas
   • Calendário de pagamentos
   • Controle de comissões

🐛 Correções e melhorias de performance`}
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => copyToClipboard(`🎉 VERSÃO 4.0.0 - GRANDE ATUALIZAÇÃO!

✨ Novidades:
📦 Gestão de Estoque
   • Controle completo de produtos
   • Alertas de estoque baixo
   • Leitor de código de barras
   
👥 Funcionários
   • Registro de diárias
   • Controle de passagens e alimentação
   
📱 Modo Offline
   • Funciona sem internet
   • Sincronização automática
   
🔔 Notificações Push
   • Alertas inteligentes
   
🏪 Melhorias em Revendas
   • Calendário de pagamentos
   • Controle de comissões

🐛 Correções e melhorias de performance`, 'changelog')}
              >
                {copiedSection === 'changelog' ? (
                  <><Check className="w-4 h-4 mr-2" /> Changelog Copiado!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copiar Changelog</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 h-14"
            onClick={() => window.open('/GuiaPlayStore', '_blank')}
          >
            📖 Ver Guia Completo
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-14"
            onClick={() => window.open('/MarketingAssets', '_blank')}
          >
            🎨 Assets de Marketing
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-14"
            onClick={() => window.open('https://play.google.com/console', '_blank')}
          >
            🚀 Play Console
          </Button>
        </div>
      </div>
    </div>
  );
}