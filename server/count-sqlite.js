const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new Database(dbPath, { readonly: true });

const tables = [
  'users', 'clientes', 'produtos', 'vendas', 'itens_venda', 
  'movimentacao_estoque', 'fornecedores', 'compras', 'itens_compra',
  'empresas_revenda', 'vendas_revenda', 'parcelas_revenda', 'gastos_revenda',
  'gastos_operacionais', 'gastos_pessoais', 'ingredientes', 'receitas_produto',
  'receitas_ingredientes', 'producoes_lanche', 'lotes', 'alertas_estoque',
  'pedidos', 'funcionarios', 'diarias'
];

const counts = {};
for (const table of tables) {
  try {
    const row = db.prepare(`SELECT count(*) as count FROM ${table}`).get();
    counts[table] = row.count;
  } catch(e) {
    counts[table] = 'Não encontrada/Erro';
  }
}

console.log(JSON.stringify(counts, null, 2));
db.close();
