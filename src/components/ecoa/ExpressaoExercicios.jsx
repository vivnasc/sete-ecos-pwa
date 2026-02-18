import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../contexts/AuthContext';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { EXERCICIOS_EXPRESSAO } from '../../lib/ecoa/gamificacao';

// ============================================================
// ECOA — Exercícios de Expressão
// Escrita livre, lista de verdades, carta ao futuro, manifesto,
// diálogo interno
// Chakra: Vishuddha (Garganta) | Moeda: Ecos
// ============================================================

const ACCENT = '#4A90A4';
const ACCENT_DARK = '#1a2a34';
const ACCENT_LIGHT = '#6BAABB';
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)';

// Timer durations in seconds (from exercise duração)
const TIMER_MAP = {
  escrita_livre: 5 * 60,   // 5 min
  lista_verdades: 10 * 60, // 10 min
  carta_futuro: 10 * 60,
  manifesto: 15 * 60,
  dialogo_interno: 10 * 60
};

// ---- Sound wave decorative SVG ----
const SoundWaveDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 40" className="w-full h-10 opacity-20" fill="none" stroke={ACCENT_LIGHT} strokeWidth="1.5">
      <path d="M10,20 Q30,5 50,20 Q70,35 90,20 Q110,5 130,20 Q150,35 170,20 Q190,5 200,20" />
      <path d="M10,20 Q30,10 50,20 Q70,30 90,20 Q110,10 130,20 Q150,30 170,20 Q190,10 200,20" opacity="0.5" />
    </svg>
  </div>
);

// ---- Format time ----
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---- Exercise card ----
const ExerciseCard = ({ exercicio, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-5 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
    style={{ background: 'rgba(255,255,255,0.04)' }}
  >
    <div className="flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${ACCENT}22` }}
      >
        {exercicio.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{exercicio.nome}</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: ACCENT_SUBTLE, color: ACCENT_LIGHT }}>
            {exercicio.duracao}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
          {exercicio.descricao}
        </p>
      </div>
    </div>
  </button>
);

