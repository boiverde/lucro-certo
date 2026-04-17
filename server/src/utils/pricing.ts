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
        custo_fixo_por_unidade: number;
        margem_lucro_padrao: number;
    }
) {
    const taxasVariaveisDec = (configs.taxa_impostos + configs.taxa_cartao) / 100;
    const custoFixoUnid = configs.custo_fixo_por_unidade || 0;
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
