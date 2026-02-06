import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - Diário de Merecimento
 * Espaço livre para escrever momentos de auto-valor
 */

const PROMPTS = [
  'Hoje, mereci porque...',
  'Hoje, tratei-me como prioridade quando...',
  'Hoje, disse não a...',
  'Hoje, recebi sem culpa...',
  'Hoje, gastei tempo/dinheiro comigo quando...',
  'Hoje, escolhi-me a mim em vez de...',
  'Hoje, senti-me valiosa porque...',
  'Hoje, permiti-me...'
];

export default function DiarioMerecimento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [entradas, setEntradas] = useState([]);
  const [entradaHoje, setEntradaHoje] = useState(null);

  // Form
  const [texto, setTexto] = useState('');
  const [promptActual, setPromptActual] = useState(PROMPTS[0]);

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
    // Random prompt
    setPromptActual(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
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

        // Load today's entry
        const { data: entradaHj } = await supabase
          .from('aurea_diario')
          .select('*')
          .eq('user_id', userData.id)
          .eq('data', hoje)
          .maybeSingle();

        setEntradaHoje(entradaHj);
        if (entradaHj) {
          setTexto(entradaHj.texto);
        }

        // Load history
        const { data: hist } = await supabase
          .from('aurea_diario')
          .select('*')
          .eq('user_id', userData.id)
          .order('data', { ascending: false })
          .limit(30);

        setEntradas(hist || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!texto.trim()) return;

    try {
      await supabase.from('aurea_diario').upsert({
        user_id: userId,
        data: hoje,
        texto: texto.trim(),
        prompt: promptActual,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,data' });

      // Add joia if first entry today
      if (!entradaHoje) {
        await supabase.from('aurea_joias_log').insert({
          user_id: userId,
          quantidade: 1,
          motivo: 'diario_entrada',
          created_at: new Date().toISOString()
        });

        const { data: client } = await supabase
          .from('aurea_clients')
          .select('joias_total')
          .eq('user_id', userId)
          .maybeSingle();

        await supabase
          .from('aurea_clients')
          .update({ joias_total: (client?.joias_total || 0) + 1 })
          .eq('user_id', userId);
      }

      loadData();
    } catch (err) {
      console.error('Erro ao guardar:', err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

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
          <h1 className="text-xl font-bold text-amber-100">Diário de Merecimento</h1>
        </div>
        <p className="text-amber-200/60 text-sm mt-2">
          {entradas.length} entradas | {entradas.filter(e => e.data === hoje).length > 0 ? 'Escreveste hoje' : 'Ainda não escreveste hoje'}
        </p>
      </header>

      <main className="px-4 space-y-4">
        {/* Entry form */}
        <div className="p-4 bg-gradient-to-br from-amber-600/10 to-amber-500/10 rounded-2xl border border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-amber-300 text-sm">✨ Prompt de hoje</span>
            <button
              onClick={() => setPromptActual(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
              className="text-amber-400/70 text-xs hover:text-amber-300"
            >
              Mudar prompt ↻
            </button>
          </div>
          <p className="text-amber-100 italic mb-4">"{promptActual}"</p>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreve aqui..."
            rows={5}
            className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 resize-none"
          />

          <div className="flex justify-between items-center mt-3">
            <span className="text-amber-200/50 text-xs">
              {texto.length} caracteres
            </span>
            <button
              onClick={handleSave}
              disabled={!texto.trim()}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {entradaHoje ? 'Actualizar' : 'Guardar (+1 ✨)'}
            </button>
          </div>
        </div>

        {/* Entradas anteriores */}
        {entradas.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-amber-100 font-medium">Entradas anteriores</h3>

            {entradas.map((entrada) => (
              <div
                key={entrada.id}
                className={`p-4 rounded-xl border ${entrada.data === hoje
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/5 border-amber-500/20'
                  }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-300 text-sm">
                    {entrada.data === hoje ? 'Hoje' : formatDate(entrada.data)}
                  </span>
                  {entrada.prompt && (
                    <span className="text-amber-200/40 text-xs italic truncate max-w-[200px]">
                      {entrada.prompt}
                    </span>
                  )}
                </div>
                <p className="text-amber-100/90 whitespace-pre-wrap">{entrada.texto}</p>
              </div>
            ))}
          </div>
        )}

        {entradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-amber-200/70">O teu diário está vazio.</p>
            <p className="text-amber-200/50 text-sm mt-1">
              Escreve o primeiro momento de merecimento.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
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
