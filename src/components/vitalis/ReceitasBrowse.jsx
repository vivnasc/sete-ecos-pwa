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

  // Gradientes suaves por tipo de refeição
  const tipoGradientes = {
    pequeno_almoco: 'from-amber-200 to-orange-300',
    almoco: 'from-emerald-200 to-green-300',
    jantar: 'from-indigo-200 to-purple-300',
    snack: 'from-rose-200 to-pink-300',
    sobremesa: 'from-fuchsia-200 to-purple-300'
  };

  // Emojis especiais por tags
  const getSpecialEmoji = (receita) => {
    if (receita.tags?.includes('jejum_friendly') || receita.tags?.includes('diuretico') || receita.tags?.includes('alta_proteina')) return '🥤';
    if (receita.tags?.includes('marisco')) return '🦐';
    if (receita.tags?.includes('picante')) return '🌶️';
    if (receita.tags?.includes('tropical')) return '🥭';
    return tipoEmojis[receita.tipo_refeicao] || '🍽️';
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
      const { data: planoData } = await supabase
        .from('vitalis_plano')
        .select('fase')
        .eq('user_id', userData.id)
        .single();
      
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

  // Mapear fase do plano para nome
  const getFaseNome = (fase) => {
    const fases = {
      1: 'inducao',
      2: 'transicao',
      3: 'manutencao'
    };
    return fases[fase] || 'manutencao';
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
      
      // Se user é vegetariano, excluir receitas com carne
      if (restricoes.includes('Vegetariana') && !receita.tags?.includes('vegetariano')) {
        // Verificar se não tem proteína animal (simplificado)
        const temCarneOuPeixe = receita.titulo?.toLowerCase().match(/frango|carne|porco|bife|peixe|salmão|atum|camarão|bacalhau|sardinha|peru/);
        if (temCarneOuPeixe) return false;
      }

      // Se user tem restrição sem glúten
      if (restricoes.includes('Sem glúten') && !receita.tags?.includes('sem_gluten')) {
        return false;
      }

      // Se user tem restrição sem lactose
      if (restricoes.includes('Sem lactose') && !receita.tags?.includes('sem_lactose')) {
        // Verificar se tem lactose (simplificado)
        const temLactose = receita.titulo?.toLowerCase().match(/queijo|leite|iogurte|natas|manteiga/);
        if (temLactose && !receita.tags?.includes('sem_lactose')) return false;
      }

      // Filtrar por fase do programa
      if (userPlano?.fase) {
        const faseActual = getFaseNome(userPlano.fase);
        if (!receita.fases_recomendadas?.includes(faseActual)) {
          return false;
        }
      }

      // Se abordagem é keto, priorizar receitas keto
      if (userIntake.abordagem_preferida === 'keto_if') {
        // Não excluir, mas em fase de indução só mostrar keto
        if (userPlano?.fase === 1 && !receita.tags?.includes('keto')) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p className="text-gray-600">A carregar receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate('/vitalis/dashboard')}
            className="text-orange-600 hover:text-orange-700 mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-orange-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Biblioteca de Receitas 🍽️
          </h1>
          <p className="text-gray-600">
            {receitasFiltradas.length} receitas disponíveis
          </p>
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
              <p className="text-xs text-purple-600">Mostra apenas receitas compatíveis com o teu perfil</p>
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
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
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
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {receitasFiltradas.map(receita => (
              <div
                key={receita.id}
                onClick={() => navigate(`/vitalis/receita/${receita.id}`)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                {/* Header colorido com emoji */}
                <div className={`relative h-32 bg-gradient-to-br ${tipoGradientes[receita.tipo_refeicao] || tipoGradientes.snack} flex items-center justify-center`}>
                  <span className="text-6xl drop-shadow-lg">{getSpecialEmoji(receita)}</span>
                  
                  {/* Botão Favoritar */}
                  <button
                    onClick={(e) => toggleFavorito(receita.id, e)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="text-xl">{receitasFavoritas.includes(receita.id) ? '❤️' : '🤍'}</span>
                  </button>

                  {/* Tipo badge */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium">
                    {tipoEmojis[receita.tipo_refeicao]} {receita.tipo_refeicao?.replace('_', ' ')}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                    {receita.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {receita.descricao}
                  </p>

                  {/* Info rápida */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>⏱️ {receita.tempo_preparo_min} min</span>
                    <span>•</span>
                    <span>🔥 {receita.calorias} kcal</span>
                    <span>•</span>
                    <span>💪 {receita.proteina_g}g</span>
                  </div>

                  {/* Tags preview */}
                  {receita.tags && receita.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {receita.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {receita.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{receita.tags.length - 3}</span>
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
