import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export const ReceitasBrowse = () => {
  const [receitas, setReceitas] = useState([]);
  const [receitasFavoritas, setReceitasFavoritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroTags, setFiltroTags] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    loadReceitas();
  }, []);

  const loadReceitas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);

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
        .eq('user_id', user.id);

      setReceitasFavoritas(favoritasData?.map(f => f.receita_id) || []);

    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (receitaId) => {
    try {
      const isFavorita = receitasFavoritas.includes(receitaId);

      if (isFavorita) {
        // Remover
        await supabase
          .from('vitalis_receitas_favoritas')
          .delete()
          .eq('user_id', userId)
          .eq('receita_id', receitaId);

        setReceitasFavoritas(receitasFavoritas.filter(id => id !== receitaId));
      } else {
        // Adicionar
        await supabase
          .from('vitalis_receitas_favoritas')
          .insert([{
            user_id: userId,
            receita_id: receitaId
          }]);

        setReceitasFavoritas([...receitasFavoritas, receitaId]);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(receita => {
    // Filtro de tipo
    if (filtroTipo !== 'todos' && receita.tipo_refeicao !== filtroTipo) {
      return false;
    }

    // Filtro de tags
    if (filtroTags.length > 0) {
      const hasAllTags = filtroTags.every(tag => receita.tags?.includes(tag));
      if (!hasAllTags) return false;
    }

    // Busca por texto
    if (busca) {
      const buscaLower = busca.toLowerCase();
      return (
        receita.titulo.toLowerCase().includes(buscaLower) ||
        receita.descricao?.toLowerCase().includes(buscaLower)
      );
    }

    return true;
  });

  const tagsDisponiveis = [
    { value: 'proteico', label: 'Proteico', emoji: '🥩' },
    { value: 'rapido', label: 'Rápido', emoji: '⚡' },
    { value: 'vegetariano', label: 'Vegetariano', emoji: '🥬' },
    { value: 'sem_gluten', label: 'Sem Glúten', emoji: '🌾' },
    { value: 'keto', label: 'Keto', emoji: '🥑' },
    { value: 'mocambicano', label: 'Moçambicano', emoji: '🇲🇿' },
    { value: 'economico', label: 'Económico', emoji: '💰' }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-gray-600">A carregar receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-orange-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Biblioteca de Receitas 🍽️
          </h1>
          <p className="text-gray-600">
            {receitasFiltradas.length} receitas disponíveis
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Busca */}
          <div className="mb-6">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="🔍 Procurar receita..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Tipo de Refeição */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Tipo de Refeição:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todos', label: 'Todas', emoji: '🍴' },
                { value: 'pequeno_almoco', label: 'Pequeno-Almoço', emoji: '🌅' },
                { value: 'almoco', label: 'Almoço', emoji: '☀️' },
                { value: 'jantar', label: 'Jantar', emoji: '🌙' },
                { value: 'snack', label: 'Snack', emoji: '🥜' }
              ].map(tipo => (
                <button
                  key={tipo.value}
                  onClick={() => setFiltroTipo(tipo.value)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
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

          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Filtrar por:</p>
            <div className="flex flex-wrap gap-2">
              {tagsDisponiveis.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
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
            <p className="text-2xl mb-2">🤷‍♀️</p>
            <p className="text-gray-600">Nenhuma receita encontrada com estes filtros.</p>
            <button
              onClick={() => {
                setFiltroTipo('todos');
                setFiltroTags([]);
                setBusca('');
              }}
              className="mt-4 text-orange-600 hover:text-orange-700 font-semibold"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receitasFiltradas.map(receita => (
              <ReceitaCard
                key={receita.id}
                receita={receita}
                isFavorita={receitasFavoritas.includes(receita.id)}
                onToggleFavorito={() => toggleFavorito(receita.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Card de Receita
const ReceitaCard = ({ receita, isFavorita, onToggleFavorito }) => {
  const tipoEmojis = {
    pequeno_almoco: '🌅',
    almoco: '☀️',
    jantar: '🌙',
    snack: '🥜',
    sobremesa: '🍰'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Imagem */}
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100">
        {receita.foto_url ? (
          <img
            src={receita.foto_url}
            alt={receita.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
        
        {/* Botão Favoritar */}
        <button
          onClick={onToggleFavorito}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <span className="text-2xl">{isFavorita ? '❤️' : '🤍'}</span>
        </button>

        {/* Tipo */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
          {tipoEmojis[receita.tipo_refeicao]} {receita.tipo_refeicao.replace('_', ' ')}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {receita.titulo}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {receita.descricao}
        </p>

        {/* Macros */}
        <div className="flex gap-3 mb-4 text-xs">
          <div className="bg-orange-50 px-3 py-1 rounded-full">
            <span className="font-semibold">🔥 {receita.calorias}</span> kcal
          </div>
          <div className="bg-red-50 px-3 py-1 rounded-full">
            <span className="font-semibold">P {receita.proteina_g}</span>g
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full">
            <span className="font-semibold">C {receita.carboidratos_g}</span>g
          </div>
        </div>

        {/* Tags */}
        {receita.tags && receita.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {receita.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag.replace('_', ' ')}
              </span>
            ))}
            {receita.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{receita.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Tempo */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>⏱️</span>
          <span>{receita.tempo_preparo_min} min</span>
          {receita.dificuldade && (
            <>
              <span>•</span>
              <span>{receita.dificuldade}</span>
            </>
          )}
        </div>

        {/* Botão Ver Receita */}
        <Link
          to={`/vitalis/receitas/${receita.id}`}
          className="block w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-center rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
        >
          Ver Receita →
        </Link>
      </div>
    </div>
  );
};

export default ReceitasBrowse;
