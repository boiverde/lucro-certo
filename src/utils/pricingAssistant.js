/**
 * Assistente de Precificação Lucro Certo (v1.3 - Algorithmic)
 * EWMA, Zonas por Categoria e Delta Suavizado com Clamp.
 */

const FORMULA_VERSION = "v1.3";
const ALPHA = 0.25; // EWMA Smoothing Factor

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, name: 'BALCÃO' },
    delivery: { risk: 0.70, name: 'DELIVERY' },
    marketplace: { risk: 0.65, name: 'MARKETPLACE' }
};

/**
 * Calcula EWMA para uma série de volumes
 */
export function calculateEWMA(volumes) {
    if (!volumes || volumes.length === 0) return 1;
    let ewma = volumes[0];
    for (let i = 1; i < volumes.length; i++) {
        ewma = ALPHA * volumes[i] + (1 - ALPHA) * ewma;
    }
    return ewma;
}

/**
 * Arredondamento Comercial Padronizado
 */
function standardizePrice(price) {
    const rounded = Math.round(price * 10) / 10;
    const decimal = price - Math.floor(price);
    if (decimal > 0.85) return Math.floor(price) + 0.90;
    if (decimal > 0.45 && decimal < 0.55) return Math.floor(price) + 0.50;
    return Math.ceil(price);
}

/**
 * Motor de Precificação Algorítmico v1.3
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
    
    // Delta Suavizado com Clamp (Trava de ±5%)
    const maxDelta = precoBase * 0.05;
    const minDelta = precoBase * -0.05;
    const deltaSuavizado = Math.max(minDelta, Math.min(maxDelta, parseFloat(deltaRaw || 0)));

    const precoFinalRaw = precoBase + deltaSuavizado;
    const precoSugerido = standardizePrice(precoFinalRaw);

    // Análise de Zonas
    let zona = "SEGURA";
    let color = "emerald";
    if (somaCargos > canalInfo.risk) {
        zona = "CRÍTICA"; color = "red";
    } else if (somaCargos > (canalInfo.risk - 0.10)) {
        zona = "ALERTA"; color = "amber";
    }

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaSuavizado.toFixed(2),
        zona,
        color,
        versao: FORMULA_VERSION,
        lucroUnitario: (precoSugerido * margemDesejadaDec).toFixed(2),
        margemLiquida: margemDesejada.toFixed(1),
        canal: canalInfo.name,
        detalhes: {
            markup: (1 / divisor).toFixed(2),
            ewmaUsed: true
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
