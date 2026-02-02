import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Base de dados de sugestões rápidas
const SUGESTOES_RAPIDAS = {
  pequeno_almoco: [
    { nome: 'Ovos mexidos com espinafres', proteina: 2, hidratos: 0, gordura: 1, calorias: 220, tempo: 10, icone: '🥚' },
    { nome: 'Papas de aveia com frutos vermelhos', proteina: 1, hidratos: 2, gordura: 1, calorias: 280, tempo: 5, icone: '🥣' },
    { nome: 'Iogurte grego com granola e banana', proteina: 1.5, hidratos: 1.5, gordura: 0.5, calorias: 250, tempo: 3, icone: '🥛' },
    { nome: 'Tosta de abacate com ovo', proteina: 1, hidratos: 1, gordura: 2, calorias: 300, tempo: 8, icone: '🥑' },
    { nome: 'Smoothie proteico de banana', proteina: 2, hidratos: 1, gordura: 0.5, calorias: 200, tempo: 5, icone: '🥤' },
    { nome: 'Panquecas de aveia e banana', proteina: 1.5, hidratos: 2, gordura: 1, calorias: 320, tempo: 15, icone: '🥞' },
  ],
  almoco: [
    { nome: 'Salada de frango grelhado', proteina: 3, hidratos: 1, gordura: 2, calorias: 400, tempo: 20, icone: '🥗' },
    { nome: 'Bowl de quinoa com salmão', proteina: 2.5, hidratos: 2, gordura: 2, calorias: 450, tempo: 25, icone: '🍱' },
    { nome: 'Wrap de peru com vegetais', proteina: 2, hidratos: 1.5, gordura: 1, calorias: 350, tempo: 10, icone: '🌯' },
    { nome: 'Arroz integral com frango e legumes', proteina: 3, hidratos: 2, gordura: 1, calorias: 420, tempo: 30, icone: '🍛' },
    { nome: 'Omelete de vegetais com salada', proteina: 2.5, hidratos: 0.5, gordura: 2, calorias: 320, tempo: 15, icone: '🍳' },
    { nome: 'Sopa de legumes com frango desfiado', proteina: 2, hidratos: 1, gordura: 1, calorias: 280, tempo: 20, icone: '🍲' },
  ],
  jantar: [
    { nome: 'Peixe grelhado com vegetais', proteina: 3, hidratos: 0.5, gordura: 1.5, calorias: 350, tempo: 20, icone: '🐟' },
    { nome: 'Peito de frango com batata doce', proteina: 3, hidratos: 1.5, gordura: 1, calorias: 380, tempo: 25, icone: '🍗' },
    { nome: 'Salada mediterrânea com atum', proteina: 2.5, hidratos: 1, gordura: 2, calorias: 320, tempo: 10, icone: '🥗' },
    { nome: 'Tofu salteado com legumes', proteina: 2, hidratos: 1, gordura: 1.5, calorias: 280, tempo: 20, icone: '🥡' },
    { nome: 'Sopa de legumes com ovo cozido', proteina: 1.5, hidratos: 1, gordura: 1, calorias: 220, tempo: 15, icone: '🍜' },
    { nome: 'Hambúrguer caseiro de peru', proteina: 2.5, hidratos: 1, gordura: 1.5, calorias: 340, tempo: 20, icone: '🍔' },
  ],
  snack: [
    { nome: 'Maçã com manteiga de amendoim', proteina: 0.5, hidratos: 1, gordura: 1, calorias: 180, tempo: 2, icone: '🍎' },
    { nome: 'Iogurte natural com nozes', proteina: 1, hidratos: 0.5, gordura: 1, calorias: 150, tempo: 2, icone: '🥜' },
    { nome: 'Palitos de cenoura com hummus', proteina: 0.5, hidratos: 0.5, gordura: 1, calorias: 120, tempo: 2, icone: '🥕' },
    { nome: 'Queijo fresco com tomate', proteina: 1, hidratos: 0.5, gordura: 0.5, calorias: 100, tempo: 2, icone: '🧀' },
    { nome: 'Batido de proteína', proteina: 1.5, hidratos: 0.5, gordura: 0.5, calorias: 130, tempo: 3, icone: '🥤' },
    { nome: 'Mix de frutos secos', proteina: 0.5, hidratos: 0.5, gordura: 1.5, calorias: 180, tempo: 1, icone: '🥜' },
  ]
};

