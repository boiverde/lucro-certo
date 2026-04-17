import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Gerenciador de notificações
class NotificationService {
  static async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("Este navegador não suporta notificações");
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  static async showNotification(title, options = {}) {
    if (Notification.permission !== "granted") {
      return false;
    }

    try {
      // Se o service worker estiver disponível, usar ele
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          ...options
        });
      } else {
        // Fallback para notificação básica
        new Notification(title, {
          icon: '/icon-192.png',
          ...options
        });
      }
      return true;
    } catch (error) {
      console.error("Erro ao mostrar notificação:", error);
      return false;
    }
  }

  static isSupported() {
    return "Notification" in window;
  }

  static getPermission() {
    return Notification.permission;
  }
}

export default function NotificationManager({ produtos = [] }) {
  const [permission, setPermission] = useState(
    NotificationService.isSupported() ? NotificationService.getPermission() : "unsupported"
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Verificar estoque baixo a cada 30 segundos
    const interval = setInterval(() => {
      checkLowStock();
    }, 30000);

    // Verificar imediatamente ao carregar
    checkLowStock();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtos]);

  const checkLowStock = async () => {
    if (permission !== "granted" || checking) return;
    
    setChecking(true);
    
    const produtosBaixos = produtos.filter(
      p => p.ativo && 
           p.notificar_estoque_baixo && 
           p.estoque_minimo > 0 && 
           p.estoque_atual <= p.estoque_minimo
    );

    // Verificar se já notificou recentemente (últimas 6 horas)
    const lastNotification = localStorage.getItem('last_stock_notification');
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
    
    if (produtosBaixos.length > 0 && (!lastNotification || parseInt(lastNotification) < sixHoursAgo)) {
      await NotificationService.showNotification(
        "⚠️ Estoque Baixo!",
        {
          body: produtosBaixos.length === 1
            ? `${produtosBaixos[0].nome} está com estoque baixo (${produtosBaixos[0].estoque_atual} ${produtosBaixos[0].unidade})`
            : `${produtosBaixos.length} produtos estão com estoque baixo`,
          tag: 'low-stock',
          requireInteraction: true,
          actions: [
            { action: 'view', title: 'Ver Estoque' },
            { action: 'close', title: 'Fechar' }
          ]
        }
      );
      
      localStorage.setItem('last_stock_notification', Date.now().toString());
    }
    
    setChecking(false);
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await NotificationService.requestPermission();
      setPermission(granted ? "granted" : "denied");
      
      if (granted) {
        // Enviar notificação de teste
        await NotificationService.showNotification(
          "✅ Notificações Ativadas!",
          {
            body: "Você receberá alertas quando o estoque estiver baixo",
            tag: 'test'
          }
        );
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
    }
  };

  if (!NotificationService.isSupported()) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-5 h-5" />
          Notificações de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent>
        {permission === "default" && (
          <Alert className="mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Ative as notificações para receber alertas de estoque baixo automaticamente
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {permission === "denied" && (
            <Alert className="bg-red-50 border-red-200">
              <BellOff className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Notificações bloqueadas. Ative nas configurações do navegador.
              </AlertDescription>
            </Alert>
          )}

          {permission === "granted" && (
            <Alert className="bg-green-50 border-green-200">
              <Bell className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Notificações ativas! Você será alertado quando houver estoque baixo.
              </AlertDescription>
            </Alert>
          )}

          {permission === "default" && (
            <Button
              onClick={handleRequestPermission}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ativar Notificações
            </Button>
          )}

          {permission === "granted" && (
            <Button
              onClick={checkLowStock}
              variant="outline"
              className="w-full"
              disabled={checking}
            >
              {checking ? "Verificando..." : "Verificar Estoque Agora"}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          As notificações são enviadas quando produtos atingem o estoque mínimo configurado.
        </p>
      </CardContent>
    </Card>
  );
}

export { NotificationService };