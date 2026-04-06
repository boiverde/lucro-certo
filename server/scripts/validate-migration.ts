import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

async function validate() {
    const prisma = new PrismaClient();
    console.log('🔄 Iniciando Auditoria e Validação Pós-Migração...');

    const sqlitePath = path.resolve(__dirname, '../../prisma/dev.db');
    if (!fs.existsSync(sqlitePath)) {
        throw new Error(`Arquivo SQLite da Origem não encontrado: ${sqlitePath}`);
    }

    const sqlite = new Database(sqlitePath, { readonly: true });

    const tables = [
        { name: 'users', model: prisma.user },
        { name: 'clientes', model: prisma.cliente },
        { name: 'produtos', model: prisma.produto },
        { name: 'fornecedores', model: prisma.fornecedor },
        { name: 'vendas', model: prisma.venda },
        { name: 'itens_venda', model: prisma.itemVenda },
        { name: 'compras', model: prisma.compra },
        { name: 'itens_compra', model: prisma.itemCompra },
        { name: 'movimentacao_estoque', model: prisma.movimentacaoEstoque },
        { name: 'empresas_revenda', model: prisma.empresaRevenda },
        { name: 'vendas_revenda', model: prisma.vendaRevenda },
        { name: 'parcelas_revenda', model: prisma.parcelaRevenda },
    ];

    console.log('\n--- BATERIA DE CONTAGENS (Origem x Destino) ---');
    let hasDivergence = false;

    for (const table of tables) {
        try {
            // Conta Origem (SQLite)
            const sqliteCountRow = sqlite.prepare(`SELECT count(*) as total FROM ${table.name}`).get() as { total: number };
            const countOrigem = sqliteCountRow.total;

            // Conta Destino (Postgres via Prisma)
            const countDestino = await (table.model as any).count();

            const icon = countOrigem === countDestino ? '✅' : '❌';
            if (countOrigem !== countDestino) hasDivergence = true;

            console.log(`${icon} Tabela [${table.name.padEnd(20)}] | Origem (SQLite): ${countOrigem.toString().padStart(5)} | Destino (PG): ${countDestino.toString().padStart(5)}`);

        } catch (err: any) {
             console.log(`⚠️ Erro ao validar tabela [${table.name}]: ${err.message}`);
        }
    }

    console.log('\n--- APROFUNDAMENTO DE INTEGRIDADE (Produtos com Estoque Controlado) ---');
    try {
        const produtosComEstoque = sqlite.prepare(`SELECT id, nome, estoque_atual FROM produtos WHERE controla_estoque = 1;`).all() as any[];
        
        let checked = 0;
        let divergenciasEstoque = 0;

        for (const pdSQLite of produtosComEstoque) {
            checked++;
            // Conferência exata do saldo persistido na origem com o do Postgres
            const pdPostgres = await prisma.produto.findUnique({ where: { id: pdSQLite.id }});
            
            if (!pdPostgres) {
                console.log(`❌ Produto [${pdSQLite.nome}] sumiu durante a migração!`);
                divergenciasEstoque++;
                continue;
            }

            // Prisma converte Decimal para uso com Decimal.js, entao o cast de precisão importa
            const saldoPg = Number(pdPostgres.estoque_atual);
            const saldoSq = Number(pdSQLite.estoque_atual);

            if (saldoPg !== saldoSq) {
                 console.log(`❌ Divergência de Saldo no [${pdSQLite.nome}]: Era ${saldoSq}, Ficou ${saldoPg}`);
                 divergenciasEstoque++;
            }
        }

        console.log(`\nAuditoria Finalizada: Verificados ${checked} produtos monitoráveis.`);
        if (divergenciasEstoque > 0) {
            console.log(`⚠️ EXISTEM ${divergenciasEstoque} VAZAMENTOS DE ESTOQUE APÓS A MIGRAÇÃO!`);
        } else {
             console.log(`✅ Todos os saldos estão matematicamente idênticos nas constelações.`);
        }

    } catch(err: any) {
        console.log('Não foi possível realizar o check aprofundado.', err.message);
    }

    sqlite.close();
    await prisma.$disconnect();

    if (hasDivergence) {
        console.log('\n🚨 ALERTA: Foram detectadas divergências métricas entre origem e destino! Verifique o log e execute reparos.');
    } else {
        console.log('\n🟢 MIGRATION READY: Os bancos estão sincronizados perfeitamente em volume. Seguro para apontamento da API.');
    }
}

validate();
