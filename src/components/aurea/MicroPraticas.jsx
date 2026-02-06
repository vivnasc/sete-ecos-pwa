import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  TODAS_PRATICAS,
  CATEGORIAS,
  getPraticaDoDia,
  getPraticasPorCategoria
} from '../../lib/aurea/praticas';

/**
 * ÁUREA - Micro-Práticas Diárias
 * Browse e completar as 100+ práticas de auto-cuidado
 */

export default function MicroPraticas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [completedToday, setCompletedToday] = useState([]);
  const [showCulpaModal, setShowCulpaModal] = useState(false);
  const [currentPratica, setCurrentPratica] = useState(null);
  const [culpaLevel, setCulpaLevel] = useState(null);

  const hoje = new Date().toISOString().split('T')[0];
  const praticaDoDia = getPraticaDoDia();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (userData) {
        setUserId(userData.id);

        // Load today's completed practices
        const { data: completed } = await supabase
          .from('aurea_praticas_log')
          .select('pratica_id')
          .eq('user_id', userData.id)
          .eq('data', hoje);

        setCompletedToday(completed?.map(c => c.pratica_id) || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (pratica) => {
    setCurrentPratica(pratica);
    setShowCulpaModal(true);
  };

  const finishPratica = async () => {
    if (!currentPratica) return;

    try {
      // Calculate joias (base + bonus for no guilt)
      let joiasGanhas = currentPratica.joias;
      if (culpaLevel === 'sem') {
        joiasGanhas += 1; // Bonus for no guilt
      }

      // Log practice
      await supabase.from('aurea_praticas_log').insert({
        user_id: userId,
        pratica_id: currentPratica.id,
        data: hoje,
        categoria: currentPratica.categoria,
        nivel_culpa: culpaLevel,
        joias_ganhas: joiasGanhas,
        created_at: new Date().toISOString()
      });

      // Log joias
      await supabase.from('aurea_joias_log').insert({
        user_id: userId,
        quantidade: joiasGanhas,
        motivo: 'pratica_completada',
        pratica_id: currentPratica.id,
        created_at: new Date().toISOString()
      });

      // Update total joias
      const { data: client } = await supabase
        .from('aurea_clients')
        .select('joias_total')
        .eq('user_id', userId)
        .maybeSingle();

      await supabase
        .from('aurea_clients')
        .update({ joias_total: (client?.joias_total || 0) + joiasGanhas })
        .eq('user_id', userId);

      // Log culpa if present
      if (culpaLevel && culpaLevel !== 'sem') {
        await supabase.from('aurea_culpa_log').insert({
          user_id: userId,
          pratica_id: currentPratica.id,
          nivel: culpaLevel,
          created_at: new Date().toISOString()
        });
      }

      setCompletedToday([...completedToday, currentPratica.id]);
      setShowCulpaModal(false);
      setCurrentPratica(null);
      setCulpaLevel(null);
    } catch (err) {
      console.error('Erro ao completar prática:', err);
    }
  };

  const categoriasLista = Object.values(CATEGORIAS);
  const praticasParaMostrar = selectedCategory
    ? getPraticasPorCategoria(selectedCategory)
    : TODAS_PRATICAS;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" className="text-amber-200/60 hover:text-amber-200">
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold text-amber-100">Micro-Práticas</h1>
        </div>
        <p className="text-amber-200/60 text-sm mt-2">
          {completedToday.length} práticas hoje | {TODAS_PRATICAS.length} total
        </p>
      </header>

      <main className="px-4 space-y-4">
        {/* Prática do Dia Destaque */}
        {!completedToday.includes(praticaDoDia.id) && (
          <div className="p-4 bg-gradient-to-br from-amber-600/20 to-amber-500/20 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-300 text-sm font-medium">✨ Prática do Dia</span>
              <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-300 text-xs">
                +{praticaDoDia.joias} jóias
              </span>
            </div>
            <p className="text-amber-100 mb-4">{praticaDoDia.texto}</p>
            <button
              onClick={() => handleComplete(praticaDoDia)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold"
            >
              Completar ✓
            </button>
          </div>
        )}

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${!selectedCategory
              ? 'bg-amber-500 text-white'
              : 'bg-white/10 text-amber-200 hover:bg-white/20'
              }`}
          >
            Todas ({TODAS_PRATICAS.length})
          </button>
          {categoriasLista.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 ${selectedCategory === cat.id
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 text-amber-200 hover:bg-white/20'
                }`}
            >
              <span>{cat.icone}</span>
              <span>{cat.nome}</span>
            </button>
          ))}
        </div>

        {/* Lista de Práticas */}
        <div className="space-y-3">
          {praticasParaMostrar.map((pratica) => {
            const isCompleted = completedToday.includes(pratica.id);
            const categoria = CATEGORIAS[pratica.categoria.toUpperCase()];

            return (
              <div
                key={pratica.id}
                className={`p-4 rounded-xl border transition-all ${isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: categoria.cor + '30' }}
                  >
                    {isCompleted ? '✓' : categoria.icone}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-200/50 text-xs uppercase">{categoria.nome}</span>
                      <span className={`text-xs ${isCompleted ? 'text-green-400' : 'text-amber-300'}`}>
                        {isCompleted ? 'Feita!' : `+${pratica.joias} ✨`}
                      </span>
                    </div>
                    <p className={isCompleted ? 'text-green-300' : 'text-amber-100'}>{pratica.texto}</p>
                  </div>
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => handleComplete(pratica)}
                    className="mt-3 w-full py-2 bg-white/10 text-amber-200 rounded-lg text-sm hover:bg-white/20 transition-colors"
                  >
                    Fiz hoje ✓
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Culpa */}
      {showCulpaModal && currentPratica && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2A24] rounded-2xl p-6 max-w-md w-full border border-amber-500/30">
            <h3 className="text-lg font-bold text-amber-100 mb-2">Como te sentiste?</h3>
            <p className="text-amber-200/70 text-sm mb-6">
              "{currentPratica.texto}"
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setCulpaLevel('sem');
                  finishPratica();
                }}
                className="w-full p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-left hover:bg-green-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-300 font-medium">✅ Sem culpa</div>
                    <div className="text-green-400/60 text-sm">Fiz e senti-me bem</div>
                  </div>
                  <span className="text-green-300">+1 bónus</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setCulpaLevel('leve');
                  finishPratica();
                }}
                className="w-full p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-left hover:bg-yellow-500/30 transition-colors"
              >
                <div className="text-yellow-300 font-medium">⚠️ Culpa leve</div>
                <div className="text-yellow-400/60 text-sm">Um pouco desconfortável</div>
              </button>

              <button
                onClick={() => {
                  setCulpaLevel('muita');
                  finishPratica();
                }}
                className="w-full p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-left hover:bg-red-500/30 transition-colors"
              >
                <div className="text-red-300 font-medium">❌ Muita culpa</div>
                <div className="text-red-400/60 text-sm">Senti que não devia</div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowCulpaModal(false);
                setCurrentPratica(null);
              }}
              className="mt-4 w-full py-2 text-amber-200/50 text-sm hover:text-amber-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-400">
            <span className="text-xl">💎</span>
            <span className="text-xs mt-1">Práticas</span>
          </Link>
          <Link to="/aurea/roupa" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">👗</span>
            <span className="text-xs mt-1">Roupa</span>
          </Link>
          <Link to="/aurea/carteira" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💰</span>
            <span className="text-xs mt-1">Carteira</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
