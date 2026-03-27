import * as entities from './entities';
import * as integrations from './integrations';
import { auth } from './auth';

// Mock do objeto base44 para manter compatibilidade sem alterar todas as páginas
export const base44 = {
  auth: auth,
  entities: entities, // entities.js agora exporta os Adapters (Cliente, Venda, etc)
  integrations: {
    Core: integrations
  }
};
