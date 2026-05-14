
import React, { useState, useEffect } from "react";
import { handleApiError } from '@/api/errorHandler';
import { toast } from 'sonner';
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { httpClient } from "@/api/httpClient";
import { usePlan } from "@/api/usePlan";
import {
  LayoutDashboard,
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  X,
  Store,
  Users,
  Sliders,
  Settings,
  Rocket,
  Crown,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// ── Menu principal (Play Store removido) ──────────────────────────
const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Plano",     url: createPageUrl("Plano"),     icon: Rocket },
  { title: "PDV e Controle", url: createPageUrl("Controle"), icon: Sliders },
  { title: "Estoque",   url: createPageUrl("Estoque"),   icon: Store },
  { title: "Clientes",  url: createPageUrl("Clientes"),  icon: Users },
  { title: "Relatórios",url: createPageUrl("Relatorios"),icon: BarChart3 },
  { title: "Markup",    url: createPageUrl("Configuracoes"), icon: Settings },
];

// ── Badge de plano ─────────────────────────────────────────────────
function PlanBadge({ plan, onClick }) {
  if (plan === 'pro') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold cursor-default select-none">
        <Crown className="w-3 h-3" />
        Plano PRO
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors animate-pulse"
    >
      <Zap className="w-3 h-3" />
      Plano FREE
    </button>
  );
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { plan } = usePlan();

  const paginasPublicas = ["Home", "PoliticaDePrivacidade", "MarketingAssets", "GuiaPlayStore", "GuiaGooglePlay", "Login", "Register"];
  const isPaginaPublica = paginasPublicas.includes(currentPageName);

  useEffect(() => {
    if (isPaginaPublica) {
      setUser({ public: true });
      return;
    }
    const checkUser = async () => {
      try {
        const currentUser = await httpClient('/auth/me');
        setUser(currentUser);
      } catch (error) {
        handleApiError(error, 'validar sessão');
        console.error('Falha ao validar sessão:', error);
        if (error.status === 401 || !localStorage.getItem('auth_token')) {
          window.location.href = '/Login';
        } else {
          setUser({ full_name: 'Admin', email: 'admin@lucrocerto.com' });
        }
      }
    };
    checkUser();
  }, [currentPageName, isPaginaPublica]);

  const handleLogout = async () => {
    await httpClient('/auth/logout', { method: 'POST' });
    window.location.href = createPageUrl("Home");
  };

  const goToPlano = () => {
    window.location.href = createPageUrl("Plano");
  };

  if (isPaginaPublica) {
    return (
      <>
        <div style={{ display: 'none' }}>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="theme-color" content="#16a34a" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Lucro Certo" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
          <link rel="manifest" href="/manifest.json" />
        </div>
        {children}
      </>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'none' }}>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lucro Certo" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </div>

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <Sidebar className="border-r border-gray-200">
              <SidebarHeader className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 leading-tight">Lucro Certo</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Control Panel</p>
                    </div>
                  </div>
                  {/* Link administrativo condicional */}
                  {user?.email === 'admin@lucrocerto.com' && (
                    <Link 
                      to="/Growth" 
                      className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all rounded-xl shadow-sm border border-indigo-100 group"
                      title="Growth Dashboard"
                    >
                      <Zap className="w-5 h-5 group-hover:animate-pulse" />
                    </Link>
                  )}
                </div>
              </SidebarHeader>

              <SidebarContent className="p-2">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                    Menu Principal
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => {
                        const isPlano = item.title === 'Plano';
                        const isActive = location.pathname === item.url;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              className={`hover:bg-green-50 hover:text-green-700 transition-colors duration-200 rounded-lg mb-1 ${isActive ? 'bg-green-50 text-green-700' : ''}`}
                            >
                              <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium flex-1">{item.title}</span>
                                {/* Badge FREE piscando apenas no item Plano quando free */}
                                {isPlano && plan === 'free' && (
                                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full animate-pulse">
                                    FREE
                                  </span>
                                )}
                                {isPlano && plan === 'pro' && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">
                                    PRO
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-gray-200 p-4 space-y-3">
                {/* Plan badge */}
                {plan && (
                  <div className="flex justify-center">
                    <PlanBadge plan={plan} onClick={goToPlano} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-medium text-sm">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {user?.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col overflow-auto">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="md:hidden min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-gray-900">Lucro Certo</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Badge plano no header mobile */}
              {plan && <PlanBadge plan={plan} onClick={goToPlano} />}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-medium">{user?.full_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user?.full_name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
            <div className="mt-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 mb-1 ${location.pathname === item.url ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto pb-20">{children}</main>

        {/* Bottom nav mobile — 5 primeiros itens */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
          <div className="flex justify-around items-center px-1 py-2">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${isActive ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <style>{`
        .safe-area-top { padding-top: env(safe-area-inset-top); }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
        @media (max-width: 768px) { body { overscroll-behavior-y: none; } }
      `}</style>
    </>
  );
}
