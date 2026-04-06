import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

async function migrate() {
    const prisma = new PrismaClient();
    console.log('Iniciando migração de dados (SQLite -> PostgreSQL)...');

    // Assegura caminho do SQLite
    const sqlitePath = path.resolve(__dirname, '../../prisma/dev.db');
    if (!fs.existsSync(sqlitePath)) {
        throw new Error(`Arquivo SQLite não encontrado: ${sqlitePath}`);
    }

    const sqlite = new Database(sqlitePath, { readonly: true });

    // Ordem estrita de dependências (Nível 0 ao Nível N)
    const tables = [
        { name: 'users', model: prisma.user },
        { name: 'clientes', model: prisma.cliente },
        { name: 'fornecedores', model: prisma.fornecedor },
        { name: 'empresas_revenda', model: prisma.empresaRevenda },
        { name: 'funcionarios', model: prisma.funcionario },
        { name: 'gastos_operacionais', model: prisma.gastoOperacional },
        { name: 'gastos_pessoais', model: prisma.gastoPessoal },
        { name: 'ingredientes', model: prisma.ingrediente },
        { name: 'produtos', model: prisma.produto },
        { name: 'receitas_produto', model: prisma.receitaProduto },
        { name: 'vendas', model: prisma.venda },
        { name: 'compras', model: prisma.compra },
        { name: 'movimentacao_estoque', model: prisma.movimentacaoEstoque },
        { name: 'diarias', model: prisma.diaria },
        { name: 'pedidos', model: prisma.pedido },
        { name: 'gastos_revenda', model: prisma.gastoRevenda },
        { name: 'vendas_revenda', model: prisma.vendaRevenda },
        { name: 'receitas_ingredientes', model: prisma.receitaIngrediente },
        { name: 'producoes_lanche', model: prisma.producaoLanche },
        { name: 'lotes', model: prisma.lote },
        { name: 'alertas_estoque', model: prisma.alertaEstoque },
        { name: 'itens_venda', model: prisma.itemVenda },
        { name: 'itens_compra', model: prisma.itemCompra },
        { name: 'parcelas_revenda', model: prisma.parcelaRevenda },
    ];

    try {
        for (const table of tables) {
            console.log(`\n⬇️ Lendo tabela [${table.name}] do SQLite...`);
            
            // Lê todos os dados da tabela original
            const rows = sqlite.prepare(`SELECT * FROM ${table.name}`).all();
            
            if (rows.length === 0) {
                console.log(`   Vazia. Ignorando.`);
                continue;
            }

            console.log(`   Encontrados ${rows.length} registros. Inserindo no Postgres...`);

            // Tratamento de conversões numéricas que o Prisma Postgres exige (ex: Decimal/Boolean no sqlite é integer/real/string)
            const cleanedRows = rows.map(row => {
                const newRow = { ...row };
                // SQLite não tem tipo Date ou Boolean real, então pode ser tratado pelo prisma como iso string e numbers
                // Dependendo do model Prisma, precisamos assegurar a conversão correta se bater constraint.
                // Como createMany aceita os formatos ISO8601 ou timestamps nativos devolvidos do SQLite, a injeção deve ser direta,
                // mas vamos limpar possíveis undefined maps.
                 Object.keys(newRow).forEach(k => {
                    if (newRow[k] === null) return;
                    if (typeof newRow[k] === 'number') {
                        // Se o Prisma espera boolean (SQLite envia 0/1)
                        // A tipagem real depende do schema. Deixamos o cast do Prisma atuar primeiro.
                    }
                });
                return newRow;
            });

            try {
                // Inserir os registros
                const result = await (table.model as any).createMany({
                    data: cleanedRows,
                    skipDuplicates: true // Garante que re-rodar o script é seguro
                });
                
                console.log(`✅ Sucesso: ${result.count} registros inseridos em PostgreSQL -> [${table.name}].`);
            } catch (err: any) {
                console.error(`❌ Erro ao inserir na tabela ${table.name}:`, err.message);
                console.log(`   ⚠️ PAUSANDO MIGRAÇÃO devido ao erro de constraint estrutural.`);
                break; 
            }
        }
    } finally {
        sqlite.close();
        await prisma.$disconnect();
        console.log('\nProcesso finalizado.');
    }
}

migrate();
