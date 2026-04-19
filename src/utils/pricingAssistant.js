/**
 * Assistente de Precificação Lucro Certo (v2.1 - Decision Transparency)
 * Confiança Semântica, EWMA Friction e Filtro de Representatividade.
 */

const FORMULA_VERSION = "v2.1";
const ABSOLUTE_CAP = 10.00; 
const PERCENT_CAP = 0.20;   
const MAX_TICK_STEP = 5.00; 

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, friction_base: 0.05 },
    delivery: { risk: 0.70, friction_base: 0.12 },
    marketplace: { risk: 0.65, friction_base: 0.18 }
};

/**
 * Tradutor de Confiança Semântica
 */
function getConfidenceLabel(confidenceValue) {
    if (confidenceValue >= 0.90) return { label: "ALTA", color: "emerald", desc: "Dados robustos e estáveis" };
    if (confidenceValue >= 0.75) return { label: "MÉDIA", color: "indigo", desc: "Em fase de validação" };
    return { label: "BAIXA", color: "amber", desc: "Dados voláteis ou parciais" };
}

/**
 * Motor de Precificação Transparência v2.1
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

    // Arredondamento High Precision (mantido da v2.0)
    const capValue = Math.min(parseFloat(currentPrice || precoBase) * PERCENT_CAP, ABSOLUTE_CAP, MAX_TICK_STEP);
    const precoSugeridoBase = precoBase + deltaAplicado;
    const precoSugerido = Math.max(parseFloat(currentPrice || precoBase) - capValue, Math.min(parseFloat(currentPrice || precoBase) + capValue, precoSugeridoBase));

    const deltaTotalRestante = Math.abs(parseFloat(deltaRaw || 0));
    const ciclosTotais = Math.ceil(deltaTotalRestante / (stepDelta || 1));
    const ciclosRestantes = Math.ceil(Math.abs(parseFloat(deltaRaw || 0) - deltaAplicado) / (stepDelta || 1));
    
    const lucroTeorico = (precoSugerido - cost - (precoSugerido * taxasVariaveisDec)) - (precoBase * margemAlvoDec);
    
    // Atrito Suavizado v2.1
    const config = CANAIS_CONFIG[canal] || CANAIS_CONFIG.balcao;
    const rawFriction = 1 - (cv * 0.4) - config.friction_base;
    const friction = Math.max(0.60, Math.min(0.95, rawFriction));
    
    const confidence = getConfidenceLabel(friction);

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaAplicado.toFixed(2),
        cicloAtual: (Math.max(1, ciclosTotais) - ciclosRestantes),
        ciclosTotais: Math.max(1, ciclosTotais),
        ganhoRealista: (lucroTeorico * friction).toFixed(2),
        confianca: confidence.label,
        confiancaCor: confidence.color,
        confiancaDesc: confidence.desc,
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
