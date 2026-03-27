import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image, FileText, CheckCircle2, Smartphone, Video, Sparkles, Copy, Check, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function MarketingAssetsPage() {
  const [copiedItems, setCopiedItems] = useState({});

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedItems(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const screenshots = [
    { nome: "Dashboard", descricao: "Tela principal com resumo financeiro" },
    { nome: "Vendas", descricao: "Lista de vendas realizadas" },
    { nome: "Revendas", descricao: "Gestão de vendas de revenda" },
    { nome: "Clientes", descricao: "Cadastro e histórico de clientes" },
    { nome: "Relatórios", descricao: "Gráficos e análises financeiras" }
  ];

  const textosSugeridos = {
    titulo: "Lucro Certo - Gestão Financeira",
    descricaoCurta: "Controle completo de vendas, compras, gastos e revendas para o seu negócio.",
    descricaoCompleta: `Lucro Certo é o aplicativo completo para gestão financeira do seu pequeno ou médio negócio.

🎯 RECURSOS PRINCIPAIS:

📊 Dashboard Inteligente
• Visão geral do seu negócio em tempo real
• Gráficos e métricas importantes
• Lucro líquido e análise de rentabilidade

💰 Gestão de Vendas
• Registre vendas por kg ou unidade
• Acompanhe faturamento diário, semanal e mensal
• Controle de clientes

🛒 Controle de Compras
• Cadastro de fornecedores
• Gestão de estoque
• Cálculo automático de custos

🏪 Módulo de Revendas
• Ideal para revendedoras (Natura, Boticário, Hinode, etc)
• Controle de comissões e parcelas
• Lembretes automáticos de pagamentos
• Calendário de recebíveis

👥 Gestão de Clientes
• Cadastro completo com contatos
• Histórico de vendas por cliente
• Análise de performance

📈 Relatórios Avançados
• Exportação para Excel/CSV
• Análise de lucratividade por produto
• Comparação de períodos
• Gráficos interativos

💸 Controle de Gastos
• Gastos operacionais
• Despesas pessoais
• Categorização automática

✨ DIFERENCIAIS:

✅ Interface moderna e intuitiva
✅ 100% mobile-first
✅ Dados seguros na nuvem
✅ Acesso de qualquer dispositivo
✅ Atualizações automáticas
✅ Sem anúncios

Ideal para:
• Pequenos comerciantes
• Revendedoras
• Autônomos
• Microempresas
• Ambulantes
• Prestadores de serviço

Tenha o controle total das suas finanças na palma da mão!`,
    palavrasChave: [
      "gestão financeira",
      "controle de vendas",
      "revendas",
      "comissões",
      "lucro",
      "pequeno negócio",
      "controle de estoque",
      "clientes",
      "relatórios",
      "finanças pessoais"
    ]
  };

  const postsRedesSociais = {
    instagram: [
      {
        titulo: "Post 1 - Problema/Solução",
        texto: `📱 Você já perdeu o controle das suas vendas?

❌ Anotações no caderno que você não encontra
❌ Esqueceu quem já pagou e quem não pagou
❌ Não sabe se está tendo lucro de verdade

✅ O Lucro Certo resolve tudo isso!

📊 Controle de vendas e compras
💰 Cálculo automático de lucro
👥 Histórico completo de clientes
📈 Relatórios visuais e fáceis

Baixe agora e organize seu negócio! 🚀
Link na bio 👆

#empreendedorismo #gestaofinanceira #vendas #pequenaempresa #revendedora #organizacao #lucrocerto`,
        dica: "Use uma imagem do dashboard do app ou um before/after (caderno x app)"
      },
      {
        titulo: "Post 2 - Para Revendedoras",
        texto: `🛍️ REVENDEDORAS, esse app é para vocês!

Se você revende:
💄 Natura
💅 Avon
🌸 O Boticário
✨ Hinode
🎁 Qualquer marca

O Lucro Certo tem um módulo especial com:
✅ Controle de comissões por venda
✅ Acompanhamento de parcelas
✅ Lembretes de pagamentos
✅ Calendário de recebimentos

Pare de perder dinheiro e organize suas revendas! 💚

#revendedora #natura #avon #boticario #hinode #comissoes #vendasdiretas #mulheresempreendedoras`,
        dica: "Use cores vibrantes e emojis relacionados aos produtos"
      },
      {
        titulo: "Post 3 - Benefícios",
        texto: `💚 Por que usar o Lucro Certo?

1️⃣ GRÁTIS - sem mensalidade
2️⃣ COMPLETO - tudo em um só lugar
3️⃣ FÁCIL - interface simples
4️⃣ SEGURO - dados na nuvem
5️⃣ RÁPIDO - cadastre em segundos

Ideal para:
• Ambulantes
• Pequenos comerciantes
• Prestadores de serviço
• Revendedores
• Autônomos

Baixe agora e veja a diferença! 📲

#app #gestao #negocios #empreendedor #gratis #ferramentadigital`,
        dica: "Carrossel com cada benefício em um slide"
      }
    ],
    stories: [
      {
        tipo: "Enquete",
        texto: "Você controla suas vendas em:\n\nA) Caderno 📓\nB) Planilha 📊\nC) App 📱\nD) Cabeça 🧠",
        dica: "Use enquete interativa do Instagram"
      },
      {
        tipo: "Quiz",
        texto: "QUIZ: Você sabe quanto lucrou mês passado?\n\n😅 Responda SIM ou NÃO",
        dica: "Depois mostre como o app resolve isso"
      },
      {
        tipo: "Tutorial Rápido",
        texto: "⚡ COMO USAR:\n\n1. Baixe o app\n2. Cadastre uma venda\n3. Veja seu lucro\n\nSimples assim! 💚",
        dica: "Vídeo de 15 segundos mostrando"
      }
    ]
  };

  const scriptsVideo = [
    {
      titulo: "Vídeo Curto 30s (TikTok/Reels)",
      script: `[GANCHO - 3s]
"Você está PERDENDO dinheiro e nem sabe..."

[PROBLEMA - 5s]
Mostra: caderno rabiscado, planilhas confusas, pessoa estressada

[SOLUÇÃO - 12s]
"Apresentando: Lucro Certo"
Mostra: tela do app, cadastrando venda, vendo lucro

[BENEFÍCIOS - 7s]
✅ Controle total
✅ Lucro real
✅ 100% grátis

[CALL TO ACTION - 3s]
"Baixe agora! Link na bio 👆"`,
      dica: "Use transições rápidas, música animada"
    },
    {
      titulo: "Vídeo Explicativo 60s",
      script: `[INTRO - 5s]
"3 erros que estão matando seu negócio"

[ERRO 1 - 15s]
❌ Não saber quanto você lucra
Mostre: pessoa confusa com papéis

[ERRO 2 - 15s]
❌ Perder vendas por desorganização
Mostre: cliente ligando e você sem info

[ERRO 3 - 15s]
❌ Não acompanhar clientes
Mostre: oportunidades perdidas

[SOLUÇÃO - 8s]
✅ Lucro Certo resolve tudo isso!
Mostra: app em ação

[CTA - 2s]
"Baixe grátis agora!"`,
      dica: "Tom mais sério e profissional"
    }
  ];

  const ferramentasIA = [
    {
      categoria: "Criação de Imagens",
      ferramentas: [
        {
          nome: "Canva Magic Design",
          descricao: "Crie posts profissionais com IA",
          uso: "Digite: 'Post Instagram sobre app de gestão financeira verde e moderno'",
          link: "canva.com",
          gratis: true
        },
        {
          nome: "Leonardo.ai",
          descricao: "Gere imagens realistas ou ilustrações",
          uso: "Prompts: 'pessoa feliz usando celular contando dinheiro, fotorealista'",
          link: "leonardo.ai",
          gratis: true
        },
        {
          nome: "Ideogram",
          descricao: "Melhor para textos em imagens",
          uso: "Crie banners com o nome 'Lucro Certo' e design profissional",
          link: "ideogram.ai",
          gratis: true
        }
      ]
    },
    {
      categoria: "Criação de Vídeos",
      ferramentas: [
        {
          nome: "CapCut",
          descricao: "Editor de vídeo com IA (legendas automáticas)",
          uso: "Grave telas do app e adicione legendas e efeitos",
          link: "capcut.com",
          gratis: true
        },
        {
          nome: "Runway ML",
          descricao: "Crie vídeos com IA",
          uso: "Text-to-video para criar animações explicativas",
          link: "runwayml.com",
          gratis: false
        },
        {
          nome: "InVideo AI",
          descricao: "Crie vídeos completos com script",
          uso: "Cole o script e a IA gera o vídeo",
          link: "invideo.ai",
          gratis: true
        }
      ]
    },
    {
      categoria: "Copywriting e Textos",
      ferramentas: [
        {
          nome: "ChatGPT",
          descricao: "Crie textos persuasivos",
          uso: "Prompt: 'Escreva 10 legendas para Instagram promovendo app de gestão financeira'",
          link: "chat.openai.com",
          gratis: true
        },
        {
          nome: "Copy.ai",
          descricao: "Especializado em marketing",
          uso: "Templates prontos para posts, anúncios e emails",
          link: "copy.ai",
          gratis: true
        },
        {
          nome: "Jasper",
          descricao: "Copywriting profissional",
          uso: "Crie campanhas completas de marketing",
          link: "jasper.ai",
          gratis: false
        }
      ]
    },
    {
      categoria: "Design e Mockups",
      ferramentas: [
        {
          nome: "Mockup Generator",
          descricao: "Coloque screenshots em mockups de celular",
          uso: "Upload suas screenshots e gere imagens profissionais",
          link: "mockupworld.co",
          gratis: true
        },
        {
          nome: "Figma + AI Plugins",
          descricao: "Design profissional com ajuda de IA",
          uso: "Use plugins como 'Magician' para gerar elementos",
          link: "figma.com",
          gratis: true
        }
      ]
    },
    {
      categoria: "Hashtags e SEO",
      ferramentas: [
        {
          nome: "Hashtagify",
          descricao: "Encontre hashtags relevantes",
          uso: "Pesquise '#gestaofinanceira' e veja relacionadas",
          link: "hashtagify.me",
          gratis: true
        },
        {
          nome: "RiteTag",
          descricao: "Sugestões de hashtags em tempo real",
          uso: "Digite seu texto e veja hashtags sugeridas",
          link: "ritetag.com",
          gratis: true
        }
      ]
    }
  ];

  const promptsIA = {
    imagens: [
      "Crie um post moderno de Instagram sobre um aplicativo de gestão financeira chamado 'Lucro Certo', use cores verde e branco, estilo minimalista profissional",
      "Pessoa empreendedora feliz usando celular para controlar vendas, estilo fotorealista, iluminação natural, cores vibrantes",
      "Infográfico visual mostrando 'antes e depois' de usar app de gestão: lado esquerdo caótico com papéis, lado direito organizado com celular",
      "Banner promocional para stories Instagram: texto 'Organize seu negócio hoje', fundo gradiente verde água, design moderno"
    ],
    videos: [
      "Crie storyboard para vídeo de 30 segundos sobre app de gestão financeira: início mostra problema (desorganização), meio apresenta solução (app), fim mostra resultado (lucro)",
      "Script para vídeo explicativo: 'Como o Lucro Certo ajuda pequenos empreendedores a triplicar seus lucros organizando vendas e gastos'"
    ],
    textos: [
      "Escreva 15 legendas criativas para Instagram promovendo app de gestão financeira para pequenos negócios e revendedoras",
      "Crie 5 anúncios curtos (máximo 100 caracteres) para Google Ads promovendo app gratuito de controle de vendas",
      "Escreva email marketing persuasivo convidando empreendedores a experimentar app de gestão financeira gratuito"
    ]
  };

  const hashtagsSugeridas = {
    geral: [
      "#empreendedorismo", "#gestaofinanceira", "#pequenaempresa", "#microempresa",
      "#empreendedor", "#negocios", "#vendas", "#lucro", "#organizacao"
    ],
    revendas: [
      "#revendedora", "#natura", "#avon", "#boticario", "#hinode", "#jequiti",
      "#vendasdiretas", "#consultora", "#revendaonline", "#comissoes"
    ],
    financeiro: [
      "#controlefinanceiro", "#lucrocerto", "#gestao", "#financas",
      "#contabilidade", "#fluxodecaixa", "#planejamentofinanceiro"
    ],
    publico: [
      "#mulheresempreendedoras", "#maedenegocios", "#empoderamento",
      "#autonomia", "#trabalheemcasa", "#rendaextra"
    ]
  };

  const calendarioConteudo = {
    estrategia: {
      frequencia: "3-5 posts por semana",
      melhoresHorarios: ["7h-9h (antes do trabalho)", "12h-14h (almoço)", "18h-21h (após trabalho)"],
      diasMelhores: ["Terça, Quarta e Quinta = mais engajamento", "Segunda = motivacional", "Sexta = dicas rápidas"],
      mix: ["60% educacional (dicas, tutoriais)", "30% promocional (benefícios do app)", "10% pessoal (histórias de sucesso)"]
    },
    exemplos: [
      {
        dia: "Segunda",
        tipo: "Motivacional + Problema",
        exemplo: "Post sobre desafios de empreendedores + como você pode ajudar",
        formato: "Carrossel ou imagem única"
      },
      {
        dia: "Terça",
        tipo: "Educacional",
        exemplo: "Tutorial: 'Como calcular seu lucro real em 3 passos'",
        formato: "Reels/TikTok (30-60s)"
      },
      {
        dia: "Quarta",
        tipo: "Caso de Uso",
        exemplo: "Antes x Depois: 'Como Maria organizou suas revendas com o app'",
        formato: "Post com imagens"
      },
      {
        dia: "Quinta",
        tipo: "Dica Prática",
        exemplo: "'5 erros que estão matando seu lucro' + CTA para baixar app",
        formato: "Carrossel"
      },
      {
        dia: "Sexta",
        tipo: "Interativo",
        exemplo: "Enquete nos Stories: 'Você controla suas vendas?' + tutorial rápido",
        formato: "Stories interativos"
      }
    ]
  };

  const estrategiaLancamento = [
    {
      fase: "Pré-Lançamento (1 semana antes)",
      acoes: [
        "Crie perfis no Instagram, TikTok e Facebook",
        "Poste 3-5 conteúdos teaser (sem revelar o app ainda)",
        "Use stories com contagem regressiva",
        "Crie lista de espera ou 'Avise-me quando lançar'"
      ]
    },
    {
      fase: "Lançamento (Dia 1-3)",
      acoes: [
        "Post de anúncio em todas as redes",
        "Vídeo demonstração de 60s",
        "Stories com link direto",
        "Peça para amigos/família compartilhar"
      ]
    },
    {
      fase: "Pós-Lançamento (Semana 1-4)",
      acoes: [
        "Publique tutoriais semanais",
        "Compartilhe depoimentos (mesmo que sejam seus testes)",
        "Participe de grupos de empreendedoras no Facebook",
        "Responda todos os comentários e DMs rapidamente"
      ]
    },
    {
      fase: "Crescimento (Mês 2+)",
      acoes: [
        "Colabore com micro-influencers (revendedoras com 1k-10k seguidores)",
        "Crie desafio viral: '#DesafioLucroCerto'",
        "Ofereça suporte em tempo real nos Stories",
        "Considere ads pagos (R$5-10/dia para testar)"
      ]
    }
  ];

  const especificacoes = [
    { item: "Ícone do App", spec: "512x512 px (PNG, fundo transparente ou sólido)" },
    { item: "Feature Graphic", spec: "1024x500 px (JPG ou PNG 24-bit)" },
    { item: "Screenshots Celular", spec: "Mínimo 2, ideal 4-8 (entre 320-3840 px)" },
    { item: "Screenshots Tablet", spec: "Opcional (7-10 polegadas)" },
    { item: "Vídeo Promocional", spec: "Opcional (YouTube)" },
    { item: "Descrição Curta", spec: "Máximo 80 caracteres" },
    { item: "Descrição Completa", spec: "Máximo 4000 caracteres" }
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Assets</h1>
          <p className="text-gray-500">Materiais de marketing e ferramentas de IA</p>
        </div>

        <Tabs defaultValue="briefing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="briefing">📋 Briefing</TabsTrigger>
            <TabsTrigger value="playstore">Play Store</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="estrategia">📅 Estratégia</TabsTrigger>
            <TabsTrigger value="ferramentas">🤖 Ferramentas IA</TabsTrigger>
            <TabsTrigger value="prompts">💡 Prompts IA</TabsTrigger>
          </TabsList>

          {/* ABA BRIEFING COMPLETO */}
          <TabsContent value="briefing" className="space-y-6">
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Briefing Completo do Lucro Certo</strong>
                <p className="text-sm mt-1">Use esta descrição detalhada para orientar IAs (ChatGPT, Claude, etc) na criação de propagandas, posts e conteúdo</p>
              </AlertDescription>
            </Alert>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>📄 Documento de Briefing</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      const briefingCompleto = `# BRIEFING COMPLETO - LUCRO CERTO

          ## 1. IDENTIFICAÇÃO DO APP

          **Nome:** Lucro Certo
          **Tagline:** Gestão Financeira Completa para Pequenos Negócios
          **Categoria:** Aplicativo de Gestão Financeira / Software de Negócios
          **Plataforma:** PWA (Progressive Web App) - funciona em qualquer dispositivo
          **Status:** Pronto para lançamento

          ---

          ## 2. DESCRIÇÃO GERAL

          O Lucro Certo é um aplicativo completo de gestão financeira desenvolvido especialmente para pequenos empreendedores, ambulantes, revendedoras e autônomos que precisam ter controle total do seu negócio de forma simples e eficiente.

          O app resolve o problema de desorganização financeira que afeta milhares de pequenos negócios no Brasil, substituindo cadernos, planilhas confusas e anotações perdidas por uma solução digital moderna, intuitiva e completa.

          ---

          ## 3. PROBLEMA QUE RESOLVE

          ### Dores do Público:
          1. **Desorganização:** Anotações em cadernos que se perdem, falta de controle
          2. **Não saber o lucro real:** Mistura de contas pessoais e do negócio
          3. **Esquecimento de cobranças:** Perda de dinheiro por não lembrar quem deve
          4. **Falta de visão geral:** Não sabe se está ganhando ou perdendo dinheiro
          5. **Complexidade:** Planilhas complicadas que ninguém entende
          6. **Falta de tempo:** Soluções tradicionais tomam muito tempo

          ### Solução do Lucro Certo:
          - ✅ Tudo organizado em um só lugar
          - ✅ Cálculo automático de lucro real
          - ✅ Lembretes automáticos de pagamentos
          - ✅ Relatórios visuais e fáceis de entender
          - ✅ Interface simples, qualquer pessoa usa
          - ✅ Cadastros rápidos (menos de 30 segundos)

          ---

          ## 4. PÚBLICO-ALVO

          ### Perfil Principal:
          - **Idade:** 25-55 anos
          - **Gênero:** Principalmente mulheres (60-70%), mas também homens
          - **Escolaridade:** Ensino médio a superior
          - **Renda:** R$ 1.500 a R$ 10.000/mês
          - **Localização:** Todo Brasil, especialmente interior e periferias

          ### Personas:

          **Persona 1 - Maria, a Revendedora**
          - 35 anos, casada, 2 filhos
          - Revende Natura, Avon e Hinode
          - Renda extra de R$ 2.000/mês
          - Usa caderno e WhatsApp para controlar
          - Problema: Perde o controle das comissões e parcelas

          **Persona 2 - João, o Ambulante**
          - 42 anos, autônomo
          - Vende frutas e verduras em feira
          - Renda de R$ 4.000/mês
          - Anota tudo em caderno
          - Problema: Não sabe quanto lucra de verdade

          **Persona 3 - Ana, a Microempresária**
          - 28 anos, tem lojinha física
          - Vende roupas e acessórios
          - Renda de R$ 6.000/mês
          - Usa planilha confusa no Excel
          - Problema: Perde tempo e não tem relatórios

          ---

          ## 5. FUNCIONALIDADES PRINCIPAIS

          ### 📊 DASHBOARD INTELIGENTE
          - Visão geral do negócio em tempo real
          - Lucro líquido calculado automaticamente
          - Gráficos de faturamento e gastos
          - Métricas mensais comparativas
          - Cards com resumo: vendas, compras, gastos, lucro

          ### 💰 GESTÃO DE VENDAS
          - Cadastro rápido de vendas (menos de 30s)
          - Suporte para venda por kg, sacos, caixas, lotes
          - Controle de clientes integrado
          - Vendas à vista ou parceladas
          - Vendas pagas ou a receber
          - Histórico completo por cliente
          - Notificação de pagamentos pendentes

          ### 🛒 CONTROLE DE COMPRAS
          - Registro de todas as compras
          - Vinculação com estoque (opcional)
          - Controle de fornecedores
          - Compras pagas ou a pagar
          - Adição automática ao estoque
          - Cálculo de custo unitário

          ### 📦 GESTÃO DE ESTOQUE
          - Cadastro de produtos com código de barras
          - Controle de entrada e saída
          - Estoque mínimo com alertas
          - Histórico de movimentações
          - Ajuste manual de estoque
          - Scanner de código de barras (mobile)

          ### 🏪 MÓDULO DE REVENDAS (DIFERENCIAL!)
          - **Especial para revendedoras de Natura, Avon, Boticário, Hinode, etc**
          - Cadastro de múltiplas empresas de revenda
          - Controle de comissões por venda
          - Gestão de parcelas (cliente paga parcelado)
          - Calendário de recebimentos
          - Cálculo automático de comissão por parcela paga
          - Lembretes de parcelas a receber
          - Controle de gastos específicos de cada revenda

          ### 👥 GESTÃO DE CLIENTES
          - Cadastro completo: nome, telefone, endereço, CPF
          - Histórico de vendas por cliente
          - Análise de melhor cliente
          - Clientes com vendas pendentes
          - Criação automática ao registrar venda

          ### 💸 CONTROLE DE GASTOS
          **Gastos Operacionais:**
          - Alimentação, gasolina, transporte
          - Diárias de funcionários
          - Manutenção, outros

          **Gastos Pessoais:**
          - Aluguel, contas de casa
          - Mercado, lazer, saúde
          - Separação entre negócio e pessoal

          ### 👷 GESTÃO DE FUNCIONÁRIOS E DIÁRIAS
          - Cadastro de funcionários
          - Registro de diárias trabalhadas
          - Controle de pagamentos (diária + passagem + alimentação)
          - Histórico de pagamentos por funcionário

          ### 📈 RELATÓRIOS AVANÇADOS
          - Relatório de lucros (mensal, semanal, diário)
          - Análise de produtos mais vendidos
          - Gastos por categoria
          - Vendas por cliente
          - Comparação de períodos
          - Exportação para Excel/CSV
          - Gráficos interativos e visuais

          ### 📅 CALENDÁRIO DE PAGAMENTOS
          - Visualização mensal de recebimentos e pagamentos
          - Alertas de vencimentos
          - Marcação de pagamentos realizados
          - Integração com vendas e compras

          ---

          ## 6. DIFERENCIAIS COMPETITIVOS

          ### ✨ Por que escolher o Lucro Certo?

          1. **100% Gratuito**
          - Sem mensalidade, sem taxas escondidas
          - Todas as funcionalidades liberadas

          2. **Módulo de Revendas Único**
          - Único app com controle completo para revendedoras
          - Gestão de comissões e parcelas automatizada

          3. **Interface Super Simples**
          - Feito para quem não é técnico
          - Qualquer pessoa usa, qualquer idade
          - Design moderno e intuitivo

          4. **Mobile First**
          - Funciona perfeitamente no celular
          - Não precisa de computador
          - Acesso de qualquer lugar

          5. **Dados Seguros na Nuvem**
          - Nunca perde informações
          - Acesso de qualquer dispositivo
          - Backup automático

          6. **Offline Primeiro**
          - Funciona sem internet
          - Sincroniza automaticamente quando voltar online

          7. **Sem Anúncios**
          - Experiência limpa e profissional

          8. **Atualizações Automáticas**
          - Sempre a versão mais recente
          - Novas funcionalidades constantemente

          ---

          ## 7. BENEFÍCIOS TANGÍVEIS

          ### Para o Negócio:
          - 📈 Aumento de 30-50% na percepção de lucro real
          - 💰 Redução de perdas por cobrança não realizada
          - ⏰ Economia de 2-3 horas/semana em controles manuais
          - 📊 Decisões mais inteligentes baseadas em dados
          - 🎯 Foco no que realmente dá lucro

          ### Para o Empreendedor:
          - 😌 Paz de espírito (tudo sob controle)
          - 💪 Mais profissionalismo
          - 📱 Praticidade (tudo no celular)
          - 🚀 Crescimento organizado
          - 💡 Visão clara do negócio

          ---

          ## 8. JORNADA DO USUÁRIO

          ### Primeiro Uso (Onboarding):
          1. Abre o app (sem cadastro complicado)
          2. Vê dashboard vazio com dicas
          3. Cadastra primeira venda em 30 segundos
          4. Já vê resultado no dashboard
          5. Explora outras funcionalidades aos poucos

          ### Uso Diário Típico:
          - Manhã: Abre app, vê resumo do dia
          - Durante o dia: Registra vendas conforme acontecem (15-30s cada)
          - Final do dia: Confere quanto faturou
          - Fim do mês: Gera relatório e vê lucro real

          ---

          ## 9. CASOS DE USO REAIS

          ### Caso 1: Revendedora Natura
          "Ana vende Natura e Avon. Ela cadastra cada venda parcelada no app. Todo dia 10, o app lembra as parcelas a receber. Ela sabe exatamente quanto vai ganhar de comissão no mês."

          ### Caso 2: Ambulante de Feira
          "João vende frutas. Todo dia ele registra suas compras de manhã e vendas ao longo do dia. No fim do mês, ele descobriu que estava tendo prejuízo com maçãs e passou a comprar menos."

          ### Caso 3: Lojista de Roupas
          "Carla tem loja de roupas. Ela usa o app para controlar estoque e vendas. Agora ela sabe quais peças vendem mais e nunca mais deixa faltar."

          ---

          ## 10. TECNOLOGIA

          - **Tipo:** PWA (Progressive Web App)
          - **Frontend:** React, Tailwind CSS
          - **Backend:** Base44 (BaaS)
          - **Funciona:** Em qualquer celular, tablet ou computador
          - **Instalação:** Direto do navegador (Chrome, Safari, etc)
          - **Tamanho:** Leve, carrega rápido

          ---

          ## 11. COMPARAÇÃO COM CONCORRENTES

          | Recurso | Lucro Certo | Apps Pagos | Planilhas |
          |---------|-------------|------------|-----------|
          | Preço | ✅ Grátis | ❌ R$30-100/mês | ✅ Grátis |
          | Módulo Revendas | ✅ Completo | ⚠️ Limitado | ❌ Manual |
          | Fácil de Usar | ✅ Muito | ⚠️ Médio | ❌ Difícil |
          | Mobile | ✅ Perfeito | ⚠️ Limitado | ❌ Ruim |
          | Relatórios | ✅ Automático | ✅ Sim | ❌ Manual |
          | Suporte | ✅ Grátis | 💰 Pago | ❌ Nenhum |

          ---

          ## 12. TOM DE VOZ & COMUNICAÇÃO

          ### Como Falar:
          - **Simples:** Sem termos técnicos
          - **Próximo:** Como um amigo ajudando
          - **Motivacional:** Foco no crescimento
          - **Honesto:** Sem promessas exageradas
          - **Empático:** Entende as dificuldades

          ### Evitar:
          - ❌ Jargões empresariais complexos
          - ❌ Tom corporativo/formal demais
          - ❌ Promessas milagrosas
          - ❌ Comparações agressivas
          - ❌ Linguagem técnica

          ### Usar:
          - ✅ Exemplos práticos do dia a dia
          - ✅ Histórias de empreendedores reais
          - ✅ Dicas úteis e acionáveis
          - ✅ Encorajamento e positividade
          - ✅ Emojis com moderação 😊

          ---

          ## 13. MENSAGENS-CHAVE

          **Mensagem Principal:**
          "Tenha controle total do seu negócio na palma da mão"

          **Mensagens Secundárias:**
          1. "Pare de perder dinheiro por desorganização"
          2. "Saiba quanto você realmente lucra"
          3. "Feito especialmente para pequenos empreendedores"
          4. "Tão simples que qualquer pessoa usa"
          5. "100% grátis, sem pegadinhas"

          ---

          ## 14. CALL TO ACTIONS

          - "Baixe Grátis Agora"
          - "Comece a Organizar Seu Negócio"
          - "Experimente Sem Compromisso"
          - "Veja Quanto Você Lucra de Verdade"
          - "Organize Suas Vendas Hoje"

          ---

          ## 15. PALAVRAS-CHAVE SEO

          **Principais:**
          - gestão financeira
          - controle de vendas
          - app para revendedoras
          - controle de estoque
          - lucro de pequeno negócio

          **Secundárias:**
          - app para ambulantes
          - controle de comissões
          - app para microempresa
          - gestão de revenda
          - controle financeiro grátis
          - app para feira livre

          ---

          ## 16. REDES SOCIAIS

          **Instagram & TikTok:** Foco principal (reels, stories)
          **Facebook:** Grupos de revendedoras e empreendedores
          **YouTube Shorts:** Tutoriais rápidos
          **WhatsApp:** Suporte e comunidade

          ---

          ## 17. ESTRATÉGIA DE CONTEÚDO

          **60% Educacional:**
          - Dicas de gestão financeira
          - Como calcular lucro
          - Erros comuns de empreendedores
          - Tutoriais do app

          **30% Promocional:**
          - Funcionalidades do app
          - Casos de sucesso
          - Comparações (antes x depois)

          **10% Pessoal:**
          - Bastidores
          - História do criador
          - Comunidade de usuários

          ---

          ## 18. OBJEÇÕES E RESPOSTAS

          **"Não sei usar tecnologia"**
          → "O app é tão simples quanto usar WhatsApp"

          **"Não tenho tempo para aprender"**
          → "Você aprende em 5 minutos, economiza horas"

          **"Caderno funciona para mim"**
          → "E se você perder o caderno? No app, nunca perde"

          **"É caro?"**
          → "100% grátis, sem taxas escondidas"

          **"Meu negócio é pequeno demais"**
          → "Feito especialmente para pequenos negócios!"

          ---

          ## 19. RESULTADOS ESPERADOS

          Para o usuário que usa consistentemente:
          - ✅ Clareza total sobre lucro real em 1 semana
          - ✅ Redução de perdas financeiras em 1 mês
          - ✅ Decisões mais inteligentes em 2 meses
          - ✅ Crescimento organizado em 3 meses

          ---

          ## 20. PRÓXIMOS PASSOS (ROADMAP)

          Funcionalidades futuras:
          - Integração com maquininhas de cartão
          - Emissão de nota fiscal
          - Múltiplos usuários (equipe)
          - Integração com contador
          - App nativo iOS/Android

          ---

          ## INSTRUÇÕES PARA IA (ChatGPT/Claude)

          Ao criar conteúdo para o Lucro Certo:

          1. **Foque nas dores reais** do público (desorganização, perda de dinheiro)
          2. **Use linguagem simples e direta**, sem jargões
          3. **Destaque o diferencial** do módulo de revendas
          4. **Inclua CTAs claros** em todo conteúdo
          5. **Adapte o tom** para cada plataforma (Instagram = casual, LinkedIn = profissional)
          6. **Use emojis com moderação** (1-3 por post)
          7. **Inclua números e dados** quando possível
          8. **Foque em benefícios, não só funcionalidades**
          9. **Conte histórias** de empreendedores reais (personas)
          10. **Seja autêntico**, não exagere nas promessas`;

                      navigator.clipboard.writeText(briefingCompleto);
                      setCopiedItems(prev => ({ ...prev, briefing: true }));
                      setTimeout(() => {
                        setCopiedItems(prev => ({ ...prev, briefing: false }));
                      }, 2000);
                    }}
                  >
                    {copiedItems['briefing'] ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedItems['briefing'] ? 'Copiado!' : 'Copiar Tudo'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-900 text-sm">
                      <strong>Como usar:</strong> Copie este briefing completo e cole no ChatGPT, Claude ou outra IA antes de pedir propagandas, posts ou conteúdo. A IA terá contexto total do app!
                    </AlertDescription>
                  </Alert>

                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-bold text-gray-900">📋 BRIEFING COMPLETO - LUCRO CERTO</h3>

                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-blue-900 mb-2">1. IDENTIFICAÇÃO</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li><strong>Nome:</strong> Lucro Certo</li>
                        <li><strong>Tagline:</strong> Gestão Financeira Completa para Pequenos Negócios</li>
                        <li><strong>Categoria:</strong> App de Gestão Financeira</li>
                        <li><strong>Plataforma:</strong> PWA (funciona em qualquer dispositivo)</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-purple-900 mb-2">2. PROBLEMA QUE RESOLVE</h4>
                      <div className="text-sm text-purple-800 space-y-2">
                        <p><strong>Dores:</strong></p>
                        <ul>
                          <li>❌ Desorganização (cadernos perdidos)</li>
                          <li>❌ Não saber o lucro real</li>
                          <li>❌ Esquecimento de cobranças</li>
                          <li>❌ Falta de visão geral do negócio</li>
                          <li>❌ Planilhas complicadas</li>
                        </ul>
                        <p className="mt-2"><strong>Solução:</strong></p>
                        <ul>
                          <li>✅ Tudo organizado em um lugar</li>
                          <li>✅ Cálculo automático de lucro</li>
                          <li>✅ Lembretes de pagamentos</li>
                          <li>✅ Interface simples e visual</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-green-900 mb-2">3. PÚBLICO-ALVO</h4>
                      <div className="text-sm text-green-800">
                        <p><strong>Perfil Principal:</strong></p>
                        <ul className="space-y-1 mb-3">
                          <li>• Idade: 25-55 anos</li>
                          <li>• 60-70% mulheres empreendedoras</li>
                          <li>• Renda: R$ 1.500 - R$ 10.000/mês</li>
                          <li>• Todo Brasil (interior e periferias)</li>
                        </ul>
                        <p><strong>Personas:</strong></p>
                        <ul className="space-y-2">
                          <li><strong>Maria (35 anos):</strong> Revendedora Natura/Avon, perde controle das comissões</li>
                          <li><strong>João (42 anos):</strong> Ambulante de feira, não sabe quanto lucra de verdade</li>
                          <li><strong>Ana (28 anos):</strong> Lojinha de roupas, usa planilha confusa</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-orange-900 mb-2">4. FUNCIONALIDADES PRINCIPAIS</h4>
                      <div className="text-sm text-orange-800 space-y-2">
                        <p><strong>📊 Dashboard:</strong> Visão geral, lucro automático, gráficos</p>
                        <p><strong>💰 Vendas:</strong> Cadastro rápido, controle de clientes, parcelamento</p>
                        <p><strong>🛒 Compras:</strong> Controle de fornecedores, integração com estoque</p>
                        <p><strong>📦 Estoque:</strong> Código de barras, alertas de estoque baixo</p>
                        <p><strong>🏪 Revendas (DIFERENCIAL!):</strong> Comissões, parcelas, calendário</p>
                        <p><strong>👥 Clientes:</strong> Cadastro completo, histórico de vendas</p>
                        <p><strong>💸 Gastos:</strong> Operacionais e pessoais separados</p>
                        <p><strong>📈 Relatórios:</strong> Lucros, produtos, gastos - exporta Excel</p>
                      </div>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-pink-900 mb-2">5. DIFERENCIAIS</h4>
                      <div className="text-sm text-pink-800">
                        <ul className="space-y-1">
                          <li>✨ 100% Gratuito (sem mensalidade)</li>
                          <li>✨ Módulo de Revendas ÚNICO no mercado</li>
                          <li>✨ Interface super simples (qualquer pessoa usa)</li>
                          <li>✨ Mobile First (funciona perfeitamente no celular)</li>
                          <li>✨ Dados seguros na nuvem</li>
                          <li>✨ Funciona offline</li>
                          <li>✨ Sem anúncios</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-indigo-900 mb-2">6. TOM DE VOZ</h4>
                      <div className="text-sm text-indigo-800">
                        <p><strong>Usar:</strong> Simples, próximo, motivacional, empático</p>
                        <p><strong>Evitar:</strong> Jargões técnicos, corporativo demais, promessas exageradas</p>
                        <p className="mt-2"><strong>Mensagens-chave:</strong></p>
                        <ul>
                          <li>• "Tenha controle total do seu negócio na palma da mão"</li>
                          <li>• "Pare de perder dinheiro por desorganização"</li>
                          <li>• "Saiba quanto você realmente lucra"</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-bold text-yellow-900 mb-2">7. INSTRUÇÕES PARA IA</h4>
                      <div className="text-sm text-yellow-800">
                        <p>Ao criar conteúdo para o Lucro Certo:</p>
                        <ol className="space-y-1 mt-2">
                          <li>1. Foque nas dores reais (desorganização, perda de dinheiro)</li>
                          <li>2. Use linguagem simples e direta</li>
                          <li>3. Destaque o módulo de revendas</li>
                          <li>4. Inclua CTAs claros</li>
                          <li>5. Adapte o tom para cada plataforma</li>
                          <li>6. Use emojis com moderação (1-3 por post)</li>
                          <li>7. Foque em benefícios, não só funcionalidades</li>
                          <li>8. Conte histórias reais</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">💡 Como Usar Este Briefing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-blue-900">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">1.</span>
                    <div>
                      <strong>Copie o briefing completo</strong>
                      <p className="text-blue-700">Clique em "Copiar Tudo" acima</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">2.</span>
                    <div>
                      <strong>Cole no ChatGPT ou outra IA</strong>
                      <p className="text-blue-700">Comece a conversa colando o briefing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">3.</span>
                    <div>
                      <strong>Peça o que você precisa</strong>
                      <p className="text-blue-700">Exemplos: "Crie 10 posts para Instagram" ou "Escreva script para vídeo de 30s"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">4.</span>
                    <div>
                      <strong>Refine conforme necessário</strong>
                      <p className="text-blue-700">Peça ajustes: "Torne mais casual" ou "Adicione mais emojis"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA PLAY STORE */}
          <TabsContent value="playstore" className="space-y-6">
            {/* Especificações */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Especificações da Play Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {especificacoes.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:justify-between md:items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{item.item}</span>
                      <span className="text-sm text-gray-600 md:text-right">{item.spec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ícone do App */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Ícone do Aplicativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <svg viewBox="0 0 24 24" fill="none" className="w-20 h-20 text-white">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.5"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Ícone Atual</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      O ícone já está configurado no app (512x512 px). Você pode usar este ou criar um personalizado.
                    </p>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-800 text-sm">
                        <strong>Dica:</strong> Use Canva ou Leonardo.ai para criar um ícone profissional personalizado.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screenshots */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Screenshots Necessários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-orange-50 border-orange-200">
                  <AlertDescription className="text-orange-800">
                    📸 Você precisa tirar screenshots do app. Mínimo 2, recomendado 5-8 imagens.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Telas Sugeridas:</h4>
                  {screenshots.map((screen, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{screen.nome}</p>
                        <p className="text-sm text-gray-600">{screen.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Textos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Textos para a Loja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold text-gray-900">Título do App</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(textosSugeridos.titulo, 'titulo')}
                      >
                        {copiedItems['titulo'] ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copiedItems['titulo'] ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{textosSugeridos.titulo}</p>
                    </div>
                  </div>

                  {/* Descrição Curta */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold text-gray-900">Descrição Curta</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(textosSugeridos.descricaoCurta, 'curta')}
                      >
                        {copiedItems['curta'] ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copiedItems['curta'] ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{textosSugeridos.descricaoCurta}</p>
                    </div>
                  </div>

                  {/* Descrição Completa */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold text-gray-900">Descrição Completa</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(textosSugeridos.descricaoCompleta, 'completa')}
                      >
                        {copiedItems['completa'] ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copiedItems['completa'] ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {textosSugeridos.descricaoCompleta}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA REDES SOCIAIS */}
          <TabsContent value="social" className="space-y-6">
            {/* Posts Instagram */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Posts para Instagram/Facebook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {postsRedesSociais.instagram.map((post, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-purple-900">{post.titulo}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(post.texto, `post-${idx}`)}
                        >
                          {copiedItems[`post-${idx}`] ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                          {copiedItems[`post-${idx}`] ? 'Copiado!' : 'Copiar'}
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border mb-3">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{post.texto}</pre>
                      </div>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-800 text-xs">
                          💡 <strong>Dica visual:</strong> {post.dica}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stories */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Ideias para Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {postsRedesSociais.stories.map((story, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
                      <Badge className="mb-2">{story.tipo}</Badge>
                      <p className="text-sm whitespace-pre-wrap mb-3">{story.texto}</p>
                      <p className="text-xs text-gray-600 italic">💡 {story.dica}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scripts de Vídeo */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Scripts para Vídeos (TikTok/Reels)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {scriptsVideo.map((video, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-red-900">{video.titulo}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(video.script, `video-${idx}`)}
                        >
                          {copiedItems[`video-${idx}`] ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                          {copiedItems[`video-${idx}`] ? 'Copiado!' : 'Copiar'}
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border mb-3">
                        <pre className="text-sm whitespace-pre-wrap font-mono">{video.script}</pre>
                      </div>
                      <p className="text-xs text-gray-600 italic">💡 {video.dica}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  #️⃣ Hashtags Sugeridas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(hashtagsSugeridas).map(([categoria, tags]) => (
                    <div key={categoria}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 capitalize">{categoria}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(tags.join(' '), `hashtag-${categoria}`)}
                        >
                          {copiedItems[`hashtag-${categoria}`] ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copiar todas
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOVA ABA ESTRATÉGIA */}
          <TabsContent value="estrategia" className="space-y-6">
            <Alert className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <Calendar className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Calendário Editorial & Estratégia de Conteúdo</strong>
                <p className="text-sm mt-1">Planejamento completo para lançamento e crescimento nas redes sociais</p>
              </AlertDescription>
            </Alert>

            {/* Estratégia Geral */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>📊 Estratégia de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">Frequência de Postagem</h4>
                    <p className="text-blue-800">{calendarioConteudo.estrategia.frequencia}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">Melhores Horários</h4>
                    <ul className="space-y-1">
                      {calendarioConteudo.estrategia.melhoresHorarios.map((horario, idx) => (
                        <li key={idx} className="text-purple-800 text-sm">• {horario}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-900 mb-2">Dias da Semana</h4>
                    <ul className="space-y-1">
                      {calendarioConteudo.estrategia.diasMelhores.map((dia, idx) => (
                        <li key={idx} className="text-green-800 text-sm">• {dia}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-900 mb-2">Mix de Conteúdo (Regra 60-30-10)</h4>
                    <ul className="space-y-1">
                      {calendarioConteudo.estrategia.mix.map((item, idx) => (
                        <li key={idx} className="text-orange-800 text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendário Semanal */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>📅 Calendário Semanal de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calendarioConteudo.exemplos.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className="mb-2">{item.dia}</Badge>
                          <h4 className="font-bold text-gray-900">{item.tipo}</h4>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.formato}</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{item.exemplo}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estratégia de Lançamento */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>🚀 Plano de Lançamento (Fase por Fase)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {estrategiaLancamento.map((fase, idx) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-3">{fase.fase}</h4>
                      <ul className="space-y-2">
                        {fase.acoes.map((acao, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{acao}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dicas Extras */}
            <Card className="shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-orange-900">💡 Dicas Extras para Crescer Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">1.</span>
                    <div>
                      <strong>Repurpose o mesmo conteúdo:</strong> 1 ideia = 1 post Instagram + 1 Reels + 3 Stories + 1 TikTok
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">2.</span>
                    <div>
                      <strong>Use trends:</strong> Adapte áudios virais do TikTok/Reels para o seu nicho
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">3.</span>
                    <div>
                      <strong>Engajamento é tudo:</strong> Responda TODOS os comentários nas primeiras 2 horas
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">4.</span>
                    <div>
                      <strong>Colaborações:</strong> Encontre 3-5 revendedoras pequenas e façam lives juntas
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">5.</span>
                    <div>
                      <strong>Teste ads pagos:</strong> Depois de 50 downloads orgânicos, invista R$5-10/dia em Facebook Ads
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA FERRAMENTAS IA */}
          <TabsContent value="ferramentas" className="space-y-6">
            <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <AlertDescription className="text-purple-900">
                <strong>Ferramentas de IA para criar conteúdo profissional</strong>
                <p className="text-sm mt-1">A maioria tem plano gratuito! ⭐ = Grátis</p>
              </AlertDescription>
            </Alert>

            {ferramentasIA.map((categoria, catIdx) => (
              <Card key={catIdx} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{categoria.categoria}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoria.ferramentas.map((ferramenta, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{ferramenta.nome}</h4>
                            {ferramenta.gratis && <Badge variant="secondary" className="bg-green-100 text-green-800">⭐ Grátis</Badge>}
                          </div>
                          <a
                            href={`https://${ferramenta.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {ferramenta.link}
                          </a>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ferramenta.descricao}</p>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-blue-900">
                            <strong>Como usar:</strong> {ferramenta.uso}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ABA PROMPTS IA */}
          <TabsContent value="prompts" className="space-y-6">
            <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Prompts prontos para usar em ChatGPT, Leonardo.ai, etc</strong>
                <p className="text-sm mt-1">Copie e cole nas ferramentas de IA!</p>
              </AlertDescription>
            </Alert>

            {/* Prompts para Imagens */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>🎨 Prompts para Criar Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promptsIA.imagens.map((prompt, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-purple-50 hover:bg-purple-100 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm flex-1">{prompt}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(prompt, `img-${idx}`)}
                        >
                          {copiedItems[`img-${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  💡 Use em: Leonardo.ai, Ideogram, Midjourney, Canva Magic Design
                </p>
              </CardContent>
            </Card>

            {/* Prompts para Vídeos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>🎥 Prompts para Criar Vídeos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promptsIA.videos.map((prompt, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-red-50 hover:bg-red-100 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm flex-1">{prompt}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(prompt, `vid-${idx}`)}
                        >
                          {copiedItems[`vid-${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  💡 Use em: InVideo AI, Runway ML, ChatGPT (para scripts)
                </p>
              </CardContent>
            </Card>

            {/* Prompts para Textos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>✍️ Prompts para Criar Textos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promptsIA.textos.map((prompt, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-green-50 hover:bg-green-100 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm flex-1">{prompt}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(prompt, `txt-${idx}`)}
                        >
                          {copiedItems[`txt-${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  💡 Use em: ChatGPT, Copy.ai, Jasper
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}