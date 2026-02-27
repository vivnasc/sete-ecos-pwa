import React, { useState, useEffect, useCallback } from 'react';
import { CONVERSOES_MAO, gramasParaPorcoes, porcoesParaGramas, calcularMacrosAlimento } from '../../lib/vitalis/porcoesConverter.js';

/**
 * PortionSelector — Selector de porções com toggle mão/gramas
 *
 * Props:
 * - alimento: { calorias_100g, proteina_100g, carboidratos_100g, gordura_100g, porcao_padrao_g, porcao_padrao_desc, porcao_mao_tipo, porcao_mao_g }
 * - onChange: (dados) => void — { quantidade_g, quantidade_porcao, tipo_porcao, macros }
 * - initialG: gramas iniciais (opcional)
 */
export default function PortionSelector({ alimento, onChange, initialG }) {
  const tipoMao = alimento?.porcao_mao_tipo || 'concha';
  const gPorPorcao = alimento?.porcao_mao_g || CONVERSOES_MAO[tipoMao]?.g || 100;
  const conv = CONVERSOES_MAO[tipoMao];

  const [modo, setModo] = useState('mao'); // 'mao' ou 'gramas'
  const [porcoes, setPorcoes] = useState(1);
  const [gramas, setGramas] = useState(initialG || alimento?.porcao_padrao_g || gPorPorcao);

  // Sincronizar quando alimento muda
  useEffect(() => {
    const g = initialG || alimento?.porcao_padrao_g || gPorPorcao;
    setGramas(g);
    setPorcoes(gramasParaPorcoes(g, tipoMao) || 1);
  }, [alimento?.id]);

  const notificarMudanca = useCallback((g, p) => {
    if (!onChange) return;
    const macros = calcularMacrosAlimento(alimento, g);
    onChange({
      quantidade_g: g,
      quantidade_porcao: p,
      tipo_porcao: tipoMao,
      macros
    });
  }, [alimento, tipoMao, onChange]);

  // Ao alterar porções
  const handlePorcoes = (valor) => {
    const p = Math.max(0.25, Math.min(10, valor));
    setPorcoes(p);
    const g = Math.round(p * gPorPorcao);
    setGramas(g);
    notificarMudanca(g, p);
  };

  // Ao alterar gramas
  const handleGramas = (valor) => {
    const g = Math.max(1, Math.min(2000, valor));
    setGramas(g);
    const p = gramasParaPorcoes(g, tipoMao);
    setPorcoes(p);
    notificarMudanca(g, p);
  };

  // Macros em tempo real
  const macros = calcularMacrosAlimento(alimento, gramas);

  // Presets rápidos
  const presets = [
    { label: '½', valor: 0.5 },
    { label: '1', valor: 1 },
    { label: '1½', valor: 1.5 },
    { label: '2', valor: 2 },
    { label: '3', valor: 3 },
  ];

  return (
    <div className="space-y-3">
      {/* Toggle Mão / Gramas */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setModo('mao')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            modo === 'mao'
              ? 'bg-white shadow text-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {conv?.emoji || '🤲'} Método da Mão
        </button>
        <button
          onClick={() => setModo('gramas')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            modo === 'gramas'
              ? 'bg-white shadow text-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚖️ Gramas
        </button>
      </div>

      {modo === 'mao' ? (
        <div className="space-y-2">
          {/* Presets rápidos */}
          <div className="flex items-center gap-2">
            {presets.map(p => (
              <button
                key={p.valor}
                onClick={() => handlePorcoes(p.valor)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  porcoes === p.valor
                    ? 'bg-[#7C8B6F]/20 border-2 border-[#7C8B6F] text-[#5A6B4D]'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="px-1">
            <input
              type="range"
              min="0.25"
              max="5"
              step="0.25"
              value={porcoes}
              onChange={(e) => handlePorcoes(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7C8B6F]"
            />
          </div>

          {/* Valor actual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{conv?.emoji || '🤲'}</span>
              <div>
                <span className="text-xl font-bold text-gray-800">{porcoes}</span>
                <span className="text-sm text-gray-500 ml-1">
                  {porcoes === 1 ? conv?.desc : conv?.descPlural}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              = {gramas}g
            </div>
          </div>

          {/* Dica */}
          {conv?.dica && (
            <p className="text-xs text-gray-400 italic">{conv.dica}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Input de gramas */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGramas(gramas - 10)}
              className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              −
            </button>
            <div className="flex-1 relative">
              <input
                type="number"
                value={gramas}
                onChange={(e) => handleGramas(parseInt(e.target.value) || 0)}
                className="w-full text-center text-2xl font-bold py-2 border-2 border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">g</span>
            </div>
            <button
              onClick={() => handleGramas(gramas + 10)}
              className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              +
            </button>
          </div>

          {/* Presets de gramas */}
          <div className="flex items-center gap-2">
            {[50, 100, 150, 200, 250].map(g => (
              <button
                key={g}
                onClick={() => handleGramas(g)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  gramas === g
                    ? 'bg-[#7C8B6F] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g}g
              </button>
            ))}
          </div>

          {/* Equivalente em mão */}
          {conv && (
            <p className="text-xs text-gray-400 text-center">
              {conv.emoji} ≈ {gramasParaPorcoes(gramas, tipoMao)} {porcoes === 1 ? conv.desc : conv.descPlural}
            </p>
          )}
        </div>
      )}

      {/* Porção padrão (se diferente) */}
      {alimento?.porcao_padrao_desc && (
        <button
          onClick={() => handleGramas(alimento.porcao_padrao_g || 100)}
          className="w-full text-xs text-center text-gray-500 hover:text-gray-700 py-1"
        >
          Porção padrão: {alimento.porcao_padrao_desc} ({alimento.porcao_padrao_g || 100}g)
        </button>
      )}

      {/* Macros calculados */}
      <div className="bg-gray-50 rounded-xl p-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-gray-800">{macros.calorias}</div>
            <div className="text-[10px] text-gray-500">kcal</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-600">{macros.proteina}g</div>
            <div className="text-[10px] text-gray-500">Proteína</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">{macros.carboidratos}g</div>
            <div className="text-[10px] text-gray-500">Hidratos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{macros.gordura}g</div>
            <div className="text-[10px] text-gray-500">Gordura</div>
          </div>
        </div>
      </div>
    </div>
  );
}
