import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export const ReceitasBrowse = () => {
  const navigate = useNavigate();
  const [receitas, setReceitas] = useState([]);
  const [receitasFavoritas, setReceitasFavoritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userIntake, setUserIntake] = useState(null);
  const [userPlano, setUserPlano] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroTags, setFiltroTags] = useState([]);
  const [filtroOrigem, setFiltroOrigem] = useState('todas');
  const [busca, setBusca] = useState('');
  const [mostrarApenasFavoritas, setMostrarApenasFavoritas] = useState(false);
  const [filtroAutoActivo, setFiltroAutoActivo] = useState(true);

  // Emojis por tipo de refeição
  const tipoEmojis = {
    pequeno_almoco: '🍳',
    almoco: '🍽️',
    jantar: '🌙',
    snack: '🥜',
    sobremesa: '🍰'
  };

  // Gradientes premium por tipo de refeição
  const tipoGradientes = {
    pequeno_almoco: 'from-amber-400/90 via-orange-300/80 to-yellow-200/70',
    almoco: 'from-emerald-500/90 via-green-400/80 to-lime-200/70',
    jantar: 'from-indigo-500/90 via-purple-400/80 to-pink-200/70',
    snack: 'from-rose-400/90 via-pink-300/80 to-red-200/70',
    sobremesa: 'from-fuchsia-500/90 via-purple-400/80 to-pink-200/70'
  };

  // Emojis especiais por tags
  const getSpecialEmoji = (receita) => {
    if (receita.tags?.includes('jejum_friendly') || receita.tags?.includes('diuretico') || receita.tags?.includes('alta_proteina')) return '🥤';
    if (receita.tags?.includes('marisco')) return '🦐';
    if (receita.tags?.includes('picante')) return '🌶️';
    if (receita.tags?.includes('tropical')) return '🥭';
    return tipoEmojis[receita.tipo_refeicao] || '🍽️';
  };

  // Handle image error - fallback to emoji
  const handleImageError = (receitaId) => {
    setImageErrors(prev => ({ ...prev, [receitaId]: true }));
  };

  useEffect(() => {
    loadReceitas();
  }, []);

  const loadReceitas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      
      setUserId(userData.id);

      // Carregar intake do user (para filtro automático)
      const { data: intakeData } = await supabase
        .from('vitalis_intake')
        .select('restricoes_alimentares, tipos_comida, abordagem_preferida')
        .eq('user_id', userData.id)
        .single();
      
      setUserIntake(intakeData);

      // Carregar plano do user (para fase actual)
      let planoData = null;
      const { data: planoView } = await supabase
        .from('vitalis_plano')
        .select('fase')
        .eq('user_id', userData.id)
        .maybeSingle();
      planoData = planoView;

      // Fallback: vitalis_meal_plans
      if (!planoData) {
        const { data: mealPlan } = await supabase
          .from('vitalis_meal_plans').select('fase')
          .eq('user_id', userData.id).eq('status', 'activo')
          .order('created_at', { ascending: false }).limit(1).maybeSingle();
        planoData = mealPlan;
      }
      setUserPlano(planoData);

      // Carregar receitas ativas
      const { data: receitasData } = await supabase
        .from('vitalis_receitas')
        .select('*')
        .eq('ativo', true)
        .order('favoritos_count', { ascending: false });

      setReceitas(receitasData || []);

      // Carregar favoritas do user
      const { data: favoritasData } = await supabase
        .from('vitalis_receitas_favoritas')
        .select('receita_id')
        .eq('user_id', userData.id);

      setReceitasFavoritas(favoritasData?.map(f => f.receita_id) || []);

    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (receitaId, e) => {
    e.stopPropagation(); // Evitar navegação ao clicar no coração
    try {
      const isFavorita = receitasFavoritas.includes(receitaId);

      if (isFavorita) {
        await supabase
          .from('vitalis_receitas_favoritas')
          .delete()
          .eq('user_id', userId)
          .eq('receita_id', receitaId);

        setReceitasFavoritas(receitasFavoritas.filter(id => id !== receitaId));
      } else {
        await supabase
          .from('vitalis_receitas_favoritas')
          .insert([{ user_id: userId, receita_id: receitaId }]);

        setReceitasFavoritas([...receitasFavoritas, receitaId]);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  // Mapear fase do plano para nome (suporta número ou string)
  const getFaseNome = (fase) => {
    if (typeof fase === 'string') return fase;
    const fases = {
      1: 'inducao',
      2: 'transicao',
      3: 'recomposicao',
      4: 'manutencao'
    };
    return fases[fase] || null;
  };

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(receita => {
    // Filtro de favoritas
    if (mostrarApenasFavoritas && !receitasFavoritas.includes(receita.id)) {
      return false;
    }

    // FILTRO AUTOMÁTICO baseado no intake
    if (filtroAutoActivo && userIntake) {
      // Verificar restrições alimentares
      const restricoes = userIntake.restricoes_alimentares || [];

      // Se user é vegetariano, excluir receitas com carne/peixe (que não têm tag vegetariano)
      if (restricoes.includes('Vegetariana') && !receita.tags?.includes('vegetariano')) {
        return false;
      }

      // Se user tem restrição sem glúten, só excluir se receita tem tag explícita 'com_gluten'
      // Receitas sem tag de glúten são consideradas compatíveis por defeito
      if (restricoes.includes('Sem glúten') && receita.tags?.includes('com_gluten')) {
        return false;
      }

      // Se user tem restrição sem lactose, só excluir se receita tem tag explícita 'com_lactose'
      if (restricoes.includes('Sem lactose') && receita.tags?.includes('com_lactose')) {
        return false;
      }

      // Filtrar por fase do programa — só se a receita tem fases definidas
      if (userPlano?.fase) {
        const faseActual = getFaseNome(userPlano.fase);
        // Só filtrar se a receita tem fases_recomendadas preenchidas E a fase actual existe
        if (faseActual && receita.fases_recomendadas && receita.fases_recomendadas.length > 0) {
          if (!receita.fases_recomendadas.includes(faseActual)) {
            return false;
          }
        }
        // Se receita não tem fases_recomendadas, é considerada universal (mostrar sempre)
      }

      // Se abordagem é keto, priorizar receitas keto
      if (userIntake.abordagem_preferida === 'keto_if') {
        const faseActual = getFaseNome(userPlano?.fase);
        // Em fase de indução, só mostrar keto
        if (faseActual === 'inducao' && !receita.tags?.includes('keto')) {
          return false;
        }
      }
    }

    // Filtro de tipo
    if (filtroTipo !== 'todos' && receita.tipo_refeicao !== filtroTipo) {
      return false;
    }

    // Filtro de origem
    if (filtroOrigem !== 'todas' && receita.origem !== filtroOrigem) {
      return false;
    }

    // Filtro de tags
    if (filtroTags.length > 0 && receita.tags) {
      const hasAnyTag = filtroTags.some(tag => receita.tags.includes(tag));
      if (!hasAnyTag) return false;
    }

    // Busca por texto
    if (busca) {
      const buscaLower = busca.toLowerCase();
      return (
        receita.titulo?.toLowerCase().includes(buscaLower) ||
        receita.descricao?.toLowerCase().includes(buscaLower)
      );
    }

    return true;
  });

  const tagsDisponiveis = [
    { value: 'keto', label: 'Keto', emoji: '🥑' },
    { value: 'proteico', label: 'Proteico', emoji: '💪' },
    { value: 'rapido', label: 'Rápido', emoji: '⚡' },
    { value: 'vegetariano', label: 'Vegetariano', emoji: '🥬' },
    { value: 'sem_gluten', label: 'Sem Glúten', emoji: '🌾' },
    { value: 'jejum_friendly', label: 'Para Jejum', emoji: '⏰' },
    { value: 'diuretico', label: 'Diurético', emoji: '💧' },
    { value: 'alta_proteina', label: 'Batido Proteico', emoji: '🥤' },
    { value: 'economico', label: 'Económico', emoji: '💰' }
  ];

  const origensDisponiveis = [
    { value: 'todas', label: 'Todas', emoji: '🌍' },
    { value: 'mocambicana', label: 'Moçambicana', emoji: '🇲🇿' },
    { value: 'zambeziana', label: 'Zambeziana', emoji: '🇲🇿' },
    { value: 'indiana', label: 'Indiana', emoji: '🇮🇳' },
    { value: 'portuguesa', label: 'Portuguesa', emoji: '🇵🇹' },
    { value: 'mediterranica', label: 'Mediterrânica', emoji: '🌊' },
    { value: 'asiatica', label: 'Asiática', emoji: '🌏' },
    { value: 'internacional', label: 'Internacional', emoji: '🌎' }
  ];

  const toggleTag = (tag) => {
    if (filtroTags.includes(tag)) {
      setFiltroTags(filtroTags.filter(t => t !== tag));
    } else {
      setFiltroTags([...filtroTags, tag]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p className="text-gray-600">A carregar receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2ED] via-[#E8E4DC] to-[#C5D1BC] pb-24">
      {/* Header Premium */}
      <div className="relative overflow-hidden">
        {/* Background com gradiente e padrão */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C8B6F] via-[#6B7A5D] to-[#5A6B4E]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/vitalis/dashboard')}
            className="text-white/80 hover:text-white mb-6 flex items-center gap-2 font-medium transition-colors"
          >
            <span className="text-lg">←</span> Voltar ao Dashboard
          </button>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt="Vitalis"
                className="w-14 h-14 object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Biblioteca de Receitas
              </h1>
              <p className="text-white/90 text-lg">
                <span className="font-semibold">{receitasFiltradas.length}</span> receitas deliciosas para ti
              </p>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-white/70 text-sm">Favoritas</span>
              <span className="text-white font-bold ml-2">{receitasFavoritas.length}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-white/70 text-sm">Filtro activo</span>
              <span className="text-white font-bold ml-2">{filtroAutoActivo ? '✓' : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          
          {/* Busca */}
          <div className="mb-5">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="🔍 Procurar receita..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Toggle filtro automático */}
          <div className="flex items-center justify-between mb-5 p-3 bg-purple-50 rounded-xl">
            <div>
              <p className="font-semibold text-purple-900">🎯 Filtro Personalizado</p>
              <p className="text-xs text-purple-600">
                {filtroAutoActivo
                  ? `A mostrar ${receitasFiltradas.length} de ${receitas.length} receitas para o teu perfil`
                  : 'Mostra apenas receitas compatíveis com o teu perfil'
                }
              </p>
            </div>
            <button
              onClick={() => setFiltroAutoActivo(!filtroAutoActivo)}
              className={`w-14 h-8 rounded-full transition-colors ${filtroAutoActivo ? 'bg-purple-500' : 'bg-gray-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${filtroAutoActivo ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Favoritas */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setMostrarApenasFavoritas(!mostrarApenasFavoritas)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                mostrarApenasFavoritas
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ❤️ Favoritas
            </button>
          </div>

          {/* Tipo de Refeição */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Tipo:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todos', label: 'Todas', emoji: '🍴' },
                { value: 'pequeno_almoco', label: 'P. Almoço', emoji: '🍳' },
                { value: 'almoco', label: 'Almoço', emoji: '🍽️' },
                { value: 'jantar', label: 'Jantar', emoji: '🌙' },
                { value: 'snack', label: 'Snack/Bebida', emoji: '🥤' }
              ].map(tipo => (
                <button
                  key={tipo.value}
                  onClick={() => setFiltroTipo(tipo.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filtroTipo === tipo.value
                      ? 'bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tipo.emoji} {tipo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Origem */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Origem:</p>
            <div className="flex flex-wrap gap-2">
              {origensDisponiveis.map(origem => (
                <button
                  key={origem.value}
                  onClick={() => setFiltroOrigem(origem.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filtroOrigem === origem.value
                      ? 'bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {origem.emoji} {origem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Filtrar por:</p>
            <div className="flex flex-wrap gap-2">
              {tagsDisponiveis.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filtroTags.includes(tag.value)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Receitas */}
        {receitasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🤷‍♀️</p>
            <p className="text-gray-600 mb-4">Nenhuma receita encontrada com estes filtros.</p>
            <button
              onClick={() => {
                setFiltroTipo('todos');
                setFiltroTags([]);
                setFiltroOrigem('todas');
                setBusca('');
                setMostrarApenasFavoritas(false);
              }}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receitasFiltradas.map(receita => (
              <div
                key={receita.id}
                onClick={() => navigate(`/vitalis/receita/${receita.id}`)}
                className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1"
              >
                {/* Header com imagem ou gradiente */}
                <div className={`relative h-44 overflow-hidden`}>
                  {/* Imagem de fundo se existir na base de dados */}
                  {receita.imagem_url && !imageErrors[receita.id] ? (
                    <>
                      <img
                        src={receita.imagem_url}
                        alt={receita.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(receita.id)}
                      />
                      {/* Overlay gradiente para legibilidade */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </>
                  ) : (
                    /* Gradiente bonito com emoji representativo */
                    <div className={`w-full h-full bg-gradient-to-br ${tipoGradientes[receita.tipo_refeicao] || tipoGradientes.snack} flex items-center justify-center`}>
                      <span className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{getSpecialEmoji(receita)}</span>
                    </div>
                  )}

                  {/* Botão Favoritar */}
                  <button
                    onClick={(e) => toggleFavorito(receita.id, e)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 hover:bg-white/40 transition-all shadow-lg"
                  >
                    <span className="text-xl drop-shadow">{receitasFavoritas.includes(receita.id) ? '❤️' : '🤍'}</span>
                  </button>

                  {/* Badge de tempo */}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <span>⏱️</span> {receita.tempo_preparo_min} min
                  </div>

                  {/* Tipo badge no fundo */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                    <span className="text-base">{tipoEmojis[receita.tipo_refeicao]}</span>
                    <span className="capitalize text-gray-700">{receita.tipo_refeicao?.replace('_', ' ')}</span>
                  </div>

                  {/* Origem badge */}
                  {receita.origem && receita.origem !== 'internacional' && (
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-md">
                      {receita.origem === 'mocambicana' ? '🇲🇿' :
                       receita.origem === 'portuguesa' ? '🇵🇹' :
                       receita.origem === 'indiana' ? '🇮🇳' : '🌍'}
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#7C8B6F] transition-colors">
                    {receita.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {receita.descricao}
                  </p>

                  {/* Macros em pills */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      <span>🔥</span> {receita.calorias} kcal
                    </div>
                    <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      <span>💪</span> {receita.proteina_g}g
                    </div>
                    {receita.carboidratos_g && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <span>🍚</span> {receita.carboidratos_g}g
                      </div>
                    )}
                  </div>

                  {/* Tags preview com estilo melhorado */}
                  {receita.tags && receita.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {receita.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-[#E8E4DC] text-[#5A6B4E] px-2.5 py-1 rounded-full font-medium"
                        >
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {receita.tags.length > 3 && (
                        <span className="text-xs text-gray-400 px-1">+{receita.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceitasBrowse;
