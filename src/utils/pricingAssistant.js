/**
 * Assistente de Precificação Lucro Certo (v1.6 - Elite Control)
 * Cap de Variação, Histerese de Regime e Ciclos de Ajuste.
 */

const FORMULA_VERSION = "v1.6";
const PRICE_CAP_PERCENT = 0.20; // Máximo 20% de alteração manual/gradual por vez

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, name: 'BALCÃO' },
    delivery: { risk: 0.70, name: 'DELIVERY' },
    marketplace: { risk: 0.65, name: 'MARKETPLACE' }
};

/**
 * Arredondamento com Cap de Variação & Histerese
 * Protege contra aumentos abusivos e mudanças de regime falsas.
 */
function secureEliteRounding(targetPrice, currentPrice, cost, taxesDec, targetMarginDec) {
    const points = [0.00, 0.50, 0.90, 0.99];
    const maxAllowed = currentPrice * (1 + PRICE_CAP_PERCENT);
    const minAllowed = currentPrice * (1 - PRICE_CAP_PERCENT);

    const baseMeta = Math.max(minAllowed, Math.min(maxAllowed, targetPrice));
    
    let integerPart = Math.floor(baseMeta);
    let candidates = [];
    for (let offset of [0, 1]) {
        for (let p of points) {
            candidates.push(integerPart + offset + p);
        }
    }

    // Filtrar válidos (que respeitem a margem mínima e o teto de variação)
    let valid = candidates.filter(c => {
        if (c <= 0) return false;
        let profit = c - cost - (c * taxesDec);
        let margin = profit / c;
        // Margem mínima aceitável com histerese de 2%
        return margin >= (targetMarginDec - 0.02) && c <= maxAllowed;
    });

    valid.sort((a, b) => a - b);
    
    // Pegar o menor ponto psicológico que seja >= meta suavizada
    return valid.find(c => c >= baseMeta) || baseMeta;
}

/**
 * Motor de Precificação Elite v1.6
 */
export function calculatePriceSuggestion(cost, currentPrice, configs, canal = 'balcao', deltaRaw = 0, categoryOffset = 0) {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const canalInfo = CANAIS_CONFIG[canal] || CANAIS_CONFIG.balcao;
    const { taxa_impostos = 0, taxa_cartao = 0 } = configs;

    const margemKey = canal === 'balcao' ? 'margem_balcao' : (canal === 'delivery' ? 'margem_delivery' : 'margem_marketplace');
    const margemAlvoBase = (parseFloat(configs[margemKey]) || 30) + categoryOffset;
    
    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemAlvoDec = margemAlvoBase / 100;

    const divisor = 1 - (taxasVariaveisDec + margemAlvoDec);
    if (divisor <= 0.05) return { error: "INSOLVENT_MARGIN", message: "Inviabilidade no canal " + canalInfo.name };

    const precoBase = parseFloat(cost) / divisor;
    
    // Recuperação Escalonada (Clamp 5% por ciclo)
    const clampDelta = precoBase * 0.05;
    const deltaAplicado = Math.max(-clampDelta, Math.min(clampDelta, parseFloat(deltaRaw || 0)));

    const precoSugerido = secureEliteRounding(precoBase + deltaAplicado, parseFloat(currentPrice || precoBase), cost, taxasVariaveisDec, margemAlvoDec);

    // Cálculo de Ciclos Restantes (Ajustes de 5% pendentes)
    const ciclosRestantes = Math.ceil(Math.abs(parseFloat(deltaRaw || 0) - deltaAplicado) / (clampDelta || 1));

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaAplicado.toFixed(2),
        ciclosRestantes,
        zona: (taxasVariaveisDec + margemAlvoDec) > canalInfo.risk ? "CRÍTICA" : "SEGURA",
        color: (taxasVariaveisDec + margemAlvoDec) > canalInfo.risk ? "rose" : "emerald",
        versao: FORMULA_VERSION,
        margemReal: (((precoSugerido - cost - (precoSugerido * taxasVariaveisDec)) / precoSugerido) * 100).toFixed(1),
        canal: canalInfo.name,
        detalhes: {
            isElite: true,
            hasPriceCap: true
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
