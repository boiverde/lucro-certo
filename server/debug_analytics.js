
const axios = require('axios');

async function debug() {
    try {
        console.log('Tentando conectar ao backend na porta 3333...');
        // Como o endpoint requer autenticação, vamos precisar de um token ou pular o hook para teste.
        // Mas vamos tentar ver o que ele responde pura e simplesmente.
        const response = await axios.get('http://localhost:3333/analytics/funnel');
        console.log('Resposta:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('ERRO DO SERVIDOR (Status):', error.response.status);
            console.log('DETALHES DO ERRO:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('ERRO DE CONEXÃO:', error.message);
        }
    }
}

debug();
