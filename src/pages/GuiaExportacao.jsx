import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  Copy, 
  ExternalLink, 
  Download,
  Server,
  Globe,
  Smartphone,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GuiaExportacaoPage() {
  const [etapaConcluida, setEtapaConcluida] = useState({});
  const [copiado, setCopiado] = useState("");

  const copiarTexto = (texto, id) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(""), 2000);
  };

  const toggleEtapa = (etapa) => {
    setEtapaConcluida(prev => ({...prev, [etapa]: !prev[etapa]}));
  };

  const etapas = [
    {
      id: 1,
      titulo: "Assinar Plano Builder",
      icone: DollarSign,
      cor: "blue",
      descricao: "Faça upgrade para o plano Builder do Lucro Certo",
      passos: [
        "Acesse o dashboard do Lucro Certo",
        "Vá em Settings → Billing",
        "Selecione o plano Builder ($50/mês)",
        "Complete o pagamento"
      ],
      link: "https://lucro-certolucro-certo-web.onrender.com/pricing",
      linkTexto: "Ver Planos"
    },
    {
      id: 2,
      titulo: "Exportar o Código",
      icone: Download,
      cor: "purple",
      descricao: "Baixe o código-fonte do seu app",
      passos: [
        "No dashboard do Lucro Certo, vá no seu app",
        "Clique em Settings → Export",
        "Baixe o arquivo ZIP com o código",
        "Extraia o ZIP em uma pasta no seu computador"
      ]
    },
    {
      id: 3,
      titulo: "Comprar Domínio",
      icone: Globe,
      cor: "green",
      descricao: "Registre um domínio para seu app",
      passos: [
        "Acesse Registro.br ou HostGator",
        "Busque por um domínio (ex: lucrocerto.com.br)",
        "Complete a compra (~R$40/ano)",
        "Anote o domínio que você comprou"
      ],
      link: "https://registro.br",
      linkTexto: "Registro.br"
    },
    {
      id: 4,
      titulo: "Criar Conta na Vercel",
      icone: Server,
      cor: "orange",
      descricao: "Hospedagem gratuita para seu app",
      passos: [
        "Acesse vercel.com",
        "Crie uma conta (pode usar GitHub)",
        "É grátis para projetos pessoais"
      ],
      link: "https://vercel.com",
      linkTexto: "Criar Conta"
    },
    {
      id: 5,
      titulo: "Subir Código para GitHub",
      icone: Server,
      cor: "gray",
      descricao: "Coloque seu código no GitHub para a Vercel acessar",
      passos: [
        "Crie uma conta no GitHub (se não tiver)",
        "Crie um novo repositório privado",
        "Faça upload da pasta do seu app",
        "Ou use os comandos abaixo no terminal"
      ],
      comandos: [
        "git init",
        "git add .",
        "git commit -m 'primeiro commit'",
        "git remote add origin https://github.com/SEU_USUARIO/lucro-certo.git",
        "git push -u origin main"
      ],
      link: "https://github.com/new",
      linkTexto: "Criar Repositório"
    },
    {
      id: 6,
      titulo: "Deploy na Vercel",
      icone: Server,
      cor: "blue",
      descricao: "Publique seu app na Vercel",
      passos: [
        "Na Vercel, clique em 'New Project'",
        "Conecte seu repositório do GitHub",
        "A Vercel vai detectar que é um projeto React",
        "Clique em 'Deploy' e aguarde"
      ]
    },
    {
      id: 7,
      titulo: "Configurar Domínio",
      icone: Globe,
      cor: "green",
      descricao: "Aponte seu domínio para a Vercel",
      passos: [
        "Na Vercel, vá em Settings → Domains",
        "Adicione seu domínio (ex: lucrocerto.com.br)",
        "A Vercel vai mostrar os registros DNS",
        "No painel do Registro.br, configure os DNS conforme indicado",
        "Aguarde propagação (até 48h, geralmente 1-2h)"
      ]
    },
    {
      id: 8,
      titulo: "Criar assetlinks.json",
      icone: Smartphone,
      cor: "purple",
      descricao: "Arquivo necessário para o TWA",
      passos: [
        "Na pasta do projeto, crie a pasta: public/.well-known/",
        "Dentro dela, crie o arquivo: assetlinks.json",
        "Cole o conteúdo abaixo (substitua com seu SHA256)"
      ],
      codigo: `[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.lucrocerto.app",
    "sha256_cert_fingerprints": [
      "SEU_SHA256_AQUI"
    ]
  }
}]`
    },
    {
      id: 9,
      titulo: "Gerar Chave de Assinatura",
      icone: Smartphone,
      cor: "orange",
      descricao: "Criar chave para assinar o app",
      passos: [
        "Abra o terminal no seu computador",
        "Execute o comando abaixo para gerar a chave",
        "Guarde a senha em lugar seguro!",
        "Anote o SHA256 que será mostrado"
      ],
      comandos: [
        "keytool -genkey -v -keystore lucrocerto.keystore -alias lucrocerto -keyalg RSA -keysize 2048 -validity 10000"
      ]
    },
    {
      id: 10,
      titulo: "Instalar Bubblewrap",
      icone: Smartphone,
      cor: "blue",
      descricao: "Ferramenta para gerar o APK/AAB",
      passos: [
        "Instale Node.js (nodejs.org) se não tiver",
        "Abra o terminal e execute:"
      ],
      comandos: [
        "npm install -g @nicola-nicola-nicola-nicola-nicola/b-wrap"
      ]
    },
    {
      id: 11,
      titulo: "Gerar o AAB",
      icone: Smartphone,
      cor: "purple",
      descricao: "Criar o arquivo para a Play Store",
      passos: [
        "Crie uma pasta para o projeto TWA",
        "Execute o bubblewrap init",
        "Siga as instruções (vai pedir URL, nome, ícones)",
        "Execute bubblewrap build para gerar o AAB"
      ],
      comandos: [
        "mkdir lucro-certo-twa && cd lucro-certo-twa",
        "bubblewrap init --manifest https://SEU_DOMINIO.com.br/manifest.json",
        "bubblewrap build"
      ]
    },
    {
      id: 12,
      titulo: "Publicar na Play Store",
      icone: Smartphone,
      cor: "green",
      descricao: "Finalmente! Envie para a loja",
      passos: [
        "Acesse o Google Play Console",
        "Crie uma conta de desenvolvedor ($25 taxa única)",
        "Crie um novo app",
        "Faça upload do arquivo .aab gerado",
        "Preencha as informações (descrição, capturas de tela)",
        "Envie para revisão"
      ],
      link: "https://play.google.com/console",
      linkTexto: "Play Console"
    }
  ];

  const coresMap = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    green: "bg-green-100 text-green-700 border-green-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200"
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-green-600" />
            Guia: Publicar na Play Store
          </h1>
          <p className="text-gray-500 mt-1">
            Passo a passo completo para exportar e publicar seu app
          </p>
        </div>

        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Custo total estimado:</strong> ~R$350 inicial + R$300/mês (Builder)
            <br />
            <span className="text-sm">Domínio ~R$40/ano | Google Play $25 (único) | Hospedagem grátis</span>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {etapas.map((etapa) => {
            const Icone = etapa.icone;
            const concluida = etapaConcluida[etapa.id];
            
            return (
              <Card 
                key={etapa.id} 
                className={`shadow-md transition-all ${concluida ? 'bg-green-50 border-green-200' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleEtapa(etapa.id)}
                      className="mt-1"
                    >
                      {concluida ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${coresMap[etapa.cor]}`}>
                          Etapa {etapa.id}
                        </span>
                      </div>
                      <CardTitle className={`text-lg ${concluida ? 'line-through text-gray-500' : ''}`}>
                        {etapa.titulo}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                    </div>
                    <Icone className={`w-6 h-6 ${concluida ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pl-14">
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-3">
                    {etapa.passos.map((passo, i) => (
                      <li key={i}>{passo}</li>
                    ))}
                  </ol>

                  {etapa.comandos && (
                    <div className="bg-gray-900 rounded-lg p-3 mb-3">
                      {etapa.comandos.map((cmd, i) => (
                        <div key={i} className="flex items-center justify-between mb-1 last:mb-0">
                          <code className="text-green-400 text-xs break-all">{cmd}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarTexto(cmd, `cmd-${etapa.id}-${i}`)}
                            className="text-gray-400 hover:text-white h-6 ml-2 flex-shrink-0"
                          >
                            {copiado === `cmd-${etapa.id}-${i}` ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {etapa.codigo && (
                    <div className="bg-gray-900 rounded-lg p-3 mb-3 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copiarTexto(etapa.codigo, `code-${etapa.id}`)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white h-6"
                      >
                        {copiado === `code-${etapa.id}` ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <pre className="text-green-400 text-xs overflow-x-auto">
                        {etapa.codigo}
                      </pre>
                    </div>
                  )}

                  {etapa.link && (
                    <a
                      href={etapa.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      {etapa.linkTexto}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-green-900 text-lg mb-2">🎉 Parabéns!</h3>
            <p className="text-green-800">
              Após completar todas as etapas, seu app estará disponível na Google Play Store!
              O processo de revisão do Google leva de 1 a 7 dias.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Precisa de ajuda?</h4>
          <p className="text-sm text-blue-800">
            Este processo é técnico. Se tiver dificuldades em alguma etapa, 
            me avise aqui no chat que eu te ajudo com mais detalhes.
          </p>
        </div>
      </div>
    </div>
  );
}