/**
 * Assistente de Precificação Lucro Certo (v1.7 - Predictive Intelligence)
 * Cap Inteligente (Min 20%/R$10), Regime Escalonado e Impacto Total.
 */

const FORMULA_VERSION = "v1.7";
const ABSOLUTE_CAP = 10.00; // Teto absoluto de variação por ciclo
const PERCENT_CAP = 0.20;   // Teto percentual por ciclo

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, name: 'BALCÃO' },
    delivery: { risk: 0.70, name: 'DELIVERY' },
    marketplace: { risk: 0.65, name: 'MARKETPLACE' }
};

/**
 * Arredondamento com Cap Inteligente Híbrido
 */
function securePredictiveRounding(targetPrice, currentPrice, cost, taxesDec, targetMarginDec) {
    const points = [0.00, 0.50, 0.90, 0.99];
    
    // Teto Inteligente: O menor entre 20% ou R$ 10,00
    const capValue = Math.min(currentPrice * PERCENT_CAP, ABSOLUTE_CAP);
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

    // Filtragem com Histerese Proativa (1.5%)
    let valid = candidates.filter(c => {
        if (c <= 0) return false;
        let profit = c - cost - (c * taxesDec);
        let margin = profit / c;
        return margin >= (targetMarginDec - 0.015) && c <= maxAllowed;
    });

    valid.sort((a, b) => a - b);
    return valid.find(c => c >= baseMeta) || baseMeta;
}

/**
 * Motor de Precificação Preditivo v1.7
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
    if (divisor <= 0.05) return { error: "INSOLVENT_MARGIN", message: "Inviabilidade no canal" };

    const precoBase = parseFloat(cost) / divisor;
    
    // Recuperação Escalonada (Clamp 5% por ciclo)
    const clampDelta = precoBase * 0.05;
    const deltaAplicado = Math.max(-clampDelta, Math.min(clampDelta, parseFloat(deltaRaw || 0)));

    const precoSugerido = securePredictiveRounding(precoBase + deltaAplicado, parseFloat(currentPrice || precoBase), cost, taxasVariaveisDec, margemAlvoDec);

    const ciclosRestantes = Math.ceil(Math.abs(parseFloat(deltaRaw || 0) - deltaAplicado) / (clampDelta || 1));
    const lucroReal = (precoSugerido - cost - (precoSugerido * taxasVariaveisDec));

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaAplicado.toFixed(2),
        ciclosRestantes,
        impactoFinanceiroUnitario: (lucroReal - (precoBase * margemAlvoDec)).toFixed(2),
        zona: (taxasVariaveisDec + margemAlvoDec) > canalInfo.risk ? "CRÍTICA" : "SEGURA",
        color: (taxasVariaveisDec + margemAlvoDec) > canalInfo.risk ? "rose" : "emerald",
        versao: FORMULA_VERSION,
        margemReal: ((lucroReal / precoSugerido) * 100).toFixed(1),
        detalhes: {
            isPredictive: true,
            smartCap: true
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
