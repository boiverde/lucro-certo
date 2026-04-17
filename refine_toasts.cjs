const fs = require('fs');

function refineToasts(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Anti-spam: wrap sonner calls with ID derived from msg to prevent flooding
    // Example: toast.error('Foo') -> toast.error('Foo', { id: 'Foo' })
    // We must be careful not to double add if already there.
    
    // Arrays of replacements for better phrasing
    const replacements = [
        {
            regex: /toast\.error\(\s*[`'"]Erro ao carregar dados:[`'"]\s*\);?/g,
            replace: "toast.error('Não foi possível carregar os dados. Verifique sua conexão e tente atualizar a página.', { id: 'erro-dados' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Erro ao carregar compras:[`'"]\s*\);?/g,
            replace: "toast.error('Não foi possível carregar suas compras. Tente atualizar a página.', { id: 'erro-compras' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Erro ao carregar gastos pessoais:[`'"]\s*\);?/g,
            replace: "toast.error('Falha ao carregar os gastos pessoais. Tente atualizar a tela.', { id: 'erro-gastos' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]\[Auth\] Erro na ponte do backend:[`'"]\s*\);?/g,
            replace: "toast.error('Erro na autenticação. Verifique sua conexão ou tente logar novamente.', { id: 'erro-auth' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Falha ao validar sessão:[`'"]\s*\);?/g,
            replace: "toast.error('Sessão expirada ou inválida. Por favor, faça login novamente.', { id: 'erro-sessao' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Erro ao salvar:[`'"]\s*\);?/g,
            replace: "toast.error('Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.', { id: 'erro-salvar' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Erro ao carregar usuário:[`'"]\s*\);?/g,
            replace: "toast.error('Falha ao carregar os dados do usuário. Tente atualizar a tela.', { id: 'erro-usuario' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Erro ao aplicar template:[`'"]\s*\);?/g,
            replace: "toast.error('Não foi possível aplicar o tema. Tente novamente mais tarde.', { id: 'erro-tema' });"
        },
        {
            regex: /toast\.error\(\s*[`'"]Erro ao salvar configurações[`'"]\s*\);?/g,
            replace: "toast.error('Não foi possível salvar as configurações. Verifique os dados e a conexão.', { id: 'erro-config' });"
        },
        // For dynamic strings
        {
            regex: /toast\.error\(\s*[`']Erro ao sincronizar offline: \$\{([^}]+)\}[`']\s*\);?/g,
            replace: "toast.error(`Falha na sincronização: \$\{ $1 \}. O aplicativo tentará novamente mais tarde.`, { id: 'erro-sync' });"
        },
        {
            regex: /toast\.error\(\s*[`']Erro ao salvar: \$\{([^}]+)\}[`']\s*\);?/g,
            replace: "toast.error(`Atenção, erro ao salvar: \$\{ $1 \}. Revise os campos preenchidos.`, { id: 'erro-salvar-dinamico' });"
        }
    ];

    replacements.forEach(rule => {
        content = content.replace(rule.regex, (match) => {
            modified = true;
            return rule.replace;
        });
    });

    // 2. Wrap all remaining simple toasts with ID to prevent generic spam
    // toast.success('Foo') -> toast.success('Foo', { id: 'Foo' })
    const genericSuccessRegex = /toast\.success\(\s*(['"][^'"]+['"]|`[^`]+`)\s*\)(?!;?\s*\{)/g;
    content = content.replace(genericSuccessRegex, (match, msg) => {
        if (msg.includes('{')) return match; // avoid messing up complex ones
        modified = true;
        // If msg is a literal string 'ABC', use it raw for ID, otherwise use a generic ID
        return `toast.success(${msg}, { id: ${msg} })`;
    });
    
    const genericWarningRegex = /toast\.warning\(\s*(['"][^'"]+['"]|`[^`]+`)\s*\)(?!;?\s*\{)/g;
    content = content.replace(genericWarningRegex, (match, msg) => {
        if (msg.includes('{')) return match;
        modified = true;
        return `toast.warning(${msg}, { id: ${msg} })`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Refined:', filePath);
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

filesToFix.forEach(f => refineToasts(f));
