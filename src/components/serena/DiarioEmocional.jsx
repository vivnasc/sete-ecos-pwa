import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { useAuth } from '../../contexts/AuthContext';
import { EMOCOES, CORPO_ZONAS } from '../../lib/serena/gamificacao';

// ============================================================
// SERENA — Diario Emocional
// Eco da Emocao & Fluidez (Svadhisthana)
// ============================================================

const ACCENT = '#6B8E9B';
const ACCENT_DARK = '#1a2e3a';
const ACCENT_LIGHT = '#8BADB8';
const ACCENT_SUBTLE = 'rgba(107,142,155,0.12)';

const STEP_LABELS = [
  { key: 'emocao', label: 'Emocao' },
  { key: 'intensidade', label: 'Intensidade' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'corpo', label: 'Corpo' },
  { key: 'reflexao', label: 'Reflexao' }
];

// ---- Wave SVG decorative background ----
const WaveDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="w-full h-16 opacity-20"
      fill={ACCENT}
    >
      <path d="M0,40 C200,100 400,0 600,50 C800,100 1000,10 1200,60 L1200,120 L0,120 Z" />
    </svg>
  </div>
);

const WaveTop = () => (
  <div className="pointer-events-none select-none absolute top-0 left-0 right-0 overflow-hidden" aria-hidden="true">
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className="w-full h-12 opacity-10"
      fill={ACCENT_LIGHT}
    >
      <path d="M0,60 C300,0 600,80 900,20 C1050,0 1150,40 1200,30 L1200,0 L0,0 Z" />
    </svg>
  </div>
);

// ---- Step progress indicator ----
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 py-4" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 32 : 10,
            height: 10,
            background: i <= current ? ACCENT : 'rgba(107,142,155,0.25)',
            boxShadow: i === current ? `0 0 8px ${ACCENT}55` : 'none'
          }}
        />
      </div>
    ))}
  </div>
);

// ---- Botao de navegacao ----
const NavButton = ({ onClick, disabled, children, primary = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200
      ${primary
        ? 'text-white shadow-lg hover:shadow-xl active:scale-[0.97]'
        : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10'
      }
      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
    `}
    style={primary ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` } : undefined}
  >
    {children}
  </button>
);

// ==========================
// Step 1: Emocao
// ==========================
const StepEmocao = ({ selected, onSelect }) => (
  <div className="space-y-4 animate-fadeIn">
    <div className="text-center mb-6">
      <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        O que sentes agora?
      </h2>
      <p className="text-sm text-gray-400 mt-1">Escolhe a emocao mais presente</p>
    </div>
    <div className="grid grid-cols-4 gap-3">
      {EMOCOES.map((em) => {
        const isSelected = selected === em.value;
        return (
          <button
            key={em.value}
            onClick={() => onSelect(em.value)}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200
              ${isSelected ? 'ring-2 scale-105 shadow-lg' : 'hover:bg-white/5 active:scale-95'}
            `}
            style={{
              background: isSelected ? `${em.cor}22` : 'rgba(255,255,255,0.04)',
              borderColor: isSelected ? em.cor : 'transparent',
              ringColor: isSelected ? em.cor : undefined,
              boxShadow: isSelected ? `0 4px 20px ${em.cor}33` : undefined
            }}
            aria-pressed={isSelected}
            aria-label={em.label}
          >
            <span className="text-2xl" role="img" aria-hidden="true">{em.icon}</span>
            <span className={`text-xs ${isSelected ? 'font-semibold' : 'text-gray-400'}`} style={isSelected ? { color: em.cor } : undefined}>
              {em.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ==========================
// Step 2: Intensidade
// ==========================
const StepIntensidade = ({ value, onChange, emocao }) => {
  const emObj = EMOCOES.find(e => e.value === emocao);
  const cor = emObj?.cor || ACCENT;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Qual a intensidade?
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {emObj ? `${emObj.icon} ${emObj.label}` : ''} — de 1 (leve) a 10 (muito forte)
        </p>
      </div>

      {/* Visual display */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="text-5xl font-bold transition-all duration-300"
          style={{ color: cor, textShadow: `0 0 20px ${cor}44` }}
        >
          {value}
        </div>
        <div className="w-full max-w-xs h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${value * 10}%`, background: `linear-gradient(90deg, ${cor}88, ${cor})` }}
          />
        </div>
      </div>

      {/* Scale buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`
              w-10 h-10 rounded-full text-sm font-medium transition-all duration-200
              ${n === value ? 'scale-110 shadow-lg text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}
            `}
            style={n === value ? { background: cor, boxShadow: `0 4px 16px ${cor}55` } : { background: 'rgba(255,255,255,0.06)' }}
            aria-label={`Intensidade ${n}`}
            aria-pressed={n === value}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Label */}
      <p className="text-center text-sm text-gray-500 italic">
        {value <= 3 ? 'Leve, quase um sussurro' : value <= 6 ? 'Presente, faz-se sentir' : value <= 8 ? 'Forte, dificil de ignorar' : 'Muito intenso, avassalador'}
      </p>
    </div>
  );
};

// ==========================
// Step 3: Trigger
// ==========================
const StepTrigger = ({ value, onChange }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="text-center mb-4">
      <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        O que provocou esta emocao?
      </h2>
      <p className="text-sm text-gray-400 mt-1">Opcional — podes avancar sem escrever</p>
    </div>
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uma conversa, uma memoria, algo que vi..."
        rows={4}
        maxLength={500}
        className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'transparent',
          focusRingColor: ACCENT
        }}
        aria-label="Descreve o que provocou esta emocao"
      />
      <span className="absolute bottom-3 right-3 text-xs text-gray-600">{value.length}/500</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {['Trabalho', 'Relacao', 'Familia', 'Saude', 'Dinheiro', 'Solidao', 'Sem razao clara'].map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(value ? `${value} ${tag}` : tag)}
          className="px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:bg-white/10"
          style={{ background: 'rgba(107,142,155,0.15)', color: ACCENT_LIGHT }}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);

