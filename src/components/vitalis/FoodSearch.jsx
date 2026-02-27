import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pesquisarAlimentos, obterRecentes, obterFavoritos } from '../../lib/vitalis/alimentosSearch.js';
import { CATEGORIAS_ALIMENTOS } from '../../lib/vitalis/alimentosDb.js';

/**
 * FoodSearch — Pesquisa de alimentos com autocomplete + tabs (Recentes/Favoritos/Categorias)
 *
 * Props:
 * - onSelect: (alimento) => void
 * - onScanRequest: () => void — abre o barcode scanner
 * - placeholder: string
 */
export default function FoodSearch({ onSelect, onScanRequest, placeholder }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState({ locais: [], api: [] });
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState('recentes'); // recentes, favoritos, categorias
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [categoryResults, setCategoryResults] = useState(null); // resultados de categoria selecionada
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Dados iniciais
  const [recentes, setRecentes] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    setRecentes(obterRecentes(15));
    setFavoritos(obterFavoritos());
    // Focus no input ao montar
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Pesquisa com debounce
  const pesquisar = useCallback(async (texto) => {
    if (!texto || texto.length < 2) {
      setResultados({ locais: [], api: [] });
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const res = await pesquisarAlimentos(texto, {
        categoria: categoriaFiltro,
        limite: 20
      });
      setResultados(res);
    } catch (e) {
      console.warn('Erro pesquisa:', e);
    } finally {
      setSearching(false);
    }
  }, [categoriaFiltro]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => pesquisar(query), 300);
    } else {
      setResultados({ locais: [], api: [] });
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, pesquisar]);

  const handleSelect = (alimento) => {
    onSelect(alimento);
  };

  const temPesquisa = query.length >= 2;
  const totalResultados = resultados.locais.length + resultados.api.length;
  const mostrandoCategoria = !temPesquisa && categoryResults && categoryResults.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || 'Pesquisar alimento...'}
            className="w-full pl-10 pr-20 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-[#7C8B6F] focus:bg-white focus:outline-none text-gray-800 placeholder-gray-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            {onScanRequest && (
              <button
                onClick={onScanRequest}
                className="p-1.5 text-gray-500 hover:text-[#7C8B6F] bg-gray-200 rounded-lg"
                title="Ler código de barras"
              >
                📷
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados da pesquisa */}
      {temPesquisa ? (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {searching && totalResultados === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-pulse text-2xl mb-2">🔍</div>
              <p className="text-sm">A pesquisar...</p>
            </div>
          )}

          {!searching && totalResultados === 0 && query.length >= 2 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🤷</div>
              <p className="text-sm">Nenhum resultado para "{query}"</p>
              <p className="text-xs mt-1">Tenta outro termo ou lê o código de barras</p>
            </div>
          )}

          {/* Resultados locais */}
          {resultados.locais.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 font-medium mb-2 px-1">
                Base Vitalis ({resultados.locais.length})
              </p>
              <div className="space-y-1">
                {resultados.locais.map(alimento => (
                  <FoodItem key={alimento.id} alimento={alimento} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          )}

          {/* Resultados API */}
          {resultados.api.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2 px-1">
                Open Food Facts ({resultados.api.length})
              </p>
              <div className="space-y-1">
                {resultados.api.map(alimento => (
                  <FoodItem key={alimento.id} alimento={alimento} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : mostrandoCategoria ? (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium px-1">
              {CATEGORIAS_ALIMENTOS[categoriaFiltro]?.emoji} {CATEGORIAS_ALIMENTOS[categoriaFiltro]?.label} ({categoryResults.length})
            </p>
            <button
              onClick={() => { setCategoryResults(null); setCategoriaFiltro(null); }}
              className="text-xs text-[#7C8B6F] font-medium px-2 py-1 hover:bg-[#7C8B6F]/10 rounded-lg"
            >
              ← Voltar
            </button>
          </div>
          <div className="space-y-1">
            {categoryResults.map(alimento => (
              <FoodItem key={alimento.id} alimento={alimento} onSelect={handleSelect} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Tabs: Recentes / Favoritos / Categorias */}
          <div className="flex items-center gap-1 px-4 mb-2">
            {[
              { key: 'recentes', label: 'Recentes', icon: '🕐' },
              { key: 'favoritos', label: 'Favoritos', icon: '⭐' },
              { key: 'categorias', label: 'Categorias', icon: '📂' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  tab === t.key
                    ? 'bg-[#7C8B6F] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {tab === 'recentes' && (
              recentes.length > 0 ? (
                <div className="space-y-1">
                  {recentes.map((alimento, i) => (
                    <FoodItem key={`rec-${alimento.id}-${i}`} alimento={alimento} onSelect={handleSelect} compact />
                  ))}
                </div>
              ) : (
                <EmptyState emoji="🕐" texto="Os alimentos que registares vão aparecer aqui" />
              )
            )}

            {tab === 'favoritos' && (
              favoritos.length > 0 ? (
                <div className="space-y-1">
                  {favoritos.map((alimento, i) => (
                    <FoodItem key={`fav-${alimento.id}-${i}`} alimento={alimento} onSelect={handleSelect} compact />
                  ))}
                </div>
              ) : (
                <EmptyState emoji="⭐" texto="Marca alimentos como favorito para acesso rápido" />
              )
            )}

            {tab === 'categorias' && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORIAS_ALIMENTOS).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCategoriaFiltro(key);
                      // Pesquisar todos os alimentos desta categoria
                      pesquisarAlimentos('', { categoria: key, limite: 50, incluirApi: false }).then(res => {
                        setCategoryResults(res.locais);
                      });
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      categoriaFiltro === key
                        ? `border-${cat.cor}-400 bg-${cat.cor}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Item de alimento na lista
 */
function FoodItem({ alimento, onSelect, compact }) {
  const cat = CATEGORIAS_ALIMENTOS[alimento.categoria];

  return (
    <button
      onClick={() => onSelect(alimento)}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#7C8B6F]/30 hover:bg-[#7C8B6F]/5 transition-all active:scale-[0.98] text-left"
    >
      <span className="text-xl flex-shrink-0">{alimento.icon || cat?.emoji || '🍽️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{alimento.nome}</p>
        {!compact && alimento.marca && (
          <p className="text-xs text-gray-400 truncate">{alimento.marca}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-700">{alimento.calorias_100g || 0}</p>
        <p className="text-[10px] text-gray-400">kcal/100g</p>
      </div>
      {!compact && (
        <div className="flex-shrink-0 text-[10px] text-gray-400 text-right leading-tight">
          <span className="text-rose-500 font-medium">{alimento.proteina_100g || 0}P</span>
          {' '}
          <span className="text-amber-500 font-medium">{alimento.carboidratos_100g || 0}C</span>
          {' '}
          <span className="text-purple-500 font-medium">{alimento.gordura_100g || 0}G</span>
        </div>
      )}
    </button>
  );
}

function EmptyState({ emoji, texto }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-sm">{texto}</p>
    </div>
  );
}
