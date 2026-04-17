const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDJmZjM0NS0xOGQ0LTQ2ZDctYmRkMi05NTc0NDY1ZDYxZTkiLCJpYXQiOjE3NzYxMDg4NTIsImV4cCI6MTc3NjExMjQ1Mn0.V83fySXjQWr-LgMzd9wun_pytFiFdisqYZFkTC6D7iQ';
const api = 'https://lucro-certolucro-certo-api.onrender.com';

async function testRoute(path) {
    const start = Date.now();
    try {
        const res = await fetch(`${api}${path}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const duration = Date.now() - start;
        const text = await res.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log(`❌ ${path}: JSON Parse Error (${res.status})`, duration, 'ms', text.substring(0, 50));
            return;
        }

        const size = (text.length / 1024).toFixed(2); // kb
        
        if (data.results && data.meta) {
            console.log(`✅ ${path} | Size: ${size}KB | Time: ${duration}ms | Meta: Limit ${data.meta.limit}, Total: ${data.meta.total}`);
        } else if (data.results) {
            console.log(`⚠️ ${path} | Has results but NO META | Size: ${size}KB | Time: ${duration}ms`);
        } else {
            console.log(`❌ ${path} | UNEXPECTED FORMAT | Size: ${size}KB | Time: ${duration}ms`);
        }

    } catch (err) {
        console.log(`❌ ${path} ERROR:`, err.message);
    }
}

async function main() {
    console.log("Teste Produção (API na Render):");
    await testRoute('/vendas?limit=5');
    await testRoute('/compras?limit=5');
    await testRoute('/produtos');
    await testRoute('/receitas');
    await testRoute('/lotes');
    await testRoute('/fornecedores');
    await testRoute('/gastos-operacionais');
    await testRoute('/ingredientes');
    await testRoute('/clientes?limit=10&page=1');
}

main();
