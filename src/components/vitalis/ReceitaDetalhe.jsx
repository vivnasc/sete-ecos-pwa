import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate, useParams } from 'react-router-dom';

const ReceitaDetalhe = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorita, setIsFavorita] = useState(false);
  const [userId, setUserId] = useState(null);

  // Emojis por tipo de refeição
  const tipoEmojis = {
    pequeno_almoco: '🍳',
    almoco: '🍽️',
    jantar: '🌙',
    snack: '🥜',
    sobremesa: '🍰'
  };

  // Emojis por tags
  const tagEmojis = {
    keto: '🥑',
    proteico: '💪',
    vegetariano: '🥬',
    marisco: '🦐',
    picante: '🌶️',
    tropical: '🥭',
    omega3: '🐟',
    jejum_friendly: '⏰',
    diuretico: '💧',
    alta_proteina: '🏋️',
    rapido: '⚡',
    economico: '💰',
    tradicional: '👵',
    sem_gluten: '🌾',
    sem_lactose: '🥛',
    pos_treino: '🏃',
    detox: '🍃',
    cremoso: '🍦',
    calmante: '😌',
    energetico: '⚡'
  };

  // Gradientes suaves por tipo de refeição (mais intuitivo)
  const tipoGradientes = {
    pequeno_almoco: 'from-amber-200 to-orange-300',
    almoco: 'from-emerald-200 to-green-300',
    jantar: 'from-indigo-200 to-purple-300',
    snack: 'from-rose-200 to-pink-300',
    sobremesa: 'from-fuchsia-200 to-purple-300'
  };

  // Labels bonitos para origens
  const origemLabels = {
    mocambicana: '🇲🇿 Moçambicana',
    zambeziana: '🇲🇿 Zambeziana',
    indiana: '🇮🇳 Indiana',
    portuguesa: '🇵🇹 Portuguesa',
    mediterranica: '🌊 Mediterrânica',
    asiatica: '🌏 Asiática',
    internacional: '🌍 Internacional'
  };

  useEffect(() => {
    loadReceita();
  }, [id]);

  const loadReceita = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      
      setUserId(userData.id);

      // Carregar receita
      const { data: receitaData, error } = await supabase
        .from('vitalis_receitas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setReceita(receitaData);

      // Verificar se é favorita
      const { data: favData } = await supabase
        .from('vitalis_receitas_favoritas')
        .select('id')
        .eq('user_id', userData.id)
        .eq('receita_id', id)
        .single();

      setIsFavorita(!!favData);

    } catch (error) {
      console.error('Erro ao carregar receita:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async () => {
    try {
      if (isFavorita) {
        await supabase
          .from('vitalis_receitas_favoritas')
          .delete()
          .eq('user_id', userId)
          .eq('receita_id', id);
      } else {
        await supabase
          .from('vitalis_receitas_favoritas')
          .insert([{ user_id: userId, receita_id: id }]);
      }
      setIsFavorita(!isFavorita);
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  // Determinar emoji principal
  const getMainEmoji = () => {
    if (!receita) return '🍽️';
    
    // Verificar tags especiais primeiro
    if (receita.tags?.includes('jejum_friendly') || receita.tags?.includes('diuretico')) return '🥤';
    if (receita.tags?.includes('alta_proteina')) return '🥤';
    if (receita.tags?.includes('marisco')) return '🦐';
    if (receita.tags?.includes('picante')) return '🌶️';
    
    return tipoEmojis[receita.tipo_refeicao] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p className="text-gray-600">A carregar receita...</p>
        </div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-600 mb-4">Receita não encontrada</p>
          <button
            onClick={() => navigate('/vitalis/receitas')}
            className="px-6 py-2 bg-orange-500 text-white rounded-full"
          >
            Voltar às Receitas
          </button>
        </div>
      </div>
    );
  }

  const gradiente = tipoGradientes[receita.tipo_refeicao] || tipoGradientes.snack;
  const ingredientes = receita.ingredientes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-24">
      
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-br ${gradiente} pt-12 pb-20 px-4 relative`}>
        {/* Botão voltar */}
        <button
          onClick={() => navigate('/vitalis/receitas')}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
        >
          ←
        </button>

        {/* Botão favorito */}
        <button
          onClick={toggleFavorito}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <span className="text-2xl">{isFavorita ? '❤️' : '🤍'}</span>
        </button>

        {/* Emoji central e título */}
        <div className="text-center pt-4">
          <div className="text-6xl mb-3 drop-shadow-lg">{getMainEmoji()}</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2 px-4">{receita.titulo}</h1>
          <div className="inline-block bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-gray-700 text-xs font-medium">
            {origemLabels[receita.origem] || '🌍 Internacional'}
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          
          {/* Descrição */}
          <p className="text-gray-600 mb-4">{receita.descricao}</p>

          {/* Info rápida */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full text-sm">
              <span>⏱️</span>
              <span className="font-medium">{receita.tempo_preparo_min} min</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full text-sm">
              <span>👤</span>
              <span className="font-medium">{receita.porcoes || 1} porção</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full text-sm">
              <span>📊</span>
              <span className="font-medium capitalize">{receita.dificuldade}</span>
            </div>
          </div>

          {/* Macros */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Informação Nutricional</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{receita.calorias}</div>
                <div className="text-xs text-gray-500">kcal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{receita.proteina_g}g</div>
                <div className="text-xs text-gray-500">Proteína</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{receita.carboidratos_g}g</div>
                <div className="text-xs text-gray-500">Hidratos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{receita.gordura_g}g</div>
                <div className="text-xs text-gray-500">Gordura</div>
              </div>
            </div>
          </div>

          {/* Porções com mãos */}
          {(receita.porcoes_proteina > 0 || receita.porcoes_legumes > 0 || receita.porcoes_hidratos > 0 || receita.porcoes_gordura > 0) && (
            <div className="bg-purple-50 rounded-2xl p-4 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Porções com Mãos 🖐️</h3>
              <div className="grid grid-cols-2 gap-3">
                {receita.porcoes_proteina > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🫲</span>
                    <div>
                      <div className="font-semibold text-purple-700">{receita.porcoes_proteina} palma(s)</div>
                      <div className="text-xs text-gray-500">Proteína</div>
                    </div>
                  </div>
                )}
                {receita.porcoes_legumes > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✊</span>
                    <div>
                      <div className="font-semibold text-green-700">{receita.porcoes_legumes} punho(s)</div>
                      <div className="text-xs text-gray-500">Legumes</div>
                    </div>
                  </div>
                )}
                {receita.porcoes_hidratos > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🤲</span>
                    <div>
                      <div className="font-semibold text-amber-700">{receita.porcoes_hidratos} mão(s) concha</div>
                      <div className="text-xs text-gray-500">Hidratos</div>
                    </div>
                  </div>
                )}
                {receita.porcoes_gordura > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👍</span>
                    <div>
                      <div className="font-semibold text-blue-700">{receita.porcoes_gordura} polegar(es)</div>
                      <div className="text-xs text-gray-500">Gordura</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {receita.tags && receita.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {receita.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tagEmojis[tag] && <span>{tagEmojis[tag]}</span>}
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fases recomendadas */}
          {receita.fases_recomendadas && receita.fases_recomendadas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Fases do Programa</h3>
              <div className="flex flex-wrap gap-2">
                {receita.fases_recomendadas.map(fase => (
                  <span
                    key={fase}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      fase === 'inducao' ? 'bg-purple-100 text-purple-700' :
                      fase === 'transicao' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}
                  >
                    {fase === 'inducao' ? '🔥 Indução' :
                     fase === 'transicao' ? '🔄 Transição' :
                     '✨ Manutenção'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ingredientes */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🥗 Ingredientes</h3>
          <div className="space-y-3">
            {ingredientes.map((ing, index) => {
              // Lidar com diferentes formatos de ingredientes
              let item = '';
              let quantidade = '';
              let porcaoMao = '';
              
              if (typeof ing === 'object') {
                // Formato novo: {item, quantidade, porcao_mao}
                // Formato antigo: {nome, quantidade, unidade}
                item = ing.item || ing.nome || ing.ingrediente || '';
                
                // Quantidade - formato antigo tem número + unidade separados
                if (ing.unidade) {
                  quantidade = `${ing.quantidade} ${ing.unidade}`;
                } else {
                  quantidade = ing.quantidade || ing.qtd || '';
                }
                
                porcaoMao = ing.porcao_mao || ing.porcaoMao || '';
              } else if (typeof ing === 'string') {
                item = ing;
              }
              
              return (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 capitalize">{item || 'Ingrediente'}</div>
                    {(quantidade || porcaoMao) && (
                      <div className="text-sm text-gray-500">
                        {quantidade}
                        {porcaoMao && <span className="text-orange-600"> • {porcaoMao}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modo de preparo */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">👩‍🍳 Modo de Preparo</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {receita.modo_preparo}
          </p>
        </div>

        {/* Botão voltar */}
        <button
          onClick={() => navigate('/vitalis/receitas')}
          className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-semibold shadow-lg"
        >
          ← Voltar às Receitas
        </button>
      </div>
    </div>
  );
};

export default ReceitaDetalhe;
