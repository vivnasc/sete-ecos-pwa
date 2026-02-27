import React, { useState, useCallback } from 'react';
import FoodSearch from './FoodSearch.jsx';
import PortionSelector from './PortionSelector.jsx';
import BarcodeScanner from './BarcodeScanner.jsx';
import { calcularMacrosAlimento } from '../../lib/vitalis/porcoesConverter.js';
import { pesquisarPorBarcode, guardarRecente, toggleFavorito, isFavorito } from '../../lib/vitalis/alimentosSearch.js';

/**
 * AddFoodModal — Modal completo para adicionar alimento a uma refeição
 *
 * Props:
 * - refeicao: nome da refeição (ex: "Almoço")
 * - onAdd: (item) => void — { alimento, quantidade_g, quantidade_porcao, tipo_porcao, macros, nome_display }
 * - onClose: () => void
 */
export default function AddFoodModal({ refeicao, onAdd, onClose }) {
  const [step, setStep] = useState('search'); // search, portion, scanner, barcode-result
  const [alimentoSelecionado, setAlimento] = useState(null);
  const [porcionData, setPorcionData] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState(null);
  const [favState, setFavState] = useState(false);

  // Ao selecionar alimento da pesquisa
  const handleSelectFood = useCallback((alimento) => {
    setAlimento(alimento);
    setFavState(isFavorito(alimento.id));

    // Defaults de porção
    const g = alimento.porcao_padrao_g || 100;
    const macros = calcularMacrosAlimento(alimento, g);
    setPorcionData({
      quantidade_g: g,
      quantidade_porcao: 1,
      tipo_porcao: alimento.porcao_mao_tipo || 'concha',
      macros
    });

    setStep('portion');
  }, []);

  // Ao abrir scanner
  const handleScanRequest = useCallback(() => {
    setStep('scanner');
  }, []);

  // Ao ler barcode
  const handleBarcodeScan = useCallback(async (barcode) => {
    setStep('barcode-result');
    setBarcodeLoading(true);
    setBarcodeError(null);

    try {
      const resultado = await pesquisarPorBarcode(barcode);
      if (resultado) {
        handleSelectFood(resultado);
      } else {
        setBarcodeError(`Produto não encontrado para o código ${barcode}. Tenta pesquisar pelo nome.`);
      }
    } catch {
      setBarcodeError('Erro ao pesquisar o produto. Tenta novamente.');
    } finally {
      setBarcodeLoading(false);
    }
  }, [handleSelectFood]);

  // Confirmar adição
  const handleConfirm = () => {
    if (!alimentoSelecionado || !porcionData) return;

    guardarRecente(alimentoSelecionado);

    onAdd({
      alimento: alimentoSelecionado,
      quantidade_g: porcionData.quantidade_g,
      quantidade_porcao: porcionData.quantidade_porcao,
      tipo_porcao: porcionData.tipo_porcao,
      macros: porcionData.macros,
      nome_display: alimentoSelecionado.nome
    });
  };

  // Toggle favorito
  const handleToggleFav = () => {
    if (!alimentoSelecionado) return;
    const added = toggleFavorito(alimentoSelecionado);
    setFavState(added);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:bg-black/50 sm:items-center sm:justify-center">
      <div className="flex-1 flex flex-col sm:flex-initial sm:w-full sm:max-w-md sm:max-h-[90vh] sm:rounded-2xl sm:overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {step !== 'search' && step !== 'scanner' && (
              <button
                onClick={() => { setStep('search'); setAlimento(null); setBarcodeError(null); }}
                className="p-1.5 text-gray-500 hover:text-gray-700 -ml-1"
              >
                ←
              </button>
            )}
            <h3 className="font-semibold text-gray-800">
              {step === 'search' && `Adicionar a ${refeicao || 'refeição'}`}
              {step === 'portion' && (alimentoSelecionado?.nome || 'Porção')}
              {step === 'scanner' && 'Ler Código de Barras'}
              {step === 'barcode-result' && 'A pesquisar...'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search step */}
          {step === 'search' && (
            <FoodSearch
              onSelect={handleSelectFood}
              onScanRequest={handleScanRequest}
              placeholder="Pesquisar alimento..."
            />
          )}

          {/* Barcode scanner */}
          {step === 'scanner' && (
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onClose={() => setStep('search')}
            />
          )}

          {/* Barcode result loading/error */}
          {step === 'barcode-result' && barcodeLoading && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-pulse text-4xl mb-3">📦</div>
                <p className="text-gray-500">A pesquisar produto...</p>
              </div>
            </div>
          )}

          {step === 'barcode-result' && barcodeError && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-xs">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 mb-4">{barcodeError}</p>
                <button
                  onClick={() => setStep('search')}
                  className="px-6 py-2.5 bg-[#7C8B6F] text-white rounded-xl font-medium"
                >
                  Pesquisar pelo nome
                </button>
              </div>
            </div>
          )}

          {/* Portion step */}
          {step === 'portion' && alimentoSelecionado && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Alimento info */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-3xl">{alimentoSelecionado.icon || '🍽️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{alimentoSelecionado.nome}</p>
                    {alimentoSelecionado.marca && (
                      <p className="text-xs text-gray-400">{alimentoSelecionado.marca}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {alimentoSelecionado.calorias_100g} kcal / 100g
                    </p>
                  </div>
                  <button
                    onClick={handleToggleFav}
                    className={`p-2 rounded-lg transition-all ${
                      favState ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-500'
                    }`}
                    aria-label={favState ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    {favState ? '⭐' : '☆'}
                  </button>
                </div>

                {/* Selector de porção */}
                <PortionSelector
                  alimento={alimentoSelecionado}
                  onChange={setPorcionData}
                />

                {/* Botão confirmar */}
                <button
                  onClick={handleConfirm}
                  className="w-full py-3.5 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white rounded-xl font-semibold text-base hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Adicionar {porcionData?.macros?.calorias || 0} kcal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
