import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../contexts/AuthContext';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';

// ============================================================
// IGNIS — 3 Escolhas Conscientes
// Eco da Vontade & Direccao Consciente (Manipura)
//
// Conceito central:
//   "Isto serve-me ou serve expectativas alheias?"
//   Cada escolha e uma decisao alinhada, nao uma tarefa.
// ============================================================

const ACCENT = '#C1634A';
const ACCENT_DARK = '#2e1a14';
const ACCENT_LIGHT = '#D4836E';
const ACCENT_SUBTLE = 'rgba(193,99,74,0.12)';

const HEADING_FONT = "'Cormorant Garamond', serif";

// ---- Flame SVG decorative ----
const FlameDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="w-full h-16 opacity-15"
      fill={ACCENT}
    >
      <path d="M0,80 C100,20 200,90 300,40 C400,0 500,70 600,30 C700,0 800,60 900,25 C1000,0 1100,50 1200,20 L1200,120 L0,120 Z" />
    </svg>
  </div>
);

// ---- Fire icon ----
const FireIcon = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={{ width: size, height: size }}>
    <path
      d="M12 2C12 2 8.5 7 8.5 11.5C8.5 14.5 10 17 12 18C14 17 15.5 14.5 15.5 11.5C15.5 7 12 2 12 2Z"
      fill={ACCENT}
      opacity="0.7"
    />
    <path
      d="M12 6C12 6 10 9 10 11.5C10 13.5 11 15 12 15.5C13 15 14 13.5 14 11.5C14 9 12 6 12 6Z"
      fill={ACCENT_LIGHT}
    />
  </svg>
);

// ---- Chevron icon ----
const ChevronIcon = ({ expanded }) => (
  <svg
    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ---- Spinner ----
const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div
      className="w-8 h-8 border-2 rounded-full animate-spin"
      style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
    />
  </div>
);

// ---- Determinar modo baseado na hora ----
function getModeByTime() {
  const hour = new Date().getHours();
  // Antes das 19h: registar; a partir das 19h: review
  return hour >= 19 ? 'review' : 'register';
}