// ---- History entry ----
const HistoricoEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const exercicio = EXERCICIOS_EXPRESSAO.find(e => e.id === entry.tipo_exercicio);
  const data = new Date(entry.created_at).toLocaleDateString('pt-PT', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
      style={{ background: expanded ? ACCENT_SUBTLE : 'rgba(255,255,255,0.03)' }}
      aria-expanded={expanded}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{exercicio?.icon || '\u270D\uFE0F'}</span>
          <div>
            <span className="text-sm font-medium text-white">{exercicio?.nome || entry.tipo_exercicio}</span>
            <span className="text-xs text-gray-500 ml-2">{data}</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
          {entry.conteudo && (
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {entry.conteudo}
            </div>
          )}
          {entry.reflexao && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(74,144,164,0.08)' }}>
              <p className="text-xs text-gray-500 mb-1">Reflexão:</p>
              <p className="text-sm text-gray-300 italic">{entry.reflexao}</p>
            </div>
          )}
        </div>
      )}
    </button>
  );
};

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function ExpressaoExercicios() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [view, setView] = useState('browse');   // 'browse' | 'exercise' | 'historico'
  const [selectedExercicio, setSelectedExercicio] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Exercise state
  const [conteudo, setConteudo] = useState('');
  const [reflexao, setReflexao] = useState('');
  const [showReflexao, setShowReflexao] = useState(false);

  // Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Historico
  const [historico, setHistorico] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  // Fetch historico
  useEffect(() => {
    if (!userId || view !== 'historico') return;
    const fetchHistorico = async () => {
      setHistoricoLoading(true);
      try {
        const { data } = await supabase
          .from('ecoa_exercicios_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        setHistorico(data || []);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      } finally {
        setHistoricoLoading(false);
      }
    };
    fetchHistorico();
  }, [userId, view]);

  const startExercise = useCallback((exercicio) => {
    setSelectedExercicio(exercicio);
    setConteudo('');
    setReflexao('');
    setShowReflexao(false);
    setSaved(false);
    setView('exercise');

    // Set timer for timed exercises
    const duration = TIMER_MAP[exercicio.id];
    if (duration) {
      setTimeLeft(duration);
      setTimerActive(false); // User starts manually
    }
  }, []);

  const handleStartTimer = useCallback(() => {
    const duration = TIMER_MAP[selectedExercicio?.id];
    if (duration) {
      setTimeLeft(duration);
      setTimerActive(true);
    }
  }, [selectedExercicio]);

  const handleSave = useCallback(async () => {
    if (!userId || !selectedExercicio || !conteudo.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ecoa_exercicios_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          tipo_exercicio: selectedExercicio.id,
          conteudo: conteudo.trim(),
          reflexao: reflexao.trim() || null
        });

      if (error) throw error;

      // Award 6 ecos
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('ecos_total')
        .eq('user_id', userId)
        .maybeSingle();

      if (clientData) {
        const novoTotal = (clientData.ecos_total || 0) + 6;
        await supabase
          .from('ecoa_clients')
          .update({ ecos_total: novoTotal })
          .eq('user_id', userId);
      }

      setSaved(true);
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      console.error('Erro ao guardar exercício:', err);
      alert('Não foi possível guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, selectedExercicio, conteudo, reflexao]);

  const handleBackToBrowse = useCallback(() => {
    setView('browse');
    setSelectedExercicio(null);
    setConteudo('');
    setReflexao('');
    setShowReflexao(false);
    setSaved(false);
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ---- Tabs ----
  const renderTabs = () => (
    <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => { setView('browse'); handleBackToBrowse(); }}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view !== 'historico' ? 'text-white' : 'text-gray-500'}`}
        style={view !== 'historico' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view !== 'historico'}
      >
        Exercícios
      </button>
      <button
        onClick={() => setView('historico')}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
        style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view === 'historico'}
      >
        Histórico
      </button>
    </div>
  );

  // Group historico by exercise type
  const groupedHistorico = historico.reduce((acc, entry) => {
    const tipo = entry.tipo_exercicio || 'outro';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Exercícios de Expressão"
        subtitle="Escreve, descobre, liberta"
      />

      <SoundWaveDecoration className="-mt-1" />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Exercícios de Expressão">
        {view !== 'exercise' && renderTabs()}

        {view === 'historico' ? (
          // ---- HISTORICO ----
          <div className="space-y-6 animate-fadeIn">
            {historicoLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }} />
              </div>
            ) : historico.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl">{'\u270D\uFE0F'}</div>
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                  Ainda sem exercícios
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Quando completares o teu primeiro exercício, ele aparecerá aqui.
                </p>
                <button
                  onClick={() => setView('browse')}
                  className="px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Explorar exercícios
                </button>
              </div>
            ) : (
              Object.entries(groupedHistorico).map(([tipo, entries]) => {
                const exercicio = EXERCICIOS_EXPRESSAO.find(e => e.id === tipo);
                return (
                  <div key={tipo} className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 flex items-center gap-2">
                      <span>{exercicio?.icon || '\u270D\uFE0F'}</span>
                      <span>{exercicio?.nome || tipo} ({entries.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <HistoricoEntry key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : view === 'exercise' && selectedExercicio ? (
          // ---- EXERCISE MODE ----
          <div className="space-y-6 animate-fadeIn">
            {saved ? (
              // Success
              <div className="flex flex-col items-center text-center py-12 space-y-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
                >
                  {selectedExercicio.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Exercício {g('completo', 'completo')}!
                  </h2>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Cada palavra escrita é uma voz a ganhar forma. +6 Ecos {'\uD83D\uDD0A'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBackToBrowse}
                    className="px-5 py-3 rounded-xl text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/15 transition-all"
                  >
                    Outro exercício
                  </button>
                  <button
                    onClick={() => setView('historico')}
                    className="px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                  >
                    Ver histórico
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Exercise header */}
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={handleBackToBrowse}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                    aria-label="Voltar"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {selectedExercicio.nome}
                    </h2>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: ACCENT_SUBTLE, color: ACCENT_LIGHT }}>
                    {selectedExercicio.duracao}
                  </span>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-xl" style={{ background: ACCENT_SUBTLE }}>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {selectedExercicio.instrucoes}
                  </p>
                </div>

                {/* Timer (for timed exercises) */}
                {TIMER_MAP[selectedExercicio.id] && (
                  <div className="flex items-center justify-center gap-4">
                    <div
                      className="text-3xl font-mono font-bold transition-colors duration-300"
                      style={{ color: timeLeft <= 30 && timerActive ? '#ef4444' : ACCENT }}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    {!timerActive && timeLeft > 0 && (
                      <button
                        onClick={handleStartTimer}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                        style={{ background: ACCENT }}
                      >
                        Iniciar timer
                      </button>
                    )}
                    {timerActive && (
                      <button
                        onClick={() => setTimerActive(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/15 transition-all"
                      >
                        Pausar
                      </button>
                    )}
                    {timeLeft === 0 && (
                      <span className="text-sm text-gray-400">Tempo terminado</span>
                    )}
                  </div>
                )}

                {/* Writing area */}
                <div className="relative">
                  <textarea
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    placeholder={selectedExercicio.descricao}
                    rows={10}
                    maxLength={5000}
                    className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      focusRingColor: ACCENT,
                      fontFamily: 'var(--font-titulos)',
                      fontSize: '1rem',
                      lineHeight: '1.8'
                    }}
                    aria-label={`Escrita: ${selectedExercicio.nome}`}
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-gray-600">{conteudo.length}/5000</span>
                </div>

                {/* Reflexão toggle */}
                {conteudo.trim().length > 0 && !showReflexao && (
                  <button
                    onClick={() => setShowReflexao(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.04)', color: ACCENT_LIGHT }}
                  >
                    + O que descobriste ao escrever?
                  </button>
                )}

                {/* Reflexão textarea */}
                {showReflexao && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-sm text-gray-400">O que descobriste ao escrever?</label>
                    <textarea
                      value={reflexao}
                      onChange={(e) => setReflexao(e.target.value)}
                      placeholder="Uma surpresa, uma emoção, algo que não esperavas..."
                      rows={3}
                      maxLength={1000}
                      className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                      aria-label="Reflexão sobre o exercício"
                    />
                  </div>
                )}

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={!conteudo.trim() || saving}
                  className="w-full py-4 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: conteudo.trim() ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)' }}
                >
                  {saving ? 'A guardar...' : `Guardar exercício (+6 Ecos ${'\uD83D\uDD0A'})`}
                </button>
              </>
            )}
          </div>
        ) : (
          // ---- BROWSE ----
          <div className="space-y-3 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                Escolhe um exercício
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Cada exercício é uma porta para a tua voz interior
              </p>
            </div>

            {EXERCICIOS_EXPRESSAO.map((exercicio) => (
              <ExerciseCard
                key={exercicio.id}
                exercicio={exercicio}
                onClick={() => startExercise(exercicio)}
              />
            ))}
          </div>
        )}

        <SoundWaveDecoration className="mt-12 rotate-180" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