export default function SugestoesRefeicoes() {
  const [loading, setLoading] = useState(true);
  const [plano, setPlano] = useState(null);
  const [macrosRestantes, setMacrosRestantes] = useState({ proteina: 0, hidratos: 0, gordura: 0, calorias: 0 });
  const [macrosConsumidos, setMacrosConsumidos] = useState({ proteina: 0, hidratos: 0, gordura: 0 });
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState('almoco');
  const [sugestoesFiltradas, setSugestoesFiltradas] = useState([]);
  const [filtroTempo, setFiltroTempo] = useState('todos');

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDados();
  }, []);

  useEffect(() => {
    filtrarSugestoes();
  }, [refeicaoSelecionada, macrosRestantes, filtroTempo]);

  const loadDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();

        if (planoData) {
          setPlano(planoData);

          // Buscar consumo de hoje
          const { data: mealsData } = await supabase
            .from('vitalis_meals_log')
            .select('*')
            .eq('user_id', userData.id)
            .eq('data', hoje);

          const consumidos = (mealsData || []).reduce((acc, meal) => ({
            proteina: acc.proteina + (parseFloat(meal.porcoes_proteina) || 0),
            hidratos: acc.hidratos + (parseFloat(meal.porcoes_hidratos) || 0),
            gordura: acc.gordura + (parseFloat(meal.porcoes_gordura) || 0)
          }), { proteina: 0, hidratos: 0, gordura: 0 });

          setMacrosConsumidos(consumidos);

          // Calcular restantes
          const restantes = {
            proteina: Math.max(0, (planoData.porcoes_proteina || 6) - consumidos.proteina),
            hidratos: Math.max(0, (planoData.porcoes_hidratos || 3) - consumidos.hidratos),
            gordura: Math.max(0, (planoData.porcoes_gordura || 8) - consumidos.gordura),
            calorias: Math.max(0, (planoData.calorias_diarias || 1500) - (
              consumidos.proteina * 20 * 4 +
              consumidos.hidratos * 30 * 4 +
              consumidos.gordura * 7 * 9
            ))
          };

          setMacrosRestantes(restantes);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarSugestoes = () => {
    let sugestoes = SUGESTOES_RAPIDAS[refeicaoSelecionada] || [];

    // Filtrar por tempo
    if (filtroTempo === 'rapido') {
      sugestoes = sugestoes.filter(s => s.tempo <= 10);
    } else if (filtroTempo === 'medio') {
      sugestoes = sugestoes.filter(s => s.tempo > 10 && s.tempo <= 20);
    }

    // Ordenar por adequação aos macros restantes
    sugestoes = sugestoes.map(s => {
      const score = (
        (s.proteina <= macrosRestantes.proteina ? 1 : 0) +
        (s.hidratos <= macrosRestantes.hidratos ? 1 : 0) +
        (s.gordura <= macrosRestantes.gordura ? 1 : 0) +
        (s.calorias <= macrosRestantes.calorias ? 1 : 0)
      );
      return { ...s, score, adequado: score >= 3 };
    }).sort((a, b) => b.score - a.score);

    setSugestoesFiltradas(sugestoes);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p className="text-[#6B5C4C]">A calcular sugestões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">Sugestões de Refeições</h1>
              <p className="text-white/70 text-sm">Baseado nos teus macros restantes</p>
            </div>
          </div>

          {/* Macros Restantes */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{macrosRestantes.proteina.toFixed(1)}</p>
              <p className="text-xs text-white/70">Proteína</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{macrosRestantes.hidratos.toFixed(1)}</p>
              <p className="text-xs text-white/70">Hidratos</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{macrosRestantes.gordura.toFixed(1)}</p>
              <p className="text-xs text-white/70">Gordura</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{Math.round(macrosRestantes.calorias)}</p>
              <p className="text-xs text-white/70">kcal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'pequeno_almoco', nome: 'Peq. Almoço', icone: '🌅' },
            { id: 'almoco', nome: 'Almoço', icone: '☀️' },
            { id: 'jantar', nome: 'Jantar', icone: '🌙' },
            { id: 'snack', nome: 'Snack', icone: '🍎' }
          ].map(ref => (
            <button
              key={ref.id}
              onClick={() => setRefeicaoSelecionada(ref.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                refeicaoSelecionada === ref.id
                  ? 'bg-[#7C8B6F] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{ref.icone}</span>
              <span className="text-sm font-medium">{ref.nome}</span>
            </button>
          ))}
        </div>

        {/* Filtro de tempo */}
        <div className="flex gap-2">
          {[
            { id: 'todos', nome: 'Todos' },
            { id: 'rapido', nome: '⚡ Rápido (<10min)' },
            { id: 'medio', nome: '⏱️ Médio (10-20min)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroTempo(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtroTempo === f.id
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.nome}
            </button>
          ))}
        </div>

        {/* Lista de Sugestões */}
        <div className="space-y-3">
          {sugestoesFiltradas.map((sugestao, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-4 transition-all ${
                sugestao.adequado ? 'border-2 border-green-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{sugestao.icone}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{sugestao.nome}</h3>
                    {sugestao.adequado && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Ideal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>⏱️ {sugestao.tempo} min</span>
                    <span>🔥 {sugestao.calorias} kcal</span>
                  </div>

                  {/* Macros */}
                  <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
                      <span className="text-xs">🥩</span>
                      <span className="text-xs font-medium text-red-700">{sugestao.proteina}P</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                      <span className="text-xs">🍚</span>
                      <span className="text-xs font-medium text-amber-700">{sugestao.hidratos}H</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                      <span className="text-xs">🥑</span>
                      <span className="text-xs font-medium text-green-700">{sugestao.gordura}G</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/vitalis/meals"
                  className="px-3 py-2 bg-[#7C8B6F] text-white rounded-xl text-sm font-medium hover:bg-[#6B7A5D] transition-colors"
                >
                  Registar
                </Link>
              </div>
            </div>
          ))}
        </div>

        {sugestoesFiltradas.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤔</div>
            <p className="text-gray-500">Nenhuma sugestão encontrada com estes filtros</p>
          </div>
        )}
      </main>
    </div>
  );
}
