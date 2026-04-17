/**
 * Assistente de Precificação Lucro Certo
 * Baseado na fórmula de Margem de Contribuição (Markup Divisor)
 */

export function calculatePriceSuggestion(cost, configs) {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0,
        custo_fixo_mensal = 0,
        faturamento_medio_mensal = 0,
        margem_lucro_padrao = 30
    } = configs;

    // 1. Converter taxas para decimal
    const impostoDec = parseFloat(taxa_impostos) / 100;
    const cartaoDec = parseFloat(taxa_cartao) / 100;
    const margemDesejadaDec = parseFloat(margem_lucro_padrao) / 100;
    
    // 2. Peso do Custo Fixo (%)
    const custoFixoPctDec = faturamento_medio_mensal > 0 
        ? (parseFloat(custo_fixo_mensal) / parseFloat(faturamento_medio_mensal))
        : 0;

    // 3. Divisor de Preço (1 - somatório de todas as taxas/margem)
    const divisor = 1 - (impostoDec + cartaoDec + custoFixoPctDec + margemDesejadaDec);

    // Validação matemática: Se divisor <= 0, a margem é impossível
    if (divisor <= 0) {
        return {
            error: "IMPOSSIBLE_MARGIN",
            message: "Taxas + Margem somam 100% ou mais. Ajuste as configurações do negócio."
        };
    }

    // 4. Preço Sugerido
    const precoSugerido = cost / divisor;

    // 5. Breakdown Financeiro (Realidade Unitária)
    const valorImpostos = precoSugerido * impostoDec;
    const valorCartao = precoSugerido * cartaoDec;
    const valorCustoFixo = precoSugerido * custoFixoPctDec;
    const custoTotalUnitario = cost + valorImpostos + valorCartao + valorCustoFixo;
    
    const lucroLiquidoUnitario = precoSugerido - custoTotalUnitario;
    const margemLiquidaReal = (lucroLiquidoUnitario / precoSugerido) * 100;

    return {
        precoSugerido: precoSugerido.toFixed(2),
        lucroUnitario: lucroLiquidoUnitario.toFixed(2),
        margemLiquida: margemLiquidaReal.toFixed(1),
        detalhes: {
            divisor: divisor.toFixed(4),
            custoBase: cost,
            markupEquivalente: (1 / divisor).toFixed(2)
        }
    };
}
export function analyzeCurrentPrice(cost, currentPrice, configs) {
    if (!cost || !currentPrice || cost <= 0 || currentPrice <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0,
        custo_fixo_mensal = 0,
        faturamento_medio_mensal = 0
    } = configs;

    const impostoDec = parseFloat(taxa_impostos) / 100;
    const cartaoDec = parseFloat(taxa_cartao) / 100;
    const custoFixoPctDec = faturamento_medio_mensal > 0 
        ? (parseFloat(custo_fixo_mensal) / parseFloat(faturamento_medio_mensal))
        : 0;

    // Margem bruta disponível após taxas variáveis e custo fixo rateado
    const divisorBruto = 1 - (impostoDec + cartaoDec + custoFixoPctDec);
    
    const lucroLiquidoUnitario = (currentPrice * divisorBruto) - cost;
    const margemLiquidaReal = (lucroLiquidoUnitario / currentPrice) * 100;

    let status = "OK";
    let message = "Sua margem está saudável.";
    let color = "emerald";

    if (margemLiquidaReal < 0) {
        status = "DANGER";
        message = "Você está vendendo no PREJUÍZO! O preço não cobre os custos e taxas.";
        color = "red";
    } else if (margemLiquidaReal < 10) {
        status = "WARNING";
        message = "Sua margem está muito BAIXA. Você pode estar pagando para trabalhar.";
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
