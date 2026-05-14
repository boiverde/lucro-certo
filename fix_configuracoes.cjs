const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Configuracoes.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: broken aplicarTemplate JSON — }) || 0, after faturamentoMedio closes JSON.stringify early
content = content.replace(
  "        faturamento_medio_mensal: parseFloat(faturamentoMedio) }) || 0,\r\n        custo_fixo_mensal: parseFloat(custoFixo) || 0,\r\n        producao_mensal_estimada: parseFloat(producaoMensalEstimada) || 0,\r\n        custo_fixo_por_unidade: parseFloat(custoFixoUnidade) || 0\r\n      });",
  "        faturamento_medio_mensal: parseFloat(faturamentoMedio) || 0,\r\n        custo_fixo_mensal: parseFloat(custoFixo) || 0,\r\n        producao_mensal_estimada: parseFloat(producaoMensalEstimada) || 0,\r\n        custo_fixo_por_unidade: parseFloat(custoFixoUnidade) || 0\r\n      }) });"
);

// Fix 2: Remove duplicate handleApiError calls
content = content.replace(
  "      handleApiError(error, 'aplicar o tema')\n      handleApiError(error, 'aplicar o tema')\n",
  "      handleApiError(error, 'aplicar o tema');\n"
);

content = content.replace(
  "      handleApiError(error, 'salvar as alterações')\n      handleApiError(error, 'salvar as alterações')\n      console.error('Erro ao salvar:', error);\r\n      handleApiError(error, 'salvar as configurações')\r\n",
  "      handleApiError(error, 'salvar as configurações');\n      console.error('Erro ao salvar:', error);\r\n"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Configuracoes.jsx fixed');
