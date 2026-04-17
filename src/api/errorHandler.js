import { toast } from 'sonner';

export function handleApiError(error, contextoAcao) {
  // Ignorar erros abortados
  if (error.name === 'AbortError') return;

  // Erro de Rede / Offline
  if (error.message === 'offline' || error.message === 'Failed to fetch' || !navigator.onLine) {
    if (contextoAcao.includes('carregar') || contextoAcao.includes('buscar')) {
      toast.warning(`Sem conexão. Tentando ${contextoAcao} novamente em breve...`, { id: `net-${contextoAcao}` });
    } else {
      // Se for save/update e app suporta sync
      toast.warning(`Você está offline. ${contextoAcao} ocorrerá assim que voltar a conexão.`, { id: `net-${contextoAcao}` });
    }
    return;
  }

  // Erro de Autenticação
  if (error.status === 401) {
    toast.error('Sessão expirada. Faça login novamente.', { id: 'auth-err' });
    setTimeout(() => {
        if (window.location.pathname !== '/Login') {
            window.location.href = '/Login';
        }
    }, 1500);
    return;
  }

  if (error.status === 403) {
    // 403 LIMIT_REACHED é tratado via evento open-upgrade-modal silenciosamente
    if (error.data?.error !== 'LIMIT_REACHED') {
      toast.error('Acesso negado. Você não tem permissão para esta ação.', { id: 'auth-403' });
    }
    return;
  }

  // Erro de Validação (Server rejeitou input)
  if (error.status === 400) {
    toast.warning(`Verifique os dados informados ao ${contextoAcao}.`, { id: `val-${contextoAcao}` });
    return;
  }

  // Erro de Servidor (500)
  if (error.status >= 500) {
    toast.error(`Erro interno do servidor ao ${contextoAcao}. Tente novamente mais tarde.`, { id: `srv-${contextoAcao}` });
    return;
  }

  // Fallback Genérico
  toast.error(`Não foi possível ${contextoAcao}. Verifique o sistema e tente novamente.`, { id: `gen-${contextoAcao}` });
}
