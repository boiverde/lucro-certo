/**
 * Assistente de Precificação Lucro Certo (Refined Hardening)
 * Implementa o Markup Divisor com validações de sanidade matemática.
 */

const CANAIS_DEFAULT = {
    balcao: 'margem_balcao',
    delivery: 'margem_delivery',
    marketplace: 'margem_marketplace'
};

/**
 * Calcula a sugestão de preço baseada no markup divisor
 * Validação Crítica: Taxas + Margem deve ser < 1 (100%)
 */
export function calculatePriceSuggestion(cost, configs, canal = 'balcao') {
    if (!cost || cost <= 0) return null;
    if (!configs) return null;

    const {
        taxa_impostos = 0,
        taxa_cartao = 0,
        custo_fixo_mensal = 0
    } = configs;

    // Selecionar margem baseada no canal
    const margemKey = CANAIS_DEFAULT[canal] || 'margem_balcao';
    const margemDesejada = parseFloat(configs[margemKey]) || 30;

    // 1. Converter taxas para decimal
    const taxasVariaveisDec = (parseFloat(taxa_impostos) + parseFloat(taxa_cartao)) / 100;
    const margemDesejadaDec = margemDesejada / 100;

    // 2. Validação T+M < 1 (HARDENING)
    // Se a soma das taxas e lucro for > 95%, bloqueamos para evitar preços infinitos
    const somaCargos = taxasVariaveisDec + margemDesejadaDec;
    
    if (somaCargos >= 0.95) {
        return {
            error: "INSOLVENT_MARGIN",
            message: "A soma das taxas e lucro desejado é muito alta (>= 95%). O negócio é inviável nestas condições."
        };
    }

    const divisor = 1 - somaCargos;

    // 3. Custo Fixo Médio (Considerando Rateio Mensal Simplificado)
    // No frontend, se não temos volume de vendas, usamos o custo fixo base ou zero
    const custoFixoUnid = 0; // O rateio real será feito no backend com volume real

    // 4. Preço Sugerido
    const custoTotalUnitarioBase = parseFloat(cost);
    const precoSugerido = custoTotalUnitarioBase / divisor;

    // 5. Analise de Ganho (Intervalo de Confiança 2%)
    const precoMinimo = precoSugerido * 0.98;
    const precoMaximo = precoSugerido * 1.02;

    return {
        precoSugerido: precoSugerido.toFixed(2),
        intervalo: {
            min: precoMinimo.toFixed(2),
            max: precoMaximo.toFixed(2)
        },
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
