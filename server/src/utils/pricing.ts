/**
 * Motor de Precificação (Backend)
 * Sincronizado com src/utils/pricingAssistant.js
 */

export function calculateFinancials(
    cost: number,
    price: number,
    configs: {
        taxa_impostos: number;
        taxa_cartao: number;
        custo_fixo_mensal: number;      // Custo fixo total do mês (do User)
        unidades_vendidas_mes: number;  // Estimativa de unidades para ratear custo fixo
        margem_lucro_padrao: number;
    }
) {
    const taxasVariaveisDec = (configs.taxa_impostos + configs.taxa_cartao) / 100;
    // Rateio do custo fixo por unidade (evita divisão por zero)
    const custoFixoUnid = configs.unidades_vendidas_mes > 0
        ? configs.custo_fixo_mensal / configs.unidades_vendidas_mes
        : 0;
    const custoTotalBase = cost + custoFixoUnid;

    // Fórmula: Lucro = Preço - CT - (Preço * taxas)
    const lucroRealUnitario = price - custoTotalBase - (price * taxasVariaveisDec);
    const margemReal = price > 0 ? (lucroRealUnitario / price) * 100 : 0;

    // Cálculo do Preço Sugerido (Ideal) para o lucro potencial
    const margemDesejadaDec = configs.margem_lucro_padrao / 100;
    const divisor = 1 - (taxasVariaveisDec + margemDesejadaDec);
    const precoSugerido = divisor > 0 ? (custoTotalBase / divisor) : 0;

    // Lucro que o usuário ganharia se usasse o preço ideal
    const lucroIdealUnitario = precoSugerido > 0
        ? (precoSugerido - custoTotalBase - (precoSugerido * taxasVariaveisDec))
        : 0;

    return {
        custoTotalBase,
        taxasVariaveisDec,
        lucroRealUnitario,
        margemReal,
        precoSugerido,
        lucroIdealUnitario
    };
}
