/**
 * Assistente de Precificação Lucro Certo (v1.5 - Adaptive Engine)
 * Arredondamento Competitivo, Detecção de Regime e Previsão de Equilíbrio.
 */

const FORMULA_VERSION = "v1.5";

const CANAIS_CONFIG = {
    balcao: { risk: 0.75, name: 'BALCÃO' },
    delivery: { risk: 0.70, name: 'DELIVERY' },
    marketplace: { risk: 0.65, name: 'MARKETPLACE' }
};

/**
 * Arredondamento Inteligente & Competitivo
 * Busca o MENOR preço que respeita a margem alvo.
 */
function competitiveRounding(basePrice, cost, taxesDec, targetMarginDec) {
    const points = [0.00, 0.50, 0.90, 0.99]; // Pontos psicológicos
    let integerPart = Math.floor(basePrice);
    
    // Testar pontos no real atual e no anterior (para ser agressivo se possível)
    let candidates = [];
    for (let offset of [-1, 0, 1]) {
        for (let p of points) {
            candidates.push(integerPart + offset + p);
        }
    }

    // Filtrar apenas os que respeitam a margem
    let validCandidates = candidates.filter(c => {
        if (c <= 0) return false;
        let profit = c - cost - (c * taxesDec);
        let margin = profit / c;
        return margin >= targetMarginDec;
    });

    // Ordenar e pegar o menor válido que não seja absurdamente menor que o base
    validCandidates.sort((a, b) => a - b);
    
    // O menor válido que seja pelo menos próximo ao preço base necessário
    const finalPrice = validCandidates.find(c => c >= (basePrice * 0.98)) || (integerPart + 1.10);
    return finalPrice;
}

/**
 * Motor de Precificação Adaptativo v1.5
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
    
    // Clamp de Delta (Ajuste Suave)
    const maxDelta = precoBase * 0.05;
    const deltaAplicado = Math.max(-maxDelta, Math.min(maxDelta, parseFloat(deltaRaw || 0)));

    const precoMeta = precoBase + deltaAplicado;
    const precoSugerido = competitiveRounding(precoMeta, cost, taxasVariaveisDec, margemDesejadaDec);

    return {
        precoSugerido: precoSugerido.toFixed(2),
        deltaAplicado: deltaAplicado.toFixed(2),
        deltaPendente: (parseFloat(deltaRaw || 0) - deltaAplicado).toFixed(2),
        zona: somaCargos > canalInfo.risk ? "CRÍTICA" : (somaCargos > canalInfo.risk - 0.12 ? "ALERTA" : "SEGURA"),
        color: somaCargos > canalInfo.risk ? "rose" : (somaCargos > canalInfo.risk - 0.12 ? "amber" : "emerald"),
        versao: FORMULA_VERSION,
        lucroReal: (precoSugerido - cost - (precoSugerido * taxasVariaveisDec)).toFixed(2),
        margemReal: (((precoSugerido - cost - (precoSugerido * taxasVariaveisDec)) / precoSugerido) * 100).toFixed(1),
        canal: canalInfo.name,
        detalhes: {
            adaptiveRounding: true,
            regimeAware: true
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
