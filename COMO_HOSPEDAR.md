# ☁️ Guia Oficial de Hospedagem (Nuvem)

O seu sistema **Lucro Certo** agora foi desenhado para ser "Híbrido". Ele roda perfeitamente no seu computador (com banco de dados SQLite .db), mas a qualquer momento pode ser chaveado para um Servidor Web Profissional global.

## Como migrar o Banco de Dados para a Nuvem de verdade (PostgreSQL)

1. **Obtenha um banco de dados hospedado gratuito** (Ex: *Supabase* ou *Neon.tech*) e pegue a sua `DATABASE_URL` gigante (começa com `postgresql://...`).
2. Vá até a pasta `lucro-certo-backend` na nuvem (ou no ambiente virtual como Render.com).
3. Mude as variáveis de ambiente (`.env`) e cole a sua DATABASE_URL lá.
4. Você notará que existe um arquivo novo chamado `server/prisma/schema.postgresql.prisma`.
5. Substitua o seu arquivo `schema.prisma` normal pelo conteúdo desse `schema.postgresql.prisma`.
6. Rode `npx prisma db push` e pronto! Suas tabelas nasceram na nuvem.

## Como subir a Tela Visual (Frontend)

Com a API pronta e online numa URL (ex: api.lucrocerto.com):
1. Coloque esse código em uma conta sua no **GitHub**.
2. Vá no site **Vercel.com** e importe esse repositório do Github.
3. Configure a variável local `VITE_API_URL` apontando para a sua API hospedada.
4. A Vercel cuida do resto!

Qualquer dúvida durante esse processo, o código já está configurado nos bastidores para "aceitar" a nuvem sem reclamar!
