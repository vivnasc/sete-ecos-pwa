import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - Espelho de Roupa
 * Check-in semanal de como te vestes + cadastro de peças
 */

const CATEGORIAS_ROUPA = {
  SUSTENTA: { id: 'sustenta', nome: 'Sustenta-me', cor: '#22C55E', icone: '💚', desc: 'Sinto-me EU' },
  NEUTRA: { id: 'neutra', nome: 'Neutra', cor: '#EAB308', icone: '🟡', desc: 'Funcional' },
  DISFARÇA: { id: 'disfarça', nome: 'Disfarça-me', cor: '#EF4444', icone: '🔴', desc: 'Escondo-me' },
  ANTIGA: { id: 'antiga', nome: 'Versão antiga', cor: '#1F2937', icone: '🖤', desc: 'Já não sou esta' }
};

export default function EspelhoRoupa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'guardaroupa'
  const [checkinSemanal, setCheckinSemanal] = useState(null);
  const [pecas, setPecas] = useState([]);
  const [showAddPeca, setShowAddPeca] = useState(false);

  // Check-in form
  const [modoRoupaDominante, setModoRoupaDominante] = useState(null);
  const [usouPecaGuardada, setUsouPecaGuardada] = useState(null);
  const [sentimentoRoupa, setSentimentoRoupa] = useState(null);
  const [temPecasGuardadas, setTemPecasGuardadas] = useState(null);

  // Add peça form
  const [novaPeca, setNovaPeca] = useState({ nome: '', categoria: null });

  const inicioSemana = getInicioSemana();

  useEffect(() => {
    loadData();
  }, []);

  function getInicioSemana() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

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

        // Load this week's check-in
        const { data: checkin } = await supabase
          .from('aurea_roupa_checkins')
          .select('*')
          .eq('user_id', userData.id)
          .gte('data', inicioSemana)
          .maybeSingle();

        setCheckinSemanal(checkin);

        // Load wardrobe pieces
        const { data: pecasData } = await supabase
          .from('aurea_roupa_pecas')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });

        setPecas(pecasData || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCheckin = async () => {
    if (!modoRoupaDominante || !sentimentoRoupa) return;

    try {
      let joiasGanhas = 1;
      if (modoRoupaDominante === 'sustenta') joiasGanhas = 2;
      if (usouPecaGuardada) joiasGanhas += 2;

      await supabase.from('aurea_roupa_checkins').upsert({
        user_id: userId,
        data: inicioSemana,
        modo_dominante: modoRoupaDominante,
        usou_peca_guardada: usouPecaGuardada,
        sentimento: sentimentoRoupa,
        tem_pecas_guardadas: temPecasGuardadas,
        joias_ganhas: joiasGanhas,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,data' });

      // Add joias
      await supabase.from('aurea_joias_log').insert({
        user_id: userId,
        quantidade: joiasGanhas,
        motivo: 'roupa_checkin',
        created_at: new Date().toISOString()
      });

      // Update total
      const { data: client } = await supabase
        .from('aurea_clients')
        .select('joias_total')
        .eq('user_id', userId)
        .maybeSingle();

      await supabase
        .from('aurea_clients')
        .update({ joias_total: (client?.joias_total || 0) + joiasGanhas })
        .eq('user_id', userId);

      loadData();
    } catch (err) {
      console.error('Erro ao guardar check-in:', err);
    }
  };

  const handleAddPeca = async () => {
    if (!novaPeca.nome || !novaPeca.categoria) return;

    try {
      await supabase.from('aurea_roupa_pecas').insert({
        user_id: userId,
        nome: novaPeca.nome,
        categoria: novaPeca.categoria,
        created_at: new Date().toISOString()
      });

      setNovaPeca({ nome: '', categoria: null });
      setShowAddPeca(false);
      loadData();
    } catch (err) {
      console.error('Erro ao adicionar peça:', err);
    }
  };

  const handleRemovePeca = async (pecaId) => {
    try {
      await supabase.from('aurea_roupa_pecas').delete().eq('id', pecaId);
      loadData();
    } catch (err) {
      console.error('Erro ao remover peça:', err);
    }
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
          <h1 className="text-xl font-bold text-amber-100">Espelho de Roupa</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'checkin' ? 'bg-amber-500 text-white' : 'text-amber-200'
              }`}
          >
            Check-in Semanal
          </button>
          <button
            onClick={() => setActiveTab('guardaroupa')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'guardaroupa' ? 'bg-amber-500 text-white' : 'text-amber-200'
              }`}
          >
            Guarda-Roupa
          </button>
        </div>
      </div>

      <main className="px-4 space-y-4">
        {activeTab === 'checkin' && (
          <>
            {checkinSemanal ? (
              // Show completed check-in
              <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✓</span>
                  <div>
                    <div className="text-green-300 font-medium">Check-in desta semana feito!</div>
                    <div className="text-green-400/60 text-sm">+{checkinSemanal.joias_ganhas} jóias</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-amber-200/70">
                    <span>Modo dominante:</span>
                    <span className="text-amber-100">{CATEGORIAS_ROUPA[checkinSemanal.modo_dominante?.toUpperCase()]?.nome || checkinSemanal.modo_dominante}</span>
                  </div>
                  <div className="flex justify-between text-amber-200/70">
                    <span>Usou peça guardada:</span>
                    <span className="text-amber-100">{checkinSemanal.usou_peca_guardada ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between text-amber-200/70">
                    <span>Sentimento:</span>
                    <span className="text-amber-100 capitalize">{checkinSemanal.sentimento}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Show check-in form
              <div className="space-y-4">
                {/* Pergunta 1 */}
                <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-100 font-medium mb-3">Esta semana, vestiste maioritariamente:</p>
                  <div className="space-y-2">
                    {Object.values(CATEGORIAS_ROUPA).slice(0, 3).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setModoRoupaDominante(cat.id)}
                        className={`w-full p-3 rounded-xl text-left transition-colors ${modoRoupaDominante === cat.id
                          ? 'bg-amber-500/30 border-amber-400'
                          : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                          } border`}
                      >
                        <span className="mr-2">{cat.icone}</span>
                        <span className="text-amber-100">{cat.nome}</span>
                        <span className="text-amber-200/50 text-sm ml-2">({cat.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pergunta 2 */}
                <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-100 font-medium mb-3">Usaste alguma peça "guardada" em dia banal?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUsouPecaGuardada(true)}
                      className={`flex-1 p-3 rounded-xl transition-colors ${usouPecaGuardada === true
                        ? 'bg-green-500/30 border-green-400'
                        : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                        } border`}
                    >
                      <span className="text-amber-100">Sim (+2 bónus)</span>
                    </button>
                    <button
                      onClick={() => setUsouPecaGuardada(false)}
                      className={`flex-1 p-3 rounded-xl transition-colors ${usouPecaGuardada === false
                        ? 'bg-amber-500/30 border-amber-400'
                        : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                        } border`}
                    >
                      <span className="text-amber-100">Não</span>
                    </button>
                  </div>
                </div>

                {/* Pergunta 3 */}
                <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-100 font-medium mb-3">Como te sentiste com o que vestiste?</p>
                  <div className="flex gap-2">
                    {['presente', 'funcional', 'invisível'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSentimentoRoupa(s)}
                        className={`flex-1 p-3 rounded-xl transition-colors capitalize ${sentimentoRoupa === s
                          ? 'bg-amber-500/30 border-amber-400'
                          : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                          } border`}
                      >
                        <span className="text-amber-100">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pergunta 4 */}
                <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-100 font-medium mb-3">Tens peças bonitas guardadas só "para ocasiões"?</p>
                  <div className="flex gap-2">
                    {[{ v: 'muitas', l: 'Sim, muitas' }, { v: 'algumas', l: 'Algumas' }, { v: 'nao', l: 'Não' }].map((o) => (
                      <button
                        key={o.v}
                        onClick={() => setTemPecasGuardadas(o.v)}
                        className={`flex-1 p-3 rounded-xl transition-colors ${temPecasGuardadas === o.v
                          ? 'bg-amber-500/30 border-amber-400'
                          : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                          } border`}
                      >
                        <span className="text-amber-100 text-sm">{o.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveCheckin}
                  disabled={!modoRoupaDominante || !sentimentoRoupa}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  Guardar Check-in
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'guardaroupa' && (
          <>
            <button
              onClick={() => setShowAddPeca(true)}
              className="w-full p-4 bg-white/5 rounded-2xl border border-dashed border-amber-500/30 text-amber-300 hover:bg-white/10 transition-colors"
            >
              + Adicionar peça
            </button>

            {/* Peças por categoria */}
            {Object.values(CATEGORIAS_ROUPA).map((cat) => {
              const pecasCategoria = pecas.filter(p => p.categoria === cat.id);
              if (pecasCategoria.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <h3 className="text-amber-200/70 text-sm flex items-center gap-2">
                    <span>{cat.icone}</span>
                    <span>{cat.nome}</span>
                    <span className="text-amber-200/40">({pecasCategoria.length})</span>
                  </h3>
                  {pecasCategoria.map((peca) => (
                    <div key={peca.id} className="p-3 bg-white/5 rounded-xl border border-amber-500/20 flex justify-between items-center">
                      <span className="text-amber-100">{peca.nome}</span>
                      <button
                        onClick={() => handleRemovePeca(peca.id)}
                        className="text-red-400/60 hover:text-red-400 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}

            {pecas.length === 0 && (
              <div className="text-center py-8 text-amber-200/50">
                <p>Ainda não adicionaste peças.</p>
                <p className="text-sm mt-1">Conhecer o teu guarda-roupa é opcional mas ajuda.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal adicionar peça */}
      {showAddPeca && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2A24] rounded-2xl p-6 max-w-md w-full border border-amber-500/30">
            <h3 className="text-lg font-bold text-amber-100 mb-4">Adicionar Peça</h3>

            <input
              type="text"
              value={novaPeca.nome}
              onChange={(e) => setNovaPeca({ ...novaPeca, nome: e.target.value })}
              placeholder="Nome da peça (ex: Vestido azul)"
              className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 mb-4"
            />

            <div className="space-y-2 mb-4">
              {Object.values(CATEGORIAS_ROUPA).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNovaPeca({ ...novaPeca, categoria: cat.id })}
                  className={`w-full p-3 rounded-xl text-left transition-colors ${novaPeca.categoria === cat.id
                    ? 'bg-amber-500/30 border-amber-400'
                    : 'bg-white/5 border-amber-500/20'
                    } border`}
                >
                  <span className="mr-2">{cat.icone}</span>
                  <span className="text-amber-100">{cat.nome}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPeca(false)}
                className="flex-1 py-3 bg-white/10 text-amber-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPeca}
                disabled={!novaPeca.nome || !novaPeca.categoria}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
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
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💎</span>
            <span className="text-xs mt-1">Práticas</span>
          </Link>
          <Link to="/aurea/roupa" className="flex flex-col items-center text-amber-400">
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