// ---- Formatar data para display ----
function formatDatePT(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

// ============================
// Toggle: "Serve-me" vs "Expectativas alheias"
// ============================
const AlinhamentoToggle = ({ value, onChange }) => {
  const isMe = value === 'serve-me';
  const isOther = value === 'expectativas';

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('serve-me')}
        className={`
          flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200
          ${isMe ? 'text-white shadow-lg' : 'text-gray-400 hover:text-gray-300'}
        `}
        style={{
          background: isMe
            ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`
            : 'rgba(255,255,255,0.04)',
          boxShadow: isMe ? `0 4px 16px ${ACCENT}33` : 'none'
        }}
        aria-pressed={isMe}
        aria-label="Serve-me a mim"
      >
        Serve-me a mim
      </button>
      <button
        type="button"
        onClick={() => onChange('expectativas')}
        className={`
          flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200
          ${isOther ? 'text-white shadow-lg' : 'text-gray-400 hover:text-gray-300'}
        `}
        style={{
          background: isOther
            ? 'linear-gradient(135deg, #6B5B73, #3D2E45)'
            : 'rgba(255,255,255,0.04)',
          boxShadow: isOther ? '0 4px 16px rgba(107,91,115,0.33)' : 'none'
        }}
        aria-pressed={isOther}
        aria-label="Serve expectativas alheias"
      >
        Expectativas alheias
      </button>
    </div>
  );
};

// ============================
// Selector de Valor (Bussola)
// ============================
const ValorSelector = ({ valores, selected, onChange }) => {
  if (!valores || valores.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">
        Valor da Bussola (opcional)
      </label>
      <div className="flex flex-wrap gap-2">
        {valores.map((valor, idx) => {
          const isSelected = selected === valor;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(isSelected ? null : valor)}
              className={`
                px-3 py-1.5 rounded-full text-xs transition-all duration-200
                ${isSelected ? 'text-white font-medium' : 'text-gray-400 hover:text-gray-300'}
              `}
              style={{
                background: isSelected ? `${ACCENT}55` : 'rgba(255,255,255,0.06)',
                border: isSelected ? `1px solid ${ACCENT}` : '1px solid transparent'
              }}
              aria-pressed={isSelected}
            >
              {valor}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================
// Card de uma Escolha (Registar)
// ============================
const EscolhaCard = ({ num, escolha, reflexao, alinhamento, valorSel, valores, onEscolhaChange, onReflexaoChange, onAlinhamentoChange, onValorChange }) => (
  <div
    className="rounded-2xl p-5 space-y-4 transition-all duration-200"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
  >
    {/* Header */}
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
      >
        {num}
      </div>
      <h3 className="text-sm font-semibold text-white" style={{ fontFamily: HEADING_FONT }}>
        Escolha {num}
      </h3>
    </div>

    {/* Input: Hoje escolho... */}
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">Hoje escolho...</label>
      <input
        type="text"
        value={escolha}
        onChange={(e) => onEscolhaChange(e.target.value)}
        placeholder={
          num === 1 ? 'Ex: Dizer nao ao que nao me serve'
            : num === 2 ? 'Ex: Dedicar 30 min ao que importa'
              : 'Ex: Honrar o meu ritmo sem culpa'
        }
        maxLength={200}
        className="w-full p-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          focusRingColor: ACCENT
        }}
        aria-label={`Escolha ${num}: O que escolho hoje`}
      />
    </div>

    {/* Input: Porque escolhi isto? */}
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">Porque escolhi isto?</label>
      <textarea
        value={reflexao}
        onChange={(e) => onReflexaoChange(e.target.value)}
        placeholder="Esta escolha serve-me porque..."
        rows={2}
        maxLength={500}
        className="w-full p-3 rounded-xl text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          focusRingColor: ACCENT
        }}
        aria-label={`Escolha ${num}: Reflexao sobre a escolha`}
      />
    </div>

    {/* Toggle: Serve-me vs expectativas */}
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">
        Isto serve-me ou serve expectativas alheias?
      </label>
      <AlinhamentoToggle value={alinhamento} onChange={onAlinhamentoChange} />
    </div>

    {/* Valor da Bussola */}
    <ValorSelector valores={valores} selected={valorSel} onChange={onValorChange} />
  </div>
);

// ============================
// Card de uma Escolha (Review)
// ============================
const EscolhaReviewCard = ({ num, escolha, reflexao, alinhamento, cumpriu, onCumpriuChange }) => (
  <div
    className="rounded-2xl p-5 space-y-3 transition-all duration-200"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
  >
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5"
        style={{
          background: cumpriu === true
            ? 'linear-gradient(135deg, #4A9B6F, #2D5E42)'
            : cumpriu === false
              ? 'linear-gradient(135deg, #9B4A5E, #5E2D3A)'
              : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`
        }}
      >
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{escolha || <span className="text-gray-500 italic">(sem escolha)</span>}</p>
        {reflexao && <p className="text-xs text-gray-400 mt-1">{reflexao}</p>}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: alinhamento === 'serve-me' ? `${ACCENT}22` : 'rgba(107,91,115,0.22)',
              color: alinhamento === 'serve-me' ? ACCENT_LIGHT : '#A89BB5'
            }}
          >
            {alinhamento === 'serve-me' ? 'Serve-me' : alinhamento === 'expectativas' ? 'Expectativas' : ''}
          </span>
        </div>
      </div>
    </div>

    {/* Cumpriu toggle */}
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">
        Cumpri esta escolha?
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onCumpriuChange(true)}
          className={`
            flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
            ${cumpriu === true ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
          `}
          style={{
            background: cumpriu === true ? 'linear-gradient(135deg, #4A9B6F, #2D5E42)' : 'rgba(255,255,255,0.04)',
            boxShadow: cumpriu === true ? '0 4px 16px rgba(74,155,111,0.33)' : 'none'
          }}
          aria-pressed={cumpriu === true}
        >
          Sim, cumpri
        </button>
        <button
          type="button"
          onClick={() => onCumpriuChange(false)}
          className={`
            flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
            ${cumpriu === false ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
          `}
          style={{
            background: cumpriu === false ? 'linear-gradient(135deg, #9B4A5E, #5E2D3A)' : 'rgba(255,255,255,0.04)',
            boxShadow: cumpriu === false ? '0 4px 16px rgba(155,74,94,0.33)' : 'none'
          }}
          aria-pressed={cumpriu === false}
        >
          Nao cumpri
        </button>
      </div>
    </div>
  </div>
);

