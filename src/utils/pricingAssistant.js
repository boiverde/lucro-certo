/**
 * Assistente de Precificação Lucro Certo (v2.0 - Adaptive Calibration)
 * Atrito Dinâmico f(CV, Canal), Piso Tau e Diversidade de SKU.
 */

const FORMULA_VERSION = "v2.0";
const ABSOLUTE_CAP = 10.00; 
const PERCENT_CAP = 0.20;   
const MAX_TICK_STEP = 5.00; 

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, friction_base: 0.05, name: 'BALCÃO' },
    delivery: { risk: 0.70, friction_base: 0.12, name: 'DELIVERY' },
    marketplace: { risk: 0.65, friction_base: 0.18, name: 'MARKETPLACE' }
};

/**
 * Cálculo de Atrito Adaptativo
 * f(CV, Canal) = 1 - (CV * 0.4) - offset_canal
 */
function calculateAdaptiveFriction(cv = 0.2, canal = 'balcao') {
    const config = CANAIS_CONFIG[canal] || CANAIS_CONFIG.balcao;
    const friction = 1 - (cv * 0.4) - config.friction_base;
    return Math.max(0.60, Math.min(0.95, friction));
}

/**
 * Arredondamento com Governança v2.0
 */
function secureAdaptiveRounding(targetPrice, currentPrice, cost, taxesDec, targetMarginDec) {
    const points = [0.00, 0.50, 0.90, 0.99];
    const capValue = Math.min(currentPrice * PERCENT_CAP, ABSOLUTE_CAP, MAX_TICK_STEP);
    const maxAllowed = currentPrice + capValue;
    const minAllowed = currentPrice - capValue;

    const baseMeta = Math.max(minAllowed, Math.min(maxAllowed, targetPrice));
    
    let integerPart = Math.floor(baseMeta);
    let candidates = [];
    for (let offset of [0, 1]) {
        for (let p of points) {
            candidates.push(integerPart + offset + p);
        }
    }

    let valid = candidates.filter(c => {
        if (c <= 0) return false;
        let profit = c - cost - (c * taxesDec);
        let margin = profit / c;
        return margin >= (targetMarginDec - 0.01) && c <= maxAllowed;
    });

    valid.sort((a, b) => a - b);
    return valid.find(c => c >= baseMeta) || baseMeta;
}

/**
 * Motor de Precificação Auto-Calibrado v2.0
 */
export function calculatePriceSuggestion(cost, currentPrice, configs, canal = 'balcao', deltaRaw = 0, cv = 0.2) {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const { taxa_impostos = 0, taxa_cartao = 0 } = configs;
    const margemKey = canal === 'balcao' ? 'margem_balcao' : (canal === 'delivery' ? 'margem_delivery' : 'margem_marketplace');
    const margemAlvoBase = (parseFloat(configs[margemKey]) || 30);
    
    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemAlvoDec = margemAlvoBase / 100;

    const divisor = 1 - (taxasVariaveisDec + margemAlvoDec);
    if (divisor <= 0.05) return { error: "INSOLVENT_MARGIN" };

    const precoBase = parseFloat(cost) / divisor;
    const stepDelta = precoBase * 0.05;
    const deltaAplicado = Math.max(-stepDelta, Math.min(stepDelta, parseFloat(deltaRaw || 0)));

    const precoSugerido = secureAdaptiveRounding(precoBase + deltaAplicado, parseFloat(currentPrice || precoBase), cost, taxasVariaveisDec, margemAlvoDec);

    const deltaTotalRestante = Math.abs(parseFloat(deltaRaw || 0));
    const ciclosTotais = Math.ceil(deltaTotalRestante / (stepDelta || 1));
    const ciclosRestantes = Math.ceil(Math.abs(parseFloat(deltaRaw || 0) - deltaAplicado) / (stepDelta || 1));
    
    const lucroTeorico = (precoSugerido - cost - (precoSugerido * taxasVariaveisDec)) - (precoBase * margemAlvoDec);
    const friction = calculateAdaptiveFriction(cv, canal);

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaAplicado.toFixed(2),
        cicloAtual: (Math.max(1, ciclosTotais) - ciclosRestantes),
        ciclosTotais: Math.max(1, ciclosTotais),
        ganhoRealista: (lucroTeorico * friction).toFixed(2),
        ganhoOtimista: lucroTeorico.toFixed(2),
        confianca: (friction * 100).toFixed(0),
        versao: FORMULA_VERSION
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
