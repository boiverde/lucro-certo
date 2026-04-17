const fs = require('fs');

const path = 'src/pages/Controle.jsx';
let content = fs.readFileSync(path, 'utf8');

if(!content.includes('import Pagination from')) {
    content = content.replace(
        'import { Badge } from "@/components/ui/badge";',
        'import { Badge } from "@/components/ui/badge";\nimport Pagination from "@/components/ui/pagination";'
    );
}

const statesCode = `
  const [pageVendas, setPageVendas] = useState(1);
  const [pageCompras, setPageCompras] = useState(1);
  const [pageProdutos, setPageProdutos] = useState(1);
  const [pageGastos, setPageGastos] = useState(1);
  const [pageClientes, setPageClientes] = useState(1); // just in case
`;

if (!content.includes('setPageVendas')) {
    content = content.replace('  const queryClient = useQueryClient();', statesCode + '\n  const queryClient = useQueryClient();');
}

// Compras
content = content.replace(
`  const { data: compras = [], isLoading: loadingCompras } = useQuery({
    queryKey: ['compras'],
    queryFn: async () => {
      const result = await base44.entities.Compra.filter(
        { created_by: user?.email },
        '-data_compra'
      );
      return result;
    },
    enabled: !!user,
  });`,
`  const { data: comprasData = { data: [], meta: null }, isLoading: loadingCompras } = useQuery({
    queryKey: ['compras', pageCompras],
    queryFn: async () => {
      return base44.entities.Compra.filterPaginated(
        { created_by: user?.email },
        '-data_compra', pageCompras, 50
      );
    },
    enabled: !!user,
  });
  const compras = comprasData.data;`
);

// Vendas
content = content.replace(
`  const { data: vendas = [], isLoading: loadingVendas } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      const result = await base44.entities.Venda.filter(
        { created_by: user?.email },
        '-data_venda'
      );
      return result;
    },
    enabled: !!user,
  });`,
`  const { data: vendasData = { data: [], meta: null }, isLoading: loadingVendas } = useQuery({
    queryKey: ['vendas', pageVendas],
    queryFn: async () => {
      return base44.entities.Venda.filterPaginated(
        { created_by: user?.email },
        '-data_venda', pageVendas, 50
      );
    },
    enabled: !!user,
  });
  const vendas = vendasData.data;`
);

// Produtos
content = content.replace(
`  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const result = await base44.entities.Produto.filter(
        { created_by: user?.email },
        '-created_date'
      );
      return result;
    },
    enabled: !!user,
  });`,
`  const { data: produtosData = { data: [], meta: null }, isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos', pageProdutos],
    queryFn: async () => {
      return base44.entities.Produto.filterPaginated(
        { created_by: user?.email },
        '-created_date', pageProdutos, 50
      );
    },
    enabled: !!user,
  });
  const produtos = produtosData.data;`
);

// Gastos
content = content.replace(
`  const { data: gastos = [], isLoading: loadingGastos } = useQuery({
    queryKey: ['gastos-operacionais'],
    queryFn: async () => {
      const result = await base44.entities.GastoOperacional.filter(
        { created_by: user?.email },
        '-data'
      );
      return result;
    },
    enabled: !!user,
  });`,
`  const { data: gastosData = { data: [], meta: null }, isLoading: loadingGastos } = useQuery({
    queryKey: ['gastos-operacionais', pageGastos],
    queryFn: async () => {
      return base44.entities.GastoOperacional.filterPaginated(
        { created_by: user?.email },
        '-data', pageGastos, 50
      );
    },
    enabled: !!user,
  });
  const gastos = gastosData.data;`
);

// Paginators UI
// 1. Vendas
content = content.replace(
`<ListaVendas 
            vendas={vendas}
            loading={loadingVendas}
            onEditar={handleEditarVenda}
            onDeletar={handleDeletarVenda}
          />`,
`<ListaVendas 
            vendas={vendas}
            loading={loadingVendas}
            onEditar={handleEditarVenda}
            onDeletar={handleDeletarVenda}
          />
          <Pagination meta={vendasData.meta} onPageChange={setPageVendas} />`
);

// 2. Compras
content = content.replace(
`<ListaCompras 
            compras={compras}
            loading={loadingCompras}
            onEditar={handleEditarCompra}
            onDeletar={handleDeletarCompra}
          />`,
`<ListaCompras 
            compras={compras}
            loading={loadingCompras}
            onEditar={handleEditarCompra}
            onDeletar={handleDeletarCompra}
          />
          <Pagination meta={comprasData.meta} onPageChange={setPageCompras} />`
);

// 3. Gastos
content = content.replace(
`<ListaGastos 
            gastos={gastos}
            loading={loadingGastos}
            onEditar={handleEditarGasto}
            onDeletar={handleDeletarGasto}
          />`,
`<ListaGastos 
            gastos={gastos}
            loading={loadingGastos}
            onEditar={handleEditarGasto}
            onDeletar={handleDeletarGasto}
          />
          <Pagination meta={gastosData.meta} onPageChange={setPageGastos} />`
);

// 4. Produtos
content = content.replace(
`<ListaProdutos 
                      produtos={produtos}
                      loading={loadingProdutos}
                      onEditar={handleEditarProduto}
                      onAdicionarEntrada={(p) => handleAdicionarMovimentacao(p, 'entrada')}
                      onAdicionarSaida={(p) => handleAdicionarMovimentacao(p, 'saida')}
                    />`,
`<ListaProdutos 
                      produtos={produtos}
                      loading={loadingProdutos}
                      onEditar={handleEditarProduto}
                      onAdicionarEntrada={(p) => handleAdicionarMovimentacao(p, 'entrada')}
                      onAdicionarSaida={(p) => handleAdicionarMovimentacao(p, 'saida')}
                    />
                    <Pagination meta={produtosData.meta} onPageChange={setPageProdutos} />`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Controle.jsx updated cleanly.');
