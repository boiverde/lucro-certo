/**
 * Assistente de Precificação Lucro Certo (v1.2 - High Stability)
 * Zonas de risco parametrizadas e Fator Delta (Δ).
 */

const FORMULA_VERSION = "v1.2";

const CANAIS_CONFIG = {
    balcao: { field: 'margem_balcao', risk: 0.75, name: 'BALCÃO' },
    delivery: { field: 'margem_delivery', risk: 0.70, name: 'DELIVERY' },
    marketplace: { field: 'margem_marketplace', risk: 0.65, name: 'MARKETPLACE' }
};

/**
 * Calcula a sugestão de preço com análise de zonas de risco
 */
export function calculatePriceSuggestion(cost, configs, canal = 'balcao', deltaRecuperacao = 0) {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const canalInfo = CANAIS_CONFIG[canal] || CANAIS_CONFIG.balcao;
    const { taxa_impostos = 0, taxa_cartao = 0 } = configs;

    const margemDesejada = parseFloat(configs[canalInfo.field]) || 30;
    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemDesejadaDec = margemDesejada / 100;

    const somaCargos = taxasVariaveisDec + margemDesejadaDec;
    
    // Análise de Zonas de Risco
    let zona = "SEGURA";
    let warning = null;
    let color = "emerald";

    if (somaCargos > canalInfo.risk) {
        zona = "CRÍTICA";
        warning = `ZONA CRÍTICA: Os custos + lucro excedem ${canalInfo.risk * 100}% do preço no canal ${canalInfo.name}.`;
        color = "red";
    } else if (somaCargos > (canalInfo.risk - 0.15)) {
        zona = "ALERTA";
        warning = `ZONA DE ATENÇÃO: Margem de erro reduzida para este canal.`;
        color = "amber";
    }

    if (somaCargos >= 0.95) {
        return { error: "INSOLVENT_MARGIN", message: "Inviabilidade matemática no canal " + canalInfo.name };
    }

    const divisor = 1 - somaCargos;
    const precoBase = parseFloat(cost) / divisor;
    const precoSugeridoFinal = precoBase + parseFloat(deltaRecuperacao || 0);

    return {
        precoSugerido: precoSugeridoFinal.toFixed(2),
        delta: parseFloat(deltaRecuperacao || 0).toFixed(2),
        zona,
        color,
        warning,
        versao: FORMULA_VERSION,
        lucroUnitario: (precoSugeridoFinal * margemDesejadaDec).toFixed(2),
        margemLiquida: margemDesejada.toFixed(1),
        canal: canalInfo.name,
        detalhes: {
            markupEquivalente: (1 / divisor).toFixed(2),
            divisor: divisor.toFixed(4)
        }
    };
}

/**
 * Analisa a saúde financeira e registra variação (Filtro de Lote)
 */
export function analyzeCurrentPrice(cost, currentPrice, configs) {
    if (!cost || !currentPrice || cost <= 0 || currentPrice <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0
    } = configs;

    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const precoVenda = parseFloat(currentPrice);
    const custo = parseFloat(cost);

    // Margem Líquida Real = (Preço - Custo - (Preço * Taxas)) / Preço
    const lucroLiquidoUnitario = precoVenda - custo - (precoVenda * taxasVariaveisDec);
    const margemLiquidaReal = (lucroLiquidoUnitario / precoVenda) * 100;

    let status = "OK";
    let message = "Operação saudável.";
    let color = "emerald";

    if (margemLiquidaReal < 0) {
        status = "DANGER";
        message = "Preço abaixo do ponto de equilíbrio (Prejuízo!).";
        color = "red";
    } else if (margemLiquidaReal < 15) {
        status = "WARNING";
        message = "Margem de segurança crítica.";
        color = "amber";
    }

    return {
        lucroUnitario: lucroLiquidoUnitario.toFixed(2),
        margemLiquida: margemLiquidaReal.toFixed(1),
        status,
        message,
        color
    };
}
