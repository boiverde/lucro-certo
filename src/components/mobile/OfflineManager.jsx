import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi, Upload, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Gerenciador de fila offline
class OfflineQueue {
  static QUEUE_KEY = 'offline_queue';
  
  static add(item) {
    const queue = this.getAll();
    const newItem = {
      id: Date.now() + Math.random(),
      ...item,
      timestamp: new Date().toISOString()
    };
    queue.push(newItem);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    return newItem;
  }
  
  static getAll() {
    const data = localStorage.getItem(this.QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static remove(id) {
    const queue = this.getAll().filter(item => item.id !== id);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }
  
  static clear() {
    localStorage.removeItem(this.QUEUE_KEY);
  }
  
  static count() {
    return this.getAll().length;
  }
}

export default function OfflineManager({ onSync }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar periodicamente
    const interval = setInterval(updatePendingCount, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updatePendingCount = () => {
    setPendingCount(OfflineQueue.count());
  };

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    const queue = OfflineQueue.getAll();
    
    try {
      for (const item of queue) {
        await onSync(item);
        OfflineQueue.remove(item.id);
      }
      updatePendingCount();
    } catch (error) {
      toast.error('Erro ao sincronizar:');
      toast.error('Erro ao sincronizar:');
      console.error('Erro ao sincronizar:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      {/* Banner de status */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 p-4"
          >
            <Alert className={isOnline ? "bg-green-500 border-green-600" : "bg-orange-500 border-orange-600"}>
              <div className="flex items-center gap-2 text-white">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <AlertDescription className="text-white">Você está online novamente!</AlertDescription>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <AlertDescription className="text-white">Modo offline ativado</AlertDescription>
                  </>
                )}
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de pendências */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-40"
        >
          <Card className="shadow-lg border-2 border-orange-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {pendingCount} {pendingCount === 1 ? 'registro' : 'registros'} pendente{pendingCount === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isOnline ? 'Clique para sincronizar' : 'Aguardando conexão'}
                    </p>
                  </div>
                </div>
                {isOnline && (
                  <Button
                    size="sm"
                    onClick={handleSync}
                    disabled={syncing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {syncing ? (
                      <div className="animate-spin">⟳</div>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Sincronizar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Indicador de status (canto superior) */}
      <div className="fixed top-4 right-4 z-30">
        <Badge
          variant={isOnline ? "default" : "secondary"}
          className={`${
            isOnline 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-gray-400"
          } text-white shadow-lg`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
      </div>
    </>
  );
}

// Hook para usar offline
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (type, data) => {
    return OfflineQueue.add({ type, data });
  };

  return { isOnline, addToQueue, OfflineQueue };
}