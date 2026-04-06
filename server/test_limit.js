const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: { db: { url: "postgresql://postgres:%23Verde15793@db.qfahagyxugfjzrigkmkp.supabase.co:5432/postgres" } }
});

async function main() {
    console.log("[Teste] Limpando usuários de teste antigos...");
    await prisma.venda.deleteMany({ where: { user: { email: 'freemodetest@lucrocerto.com' } } });
    await prisma.user.deleteMany({ where: { email: 'freemodetest@lucrocerto.com' } });

    console.log("[Teste] Criando usuário free...");
    const user = await prisma.user.create({
        data: {
            name: 'User Free',
            email: 'freemodetest@lucrocerto.com',
            password_hash: require('bcryptjs').hashSync('testpass', 6),
        }
    });

    console.log("[Teste] Injetando 150 vendas no banco...");
    const vendasToCreate = Array.from({ length: 150 }).map((_, i) => ({
        userId: user.id,
        data_venda: new Date(),
        valor_total: 10 + i,
        status: 'paga'
    }));
    await prisma.venda.createMany({ data: vendasToCreate });

    const total = await prisma.venda.count({ where: { userId: user.id } });
    console.log("[Teste] Total de vendas injetadas:", total);

    console.log("[Teste] Fazendo login via API...");
    const loginRes = await fetch("http://localhost:3333/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: 'freemodetest@lucrocerto.com', password: 'testpass' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log("[Teste] Tentando adicionar a 151ª venda via API...");
    const res = await fetch("http://localhost:3333/vendas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            data_venda: new Date().toISOString(),
            valor_total: 100,
            itens: []
        })
    });

    console.log("Status recebido:", res.status);
    const body = await res.json();
    console.log("Response Body:", body);

    if (res.status === 403 && body.error === 'LIMIT_REACHED') {
        console.log("✅ TESTE BEM-SUCEDIDO: API bloqueou a 151ª venda corretamente.");
    } else {
        console.log("❌ TESTE FALHOU: API não retornou o erro esperado.");
    }

    console.log("[Teste] Limpando dados do teste...");
    await prisma.venda.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("[Teste] Finalizado.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
