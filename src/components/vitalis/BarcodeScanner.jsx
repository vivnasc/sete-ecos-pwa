// src/components/vitalis/BarcodeScanner.jsx
// Scanner de código de barras para registar alimentos

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Base de dados simplificada de alimentos (em produção seria uma API)
const ALIMENTOS_DB = {
  '5601234567890': { nome: 'Iogurte Natural', calorias: 65, proteina: 5, hidratos: 4, gordura: 3, porcao: '125g' },
  '5601234567891': { nome: 'Leite Meio-Gordo', calorias: 46, proteina: 3, hidratos: 5, gordura: 2, porcao: '100ml' },
  '5601234567892': { nome: 'Pão Integral', calorias: 250, proteina: 9, hidratos: 45, gordura: 3, porcao: '100g' },
  '5601234567893': { nome: 'Atum em Água', calorias: 108, proteina: 24, hidratos: 0, gordura: 1, porcao: '120g' },
  '5601234567894': { nome: 'Ovos (embalagem)', calorias: 155, proteina: 13, hidratos: 1, gordura: 11, porcao: '100g' },
  '5601234567895': { nome: 'Queijo Fresco', calorias: 103, proteina: 11, hidratos: 2, gordura: 6, porcao: '100g' },
  // Códigos genéricos para demo
  '0000000000000': { nome: 'Produto Demo', calorias: 100, proteina: 5, hidratos: 10, gordura: 5, porcao: '100g' },
};

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    checkCameraSupport();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setError('Câmara não suportada neste dispositivo');
    }
  };

  const startCamera = async () => {
    setError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmara traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao aceder à câmara:', err);
      setError('Não foi possível aceder à câmara. Verifica as permissões.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const captureFrame = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Em produção, aqui usaríamos uma biblioteca de detecção de barcode
    // Por agora, simulamos com entrada manual ou código de demo

    // Simular detecção após 3 segundos (demo)
    setTimeout(() => {
      const demoCode = '5601234567893'; // Atum
      handleBarcodeDetected(demoCode);
    }, 3000);
  };

  const handleBarcodeDetected = (code) => {
    stopCamera();

    const alimento = ALIMENTOS_DB[code];
    if (alimento) {
      setResultado({ codigo: code, ...alimento });
    } else {
      setResultado({ codigo: code, naoEncontrado: true });
    }
  };

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      handleBarcodeDetected(manualCode.trim());
    }
  };

  const handleConfirm = () => {
    if (resultado && !resultado.naoEncontrado && onScan) {
      onScan(resultado);
    }
    if (onClose) onClose();
  };

  const resetScanner = () => {
    setResultado(null);
    setManualCode('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            ✕
          </button>
          <h2 className="font-bold">Scanner de Código de Barras</h2>
        </div>
        <span className="text-2xl">📷</span>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">

        {/* Resultado */}
        {resultado && (
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {resultado.naoEncontrado ? (
              <div className="text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Produto não encontrado</h3>
                <p className="text-gray-500 mb-4">Código: {resultado.codigo}</p>
                <p className="text-sm text-gray-400 mb-4">
                  Este produto ainda não está na nossa base de dados.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
                  >
                    Tentar novamente
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-[#7C8B6F] text-white rounded-xl font-medium"
                  >
                    Registar manualmente
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">✅</div>
                  <h3 className="text-xl font-bold text-gray-800">{resultado.nome}</h3>
                  <p className="text-sm text-gray-500">Porção: {resultado.porcao}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-orange-600">{resultado.calorias}</p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-red-600">{resultado.proteina}g</p>
                    <p className="text-xs text-gray-500">Prot.</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-blue-600">{resultado.hidratos}g</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-yellow-600">{resultado.gordura}g</p>
                    <p className="text-xs text-gray-500">Gord.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
                  >
                    Outro
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-[#7C8B6F] text-white rounded-xl font-medium"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanner */}
        {!resultado && (
          <>
            {scanning ? (
              <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay de scan */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-40 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#7C8B6F] rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#7C8B6F] rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#7C8B6F] rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#7C8B6F] rounded-br-lg"></div>

                    {/* Linha de scan animada */}
                    <div className="absolute left-2 right-2 h-0.5 bg-[#7C8B6F] animate-pulse" style={{ top: '50%' }}></div>
                  </div>
                </div>

                <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                  Posiciona o código de barras na área
                </p>

                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-center w-full max-w-sm">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-white mb-2">Escanear produto</h3>
                <p className="text-gray-400 mb-6">
                  Usa a câmara para ler o código de barras do produto alimentar
                </p>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {cameraSupported && (
                  <button
                    onClick={startCamera}
                    className="w-full py-4 bg-[#7C8B6F] text-white rounded-xl font-semibold text-lg mb-4 flex items-center justify-center gap-2"
                  >
                    <span>📷</span> Abrir Câmara
                  </button>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black px-4 text-gray-400 text-sm">ou</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Inserir código manualmente"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#7C8B6F]"
                  />
                  <button
                    onClick={handleManualSearch}
                    disabled={!manualCode.trim()}
                    className="px-4 py-3 bg-white/20 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    Buscar
                  </button>
                </div>

                <p className="text-gray-500 text-xs mt-4">
                  Dica: Experimenta o código "5601234567893" para ver um exemplo
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente de botão para abrir o scanner
export function ScannerButton({ onScan, className = '' }) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowScanner(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#7C8B6F] hover:text-[#7C8B6F] transition-colors ${className}`}
      >
        <span className="text-lg">📷</span>
        <span className="text-sm font-medium">Escanear código</span>
      </button>

      {showScanner && (
        <BarcodeScanner
          onScan={(data) => {
            if (onScan) onScan(data);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
