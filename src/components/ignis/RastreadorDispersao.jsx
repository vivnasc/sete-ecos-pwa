import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase.js';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================
// IGNIS — Rastreador de Dispersão
// Eco da Vontade & Foco (Manipura)
// "O que te desvia do essencial?"
// ============================================================

const IGNIS = '#C1634A';
const IGNIS_DARK = '#2e1a14';
const IGNIS_LIGHT = '#D4836E';
const IGNIS_GLOW = 'rgba(193,99,74,0.15)';

const HEADING_FONT = "'Playfair Display', serif";

// ---- Icons (inline SVGs) ----
const FlameIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2c-1 4-4 6-4 10a4 4 0 008 0c0-4-3-6-4-10zm0 14a2 2 0 01-2-2c0-1.5 1-2.5 2-4 1 1.5 2 2.5 2 4a2 2 0 01-2 2z"/>
  </svg>
);

const AlertIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CheckCircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const TrendUpIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

// ---- Date utilities ----
const todayStr = () => new Date().toISOString().split('T')[0];

const getWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const DAY_NAMES_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

// ---- Motivational messages based on dispersal count ----
const getMotivationalMessage = (count) => {
  if (count === 0) return `Dia limpo! ${g('Focado', 'Focada')} no essencial.`;
  if (count === 1) return 'Uma dispersão apenas. Consciência é o primeiro passo.';
  if (count <= 3) return 'Estás a identificar padrões. Isso é poder.';
  if (count <= 5) return 'Dia intenso. Cada "não" que aprendes a dizer é uma vitória.';
  return 'Muitas dispersões hoje. Respira. Amanhã é uma nova chama.';
};

