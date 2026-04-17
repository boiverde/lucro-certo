/**
 * Assistente de Precificação Lucro Certo
 * Padronizado: Fórmulas financeiras consistentes em todo o sistema.
 */

/**
 * Calcula a sugestão de preço baseada no markup divisor (Margem de Contribuição)
 * CT = Custo Mercadoria + Custo Fixo Unitário
 * Preço = CT / (1 - Taxas - Margem Desejada)
 */
export function calculatePriceSuggestion(cost, configs) {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0,
        custo_fixo_por_unidade = 0,
        margem_lucro_padrao = 30
    } = configs;

    // 1. Converter taxas para decimal
    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemDesejadaDec = parseFloat(margem_lucro_padrao) / 100;
    const custoFixoUnid = parseFloat(custo_fixo_por_unidade) || 0;

    // 2. Divisor de Preço (1 - somatório das taxas e margem)
    const divisor = 1 - (taxasVariaveisDec + margemDesejadaDec);

    // Validação matemática: Se divisor <= 0, a margem é impossível
    if (divisor <= 0) {
        return {
            error: "IMPOSSIBLE_MARGIN",
            message: "A soma das taxas e lucro desejado atinge 100%. Impossível calcular."
        };
    }

    // 3. Custo Total (Mercadoria + Custo Fixo Rateado)
    const custoTotalUnitarioBase = parseFloat(cost) + custoFixoUnid;

    // 4. Preço Sugerido
    const precoSugerido = custoTotalUnitarioBase / divisor;

    // 5. Lucro Real Unitário = Preço - CustoTotal - (Preço * Taxas)
    const lucroReal = precoSugerido - custoTotalUnitarioBase - (precoSugerido * taxasVariaveisDec);
    const margemReal = (lucroReal / precoSugerido) * 100;

    return {
        precoSugerido: precoSugerido.toFixed(2),
        lucroUnitario: lucroReal.toFixed(2),
        margemLiquida: margemReal.toFixed(1),
        detalhes: {
            markupEquivalente: (1 / divisor).toFixed(2),
            custoMateriaPrima: parseFloat(cost).toFixed(2),
            custoFixoRateado: custoFixoUnid.toFixed(2),
            divisor: divisor.toFixed(4)
        }
    };
}

/**
 * Analisa a saúde financeira de um preço atual informado
 * Lucro = Preço - (Custo + CustoFixo) - (Preço * Taxas)
 */
export function analyzeCurrentPrice(cost, currentPrice, configs) {
    if (!cost || !currentPrice || cost <= 0 || currentPrice <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0,
        custo_fixo_por_unidade = 0
    } = configs;

    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const custoFixoUnid = parseFloat(custo_fixo_por_unidade) || 0;
    
    const custoTotalUnitarioBase = parseFloat(cost) + custoFixoUnid;
    const precoVenda = parseFloat(currentPrice);

    // Fórmula Padronizada: Lucro = Preço - CustoTotal - (Preço * Taxas)
    const lucroLiquidoUnitario = precoVenda - custoTotalUnitarioBase - (precoVenda * taxasVariaveisDec);
    const margemLiquidaReal = (lucroLiquidoUnitario / precoVenda) * 100;

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
