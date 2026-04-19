/**
 * Assistente de Precificação Lucro Certo (v1.1 - Stability & Hardening)
 * Implementa o Markup Divisor com alertas de risco operacional.
 */

const FORMULA_VERSION = "v1.1";
const RISK_THRESHOLD = 0.70; // Alerta se taxas + margem > 70%

const CANAIS_DEFAULT = {
    balcao: 'margem_balcao',
    delivery: 'margem_delivery',
    marketplace: 'margem_marketplace'
};

/**
 * Calcula a sugestão de preço baseada no markup divisor
 */
export function calculatePriceSuggestion(cost, configs, canal = 'balcao') {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0
    } = configs;

    // Selecionar margem baseada no canal
    const margemKey = CANAIS_DEFAULT[canal] || 'margem_balcao';
    const margemDesejada = parseFloat(configs[margemKey]) || 30;

    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemDesejadaDec = margemDesejada / 100;

    const somaCargos = taxasVariaveisDec + margemDesejadaDec;
    
    // Alerta de Risco Operacional (v1.1)
    let warning = null;
    if (somaCargos > RISK_THRESHOLD && somaCargos < 0.95) {
        warning = "RISCO_OPERACIONAL: A soma das taxas e lucro ultrapassa 70%. O preço pode ficar acima do mercado.";
    }

    if (somaCargos >= 0.95) {
        return {
            error: "INSOLVENT_MARGIN",
            message: "A soma das taxas e lucro desejado é muito alta (>= 95%). Operação inviável."
        };
    }

    const divisor = 1 - somaCargos;
    const precoSugerido = parseFloat(cost) / divisor;

    return {
        precoSugerido: precoSugerido.toFixed(2),
        warning,
        versao: FORMULA_VERSION,
        lucroUnitario: (precoSugerido * margemDesejadaDec).toFixed(2),
        margemLiquida: margemDesejada.toFixed(1),
        canal: canal.toUpperCase(),
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
