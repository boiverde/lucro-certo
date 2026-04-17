const fs = require('fs');
const path = require('path');

function replaceWithHandleError(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // We will find blocks like:
    // catch (error) {
    //   toast.error('Não foi possível carregar as compras. Tente atualizar a página.', { id: 'erro-compras' });
    //   console.error('Erro ao carregar compras:', error);
    // }
    // AND replace them with:
    // catch (error) {
    //   handleApiError(error, 'carregar as compras');
    //   console.error('Erro ao carregar compras:', error);
    // }

    // Regex to match our refined toast.errors
    // Looking for: toast.error('... {context} ...'
    
    // 1. Carregar/Load variations
    content = content.replace(/toast\.error\('Não foi possível carregar (.*?)\. Tente atualizar a página\.',\s*\{[^}]+\}\s*\);?/g, (match, p1) => {
        modified = true;
        return `handleApiError(error, 'carregar ${p1}')`;
    });
    
    content = content.replace(/toast\.error\('Falha ao carregar (.*?)\. Tente atualizar a tela\.',\s*\{[^}]+\}\s*\);?/g, (match, p1) => {
        modified = true;
        return `handleApiError(error, 'carregar ${p1}')`;
    });
    
    
    // 2. Salvar/Update variations
    content = content.replace(/toast\.error\('Não foi possível salvar (.*?)\. Verifique sua conexão e tente novamente\.',\s*\{[^}]+\}\s*\);?/g, (match, p1) => {
        modified = true;
        return `handleApiError(error, 'salvar ${p1}')`;
    });

    content = content.replace(/toast\.error\('Não foi possível salvar (.*?)\. Verifique os dados e a conexão\.',\s*\{[^}]+\}\s*\);?/g, (match, p1) => {
        modified = true;
        return `handleApiError(error, 'salvar ${p1}')`;
    });

    // 3. Sync offline failures
    content = content.replace(/toast\.error\(`Falha na sincronização: \$\{\s*([^}]+)\s*\}([^`]*)`,\s*\{[^}]+\}\s*\);?/g, (match, p1) => {
        modified = true;
        return `handleApiError(err, 'sincronizar offline')`;
    });

    // 4. Dynamic save errors (e.g. vendas)
    content = content.replace(/toast\.error\(`Atenção, erro ao salvar: \$\{\s*([^}]+)\s*\}([^`]*)`,\s*\{[^}]+\}\s*\);?/g, (match, p1) => {
        modified = true;
        return `handleApiError(error, 'salvar informações')`;
    });

    // 5. Auth specific
    content = content.replace(/toast\.error\('Erro na autenticação[^']*',\s*\{[^}]+\}\s*\);?/g, (match) => {
        modified = true;
        return `handleApiError(err, 'autenticar')`;
    });
    content = content.replace(/toast\.error\('Sessão expirada[^']*',\s*\{[^}]+\}\s*\);?/g, (match) => {
        modified = true;
        return `handleApiError(error, 'validar sessão')`;
    });

    // 6. Generic data fetch
    content = content.replace(/toast\.error\('Não foi possível carregar os dados\. Verifique sua conexão e tente atualizar a página\.',\s*\{[^}]+\}\s*\);?/g, () => {
        modified = true;
        return `handleApiError(error, 'carregar dados')`;
    });

    // 7. Configurações template
    content = content.replace(/toast\.error\('Não foi possível aplicar o tema\. Tente novamente mais tarde\.',\s*\{[^}]+\}\s*\);?/g, () => {
        modified = true;
        return `handleApiError(error, 'aplicar o tema')`;
    });

    if (modified) {
        // inject import { handleApiError } from '@/api/errorHandler';
        if (!content.includes("import { handleApiError } from '@/api/errorHandler'") &&
            !content.includes('import { handleApiError } from "@/api/errorHandler"')) {
            content = content.replace(/(import React[^;]*;?)/, "$1\nimport { handleApiError } from '@/api/errorHandler';");
            if (!content.includes('handleApiError }')) {
                content = `import { handleApiError } from '@/api/errorHandler';\n` + content;
            }
        }
        // Since sometimes we replace err, make sure handleApiError has right scope reference
        // (usually catch block has err or error argument, we assumed `error` or `err` matches natively)

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Classified errors in:', filePath);
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

filesToFix.forEach(f => replaceWithHandleError(f));
