import React, { Suspense, lazy } from 'react';
import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const Compras = lazy(() => import("./Compras"));
const Dashboard = lazy(() => import("./Dashboard"));
const Vendas = lazy(() => import("./Vendas"));
const Relatorios = lazy(() => import("./Relatorios"));
const Home = lazy(() => import("./Home"));
const Pessoais = lazy(() => import("./Pessoais"));
const PoliticaDePrivacidade = lazy(() => import("./PoliticaDePrivacidade"));
const MarketingAssets = lazy(() => import("./MarketingAssets"));
const Revendas = lazy(() => import("./Revendas"));
const Clientes = lazy(() => import("./Clientes"));
const GuiaPlayStore = lazy(() => import("./GuiaPlayStore"));
const ConfiguracaoManifest = lazy(() => import("./ConfiguracaoManifest"));
const Estoque = lazy(() => import("./Estoque"));
const Controle = lazy(() => import("./Controle"));
const GuiaPublicacao = lazy(() => import("./GuiaPublicacao"));
const Configuracoes = lazy(() => import("./Configuracoes"));
const GuiaGooglePlay = lazy(() => import("./GuiaGooglePlay"));
const CorrigirDNS = lazy(() => import("./CorrigirDNS"));
const GuiaExportacao = lazy(() => import("./GuiaExportacao"));
const Login = lazy(() => import("./Login"));
const AdminUpgrade = lazy(() => import("./AdminUpgrade"));
const Plano = lazy(() => import("./Plano"));

const PAGES = {
    Compras,
    Dashboard,
    Vendas,
    Relatorios,
    Home,
    Pessoais,
    PoliticaDePrivacidade,
    MarketingAssets,
    Revendas,
    Clientes,
    GuiaPlayStore,
    ConfiguracaoManifest,
    Estoque,
    Controle,
    GuiaPublicacao,
    Configuracoes,
    GuiaGooglePlay,
    CorrigirDNS,
    GuiaExportacao,
    Login,
    AdminUpgrade,
    Plano
};

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center text-gray-500">Carregando página...</div>}>
                <Routes>
                    <Route path="/" element={<Compras />} />
                    <Route path="/Compras" element={<Compras />} />
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Vendas" element={<Vendas />} />
                    <Route path="/Relatorios" element={<Relatorios />} />
                    <Route path="/Home" element={<Home />} />
                    <Route path="/Pessoais" element={<Pessoais />} />
                    <Route path="/PoliticaDePrivacidade" element={<PoliticaDePrivacidade />} />
                    <Route path="/MarketingAssets" element={<MarketingAssets />} />
                    <Route path="/Revendas" element={<Revendas />} />
                    <Route path="/Clientes" element={<Clientes />} />
                    <Route path="/GuiaPlayStore" element={<GuiaPlayStore />} />
                    <Route path="/ConfiguracaoManifest" element={<ConfiguracaoManifest />} />
                    <Route path="/Estoque" element={<Estoque />} />
                    <Route path="/Controle" element={<Controle />} />
                    <Route path="/GuiaPublicacao" element={<GuiaPublicacao />} />
                    <Route path="/Configuracoes" element={<Configuracoes />} />
                    <Route path="/GuiaGooglePlay" element={<GuiaGooglePlay />} />
                    <Route path="/CorrigirDNS" element={<CorrigirDNS />} />
                    <Route path="/GuiaExportacao" element={<GuiaExportacao />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/AdminUpgrade" element={<AdminUpgrade />} />
                    <Route path="/Plano" element={<Plano />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}