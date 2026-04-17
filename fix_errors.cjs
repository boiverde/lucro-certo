const fs = require('fs');
const path = require('path');

function replaceAlertsAndConsoles(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if we need to import toast
    let needsToast = false;

    // Replace alert('✅ ...') with toast.success('...')
    content = content.replace(/alert\(\s*[`'"](✅[^`'"]+)[`'"]\s*\);?/g, (match, p1) => {
        needsToast = true;
        modified = true;
        return `toast.success('${p1.replace('✅ ', '')}')`;
    });

    // Replace alert('❌ ...') with toast.error('...')
    content = content.replace(/alert\(\s*[`'"](❌[^`'"]+)[`'"]\s*\);?/g, (match, p1) => {
        needsToast = true;
        modified = true;
        return `toast.error('${p1.replace('❌ ', '')}')`;
    });
    content = content.replace(/alert\(\s*[`']❌ Erro ao sincronizar venda offline: \$\{err\.message\}[`']\s*\);?/g, () => {
        needsToast = true;
        modified = true;
        return "toast.error(`Erro ao sincronizar offline: ${err.message}`)";
    });
    content = content.replace(/alert\(\s*[`']❌ Erro ao salvar venda: \$\{error\.message\}[`']\s*\);?/g, () => {
        needsToast = true;
        modified = true;
        return "toast.error(`Erro ao salvar: ${error.message}`)";
    });

    // Replace general alert('...') with toast.warning or toast.error
    content = content.replace(/alert\(\s*[`'"](Erro[^`'"]+)[`'"]\s*\);?/g, (match, p1) => {
        needsToast = true;
        modified = true;
        return `toast.error('${p1}')`;
    });

    content = content.replace(/alert\(\s*[`'"](Aviso[^`'"]+|Adicione[^`'"]+|Não é possível[^`'"]+|Estoque insuficiente[^`'"]+)[`'"]\s*\);?/g, (match, p1) => {
        needsToast = true;
        modified = true;
        return `toast.warning('${p1}')`;
    });

    // Replace console.error + silent catch with toast.error
    // e.g. console.error('Erro ao carregar compras:', error);
    content = content.replace(/console\.error\(\s*[`'"]([^`'"]+)[`'"],\s*(error|err)\s*\);?/g, (match, message, errVar) => {
        needsToast = true;
        modified = true;
        return `toast.error('${message}');\n      console.error('${message}', ${errVar});`;
    });
    
    // Replace standalone console.error('...', error) format
    content = content.replace(/catch\s*\((error|err)\)\s*\{\s*console\.error\(\s*[`'"]([^`'"]+)[`'"]\s*\);?/g, (match, errVar, message) => {
        needsToast = true;
        modified = true;
        return `catch (${errVar}) {toast.error('${message}');\nconsole.error('${message}', ${errVar});`;
    });

    if (needsToast && !content.includes("import { toast } from 'sonner'") && !content.includes('import { toast } from "sonner"')) {
        // Insert import right after React import or exactly at the start
        content = content.replace(/(import React[^;]*;?)/, "$1\nimport { toast } from 'sonner';");
        if (!content.includes('import { toast }')) {
             content = `import { toast } from 'sonner';\n` + content;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

const filesToFix = [
    'src/pages/Vendas.jsx',
    'src/pages/Compras.jsx',
    'src/pages/Estoque.jsx',
    'src/pages/Controle.jsx',
    'src/pages/Configuracoes.jsx',
    'src/pages/Pessoais.jsx',
    'src/pages/Relatorios.jsx',
    'src/pages/Layout.jsx',
    'src/pages/Login.jsx',
    'src/components/lanches/FormReceita.jsx',
    'src/components/lanches/FormProducao.jsx',
    'src/components/lanches/FormPedido.jsx',
    'src/components/estoque/SugestaoCompras.jsx',
    'src/components/dashboard/BannerAcessoWeb.jsx',
    'src/components/mobile/OfflineManager.jsx'
];

filesToFix.forEach(f => replaceAlertsAndConsoles(f));

// Special replacements
let controle = fs.readFileSync('src/pages/Controle.jsx', 'utf8');
if (controle.includes('alert(`⚠️ ATENÇÃO: A receita')) {
    controle = controle.replace(/alert\(`⚠️ ATENÇÃO: A receita([^`]+)`\);?/g, "toast.warning(`Atenção: A receita$1`, { duration: 10000 });");
    fs.writeFileSync('src/pages/Controle.jsx', controle, 'utf8');
    console.log('Fixed custom alert in Controle.jsx');
}
