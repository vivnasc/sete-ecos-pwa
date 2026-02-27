import React, { useEffect, useRef, useState } from 'react';

/**
 * BarcodeScanner — Scanner de barcode via câmara usando html5-qrcode
 *
 * Props:
 * - onScan: (barcode: string) => void
 * - onClose: () => void
 */
export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const html5QrCodeRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    initScanner();

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  async function initScanner() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!mountedRef.current) return;

      const scanner = new Html5Qrcode('barcode-reader');
      html5QrCodeRef.current = scanner;

      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          if (mountedRef.current && decodedText) {
            if (navigator.vibrate) navigator.vibrate(100);
            stopScanner();
            onScan(decodedText);
          }
        },
        () => {
          // Frame sem barcode detectado — normal, silencioso
        }
      );
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Erro ao iniciar scanner:', err);

      const msg = err.toString();
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setError('Precisamos de acesso à câmara para ler códigos de barras. Permite o acesso nas definições do browser.');
      } else if (msg.includes('NotFound') || msg.includes('device not found')) {
        setError('Nenhuma câmara encontrada. Podes digitar o código manualmente.');
      } else {
        setError('Não foi possível iniciar a câmara. Tenta digitar o código manualmente.');
      }
      setScanning(false);
    }
  }

  function stopScanner() {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
      try { html5QrCodeRef.current.clear(); } catch {}
      html5QrCodeRef.current = null;
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = manualCode.trim().replace(/[^0-9]/g, '');
    if (code.length >= 8) {
      stopScanner();
      onScan(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl">📷</span>
          <h3 className="text-white font-semibold">Ler Código de Barras</h3>
        </div>
        <button
          onClick={() => { stopScanner(); onClose(); }}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white bg-white/10 rounded-full transition-all"
          aria-label="Fechar scanner"
        >
          ✕
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {error ? (
          <div className="bg-white/10 backdrop-blur text-white rounded-2xl p-6 max-w-sm text-center">
            <div className="text-5xl mb-3">📷</div>
            <p className="text-sm text-white/80 mb-2">{error}</p>
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl">
              <div id="barcode-reader" className="w-full" />
              {scanning && (
                <p className="text-white/60 text-sm mt-3 text-center">
                  Aponta a câmara para o código de barras
                </p>
              )}
            </div>
          </>
        )}

        {/* Input manual */}
        <div className="w-full max-w-sm mt-6">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black/80 px-3 text-white/40 text-xs">ou digita o código</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ex: 5601234567890"
              className="flex-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-white/30 focus:border-white/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={manualCode.replace(/[^0-9]/g, '').length < 8}
              className="px-5 py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold disabled:opacity-30 hover:bg-[#6B7A5D] transition-all active:scale-95"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
