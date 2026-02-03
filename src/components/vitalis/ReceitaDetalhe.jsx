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
  const [imageError, setImageError] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

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

  // Gerar URL de imagem automática se não tiver imagem
  const getAutoImageUrl = () => {
    if (!receita) return '';
    if (receita.imagem_url) return receita.imagem_url;
    // Usando Picsum com seed para consistência
    const seed = `vitalis-${receita.id}`;
    return `https://picsum.photos/seed/${seed}/600/400`;
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

  // Parsear modo de preparo em passos
  const parseSteps = (text) => {
    if (!text) return [];

    // Tentar diferentes formatos de separação
    // 1. Linhas numeradas (1. ou 1) ou 1-)
    // 2. Linhas separadas por \n
    // 3. Frases separadas por ponto final

    let steps = [];

    // Primeiro tentar por números
    const numberedRegex = /(?:^|\n)\s*(?:\d+[\.\)\-]\s*)/;
    if (numberedRegex.test(text)) {
      steps = text.split(/(?:^|\n)\s*\d+[\.\)\-]\s*/).filter(s => s.trim());
    }
    // Depois por linhas
    else if (text.includes('\n')) {
      steps = text.split('\n').filter(s => s.trim());
    }
    // Por último por frases (ponto seguido de maiúscula ou espaço)
    else {
      steps = text.split(/\.\s+(?=[A-Z])/).map(s => s.trim()).filter(s => s);
    }

    return steps.map(s => s.trim().replace(/^\d+[\.\)\-]\s*/, ''));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p className="text-gray-600">A carregar receita...</p>
        </div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-600 mb-4">Receita não encontrada</p>
          <button
            onClick={() => navigate('/vitalis/receitas')}
            className="px-6 py-2 bg-[#7C8B6F] text-white rounded-full"
          >
            Voltar às Receitas
          </button>
        </div>
      </div>
    );
  }

  const gradiente = tipoGradientes[receita.tipo_refeicao] || tipoGradientes.snack;
  const ingredientes = receita.ingredientes || [];
  const steps = parseSteps(receita.modo_preparo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2ED] via-[#E8E4DC] to-[#C5D1BC] pb-24">

      {/* Header com imagem */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        {/* Imagem - usa auto-gerada se não tiver */}
        {!imageError ? (
          <>
            <img
              src={getAutoImageUrl()}
              alt={receita.titulo}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Overlay para legibilidade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          </>
        ) : (
          /* Fallback se imagem falhar: gradiente com emoji */
          <div className={`w-full h-full bg-gradient-to-br ${gradiente}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl drop-shadow-2xl">{getMainEmoji()}</span>
            </div>
          </div>
        )}

        {/* Botão voltar com logo */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button
            onClick={() => navigate('/vitalis/receitas')}
            className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors shadow-lg"
          >
            <span className="text-lg">←</span>
          </button>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-7 h-7 object-contain"
            />
          </div>
        </div>

        {/* Botão favorito */}
        <button
          onClick={toggleFavorito}
          className="absolute top-4 right-4 w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-colors shadow-lg"
        >
          <span className="text-2xl">{isFavorita ? '❤️' : '🤍'}</span>
        </button>

        {/* Info no fundo da imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
              <span className="text-base">{tipoEmojis[receita.tipo_refeicao]}</span>
              <span className="capitalize text-gray-700">{receita.tipo_refeicao?.replace('_', ' ')}</span>
            </span>
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-md">
              {origemLabels[receita.origem] || '🌍 Internacional'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {receita.titulo}
          </h1>
        </div>
      </div>

      {/* Card principal */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          
          {/* Descrição */}
          <p className="text-gray-600 mb-4">{receita.descricao}</p>

          {/* Info rápida */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-1 bg-[#F5F2ED] px-3 py-1.5 rounded-full text-sm">
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
          <div className="bg-gradient-to-r from-[#E8E4DC] to-[#F5F2ED] rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Informação Nutricional</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7C8B6F]">{receita.calorias}</div>
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
                      <div className="font-semibold text-[#6B7A5D]">{receita.porcoes_hidratos} mão(s) concha</div>
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
                  <div className="w-6 h-6 bg-[#E8E4DC] rounded-full flex items-center justify-center text-[#7C8B6F] text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 capitalize">{item || 'Ingrediente'}</div>
                    {(quantidade || porcaoMao) && (
                      <div className="text-sm text-gray-500">
                        {quantidade}
                        {porcaoMao && <span className="text-[#7C8B6F]"> • {porcaoMao}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modo de preparo com passos */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#7C8B6F] rounded-full flex items-center justify-center text-white text-sm">👩‍🍳</span>
            Modo de Preparo
          </h3>

          {steps.length > 1 ? (
            /* Passos numerados interactivos */
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  onClick={() => setActiveStep(activeStep === index ? null : index)}
                  className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    activeStep === index
                      ? 'bg-[#7C8B6F]/10 border-2 border-[#7C8B6F]'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg transition-colors ${
                    activeStep === index
                      ? 'bg-[#7C8B6F] text-white'
                      : 'bg-[#E8E4DC] text-[#5A6B4E]'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`leading-relaxed ${activeStep === index ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>
                      {step}
                    </p>
                    {activeStep === index && (
                      <div className="mt-2 text-xs text-[#7C8B6F] font-medium">
                        ✓ Passo {index + 1} de {steps.length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Texto simples se não for possível dividir em passos */
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {receita.modo_preparo}
            </p>
          )}

          {/* Barra de progresso para os passos */}
          {steps.length > 1 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Progresso</span>
                <span>{activeStep !== null ? activeStep + 1 : 0} de {steps.length} passos</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7C8B6F] to-[#5A6B4E] rounded-full transition-all duration-300"
                  style={{ width: `${activeStep !== null ? ((activeStep + 1) / steps.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Botão voltar */}
        <button
          onClick={() => navigate('/vitalis/receitas')}
          className="w-full mt-6 py-4 bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-2xl font-semibold shadow-lg"
        >
          ← Voltar às Receitas
        </button>
      </div>
    </div>
  );
};

export default ReceitaDetalhe;
