const fs = require('fs');

function enhanceFile(filePath, entityName, queryKeyString, defaultOrder) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Import keepPreviousData
    if (content.includes('@tanstack/react-query') && !content.includes('keepPreviousData')) {
        content = content.replace(
            /import\s+\{[^}]*useQuery[^}]*\}\s+from\s+['"]@tanstack\/react-query['"]/g,
            (match) => {
                return match.replace('{', '{ keepPreviousData,');
            }
        );
    }

    // 2. Add placeholderData: keepPreviousData
    // e.g. enabled: !!user,
    // becomes enabled: !!user, placeholderData: keepPreviousData
    const queryPattern = new RegExp(`queryKey:\\s*\\[\\s*['"]${queryKeyString}['"],\\s*page[\\w]*\\s*\\].*?enabled:\\s*!!user,?`, 'gs');
    content = content.replace(queryPattern, (match) => {
        if (!match.includes('placeholderData')) {
            return match + '\n    placeholderData: keepPreviousData,';
        }
        return match;
    });

    // 3. Add Prefetch useEffect
    // We can insert the prefetch hook just below the useQuery call
    const prefetchHook = `
  useEffect(() => {
    if (user && ${entityName}Data?.meta && ${entityName}Data.meta.page < ${entityName}Data.meta.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['${queryKeyString}', page + 1],
        queryFn: () => base44.entities.${entityName}.filterPaginated(
          { created_by: user.email },
          '${defaultOrder}',
          page + 1,
          50
        )
      });
    }
  }, [page, ${entityName}Data, user, queryClient]);
`;
    // Find the end of the useQuery for this entity
    const queryEndPattern = new RegExp(`${entityName}Data\\.data;`);
    if (content.match(queryEndPattern) && !content.includes(`queryKey: ['${queryKeyString}', page + 1]`)) {
        content = content.replace(queryEndPattern, (match) => {
            return match + '\n' + prefetchHook;
        });
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

enhanceFile('src/pages/Vendas.jsx', 'Venda', 'vendas', '-data_venda');
enhanceFile('src/pages/Clientes.jsx', 'Cliente', 'clientes', '-created_date');
enhanceFile('src/pages/Estoque.jsx', 'Produto', 'produtos', '-created_date');

// Controle.jsx is special because it has multiple
let controle = fs.readFileSync('src/pages/Controle.jsx', 'utf8');
if (controle.includes('@tanstack/react-query') && !controle.includes('keepPreviousData')) {
    controle = controle.replace(
        /import\s+\{[^}]*useQuery[^}]*\}\s+from\s+['"]@tanstack\/react-query['"]/g,
        (match) => match.replace('{', '{ keepPreviousData,')
    );
}

const entitiesInControle = [
    { entity: 'Venda', key: 'vendas', state: 'pageVendas', ord: '-data_venda', hook: 'vendasData' },
    { entity: 'Compra', key: 'compras', state: 'pageCompras', ord: '-data_compra', hook: 'comprasData' },
    { entity: 'Produto', key: 'produtos', state: 'pageProdutos', ord: '-created_date', hook: 'produtosData' },
    { entity: 'GastoOperacional', key: 'gastos-operacionais', state: 'pageGastos', ord: '-data', hook: 'gastosData' },
];

entitiesInControle.forEach(({entity, key, state, ord, hook}) => {
    // Add placeholderData
    const qPattern = new RegExp(`queryKey:\\s*\\[\\s*['"]${key}['"],\\s*${state}\\s*\\].*?enabled:\\s*!!user,?`, 'gs');
    controle = controle.replace(qPattern, (match) => {
        if (!match.includes('placeholderData')) return match + '\n    placeholderData: keepPreviousData,';
        return match;
    });

    // Add prefetch
    const prefetchHook = `
  useEffect(() => {
    if (user && ${hook}?.meta && ${hook}.meta.page < ${hook}.meta.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['${key}', ${state} + 1],
        queryFn: () => base44.entities.${entity}.filterPaginated({ created_by: user.email }, '${ord}', ${state} + 1, 50)
      });
    }
  }, [${state}, ${hook}, user, queryClient]);
`;
    // Insert prefetch after the useQuery block
    const hookMatch = new RegExp(`const ${key.split('-')[0]} = ${hook}\\.data;`);
    if (controle.match(hookMatch) && !controle.includes(`['${key}', ${state} + 1]`)) {
        controle = controle.replace(hookMatch, (match) => {
             return match + '\n' + prefetchHook;
        });
    }
});

fs.writeFileSync('src/pages/Controle.jsx', controle, 'utf8');
console.log('React Query enhanced.');
