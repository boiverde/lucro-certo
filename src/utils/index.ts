
export function createPageUrl(pageName: string) {
    // Preserva o casing original para bater com as rotas /Dashboard, /Plano, etc.
    return '/' + pageName.replace(/ /g, '-');
}
