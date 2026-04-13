const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    let content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    
    // Check if GET / route exists
    if (!content.includes('get(\'/\'')) continue;

    const querystringRegex = /querystring:\s*z\.object\(\{([\s\S]*?)\}\)/;
    let match = content.match(querystringRegex);

    if (match) {
        // Appending limit and page to existing querystring
        let inner = match[1];
        if (!inner.includes('limit:')) {
            let newInner = inner + `\n                limit: z.string().optional(),\n                page: z.string().optional(),`;
            content = content.replace(inner, newInner);
        }
    } else {
        // Need to add querystring schema entirely
        // Wait, some might not have schema, or might not have querystring.
        // Let's manually do standard ones if regex is too hard, but let's try.
    }
}
