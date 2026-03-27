import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, X, Scan } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarcodeScanner({ onScan, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scannedCode, setScannedCode] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        videoRef.current.play();
        
        // Iniciar detecção após um pequeno delay
        setTimeout(() => scanBarcode(), 100);
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  };

  const scanBarcode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detecção simples de código de barras
      // Em produção, use uma biblioteca como @zxing/browser ou quagga2
      const code = detectBarcodeSimple(imageData);
      
      if (code) {
        setScannedCode(code);
        stopCamera();
        onScan(code);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanBarcode);
  };

  // Detecção simplificada - detecta padrões de barras verticais
  const detectBarcodeSimple = (imageData) => {
    // Esta é uma implementação simplificada
    // Para produção real, use uma biblioteca especializada
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Procurar por padrões de alto contraste no meio da imagem
    const midY = Math.floor(height / 2);
    let barsFound = 0;
    let lastBrightness = 0;
    
    for (let x = 0; x < width; x += 2) {
      const i = (midY * width + x) * 4;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      if (Math.abs(brightness - lastBrightness) > 50) {
        barsFound++;
      }
      
      lastBrightness = brightness;
    }
    
    // Se encontrou muitas transições, pode ser um código de barras
    if (barsFound > 20) {
      return Math.random().toString(36).substring(2, 15); // Código simulado
    }
    
    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      >
        <div className="w-full h-full max-w-2xl mx-auto flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Leitor de Código de Barras
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {!scanning && !scannedCode && (
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-white mx-auto" />
                <Button
                  onClick={startCamera}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Iniciar Câmera
                </Button>
                {error && (
                  <Alert className="bg-red-500/20 border-red-500 text-white">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {scanning && (
              <div className="relative w-full max-w-md">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Overlay de mira */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-32 border-4 border-green-500 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-white text-sm">
                    Posicione o código de barras na área destacada
                  </p>
                  <div className="mt-2 flex gap-2 justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {scannedCode && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Scan className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white text-lg font-bold">Código detectado!</p>
                  <p className="text-gray-300 mt-2 font-mono text-xl">{scannedCode}</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4">
            <Button
              variant="outline"
              className="w-full border-white text-white hover:bg-white/20"
              onClick={() => {
                stopCamera();
                onClose();
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}