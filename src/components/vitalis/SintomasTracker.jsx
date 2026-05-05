import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { obterSintomas, getNivelGravidade } from '../../lib/vitalis/sintomasAdaptacao.js';

const COACH_WHATSAPP = '+258851006473';

export default function SintomasTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [userId, setUserId] = useState(null);
  const [abordagem, setAbordagem] = useState('equilibrado');
  const [registos, setRegistos] = useState({}); // { chave: { intensidade, nota, categoria } }
  const [registosHoje, setRegistosHoje] = useState([]);
  const [showAlertaParar, setShowAlertaParar] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (!userData) {
        setLoading(false);
        return;
      }

      setUserId(userData.id);

      const { data: planoData } = await supabase
        .from('vitalis_meal_plans')
        .select('abordagem')
        .eq('user_id', userData.id)
        .eq('status', 'activo')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planoData?.abordagem) setAbordagem(planoData.abordagem);

      const hoje = new Date().toISOString().split('T')[0];
      const { data: hojeData } = await supabase
        .from('vitalis_sintomas_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje);

      setRegistosHoje(hojeData || []);
    } catch (err) {
      console.error('Erro ao carregar sintomas:', err);
    } finally {
      setLoading(false);
    }
  };

  const sintomas = obterSintomas(abordagem);

  const toggleSintoma = (chave, categoria) => {
    setRegistos(prev => {
      if (prev[chave]) {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      }
      return { ...prev, [chave]: { intensidade: 3, nota: '', categoria } };
    });
    if (categoria === 'parar') setShowAlertaParar(chave);
  };

  const setIntensidade = (chave, valor) => {
    setRegistos(prev => ({ ...prev, [chave]: { ...prev[chave], intensidade: valor } }));
  };

  const setNota = (chave, valor) => {
    setRegistos(prev => ({ ...prev, [chave]: { ...prev[chave], nota: valor } }));
  };

  const guardar = async () => {
    if (!userId) return;
    const entradas = Object.entries(registos);
    if (entradas.length === 0) return;

    setSalvando(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const linhas = entradas.map(([chave, info]) => ({
        user_id: userId,
        data: hoje,
        sintoma: chave,
        categoria: info.categoria,
        intensidade: info.intensidade,
        nota: info.nota || null
      }));

      // Upsert para permitir actualização do mesmo sintoma no mesmo dia
      const { error } = await supabase
        .from('vitalis_sintomas_log')
        .upsert(linhas, { onConflict: 'user_id,data,sintoma' });

      if (error) throw error;

      // Se houver sintoma "parar", criar alerta crítico para a coach
      const temParar = entradas.some(([_, info]) => info.categoria === 'parar');
      if (temParar) {
        try {
          await supabase.from('vitalis_alerts').insert({
            user_id: userId,
            tipo: 'sintoma_critico',
            prioridade: 'critica',
            mensagem: 'Cliente reportou sintoma crítico de adaptação. Contactar com urgência.',
            lido: false
          });
        } catch (_) { /* tabela pode não existir — falha silenciosa */ }
      }

      await carregar();
      setRegistos({});
      alert('Sintomas registados. Cuida de ti.');
    } catch (err) {
      console.error('Erro ao guardar sintomas:', err);
      alert('Erro ao guardar. Tenta novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🌡️</div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  const renderGrupo = (categoria, lista) => {
    const nivel = getNivelGravidade(categoria);
    const titulo = categoria === 'parar' ? 'PARAR e procurar ajuda'
                 : categoria === 'atencao' ? 'Sinais de Atenção'
                 : 'Sintomas Normais (passam sozinhos)';

    return (
      <section className="mb-6">
        <div
          className="rounded-xl px-4 py-3 mb-3 font-bold text-sm flex items-center gap-2"
          style={{ background: nivel.bg, color: nivel.cor, border: `2px solid ${nivel.borda}` }}
        >
          <span className="text-lg" aria-hidden="true">
            {categoria === 'parar' ? '🚨' : categoria === 'atencao' ? '⚠️' : '✅'}
          </span>
          {titulo}
        </div>
        <ul className="space-y-2">
          {lista.map(s => {
            const marcado = !!registos[s.chave];
            return (
              <li
                key={s.chave}
                className={`bg-white rounded-xl p-3 sm:p-4 border-2 transition-all ${
                  marcado ? 'shadow-md' : 'border-gray-200'
                }`}
                style={marcado ? { borderColor: nivel.cor } : {}}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => toggleSintoma(s.chave, categoria)}
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ accentColor: nivel.cor }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#4A4035]">{s.nome}</span>
                      {s.dias && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          dias {s.dias}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B5C4C] mt-1 leading-snug">
                      {s.descricao || s.accao}
                    </p>
                  </div>
                </label>
                {marcado && (
                  <div className="mt-3 ml-8 space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Intensidade: {registos[s.chave].intensidade}/5
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={registos[s.chave].intensidade}
                        onChange={(e) => setIntensidade(s.chave, parseInt(e.target.value))}
                        className="w-full"
                        style={{ accentColor: nivel.cor }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Nota (opcional)"
                      value={registos[s.chave].nota}
                      onChange={(e) => setNota(s.chave, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#7C8B6F] focus:outline-none"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    );
  };

  const sintomaParar = showAlertaParar
    ? sintomas.parar.find(s => s.chave === showAlertaParar)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      <header className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Voltar">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">Adaptação 🌡️</h1>
            <p className="text-white/80 text-sm">Como te estás a sentir?</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-5">
          <p className="text-sm text-[#4A4035] leading-relaxed">
            Marca os sintomas que sentes nos últimos dias. Os sintomas <strong>verdes</strong> são normais
            e passam sozinhos. Os <strong>amarelos</strong> precisam de ajuste. Os <strong>vermelhos</strong> exigem
            paragem imediata.
          </p>
        </div>

        {registosHoje.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 text-sm text-emerald-800">
            ✓ Já registaste {registosHoje.length} sintoma{registosHoje.length > 1 ? 's' : ''} hoje. Podes adicionar mais.
          </div>
        )}

        {sintomas.parar?.length > 0 && renderGrupo('parar', sintomas.parar)}
        {sintomas.atencao?.length > 0 && renderGrupo('atencao', sintomas.atencao)}
        {sintomas.normais?.length > 0 && renderGrupo('normais', sintomas.normais)}

        <div className="sticky bottom-4 bg-white rounded-2xl shadow-xl p-3 flex gap-2 mt-6">
          <Link
            to="/vitalis/dashboard"
            className="flex-1 py-3 text-center border-2 border-gray-300 rounded-xl text-gray-700 font-semibold text-sm"
          >
            Voltar
          </Link>
          <button
            onClick={guardar}
            disabled={salvando || Object.keys(registos).length === 0}
            className="flex-1 py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold text-sm disabled:opacity-50 active:scale-[0.98]"
          >
            {salvando ? 'A guardar...' : `Guardar (${Object.keys(registos).length})`}
          </button>
        </div>
      </main>

      {sintomaParar && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🚨</div>
              <h2 className="text-lg font-bold text-red-700">Sintoma crítico detectado</h2>
              <p className="text-sm text-[#4A4035] mt-2">
                <strong>{sintomaParar.nome}</strong> não é normal. {sintomaParar.accao}
              </p>
            </div>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${COACH_WHATSAPP.replace(/[^0-9]/g, '')}?text=Tenho um sintoma de paragem: ${encodeURIComponent(sintomaParar.nome)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 bg-emerald-600 text-white rounded-xl font-semibold text-center text-sm"
              >
                💬 Falar com a Vivianne agora
              </a>
              <button
                onClick={() => setShowAlertaParar(null)}
                className="w-full py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold text-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
