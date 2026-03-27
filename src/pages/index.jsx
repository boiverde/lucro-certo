import Layout from "./Layout.jsx";

import Compras from "./Compras";

import Dashboard from "./Dashboard";

import Vendas from "./Vendas";

import Relatorios from "./Relatorios";

import Home from "./Home";

import Pessoais from "./Pessoais";

import PoliticaDePrivacidade from "./PoliticaDePrivacidade";

import MarketingAssets from "./MarketingAssets";

import Revendas from "./Revendas";

import Clientes from "./Clientes";

import GuiaPlayStore from "./GuiaPlayStore";

import ConfiguracaoManifest from "./ConfiguracaoManifest";

import Estoque from "./Estoque";

import Controle from "./Controle";

import GuiaPublicacao from "./GuiaPublicacao";

import Configuracoes from "./Configuracoes";

import GuiaGooglePlay from "./GuiaGooglePlay";

import CorrigirDNS from "./CorrigirDNS";

import GuiaExportacao from "./GuiaExportacao";
import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Compras: Compras,

    Dashboard: Dashboard,

    Vendas: Vendas,

    Relatorios: Relatorios,

    Home: Home,

    Pessoais: Pessoais,

    PoliticaDePrivacidade: PoliticaDePrivacidade,

    MarketingAssets: MarketingAssets,

    Revendas: Revendas,

    Clientes: Clientes,

    GuiaPlayStore: GuiaPlayStore,

    ConfiguracaoManifest: ConfiguracaoManifest,

    Estoque: Estoque,

    Controle: Controle,

    GuiaPublicacao: GuiaPublicacao,

    Configuracoes: Configuracoes,

    GuiaGooglePlay: GuiaGooglePlay,

    CorrigirDNS: CorrigirDNS,

    GuiaExportacao: GuiaExportacao,

    Login: Login,

}

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

            </Routes>
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