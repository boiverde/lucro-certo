
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Receipt,
  BarChart3,
  Smartphone,
  Users,
  Shield,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import InstallInstructions from "../components/pwa/InstallInstructions";
import { Badge } from "@/components/ui/badge"; // Added for the new Badge component

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // Usuário não está logado
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Se usuário está logado, redireciona para Dashboard
  if (user) {
    window.location.href = createPageUrl("Dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lucro Certo</h1>
                <p className="text-sm text-gray-500">Gestão do seu negócio</p>
              </div>
            </div>
            <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700">
              Entrar com Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Garanta seu
            <span className="text-green-600"> Lucro Certo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gerencie compras, vendas, gastos operacionais e tenha relatórios detalhados para calcular seus lucros de forma automática.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleLogin}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3"
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver Funcionalidades
            </Button>
          </div>

          {/* App Preview Badge */}
          <div className="mt-8 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  <strong>100% Mobile</strong> - Funciona como um app no seu celular
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para gerenciar seu negócio
            </h2>
            <p className="text-xl text-gray-600">
              Ferramentas simples e poderosas para controlar suas finanças
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Controle de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Registre suas compras por quantidade e valor unitário.
                  Cálculo automático do valor total.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Gestão de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acompanhe suas vendas por quilo.
                  Calcule automaticamente seus lucros.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Gastos Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Controle alimentação, gasolina, diárias
                  e outros custos do seu negócio.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Gastos Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acompanhe seus gastos pessoais: aluguel, mercado,
                  gasolina e compare com os ganhos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Relatórios Detalhados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualize gráficos, análises por produto
                  e exporte dados para Excel.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-2 border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">App Mobile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Instale na tela do seu celular e use
                  como um aplicativo real.
                </p>
                <Badge className="bg-green-100 text-green-800">
                  Sem download necessário!
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Por que escolher nosso sistema?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">100% Gratuito</h3>
                    <p className="text-gray-600">Use todas as funcionalidades sem pagar nada.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Acesso Mobile</h3>
                    <p className="text-gray-600">Funciona perfeitamente no seu celular, como um app.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Dados Seguros</h3>
                    <p className="text-gray-600">Seus dados são privados e protegidos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Fácil de Usar</h3>
                    <p className="text-gray-600">Interface simples e intuitiva.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comece Hoje Mesmo
                </h3>
                <p className="text-gray-600 mb-6">
                  Cadastre-se em segundos e comece a controlar
                  seus gastos imediatamente.
                </p>
                <Button
                  size="lg"
                  onClick={handleLogin}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Criar Conta Grátis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para organizar suas finanças?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de empreendedores que já controlam seus gastos conosco.
          </p>
          <Button
            size="lg"
            onClick={handleLogin}
            className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Começar Agora - É Grátis!
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Lucro Certo</span>
          </div>
          <p className="text-gray-400 mb-4">
            © 2024 Lucro Certo. Feito com ❤️ para empreendedores.
          </p>
          <Link to={createPageUrl("PoliticaDePrivacidade")} className="text-sm text-gray-500 hover:text-white transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </footer>

      {/* Install Instructions Component */}
      <InstallInstructions />
    </div>
  );
}
