import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GuiaGooglePlay() {
  const [copiado, setCopiado] = React.useState(null);

  const copiarTexto = (texto, id) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            📱 Guia Google Play Console
          </h1>
          <p className="text-gray-500 mt-1">
            Copie e cole as declarações abaixo no Google Play Console
          </p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>Importante:</strong> Revise cada seção antes de enviar. Clique no botão "Copiar" 
            e cole diretamente nos campos correspondentes do Google Play Console.
          </AlertDescription>
        </Alert>

        {/* 1. POLÍTICA DE PRIVACIDADE */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span>1️⃣ Política de Privacidade</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copiarTexto('https://lucro-certo.base44.app/PoliticaDePrivacidade', 'privacy-url')}
              >
                {copiado === 'privacy-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">URL da Política de Privacidade:</label>
                <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-sm break-all">
                  https://lucro-certo.base44.app/PoliticaDePrivacidade
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ✅ Já existe uma página de Política de Privacidade no app. Cole esta URL exata no Google Play Console.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. CLASSIFICAÇÕES DE CONTEÚDO */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle>2️⃣ Classificações de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription>
                  Você precisará responder ao questionário do IARC no Play Console. 
                  Use estas respostas:
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <div>
                  <p className="font-semibold">Violência:</p>
                  <p className="text-gray-700">❌ Não</p>
                </div>
                <div>
                  <p className="font-semibold">Conteúdo sexual:</p>
                  <p className="text-gray-700">❌ Não</p>
                </div>
                <div>
                  <p className="font-semibold">Linguagem imprópria:</p>
                  <p className="text-gray-700">❌ Não</p>
                </div>
                <div>
                  <p className="font-semibold">Drogas, álcool ou tabaco:</p>
                  <p className="text-gray-700">❌ Não</p>
                </div>
                <div>
                  <p className="font-semibold">Atividades ilegais:</p>
                  <p className="text-gray-700">❌ Não</p>
                </div>
                <div>
                  <p className="font-semibold">Categoria do app:</p>
                  <p className="text-gray-700">✅ Produtividade / Negócios</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. PÚBLICO-ALVO E CONTEÚDO */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle>3️⃣ Público-alvo e Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">Faixa etária do público-alvo:</label>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>✅ <strong>18 anos ou mais</strong></p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">O app tem apelo específico para crianças?</label>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>❌ <strong>Não</strong></p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Justificativa:</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative">
                  <p className="text-sm">
                    App de gestão financeira empresarial direcionado a empreendedores e donos de negócios. 
                    Requer conhecimentos de contabilidade, finanças e gestão de negócios.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto("App de gestão financeira empresarial direcionado a empreendedores e donos de negócios. Requer conhecimentos de contabilidade, finanças e gestão de negócios.", 'publico-just')}
                  >
                    {copiado === 'publico-just' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. SEGURANÇA DOS DADOS */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle>4️⃣ Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Alert className="bg-orange-50 border-orange-200">
                <AlertDescription>
                  Configure no Play Console com estas informações:
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700">O app coleta ou compartilha dados do usuário?</p>
                  <p className="text-gray-700 mt-1">✅ <strong>Sim</strong></p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-3">Tipos de dados coletados:</p>
                  
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="font-medium">📧 Informações pessoais:</p>
                      <ul className="text-sm text-gray-700 ml-4 mt-1">
                        <li>• Nome</li>
                        <li>• Email</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Finalidade:</strong> Autenticação e funcionalidade do app<br/>
                        <strong>Opcional ou obrigatório:</strong> Obrigatório<br/>
                        <strong>Compartilhamento:</strong> Não compartilhado
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-3">
                      <p className="font-medium">💼 Dados financeiros:</p>
                      <ul className="text-sm text-gray-700 ml-4 mt-1">
                        <li>• Informações de compras</li>
                        <li>• Informações de vendas</li>
                        <li>• Histórico de transações</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Finalidade:</strong> Funcionalidade do app<br/>
                        <strong>Opcional ou obrigatório:</strong> Obrigatório<br/>
                        <strong>Compartilhamento:</strong> Não compartilhado
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Os dados são criptografados em trânsito?</p>
                  <p className="text-gray-700 mt-1">✅ <strong>Sim</strong> (HTTPS/TLS)</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Os usuários podem solicitar exclusão de dados?</p>
                  <p className="text-gray-700 mt-1">✅ <strong>Sim</strong></p>
                  <p className="text-sm text-gray-600 mt-1">
                    Os usuários podem solicitar exclusão através do email de suporte na política de privacidade
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. ID DE PUBLICIDADE */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle>5️⃣ ID de Publicidade</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700">O app usa ID de publicidade?</p>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>❌ <strong>Não</strong></p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  O app não exibe anúncios nem usa tracking para publicidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. APPS GOVERNAMENTAIS */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardTitle>6️⃣ Apps Governamentais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700">O app é de uso governamental?</p>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>❌ <strong>Não</strong></p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Este é um app comercial para empreendedores e empresas privadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. RECURSOS FINANCEIROS */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardTitle>7️⃣ Recursos Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700">O app oferece recursos financeiros?</p>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>❌ <strong>Não</strong></p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  O app apenas <strong>registra e organiza</strong> dados financeiros do usuário localmente. 
                  Não processa pagamentos, transferências, investimentos ou qualquer transação financeira real.
                </p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription>
                  <strong>Importante:</strong> O app é uma ferramenta de <strong>gestão e controle</strong>, 
                  não realiza operações financeiras reais como pagamentos, transferências ou investimentos.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* 8. APPS DE SAÚDE */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>8️⃣ Apps de Saúde</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700">O app oferece recursos de saúde?</p>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>❌ <strong>Não</strong></p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  O app não oferece serviços de saúde, diagnósticos, tratamentos ou 
                  gerenciamento de condições médicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INFORMAÇÕES ADICIONAIS */}
        <Card className="mb-6 shadow-lg border-2 border-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle>📋 Informações Adicionais do App</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">Nome do app:</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative">
                  <p>Lucro Certo - Gestão Financeira</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto("Lucro Certo - Gestão Financeira", 'nome')}
                  >
                    {copiado === 'nome' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Descrição curta (80 caracteres):</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative">
                  <p>Controle financeiro completo para pequenos negócios e empreendedores</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto("Controle financeiro completo para pequenos negócios e empreendedores", 'desc-curta')}
                  >
                    {copiado === 'desc-curta' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Descrição completa:</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative max-h-96 overflow-y-auto">
                  <p className="text-sm whitespace-pre-line">{`📊 Lucro Certo - Gestão Financeira Completa para o Seu Negócio

Transforme a gestão do seu negócio com o app de controle financeiro mais completo do mercado! Ideal para padarias, lanchonetes, pizzarias, hamburguerias, revendas e qualquer pequeno empreendimento.

✨ PRINCIPAIS FUNCIONALIDADES:

💰 CONTROLE FINANCEIRO TOTAL
• Registro de vendas e compras
• Controle de gastos operacionais
• Gestão de comissões de revenda
• Dashboard com lucro em tempo real

📦 GESTÃO DE ESTOQUE
• Controle automático de produtos
• Alertas de estoque baixo
• Movimentações de entrada e saída
• Histórico completo

🍕 FOOD SERVICE PROFISSIONAL
• Cadastro de receitas com ingredientes
• Cálculo automático de custos
• Precificação com margem de lucro
• Sistema de pedidos completo
• Controle de ingredientes

👥 GESTÃO DE CLIENTES
• Cadastro completo
• Histórico de compras
• Análise de vendas por cliente

💼 REVENDAS (Natura, Boticário, Hinode)
• Controle de vendas parceladas
• Gestão de comissões
• Calendário de pagamentos
• Múltiplas empresas

📊 RELATÓRIOS PROFISSIONAIS
• Análise de lucros e margens
• Produtos mais vendidos
• Relatório por cliente
• Exportação em PDF e CSV
• Filtros por período

⚙️ CONFIGURAÇÕES AVANÇADAS
• Templates por tipo de negócio
• Calculadora de Markup
• Cálculo de CMV (Custo de Mercadoria Vendida)
• Custos de produção

🚀 DIFERENCIAIS:
✓ Interface intuitiva e fácil de usar
✓ Funciona offline
✓ Dados 100% seguros
✓ Sem mensalidade
✓ Suporte em português
✓ Atualizações gratuitas

👨‍💼 IDEAL PARA:
• Padarias e confeitarias
• Lanchonetes e food trucks
• Pizzarias e hamburguerias
• Revendedoras autônomas
• Pequenos comércios
• Empreendedores individuais

💡 TENHA CONTROLE TOTAL DO SEU NEGÓCIO!
Saiba exatamente quanto você está lucrando, controle seu estoque, gerencie clientes e tome decisões baseadas em dados reais.

📱 Baixe agora e comece a ter lucro certo no seu negócio!`}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto(`📊 Lucro Certo - Gestão Financeira Completa para o Seu Negócio

Transforme a gestão do seu negócio com o app de controle financeiro mais completo do mercado! Ideal para padarias, lanchonetes, pizzarias, hamburguerias, revendas e qualquer pequeno empreendimento.

✨ PRINCIPAIS FUNCIONALIDADES:

💰 CONTROLE FINANCEIRO TOTAL
• Registro de vendas e compras
• Controle de gastos operacionais
• Gestão de comissões de revenda
• Dashboard com lucro em tempo real

📦 GESTÃO DE ESTOQUE
• Controle automático de produtos
• Alertas de estoque baixo
• Movimentações de entrada e saída
• Histórico completo

🍕 FOOD SERVICE PROFISSIONAL
• Cadastro de receitas com ingredientes
• Cálculo automático de custos
• Precificação com margem de lucro
• Sistema de pedidos completo
• Controle de ingredientes

👥 GESTÃO DE CLIENTES
• Cadastro completo
• Histórico de compras
• Análise de vendas por cliente

💼 REVENDAS (Natura, Boticário, Hinode)
• Controle de vendas parceladas
• Gestão de comissões
• Calendário de pagamentos
• Múltiplas empresas

📊 RELATÓRIOS PROFISSIONAIS
• Análise de lucros e margens
• Produtos mais vendidos
• Relatório por cliente
• Exportação em PDF e CSV
• Filtros por período

⚙️ CONFIGURAÇÕES AVANÇADAS
• Templates por tipo de negócio
• Calculadora de Markup
• Cálculo de CMV (Custo de Mercadoria Vendida)
• Custos de produção

🚀 DIFERENCIAIS:
✓ Interface intuitiva e fácil de usar
✓ Funciona offline
✓ Dados 100% seguros
✓ Sem mensalidade
✓ Suporte em português
✓ Atualizações gratuitas

👨‍💼 IDEAL PARA:
• Padarias e confeitarias
• Lanchonetes e food trucks
• Pizzarias e hamburguerias
• Revendedoras autônomas
• Pequenos comércios
• Empreendedores individuais

💡 TENHA CONTROLE TOTAL DO SEU NEGÓCIO!
Saiba exatamente quanto você está lucrando, controle seu estoque, gerencie clientes e tome decisões baseadas em dados reais.

📱 Baixe agora e comece a ter lucro certo no seu negócio!`, 'desc-completa')}
                  >
                    {copiado === 'desc-completa' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">App ou jogo:</label>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>✅ <strong>App</strong></p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Categoria:</label>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>✅ <strong>Empresa</strong></p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ Primeiro selecione "App", depois escolha a categoria "Empresa"
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Tags/Palavras-chave:</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative">
                  <p className="text-sm">gestão financeira, controle financeiro, pequenos negócios, empreendedor, padaria, lanchonete, estoque, vendas, lucro</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto("gestão financeira, controle financeiro, pequenos negócios, empreendedor, padaria, lanchonete, estoque, vendas, lucro", 'tags')}
                  >
                    {copiado === 'tags' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">📧 Endereço de e-mail (Detalhes de contato):</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative">
                  <p className="text-sm">lucrocerto.app@gmail.com</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto("lucrocerto.app@gmail.com", 'email')}
                  >
                    {copiado === 'email' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Use este email no campo de contato do Play Console
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">📱 Número de telefone (opcional):</label>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p className="text-sm text-gray-600">Deixe em branco se não quiser informar</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">🌐 Site (opcional):</label>
                <div className="bg-gray-100 p-3 rounded mt-2 relative">
                  <p className="text-sm">https://lucro-certo.base44.app</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copiarTexto("https://lucro-certo.base44.app", 'website')}
                  >
                    {copiado === 'website' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">📢 Marketing externo:</label>
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>✅ <strong>Ativado</strong> - Anunciar meu app fora do Google Play</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Isso permite que o Google promova seu app em outros canais. Recomendado: Deixar ativado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHECKLIST FINAL */}
        <Card className="mb-6 shadow-lg border-2 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle>✅ Checklist Final</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Política de Privacidade (URL copiada)</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Classificações de conteúdo (questionário respondido)</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Público-alvo: 18+ anos</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Segurança dos dados configurada</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>ID de publicidade: Não</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>App governamental: Não</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Recursos financeiros: Não (apenas gestão)</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Apps de saúde: Não</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span>Descrição e screenshots do app enviados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-green-50 border-green-500 border-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Pronto!</strong> Agora você tem todas as informações necessárias para completar 
            as 8 declarações do Google Play Console. Copie e cole nos campos correspondentes.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}