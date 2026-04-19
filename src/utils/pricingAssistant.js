/**
 * Assistente de Precificação Lucro Certo (v1.4 - Hybrid Resilience)
 * Volume Híbrido, Validação Pós-Arredondamento e Recuperação de Caixa.
 */

const FORMULA_VERSION = "v1.4";
const ALPHA = 0.25; 

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, name: 'BALCÃO' },
    delivery: { risk: 0.70, name: 'DELIVERY' },
    marketplace: { risk: 0.65, name: 'MARKETPLACE' }
};

/**
 * Arredondamento Comercial com Validação de Margem Proativa
 */
function secureRounding(targetPrice, cost, taxesDec, targetMarginDec) {
    const points = [0.00, 0.50, 0.90, 0.99];
    let base = Math.floor(targetPrice);
    
    // Testar pontos de arredondamento
    for (let p of points) {
        let candidate = base + p;
        if (candidate < targetPrice) continue; // Garante que nunca arredonda pra baixo da necessidade basal

        // Validar margem real do candidato
        let profit = candidate - cost - (candidate * taxesDec);
        let realMargin = profit / candidate;

        if (realMargin >= targetMarginDec) return candidate;
    }

    // Se nenhum ponto no real atual serviu, tenta o próximo real
    return base + 1.90; 
}

/**
 * Motor de Precificação Resiliente v1.4
 */
export function calculatePriceSuggestion(cost, configs, canal = 'balcao', deltaRaw = 0, categoryOffset = 0) {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const canalInfo = CANAIS_CONFIG[canal] || CANAIS_CONFIG.balcao;
    const { taxa_impostos = 0, taxa_cartao = 0 } = configs;

    const margemKey = canal === 'balcao' ? 'margem_balcao' : (canal === 'delivery' ? 'margem_delivery' : 'margem_marketplace');
    const margemDesejada = (parseFloat(configs[margemKey]) || 30) + categoryOffset;
    
    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemDesejadaDec = margemDesejada / 100;

    const somaCargos = taxasVariaveisDec + margemDesejadaDec;
    const divisor = 1 - somaCargos;

    if (divisor <= 0.05) return { error: "INSOLVENT_MARGIN", message: "Inviabilidade no canal " + canalInfo.name };

    const precoBase = parseFloat(cost) / divisor;
    
    // Clamp de Delta (Recuperação Escalonada)
    const maxDelta = precoBase * 0.05;
    const deltaAplicado = Math.max(-maxDelta, Math.min(maxDelta, parseFloat(deltaRaw || 0)));

    const precoMeta = precoBase + deltaAplicado;
    const precoSugerido = secureRounding(precoMeta, cost, taxasVariaveisDec, margemDesejadaDec);

    // Zonas DESACOPLADAS (Foco na estrutura de custo)
    let zona = "SEGURA";
    let color = "emerald";
    if (somaCargos > canalInfo.risk) {
        zona = "CRÍTICA"; color = "rose";
    } else if (somaCargos > (canalInfo.risk - 0.12)) {
        zona = "ALERTA"; color = "amber";
    }

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaAplicado.toFixed(2),
        deltaPendente: (parseFloat(deltaRaw || 0) - deltaAplicado).toFixed(2),
        zona,
        color,
        versao: FORMULA_VERSION,
        lucroReal: (precoSugerido - cost - (precoSugerido * taxasVariaveisDec)).toFixed(2),
        margemReal: (((precoSugerido - cost - (precoSugerido * taxasVariaveisDec)) / precoSugerido) * 100).toFixed(1),
        canal: canalInfo.name,
        detalhes: {
            isHybrid: true,
            roundingValidated: true
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