// ==========================
// SECTION: Log Form
// ==========================
const LogForm = ({ onSave, saving }) => {
  const [situacao, setSituacao] = useState('');
  const [disseSimQueriaNao, setDisseSimQueriaNao] = useState(false);
  const [energiaGasta, setEnergiaGasta] = useState(5);
  const [porqueDissesSim, setPorqueDissesSim] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!situacao.trim()) return;
    onSave({
      situacao: situacao.trim(),
      disse_sim_queria_nao: disseSimQueriaNao,
      energia_gasta: energiaGasta,
      porque_disse_sim: disseSimQueriaNao ? porqueDissesSim.trim() || null : null
    });
    // Reset
    setSituacao('');
    setDisseSimQueriaNao(false);
    setEnergiaGasta(5);
    setPorqueDissesSim('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Situacao */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          O que te dispersou?
        </label>
        <input
          type="text"
          value={situacao}
          onChange={(e) => setSituacao(e.target.value)}
          placeholder="Descreve a situação..."
          maxLength={300}
          required
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            focusRingColor: IGNIS
          }}
          aria-label="Descreve o que te dispersou"
        />
      </div>

      {/* Toggle: disse sim queria nao */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="flex-1 pr-4">
          <p className="text-sm font-medium text-gray-200">
            Disseste sim quando querias dizer não?
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Cedeste contra a tua vontade
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={disseSimQueriaNao}
          onClick={() => setDisseSimQueriaNao(!disseSimQueriaNao)}
          className="relative w-14 h-7 rounded-full transition-colors duration-300 shrink-0"
          style={{ background: disseSimQueriaNao ? IGNIS : 'rgba(255,255,255,0.15)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
            style={{ transform: disseSimQueriaNao ? 'translateX(28px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* Porque disse sim (conditional) */}
      {disseSimQueriaNao && (
        <div className="animate-fadeIn">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Porque disseste sim?
          </label>
          <textarea
            value={porqueDissesSim}
            onChange={(e) => setPorqueDissesSim(e.target.value)}
            placeholder="Medo de rejeição, culpa, pressão social..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              background: 'rgba(193,99,74,0.08)',
              focusRingColor: IGNIS
            }}
            aria-label="Porque disseste sim quando querias dizer não"
          />
        </div>
      )}

      {/* Energy slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Quanta energia gastaste nisto?
          </label>
          <span
            className="text-2xl font-bold"
            style={{ color: IGNIS, fontFamily: HEADING_FONT }}
          >
            {energiaGasta}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={energiaGasta}
          onChange={(e) => setEnergiaGasta(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer ignis-slider"
          style={{ background: `linear-gradient(90deg, ${IGNIS}88 0%, ${IGNIS} ${energiaGasta * 10}%, rgba(255,255,255,0.1) ${energiaGasta * 10}%)` }}
          aria-label={`Energia gasta: ${energiaGasta} de 10`}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Pouca</span>
          <span>Muita</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || !situacao.trim()}
        className="w-full py-3.5 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(135deg, ${IGNIS}, ${IGNIS_DARK})` }}
      >
        {saving ? 'A guardar...' : 'Registar dispersão'}
      </button>
    </form>
  );
};

// ==========================
// SECTION: Today's Log
// ==========================
const TodayLog = ({ entries, totalEnergy }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <FlameIcon className="w-10 h-10 mx-auto opacity-30" />
        <p className="text-sm text-gray-500">
          Nenhuma dispersão registada hoje.
        </p>
        <p className="text-xs text-gray-600 italic">
          {g('Focado', 'Focada')} no essencial — assim se alimenta a chama.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-4 rounded-xl transition-all duration-200"
          style={{
            background: entry.disse_sim_queria_nao ? 'rgba(193,99,74,0.12)' : 'rgba(255,255,255,0.04)',
            borderLeft: entry.disse_sim_queria_nao ? `3px solid ${IGNIS}` : '3px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: entry.disse_sim_queria_nao ? `${IGNIS}33` : 'rgba(255,255,255,0.08)' }}
            >
              {entry.disse_sim_queria_nao ? (
                <AlertIcon className="w-4 h-4 text-red-400" />
              ) : (
                <FlameIcon className="w-4 h-4" style={{ color: IGNIS_LIGHT }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200">{entry.situacao}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-500">
                  Energia: {entry.energia_gasta}/10
                </span>
                {entry.disse_sim_queria_nao && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${IGNIS}22`, color: IGNIS_LIGHT }}>
                    Disse sim, queria não
                  </span>
                )}
              </div>
              {entry.porque_disse_sim && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Porque: {entry.porque_disse_sim}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Summary bar */}
      <div
        className="flex items-center justify-between p-4 rounded-xl mt-4"
        style={{ background: `${IGNIS}15` }}
      >
        <div>
          <p className="text-xs text-gray-500">Energia total dispersada</p>
          <p className="text-lg font-bold" style={{ color: IGNIS, fontFamily: HEADING_FONT }}>
            {totalEnergy} / {entries.length * 10}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Dispersões</p>
          <p className="text-lg font-bold text-gray-200">{entries.length}</p>
        </div>
      </div>

      {/* Motivational message */}
      <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs text-gray-400 italic">
          {getMotivationalMessage(entries.length)}
        </p>
      </div>
    </div>
  );
};

// ==========================
// SECTION: Weekly Summary
// ==========================
const WeeklySummary = ({ weekEntries }) => {
  const weekDates = useMemo(() => getWeekDates(), []);

  // Count dispersals per day
  const dailyCounts = useMemo(() => {
    return weekDates.map((date) => {
      const dayEntries = weekEntries.filter((e) => e.data === date);
      return {
        date,
        count: dayEntries.length,
        energy: dayEntries.reduce((sum, e) => sum + (e.energia_gasta || 0), 0),
        simQueriaNao: dayEntries.filter((e) => e.disse_sim_queria_nao).length
      };
    });
  }, [weekDates, weekEntries]);

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);
  const totalSimQueriaNao = weekEntries.filter((e) => e.disse_sim_queria_nao).length;
  const totalEnergy = weekEntries.reduce((sum, e) => sum + (e.energia_gasta || 0), 0);

  // Pattern detection: find repeating situacoes
  const patterns = useMemo(() => {
    const freq = {};
    weekEntries.forEach((e) => {
      const key = e.situacao?.toLowerCase().trim();
      if (key) {
        freq[key] = (freq[key] || 0) + 1;
      }
    });
    return Object.entries(freq)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [weekEntries]);

  // Most energy-draining
  const mostDraining = useMemo(() => {
    if (weekEntries.length === 0) return null;
    return weekEntries.reduce((max, e) => (e.energia_gasta > (max?.energia_gasta || 0) ? e : max), null);
  }, [weekEntries]);

  if (weekEntries.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <FlameIcon className="w-10 h-10 mx-auto opacity-30" />
        <p className="text-sm text-gray-500">Sem dados esta semana.</p>
        <p className="text-xs text-gray-600 italic">
          Começa a registar as tuas dispersões para ver padrões.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Dispersões por dia</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {dailyCounts.map((day, i) => {
            const barHeight = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const isToday = day.date === todayStr();
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-xs text-gray-500 font-medium">{day.count || ''}</span>
                <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                  <div
                    className="w-full max-w-[28px] rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(barHeight, day.count > 0 ? 8 : 0)}%`,
                      background: day.simQueriaNao > 0
                        ? `linear-gradient(180deg, #ef4444 0%, ${IGNIS} 100%)`
                        : isToday
                          ? `linear-gradient(180deg, ${IGNIS_LIGHT} 0%, ${IGNIS} 100%)`
                          : `${IGNIS}66`,
                      minHeight: day.count > 0 ? 6 : 0
                    }}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'font-bold text-white' : 'text-gray-600'}`}>
                  {DAY_NAMES_SHORT[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-lg font-bold text-gray-200">{weekEntries.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: `${IGNIS}11` }}>
          <p className="text-lg font-bold" style={{ color: IGNIS }}>{totalSimQueriaNao}</p>
          <p className="text-xs text-gray-500">Sims que eram não</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-lg font-bold text-gray-200">{totalEnergy}</p>
          <p className="text-xs text-gray-500">Energia gasta</p>
        </div>
      </div>

      {/* Pattern detection */}
      {patterns.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: `${IGNIS}10`, border: `1px solid ${IGNIS}22` }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendUpIcon className="w-4 h-4" style={{ color: IGNIS }} />
            <h3 className="text-sm font-semibold text-gray-200">Padrão detectado</h3>
          </div>
          <div className="space-y-2">
            {patterns.map(([situacao, count]) => (
              <div key={situacao} className="flex items-center justify-between">
                <p className="text-sm text-gray-300 truncate flex-1 mr-2">{situacao}</p>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: `${IGNIS}22`, color: IGNIS_LIGHT }}>
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most draining */}
      {mostDraining && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-gray-500 mb-1">Maior dreno de energia:</p>
          <p className="text-sm text-gray-300">{mostDraining.situacao}</p>
          <p className="text-xs mt-1" style={{ color: IGNIS }}>
            Energia: {mostDraining.energia_gasta}/10
          </p>
        </div>
      )}
    </div>
  );
};

// ==========================
// SECTION: Insights
// ==========================
const Insights = ({ allEntries }) => {
  const insights = useMemo(() => {
    if (allEntries.length < 3) return null;

    // Frequency map
    const freq = {};
    allEntries.forEach((e) => {
      const key = e.situacao?.toLowerCase().trim();
      if (key) {
        if (!freq[key]) freq[key] = { count: 0, totalEnergy: 0, simCount: 0 };
        freq[key].count += 1;
        freq[key].totalEnergy += e.energia_gasta || 0;
        freq[key].simCount += e.disse_sim_queria_nao ? 1 : 0;
      }
    });

    const sorted = Object.entries(freq)
      .map(([situacao, data]) => ({ situacao, ...data, avgEnergy: data.totalEnergy / data.count }))
      .sort((a, b) => b.count - a.count);

    const topSources = sorted.slice(0, 5);
    const simPercentage = allEntries.length > 0
      ? Math.round((allEntries.filter((e) => e.disse_sim_queria_nao).length / allEntries.length) * 100)
      : 0;

    return { topSources, simPercentage, totalEntries: allEntries.length };
  }, [allEntries]);

  if (!insights || insights.topSources.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <TrendUpIcon className="w-10 h-10 mx-auto opacity-30" />
        <p className="text-sm text-gray-500">
          Preciso de pelo menos 3 registos para gerar insights.
        </p>
        <p className="text-xs text-gray-600 italic">
          Continua a registar — o autoconhecimento alimenta-se de dados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top sources */}
      <div>
        <h3
          className="text-base font-semibold text-gray-200 mb-4"
          style={{ fontFamily: HEADING_FONT }}
        >
          As tuas maiores fontes de dispersão
        </h3>
        <div className="space-y-3">
          {insights.topSources.map((source, i) => (
            <div
              key={source.situacao}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `${IGNIS}22`, color: IGNIS }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">{source.situacao}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{source.count}x</span>
                  <span className="text-xs text-gray-500">
                    Energia média: {source.avgEnergy.toFixed(1)}
                  </span>
                  {source.simCount > 0 && (
                    <span className="text-xs" style={{ color: IGNIS }}>
                      {source.simCount} sim(s) {source.simCount === 1 ? g('forcado', 'forcada') : g('forcados', 'forcadas')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sim percentage */}
      <div className="p-4 rounded-xl" style={{ background: `${IGNIS}10`, border: `1px solid ${IGNIS}22` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">
              Percentagem de vezes que disseste sim quando querias dizer não
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Em {insights.totalEntries} {insights.totalEntries === 1 ? 'registo' : 'registos'} totais
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: IGNIS, fontFamily: HEADING_FONT }}>
              {insights.simPercentage}%
            </p>
          </div>
        </div>
        {/* Visual bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${insights.simPercentage}%`,
              background: `linear-gradient(90deg, ${IGNIS}88, ${IGNIS})`
            }}
          />
        </div>
      </div>

      {/* Reflective message */}
      <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs text-gray-400 italic leading-relaxed">
          A dispersão não é fraqueza — é informação. Cada vez que a reconheces,
          a tua chama interior fica mais {g('forte', 'forte')}. O fogo não se alimenta do que te desvia,
          mas do que te chama.
        </p>
      </div>
    </div>
  );
};

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function RastreadorDispersao() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [activeTab, setActiveTab] = useState('registar');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Data
  const [todayEntries, setTodayEntries] = useState([]);
  const [weekEntries, setWeekEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const today = todayStr();
      const weekDates = getWeekDates();
      const weekStart = weekDates[0];

      // Fetch today's entries
      const { data: todayData, error: todayError } = await supabase
        .from('ignis_dispersao_log')
        .select('*')
        .eq('user_id', userId)
        .eq('data', today)
        .order('created_at', { ascending: false });

      if (todayError) throw todayError;
      setTodayEntries(todayData || []);

      // Fetch week entries
      const { data: weekData, error: weekError } = await supabase
        .from('ignis_dispersao_log')
        .select('*')
        .eq('user_id', userId)
        .gte('data', weekStart)
        .order('created_at', { ascending: false });

      if (weekError) throw weekError;
      setWeekEntries(weekData || []);

      // Fetch all entries (last 90 days for insights)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const { data: allData, error: allError } = await supabase
        .from('ignis_dispersao_log')
        .select('*')
        .eq('user_id', userId)
        .gte('data', ninetyDaysAgo.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (allError) throw allError;
      setAllEntries(allData || []);
    } catch (err) {
      console.error('Erro ao carregar dados de dispersão:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save new dispersal log
  const handleSave = useCallback(async (formData) => {
    if (!userId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('ignis_dispersao_log')
        .insert({
          user_id: userId,
          data: todayStr(),
          situacao: formData.situacao,
          disse_sim_queria_nao: formData.disse_sim_queria_nao,
          energia_gasta: formData.energia_gasta,
          porque_disse_sim: formData.porque_disse_sim
        });

      if (error) throw error;

      // Award chamas
      try {
        const { data: client } = await supabase
          .from('ignis_clients')
          .select('chamas_total')
          .eq('user_id', userId)
          .maybeSingle();

        if (client) {
          await supabase
            .from('ignis_clients')
            .update({ chamas_total: (client.chamas_total || 0) + 3 })
            .eq('user_id', userId);
        }
      } catch (chamaErr) {
        console.error('Erro ao atualizar chamas:', chamaErr);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Erro ao guardar dispersão:', err);
      alert('Erro ao guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, fetchData]);

  const todayTotalEnergy = useMemo(
    () => todayEntries.reduce((sum, e) => sum + (e.energia_gasta || 0), 0),
    [todayEntries]
  );

  // Tabs
  const TABS = [
    { key: 'registar', label: 'Registar' },
    { key: 'hoje', label: `Hoje (${todayEntries.length})` },
    { key: 'semana', label: 'Semana' },
    { key: 'insights', label: 'Insights' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${IGNIS_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="ignis" title="Rastreador de Dispersão" />
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${IGNIS}33`, borderTopColor: IGNIS }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${IGNIS_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ignis"
        title="Rastreador de Dispersão"
        subtitle="O que te desvia do essencial?"
      />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Rastreador de Dispersão">
        {/* Concept quote */}
        <div className="text-center py-5">
          <p className="text-xs text-gray-500 italic leading-relaxed max-w-xs mx-auto">
            &ldquo;Quantas vezes disseste sim quando querias dizer não?&rdquo;
          </p>
        </div>

        {/* Success toast */}
        {showSuccess && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center gap-3 animate-fadeIn"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
            role="status"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-sm text-green-300 font-medium">
                {g('Registado', 'Registada')}! +3 chamas
              </p>
              <p className="text-xs text-green-400/60">Consciência é o primeiro acto de vontade.</p>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div
          className="flex rounded-xl overflow-hidden mb-6"
          style={{ background: 'rgba(255,255,255,0.04)' }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-medium transition-all duration-200 ${
                activeTab === tab.key ? 'text-white' : 'text-gray-500'
              }`}
              style={activeTab === tab.key ? { background: `${IGNIS}33` } : undefined}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div id={`panel-${activeTab}`} role="tabpanel">
          {activeTab === 'registar' && (
            <div className="animate-fadeIn">
              <h2
                className="text-lg font-semibold text-white mb-5"
                style={{ fontFamily: HEADING_FONT }}
              >
                Nova dispersão
              </h2>
              <LogForm onSave={handleSave} saving={saving} />
            </div>
          )}

          {activeTab === 'hoje' && (
            <div className="animate-fadeIn">
              <h2
                className="text-lg font-semibold text-white mb-5"
                style={{ fontFamily: HEADING_FONT }}
              >
                Registo de hoje
              </h2>
              <TodayLog entries={todayEntries} totalEnergy={todayTotalEnergy} />
            </div>
          )}

          {activeTab === 'semana' && (
            <div className="animate-fadeIn">
              <h2
                className="text-lg font-semibold text-white mb-5"
                style={{ fontFamily: HEADING_FONT }}
              >
                Resumo semanal
              </h2>
              <WeeklySummary weekEntries={weekEntries} />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="animate-fadeIn">
              <h2
                className="text-lg font-semibold text-white mb-5"
                style={{ fontFamily: HEADING_FONT }}
              >
                Insights
              </h2>
              <Insights allEntries={allEntries} />
            </div>
          )}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .ignis-slider::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${IGNIS_LIGHT}, ${IGNIS});
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(193,99,74,0.4);
        }
        .ignis-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${IGNIS_LIGHT}, ${IGNIS});
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(193,99,74,0.4);
        }
      `}</style>
    </div>
  );
}