// ==========================
// Step 4: Corpo
// ==========================
const StepCorpo = ({ selected, onSelect }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="text-center mb-4">
      <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Onde sentes no corpo?
      </h2>
      <p className="text-sm text-gray-400 mt-1">Onde esta emocao se manifesta fisicamente?</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {CORPO_ZONAS.map((zona) => {
        const isSelected = selected === zona.value;
        return (
          <button
            key={zona.value}
            onClick={() => onSelect(zona.value)}
            className={`
              flex items-center gap-3 p-4 rounded-xl transition-all duration-200
              ${isSelected ? 'ring-2 shadow-lg' : 'hover:bg-white/5 active:scale-[0.97]'}
            `}
            style={{
              background: isSelected ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
              ringColor: isSelected ? ACCENT : undefined,
              boxShadow: isSelected ? `0 4px 16px ${ACCENT}33` : undefined
            }}
            aria-pressed={isSelected}
          >
            <span className="text-2xl" role="img" aria-hidden="true">{zona.icon}</span>
            <span className={`text-sm ${isSelected ? 'font-semibold text-white' : 'text-gray-400'}`}>
              {zona.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ==========================
// Step 5: Reflexao
// ==========================
const StepReflexao = ({ value, onChange }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="text-center mb-4">
      <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Queres reflectir sobre isto?
      </h2>
      <p className="text-sm text-gray-400 mt-1">Opcional — um momento para ti</p>
    </div>
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="O que esta emocao quer me dizer? O que preciso agora?"
        rows={5}
        maxLength={1000}
        className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'transparent',
          focusRingColor: ACCENT
        }}
        aria-label="Reflexao livre sobre a emocao"
      />
      <span className="absolute bottom-3 right-3 text-xs text-gray-600">{value.length}/1000</span>
    </div>
    <div className="p-4 rounded-xl" style={{ background: 'rgba(107,142,155,0.08)' }}>
      <p className="text-xs text-gray-400 italic leading-relaxed">
        Nao ha respostas certas nem erradas. Este espaco e teu — escreve livremente,
        sem julgar. A agua nao forca o caminho, ela encontra-o.
      </p>
    </div>
  </div>
);

// ==========================
// Confirmacao pos-submit
// ==========================
const SuccessScreen = ({ emocao, onNovo, onHistorico }) => {
  const emObj = EMOCOES.find(e => e.value === emocao);
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ background: `${emObj?.cor || ACCENT}22`, boxShadow: `0 0 40px ${emObj?.cor || ACCENT}22` }}
        >
          {emObj?.icon || '💧'}
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm bg-green-500/20"
          aria-hidden="true"
        >
          ✓
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {g('Registado', 'Registada')} com carinho
        </h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Cada emocao que reconheces e uma gota de consciencia no teu oceano interior. +5 Gotas 💧
        </p>
      </div>
      <div className="flex gap-3 pt-4">
        <NavButton onClick={onNovo}>Novo registo</NavButton>
        <NavButton onClick={onHistorico} primary>Ver historico</NavButton>
      </div>
    </div>
  );
};

// ==========================
// Historico — Entrada individual
// ==========================
const HistoricoEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const emObj = EMOCOES.find(e => e.value === entry.emocao);
  const hora = new Date(entry.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const corpoZona = CORPO_ZONAS.find(z => z.value === entry.corpo_zona);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
      style={{ background: expanded ? 'rgba(107,142,155,0.08)' : 'rgba(255,255,255,0.03)' }}
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ background: `${emObj?.cor || ACCENT}22` }}
        >
          {emObj?.icon || '💧'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">{emObj?.label || entry.emocao}</span>
            <span className="text-xs text-gray-500">{hora}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* Intensity bar */}
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', maxWidth: 80 }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(entry.intensidade || 5) * 10}%`, background: emObj?.cor || ACCENT }}
              />
            </div>
            <span className="text-xs text-gray-500">{entry.intensidade}/10</span>
            {entry.trigger && (
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                — {entry.trigger}
              </span>
            )}
          </div>
        </div>
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
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
          {corpoZona && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{corpoZona.icon}</span>
              <span>Corpo: {corpoZona.label}</span>
            </div>
          )}
          {entry.trigger && (
            <div className="text-sm text-gray-400">
              <span className="font-medium text-gray-300">Trigger:</span> {entry.trigger}
            </div>
          )}
          {entry.reflexao && (
            <div className="text-sm text-gray-400">
              <span className="font-medium text-gray-300">Reflexao:</span> {entry.reflexao}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

// ==========================
// Historico — Vista principal
// ==========================
const HistoricoView = ({ userId, onVoltar }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from('serena_emocoes_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error('Erro ao carregar historico emocional:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [userId]);

  // Group by day
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
        />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 animate-fadeIn">
        <div className="text-4xl">💧</div>
        <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          O teu diario esta vazio
        </h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Quando registares a tua primeira emocao, ela aparecera aqui. Cada gota conta.
        </p>
        <NavButton onClick={onVoltar} primary>Registar agora</NavButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{entries.length} {entries.length === 1 ? 'registo' : 'registos'}</p>
      </div>
      {Object.entries(grouped).map(([date, dayEntries]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
            {date}
          </h3>
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <HistoricoEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function DiarioEmocional() {
  const { user, userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [view, setView] = useState('registar'); // 'registar' | 'historico'
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [emocao, setEmocao] = useState(null);
  const [intensidade, setIntensidade] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [corpoZona, setCorpoZona] = useState(null);
  const [reflexao, setReflexao] = useState('');

  const containerRef = useRef(null);

  const resetForm = useCallback(() => {
    setStep(0);
    setEmocao(null);
    setIntensidade(5);
    setTrigger('');
    setCorpoZona(null);
    setReflexao('');
    setShowSuccess(false);
  }, []);

  const canAdvance = useCallback(() => {
    switch (step) {
      case 0: return emocao !== null;
      case 1: return intensidade >= 1 && intensidade <= 10;
      case 2: return true; // trigger is optional
      case 3: return corpoZona !== null;
      case 4: return true; // reflexao is optional
      default: return false;
    }
  }, [step, emocao, intensidade, corpoZona]);

  const handleNext = useCallback(() => {
    if (step < 4 && canAdvance()) {
      setStep(s => s + 1);
      // Scroll to top of container on step change
      containerRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  }, [step, canAdvance]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!userId || !emocao || !corpoZona) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('serena_emocoes_log')
        .insert({
          user_id: userId,
          emocao,
          intensidade,
          trigger: trigger.trim() || null,
          corpo_zona: corpoZona,
          reflexao: reflexao.trim() || null
        });

      if (error) throw error;
      setShowSuccess(true);
    } catch (err) {
      console.error('Erro ao guardar emocao:', err);
      alert('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, emocao, intensidade, trigger, corpoZona, reflexao]);

  // View tabs
  const renderTabs = () => (
    <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => { setView('registar'); resetForm(); }}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'registar' ? 'text-white' : 'text-gray-500'}`}
        style={view === 'registar' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view === 'registar'}
      >
        Registar Emocao
      </button>
      <button
        onClick={() => setView('historico')}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
        style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view === 'historico'}
      >
        Historico
      </button>
    </div>
  );

  // Step content renderer
  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepEmocao selected={emocao} onSelect={setEmocao} />;
      case 1:
        return <StepIntensidade value={intensidade} onChange={setIntensidade} emocao={emocao} />;
      case 2:
        return <StepTrigger value={trigger} onChange={setTrigger} />;
      case 3:
        return <StepCorpo selected={corpoZona} onSelect={setCorpoZona} />;
      case 4:
        return <StepReflexao value={reflexao} onChange={setReflexao} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="serena"
        title="Diario Emocional"
        subtitle="Regista, observa, deixa fluir"
      />

      {/* Wave decoration */}
      <WaveDecoration className="-mt-1" />

      <div
        ref={containerRef}
        className="max-w-lg mx-auto px-4 pb-24"
        role="main"
        aria-label="Diario Emocional"
      >
        {renderTabs()}

        {view === 'historico' ? (
          <HistoricoView
            userId={userId}
            onVoltar={() => { setView('registar'); resetForm(); }}
          />
        ) : showSuccess ? (
          <SuccessScreen
            emocao={emocao}
            onNovo={() => { resetForm(); setView('registar'); }}
            onHistorico={() => { setView('historico'); }}
          />
        ) : (
          <>
            <StepIndicator current={step} total={5} />

            <div className="mt-2 mb-8">
              {renderStep()}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <div>
                {step > 0 && (
                  <NavButton onClick={handleBack}>
                    Voltar
                  </NavButton>
                )}
              </div>
              <div>
                {step < 4 ? (
                  <NavButton onClick={handleNext} disabled={!canAdvance()} primary>
                    Seguinte
                  </NavButton>
                ) : (
                  <NavButton onClick={handleSubmit} disabled={saving || !canAdvance()} primary>
                    {saving ? 'A guardar...' : 'Guardar registo'}
                  </NavButton>
                )}
              </div>
            </div>
          </>
        )}

        {/* Bottom wave decoration */}
        <WaveDecoration className="mt-12 rotate-180" />
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