// ============================
// Historico — Dia individual
// ============================
const HistoricoDia = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const escolhas = [entry.escolha_1, entry.escolha_2, entry.escolha_3].filter(Boolean);
  const reflexoes = [entry.reflexao_1, entry.reflexao_2, entry.reflexao_3];
  const alinhamentos = Array.isArray(entry.alinhamento_valores)
    ? entry.alinhamento_valores
    : [];

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
      style={{ background: expanded ? ACCENT_SUBTLE : 'rgba(255,255,255,0.03)' }}
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${ACCENT}22` }}
        >
          <FireIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              {formatDatePT(entry.data)}
            </span>
            <div className="flex items-center gap-2">
              {entry.review_feito && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                  {g('Revisto', 'Revista')}
                </span>
              )}
              <ChevronIcon expanded={expanded} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {escolhas.length} {escolhas.length === 1 ? 'escolha' : 'escolhas'}
            {entry.review_nocturno ? ' + reflexao nocturna' : ''}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
          {[1, 2, 3].map((num) => {
            const escolha = entry[`escolha_${num}`];
            const reflexao = entry[`reflexao_${num}`];
            const alinhar = alinhamentos[num - 1] || {};
            if (!escolha) return null;

            return (
              <div key={num} className="space-y-1">
                <div className="flex items-start gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ background: `${ACCENT}55` }}
                  >
                    {num}
                  </span>
                  <div>
                    <p className="text-sm text-white">{escolha}</p>
                    {reflexao && <p className="text-xs text-gray-400 mt-0.5">{reflexao}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {alinhar.tipo && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: alinhar.tipo === 'serve-me' ? `${ACCENT}22` : 'rgba(107,91,115,0.22)',
                            color: alinhar.tipo === 'serve-me' ? ACCENT_LIGHT : '#A89BB5'
                          }}
                        >
                          {alinhar.tipo === 'serve-me' ? 'Serve-me' : 'Expectativas'}
                        </span>
                      )}
                      {alinhar.valor && (
                        <span className="text-xs text-gray-500">{alinhar.valor}</span>
                      )}
                      {typeof alinhar.cumpriu === 'boolean' && (
                        <span className={`text-xs ${alinhar.cumpriu ? 'text-green-400' : 'text-red-400'}`}>
                          {alinhar.cumpriu ? 'Cumpriu' : 'Nao cumpriu'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {entry.review_nocturno && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-gray-500 font-medium mb-1">Reflexao nocturna:</p>
              <p className="text-sm text-gray-300 italic">{entry.review_nocturno}</p>
            </div>
          )}
        </div>
      )}
    </button>
  );
};

// ============================
// Ecra de sucesso
// ============================
const SuccessScreen = ({ type, chamas, onVoltar }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
    <div className="relative">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
      >
        <FireIcon size={40} />
      </div>
      <div
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm bg-green-500/20 text-green-400"
        aria-hidden="true"
      >
        ✓
      </div>
    </div>
    <div>
      <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: HEADING_FONT }}>
        {type === 'register'
          ? `Escolhas ${g('registados', 'registadas')} com intencao`
          : `Review nocturno ${g('completo', 'completa')}`
        }
      </h2>
      <p className="text-sm text-gray-400 max-w-xs">
        {type === 'register'
          ? `Tres decisoes conscientes que honram quem es. +${chamas} Chamas`
          : `Reflectir sobre as tuas escolhas fortalece a tua direccao. +${chamas} Chamas`
        }
      </p>
    </div>
    <button
      onClick={onVoltar}
      className="px-6 py-3 rounded-xl text-white font-medium text-sm shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.97]"
      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
    >
      Voltar
    </button>
  </div>
);

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EscolhasConscientes() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  // State: modo e UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState('register');
  const [successChamas, setSuccessChamas] = useState(5);
  const [view, setView] = useState('form'); // 'form' | 'historico'

  // Data de hoje
  const hoje = new Date().toISOString().split('T')[0];

  // Escolhas de hoje (se existem)
  const [todayEntry, setTodayEntry] = useState(null);

  // Valores da Bussola
  const [valores, setValores] = useState([]);

  // Historico (ultimos 7 dias)
  const [historico, setHistorico] = useState([]);

  // ----- Estado do REGISTER -----
  const [escolha1, setEscolha1] = useState('');
  const [escolha2, setEscolha2] = useState('');
  const [escolha3, setEscolha3] = useState('');
  const [reflexao1, setReflexao1] = useState('');
  const [reflexao2, setReflexao2] = useState('');
  const [reflexao3, setReflexao3] = useState('');
  const [alinhamento1, setAlinhamento1] = useState(null);
  const [alinhamento2, setAlinhamento2] = useState(null);
  const [alinhamento3, setAlinhamento3] = useState(null);
  const [valor1, setValor1] = useState(null);
  const [valor2, setValor2] = useState(null);
  const [valor3, setValor3] = useState(null);

  // ----- Estado do REVIEW -----
  const [cumpriu1, setCumpriu1] = useState(null);
  const [cumpriu2, setCumpriu2] = useState(null);
  const [cumpriu3, setCumpriu3] = useState(null);
  const [oQueAprendi, setOQueAprendi] = useState('');
  const [reviewNocturno, setReviewNocturno] = useState('');

  // Determinar modo
  const timeMode = getModeByTime();
  const isReviewMode = todayEntry && !todayEntry.review_feito && timeMode === 'review';
  const isAlreadyRegistered = !!todayEntry;
  const isFullyDone = todayEntry?.review_feito;

  // ---- Carregar dados iniciais ----
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Carregar em paralelo: escolhas de hoje, valores, historico
      const [escolhasRes, valoresRes, historicoRes] = await Promise.all([
        supabase
          .from('ignis_escolhas')
          .select('*')
          .eq('user_id', userId)
          .eq('data', hoje)
          .maybeSingle(),
        supabase
          .from('ignis_valores')
          .select('valores')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('ignis_escolhas')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: false })
          .limit(7)
      ]);

      if (escolhasRes.data) {
        setTodayEntry(escolhasRes.data);
      }

      if (valoresRes.data?.valores && Array.isArray(valoresRes.data.valores)) {
        // Extrair nomes dos valores (pode ser array de strings ou objectos)
        const vals = valoresRes.data.valores.map(v =>
          typeof v === 'string' ? v : (v?.nome || v?.valor || '')
        ).filter(Boolean);
        setValores(vals);
      }

      if (historicoRes.data) {
        // Filtrar o dia de hoje do historico (mostra-se separadamente)
        setHistorico(historicoRes.data.filter(e => e.data !== hoje));
      }
    } catch (err) {
      console.error('Erro ao carregar dados Ignis Escolhas:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, hoje]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Award chamas ----
  const awardChamas = useCallback(async (amount) => {
    if (!userId) return;
    try {
      // Buscar total actual
      const { data: client } = await supabase
        .from('ignis_clients')
        .select('chamas_total')
        .eq('user_id', userId)
        .maybeSingle();

      if (client) {
        await supabase
          .from('ignis_clients')
          .update({
            chamas_total: (client.chamas_total || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    } catch (err) {
      console.error('Erro ao actualizar chamas:', err);
    }
  }, [userId]);

  // ---- Guardar escolhas (REGISTER) ----
  const handleSaveEscolhas = useCallback(async () => {
    if (!userId) return;
    if (!escolha1.trim() && !escolha2.trim() && !escolha3.trim()) return;

    setSaving(true);
    try {
      const alinhamentoData = [
        { tipo: alinhamento1, valor: valor1 },
        { tipo: alinhamento2, valor: valor2 },
        { tipo: alinhamento3, valor: valor3 }
      ];

      const { data, error } = await supabase
        .from('ignis_escolhas')
        .upsert({
          user_id: userId,
          data: hoje,
          escolha_1: escolha1.trim() || null,
          escolha_2: escolha2.trim() || null,
          escolha_3: escolha3.trim() || null,
          reflexao_1: reflexao1.trim() || null,
          reflexao_2: reflexao2.trim() || null,
          reflexao_3: reflexao3.trim() || null,
          alinhamento_valores: alinhamentoData,
          review_feito: false
        }, { onConflict: 'user_id,data' })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Award 5 chamas
      await awardChamas(5);

      setTodayEntry(data);
      setSuccessType('register');
      setSuccessChamas(5);
      setShowSuccess(true);
    } catch (err) {
      console.error('Erro ao guardar escolhas:', err);
      alert('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, hoje, escolha1, escolha2, escolha3, reflexao1, reflexao2, reflexao3, alinhamento1, alinhamento2, alinhamento3, valor1, valor2, valor3, awardChamas]);

  // ---- Guardar review (REVIEW) ----
  const handleSaveReview = useCallback(async () => {
    if (!userId || !todayEntry) return;

    setSaving(true);
    try {
      // Combinar dados de cumprimento no alinhamento_valores
      const existingAlin = Array.isArray(todayEntry.alinhamento_valores)
        ? todayEntry.alinhamento_valores
        : [];
      const updatedAlin = [
        { ...(existingAlin[0] || {}), cumpriu: cumpriu1, aprendi: null },
        { ...(existingAlin[1] || {}), cumpriu: cumpriu2, aprendi: null },
        { ...(existingAlin[2] || {}), cumpriu: cumpriu3, aprendi: null }
      ];

      // Combinar "o que aprendi" e review nocturno
      const reviewText = [
        oQueAprendi.trim() ? `O que aprendi: ${oQueAprendi.trim()}` : '',
        reviewNocturno.trim() || ''
      ].filter(Boolean).join('\n\n');

      const { error } = await supabase
        .from('ignis_escolhas')
        .update({
          alinhamento_valores: updatedAlin,
          review_nocturno: reviewText || null,
          review_feito: true
        })
        .eq('id', todayEntry.id);

      if (error) throw error;

      // Award 7 chamas for review
      await awardChamas(7);

      setTodayEntry(prev => ({ ...prev, review_feito: true, review_nocturno: reviewText }));
      setSuccessType('review');
      setSuccessChamas(7);
      setShowSuccess(true);
    } catch (err) {
      console.error('Erro ao guardar review:', err);
      alert('Nao foi possivel guardar o review. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, todayEntry, cumpriu1, cumpriu2, cumpriu3, oQueAprendi, reviewNocturno, awardChamas]);

  // ---- Validacao ----
  const canSaveEscolhas = escolha1.trim() || escolha2.trim() || escolha3.trim();
  const canSaveReview = (cumpriu1 !== null || cumpriu2 !== null || cumpriu3 !== null) || reviewNocturno.trim();

  // ---- Render: Tabs ----
  const renderTabs = () => (
    <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => { setView('form'); setShowSuccess(false); }}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'form' ? 'text-white' : 'text-gray-500'}`}
        style={view === 'form' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view === 'form'}
      >
        {isReviewMode ? 'Review Nocturno' : 'Escolhas de Hoje'}
      </button>
      <button
        onClick={() => { setView('historico'); setShowSuccess(false); }}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
        style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view === 'historico'}
      >
        Historico
      </button>
    </div>
  );

  // ---- Render: REGISTER mode ----
  const renderRegister = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro text */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-400">
          Tres decisoes conscientes. Nao tarefas — escolhas alinhadas.
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          &ldquo;Isto serve-me ou serve expectativas alheias?&rdquo;
        </p>
      </div>

      {/* Escolha 1 */}
      <EscolhaCard
        num={1}
        escolha={escolha1}
        reflexao={reflexao1}
        alinhamento={alinhamento1}
        valorSel={valor1}
        valores={valores}
        onEscolhaChange={setEscolha1}
        onReflexaoChange={setReflexao1}
        onAlinhamentoChange={setAlinhamento1}
        onValorChange={setValor1}
      />

      {/* Escolha 2 */}
      <EscolhaCard
        num={2}
        escolha={escolha2}
        reflexao={reflexao2}
        alinhamento={alinhamento2}
        valorSel={valor2}
        valores={valores}
        onEscolhaChange={setEscolha2}
        onReflexaoChange={setReflexao2}
        onAlinhamentoChange={setAlinhamento2}
        onValorChange={setValor2}
      />

      {/* Escolha 3 */}
      <EscolhaCard
        num={3}
        escolha={escolha3}
        reflexao={reflexao3}
        alinhamento={alinhamento3}
        valorSel={valor3}
        valores={valores}
        onEscolhaChange={setEscolha3}
        onReflexaoChange={setReflexao3}
        onAlinhamentoChange={setAlinhamento3}
        onValorChange={setValor3}
      />

      {/* Save button */}
      <button
        onClick={handleSaveEscolhas}
        disabled={!canSaveEscolhas || saving}
        className="w-full py-4 rounded-xl text-white font-medium text-sm shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
      >
        {saving ? 'A guardar...' : `Registar escolhas (+5 Chamas)`}
      </button>
    </div>
  );

  // ---- Render: Already registered (day view, not review time yet) ----
  const renderAlreadyRegistered = () => {
    if (!todayEntry) return null;
    const alin = Array.isArray(todayEntry.alinhamento_valores) ? todayEntry.alinhamento_valores : [];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div
          className="text-center p-4 rounded-xl"
          style={{ background: ACCENT_SUBTLE }}
        >
          <FireIcon size={24} className="mx-auto mb-2" />
          <p className="text-sm text-white font-medium">
            As tuas 3 escolhas de hoje ja foram {g('registados', 'registadas')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isFullyDone
              ? `Review nocturno ${g('completo', 'completa')}! Volta amanha.`
              : 'O review nocturno fica disponivel a partir das 19h.'
            }
          </p>
        </div>

        {/* Show today's choices read-only */}
        {[1, 2, 3].map(num => {
          const escolha = todayEntry[`escolha_${num}`];
          if (!escolha) return null;
          const reflexao = todayEntry[`reflexao_${num}`];
          const al = alin[num - 1] || {};
          return (
            <div
              key={num}
              className="rounded-2xl p-4 space-y-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `${ACCENT}55` }}
                >
                  {num}
                </span>
                <p className="text-sm text-white">{escolha}</p>
              </div>
              {reflexao && <p className="text-xs text-gray-400 pl-8">{reflexao}</p>}
              {al.tipo && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full ml-8 inline-block"
                  style={{
                    background: al.tipo === 'serve-me' ? `${ACCENT}22` : 'rgba(107,91,115,0.22)',
                    color: al.tipo === 'serve-me' ? ACCENT_LIGHT : '#A89BB5'
                  }}
                >
                  {al.tipo === 'serve-me' ? 'Serve-me' : 'Expectativas'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ---- Render: REVIEW mode ----
  const renderReview = () => {
    if (!todayEntry) return null;
    const alin = Array.isArray(todayEntry.alinhamento_valores) ? todayEntry.alinhamento_valores : [];

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Intro */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: HEADING_FONT }}>
            Review Nocturno
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Olha para as tuas escolhas de hoje com honestidade e compaixao.
          </p>
        </div>

        {/* Review de cada escolha */}
        <EscolhaReviewCard
          num={1}
          escolha={todayEntry.escolha_1}
          reflexao={todayEntry.reflexao_1}
          alinhamento={alin[0]?.tipo}
          cumpriu={cumpriu1}
          onCumpriuChange={setCumpriu1}
        />
        <EscolhaReviewCard
          num={2}
          escolha={todayEntry.escolha_2}
          reflexao={todayEntry.reflexao_2}
          alinhamento={alin[1]?.tipo}
          cumpriu={cumpriu2}
          onCumpriuChange={setCumpriu2}
        />
        <EscolhaReviewCard
          num={3}
          escolha={todayEntry.escolha_3}
          reflexao={todayEntry.reflexao_3}
          alinhamento={alin[2]?.tipo}
          cumpriu={cumpriu3}
          onCumpriuChange={setCumpriu3}
        />

        {/* O que aprendi */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">O que aprendi hoje?</label>
          <textarea
            value={oQueAprendi}
            onChange={(e) => setOQueAprendi(e.target.value)}
            placeholder="Uma licao, um padrao que notei, algo que quero lembrar..."
            rows={3}
            maxLength={500}
            className="w-full p-3 rounded-xl text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              focusRingColor: ACCENT
            }}
            aria-label="O que aprendi com as escolhas de hoje"
          />
        </div>

        {/* Review nocturno principal */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">Como me sinto sobre as minhas escolhas de hoje?</label>
          <textarea
            value={reviewNocturno}
            onChange={(e) => setReviewNocturno(e.target.value)}
            placeholder={`${g('Sinto-me', 'Sinto-me')} ${g('alinhado', 'alinhada')} porque... / Amanha quero...`}
            rows={3}
            maxLength={500}
            className="w-full p-3 rounded-xl text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              focusRingColor: ACCENT
            }}
            aria-label="Reflexao nocturna sobre as escolhas de hoje"
          />
        </div>

        {/* Inspirational note */}
        <div className="p-4 rounded-xl" style={{ background: ACCENT_SUBTLE }}>
          <p className="text-xs text-gray-400 italic leading-relaxed">
            Nao se trata de perfeccao. O fogo nao e perfeito — e {g('vivo', 'viva')}.
            Cada escolha consciente, cumprida ou nao, e um acto de presenca.
          </p>
        </div>

        {/* Save review button */}
        <button
          onClick={handleSaveReview}
          disabled={!canSaveReview || saving}
          className="w-full py-4 rounded-xl text-white font-medium text-sm shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
        >
          {saving ? 'A guardar...' : 'Guardar review (+7 Chamas)'}
        </button>
      </div>
    );
  };

  // ---- Render: Historico ----
  const renderHistorico = () => {
    if (historico.length === 0) {
      return (
        <div className="text-center py-16 space-y-4 animate-fadeIn">
          <FireIcon size={40} className="mx-auto" />
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: HEADING_FONT }}>
            Sem historico ainda
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Quando registares as tuas primeiras escolhas conscientes, elas aparecerao aqui.
          </p>
          <button
            onClick={() => setView('form')}
            className="px-6 py-3 rounded-xl text-white font-medium text-sm shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.97]"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
          >
            Registar agora
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3 animate-fadeIn pb-8">
        <p className="text-sm text-gray-400">
          Ultimos {historico.length} {historico.length === 1 ? 'dia' : 'dias'}
        </p>
        {historico.map((entry) => (
          <HistoricoDia key={entry.id} entry={entry} />
        ))}
      </div>
    );
  };

  // ---- Render: conteudo principal do form ----
  const renderFormContent = () => {
    if (showSuccess) {
      return (
        <SuccessScreen
          type={successType}
          chamas={successChamas}
          onVoltar={() => {
            setShowSuccess(false);
            loadData();
          }}
        />
      );
    }

    if (isReviewMode) {
      return renderReview();
    }

    if (isAlreadyRegistered) {
      return renderAlreadyRegistered();
    }

    return renderRegister();
  };

  // ============ RENDER PRINCIPAL ============
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ignis"
        title="3 Escolhas Conscientes"
        subtitle="Decisoes alinhadas, nao tarefas"
      />

      {/* Flame decoration */}
      <FlameDecoration className="-mt-1" />

      <div
        className="max-w-lg mx-auto px-4 pb-24"
        role="main"
        aria-label="Escolhas Conscientes"
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            {renderTabs()}
            {view === 'historico' ? renderHistorico() : renderFormContent()}
          </>
        )}

        {/* Bottom decoration */}
        <FlameDecoration className="mt-12 rotate-180" />
      </div>

      {/* CSS animations */}
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
