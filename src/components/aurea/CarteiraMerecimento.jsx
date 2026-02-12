import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - Carteira de Merecimento
 * Registo semanal de gastos: Para mim vs Casa/Família vs Outros
 */

export default function CarteiraMerecimento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [registoSemanal, setRegistoSemanal] = useState(null);
  const [historico, setHistorico] = useState([]);

  // Form values
  const [gastoMim, setGastoMim] = useState('');
  const [gastoCasa, setGastoCasa] = useState('');
  const [gastoOutros, setGastoOutros] = useState('');

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

        // Load this week's entry
        const { data: registo } = await supabase
          .from('aurea_carteira')
          .select('*')
          .eq('user_id', userData.id)
          .eq('semana', inicioSemana)
          .maybeSingle();

        setRegistoSemanal(registo);

        // Load history
        const { data: hist } = await supabase
          .from('aurea_carteira')
          .select('*')
          .eq('user_id', userData.id)
          .order('semana', { ascending: false })
          .limit(8);

        setHistorico(hist || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const mim = parseFloat(gastoMim) || 0;
    const casa = parseFloat(gastoCasa) || 0;
    const outros = parseFloat(gastoOutros) || 0;
    const total = mim + casa + outros;

    if (total === 0) return;

    try {
      const percentagemMim = total > 0 ? Math.round((mim / total) * 100) : 0;

      await supabase.from('aurea_carteira').upsert({
        user_id: userId,
        semana: inicioSemana,
        gasto_mim: mim,
        gasto_casa: casa,
        gasto_outros: outros,
        total: total,
        percentagem_mim: percentagemMim,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,semana' });

      // Add joia if spent >=10% on self
      if (percentagemMim >= 10) {
        await supabase.from('aurea_joias_log').insert({
          user_id: userId,
          quantidade: 1,
          motivo: 'carteira_10_percent',
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

  const calcPercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
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
          <h1 className="text-xl font-bold text-amber-100">Carteira de Merecimento</h1>
        </div>
        <p className="text-amber-200/60 text-sm mt-2">
          Vê quanto do teu dinheiro vai para TI
        </p>
      </header>

      <main className="px-4 space-y-4">
        {/* Esta semana */}
        {registoSemanal ? (
          <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
            <h3 className="text-amber-100 font-medium mb-4">Esta semana</h3>

            {/* Visual bars */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-300">💚 Para mim</span>
                  <span className="text-amber-200">{registoSemanal.percentagem_mim}%</span>
                </div>
                <div className="h-4 bg-amber-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${registoSemanal.percentagem_mim}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-300">🟡 Casa/Família</span>
                  <span className="text-amber-200">{calcPercentage(registoSemanal.gasto_casa, registoSemanal.total)}%</span>
                </div>
                <div className="h-4 bg-amber-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${calcPercentage(registoSemanal.gasto_casa, registoSemanal.total)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-300">🔴 Outros</span>
                  <span className="text-amber-200">{calcPercentage(registoSemanal.gasto_outros, registoSemanal.total)}%</span>
                </div>
                <div className="h-4 bg-amber-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${calcPercentage(registoSemanal.gasto_outros, registoSemanal.total)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <div className="text-green-300 font-bold">{registoSemanal.gasto_mim.toLocaleString()} MT</div>
                <div className="text-green-400/60 text-xs">Para mim</div>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <div className="text-yellow-300 font-bold">{registoSemanal.gasto_casa.toLocaleString()} MT</div>
                <div className="text-yellow-400/60 text-xs">Casa</div>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <div className="text-red-300 font-bold">{registoSemanal.gasto_outros.toLocaleString()} MT</div>
                <div className="text-red-400/60 text-xs">Outros</div>
              </div>
            </div>

            {registoSemanal.percentagem_mim >= 10 && (
              <div className="mt-4 p-3 bg-green-500/20 rounded-xl text-center">
                <span className="text-green-300">✨ Gastaste ≥10% contigo! +1 jóia</span>
              </div>
            )}

            {registoSemanal.percentagem_mim < 5 && (
              <div className="mt-4 p-3 bg-amber-500/20 rounded-xl text-center">
                <span className="text-amber-300 text-sm">Menos de 5% para ti esta semana. Onde estás na lista?</span>
              </div>
            )}
          </div>
        ) : (
          // Entry form
          <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
            <h3 className="text-amber-100 font-medium mb-4">Regista os gastos desta semana</h3>
            <p className="text-amber-200/60 text-sm mb-4">
              Não precisa ser exato. Uma estimativa serve.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-green-300 text-sm mb-2">💚 Para mim (prazer, beleza, hobbies...)</label>
                <input
                  type="number"
                  value={gastoMim}
                  onChange={(e) => setGastoMim(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/10 border border-green-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-yellow-300 text-sm mb-2">🟡 Casa/Família (contas, comida, filhos...)</label>
                <input
                  type="number"
                  value={gastoCasa}
                  onChange={(e) => setGastoCasa(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/10 border border-yellow-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-red-300 text-sm mb-2">🔴 Outros (tudo o resto)</label>
                <input
                  type="number"
                  value={gastoOutros}
                  onChange={(e) => setGastoOutros(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/10 border border-red-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-red-400"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Histórico */}
        {historico.length > 1 && (
          <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
            <h3 className="text-amber-100 font-medium mb-4">Evolução</h3>

            <div className="space-y-3">
              {historico.slice(0, 6).map((h, i) => {
                const semanaDate = new Date(h.semana);
                const label = i === 0 ? 'Esta semana' : semanaDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });

                return (
                  <div key={h.id} className="flex items-center gap-3">
                    <div className="w-24 text-amber-200/60 text-sm">{label}</div>
                    <div className="flex-1 h-3 bg-amber-900/30 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${h.percentagem_mim}%` }}
                      />
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${calcPercentage(h.gasto_casa, h.total)}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${calcPercentage(h.gasto_outros, h.total)}%` }}
                      />
                    </div>
                    <div className={`w-12 text-right text-sm ${h.percentagem_mim >= 10 ? 'text-green-400' : 'text-amber-200/60'}`}>
                      {h.percentagem_mim}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            {historico.length >= 4 && (
              <div className="mt-4 p-3 bg-amber-500/10 rounded-xl">
                <p className="text-amber-200 text-sm">
                  {historico.filter(h => h.percentagem_mim >= 10).length >= 4
                    ? '🎉 Parabéns! Tens mantido ≥10% para ti nas últimas semanas!'
                    : `Nas últimas ${Math.min(4, historico.length)} semanas, ${historico.filter(h => h.percentagem_mim >= 10).length} tiveram ≥10% para ti.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Nota */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <p className="text-amber-200/70 text-sm text-center">
            Isto não é controlo obsessivo — é visibilidade gentil.
            <br />
            Sugerimos reservar 5-10% só para prazer.
          </p>
        </div>
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
          <Link to="/aurea/carteira" className="flex flex-col items-center text-amber-400">
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
