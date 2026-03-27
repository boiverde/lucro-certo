const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/provider = \"postgresql\"/g, 'provider = "sqlite"');
content = content.replace(/env\(\"DATABASE_URL\"\)/g, '"file:./dev.db"');
content = content.replace(/@db\.Decimal\(\d+,\s*\d+\)/g, '');
fs.writeFileSync(file, content);
console.log('Done mapping schema to SQLite');
