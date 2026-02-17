import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../contexts/AuthContext';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { TEMPLATES_ASSERTIVIDADE } from '../../lib/ecoa/gamificacao';

// ============================================================
// ECOA — Comunicacao Assertiva
// Templates, pratica e diario de comunicacao
// Chakra: Vishuddha (Garganta) | Moeda: Ecos
// ============================================================

const ACCENT = '#4A90A4';
const ACCENT_DARK = '#1a2a34';
const ACCENT_LIGHT = '#6BAABB';
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)';

// ---- Icons for templates ----
const TEMPLATE_ICONS = {
  sentimento: '\uD83D\uDCAC',
  sanduiche: '\uD83E\uDD6A',
  disco_riscado: '\uD83D\uDCBF',
  pedido_claro: '\u2728'
};

// ---- Sound wave decoration ----
const SoundWaveDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 40" className="w-full h-10 opacity-20" fill="none" stroke={ACCENT_LIGHT} strokeWidth="1.5">
      <path d="M10,20 Q30,5 50,20 Q70,35 90,20 Q110,5 130,20 Q150,35 170,20 Q190,5 200,20" />
      <path d="M10,20 Q30,10 50,20 Q70,30 90,20 Q110,10 130,20 Q150,30 170,20 Q190,10 200,20" opacity="0.5" />
    </svg>
  </div>
);

// ---- Star rating ----
const StarRating = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        className="text-2xl transition-all duration-200 hover:scale-110"
        aria-label={`${n} estrelas`}
        aria-pressed={n <= value}
      >
        {n <= value ? '\u2B50' : '\u2606'}
      </button>
    ))}
  </div>
);

// ---- Extract template placeholders ----
function extractPlaceholders(template) {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/[[\]]/g, ''));
}

function buildSentence(template, values) {
  let result = template;
  const placeholders = extractPlaceholders(template);
  placeholders.forEach((ph, i) => {
    result = result.replace(`[${ph}]`, values[i] || `[${ph}]`);
  });
  return result;
}

// ---- Template card ----
const TemplateCard = ({ template, onPractice }) => (
  <div
    className="p-5 rounded-xl transition-all duration-200"
    style={{ background: 'rgba(255,255,255,0.04)' }}
  >
    <div className="flex items-start gap-3 mb-3">
      <span className="text-2xl">{TEMPLATE_ICONS[template.id] || '\uD83D\uDCAC'}</span>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white">{template.nome}</h3>
      </div>
    </div>

    {/* Template formula */}
    <div className="p-3 rounded-lg mb-3" style={{ background: `${ACCENT}15` }}>
      <p className="text-sm text-gray-300 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
        {template.template}
      </p>
    </div>

    {/* Example */}
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-1">Exemplo:</p>
      <p className="text-xs text-gray-400 italic leading-relaxed">
        {template.exemplo}
      </p>
    </div>

    <button
      onClick={() => onPractice(template)}
      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
      style={{ background: `${ACCENT}33`, color: ACCENT_LIGHT }}
    >
      Praticar
    </button>
  </div>
);

// ---- Practice view ----
const PracticeView = ({ template, onBack, onDone }) => {
  const placeholders = extractPlaceholders(template.template);
  const [values, setValues] = useState(Array(placeholders.length).fill(''));
  const [rating, setRating] = useState(0);

  const updateValue = (idx, val) => {
    setValues(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const allFilled = values.every(v => v.trim().length > 0);
  const preview = buildSentence(template.template, values);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
          aria-label="Voltar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
            {template.nome}
          </h2>
        </div>
        <span className="text-xl">{TEMPLATE_ICONS[template.id] || '\uD83D\uDCAC'}</span>
      </div>

      {/* Template reference */}
      <div className="p-3 rounded-xl" style={{ background: ACCENT_SUBTLE }}>
        <p className="text-sm text-gray-300 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
          {template.template}
        </p>
      </div>

      {/* Fill in the blanks */}
      <div className="space-y-4">
        {placeholders.map((ph, idx) => (
          <div key={idx} className="space-y-1.5">
            <label className="text-sm text-gray-400">{ph}</label>
            <input
              type="text"
              value={values[idx]}
              onChange={(e) => updateValue(idx, e.target.value)}
              placeholder={`Escreve: ${ph.toLowerCase()}`}
              maxLength={200}
              className="w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
              aria-label={ph}
            />
          </div>
        ))}
      </div>

      {/* Preview */}
      {allFilled && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-xl" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
            <p className="text-xs text-gray-500 mb-2">A tua frase:</p>
            <p className="text-base text-white leading-relaxed" style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.1rem' }}>
              "{preview}"
            </p>
          </div>

          {/* Rating */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-400">Como ficou?</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {rating > 0 && (
            <button
              onClick={() => onDone(preview, rating)}
              className="w-full py-4 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              Guardar pratica
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---- History entry ----
const HistoricoEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
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
          <span className="text-lg">{'\uD83D\uDCAC'}</span>
          <span className="text-sm font-medium text-white">{data}</span>
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
          {entry.situacao && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Situacao:</p>
              <p className="text-sm text-gray-300">{entry.situacao}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            {entry.como_comuniquei && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <p className="text-xs text-gray-500 mb-1">O que disse:</p>
                <p className="text-sm text-gray-300">{entry.como_comuniquei}</p>
              </div>
            )}
            {entry.como_gostaria && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(74,144,164,0.08)' }}>
                <p className="text-xs text-gray-500 mb-1">O que gostaria de ter dito:</p>
                <p className="text-sm text-gray-300">{entry.como_gostaria}</p>
              </div>
            )}
          </div>
          {entry.aprendizado && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(234,179,8,0.08)' }}>
              <p className="text-xs text-gray-500 mb-1">Aprendizado:</p>
              <p className="text-sm text-gray-300 italic">{entry.aprendizado}</p>
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
export default function ComunicacaoAssertiva() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [view, setView] = useState('templates'); // 'templates' | 'practice' | 'journal' | 'historico'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  // Journal state
  const [situacao, setSituacao] = useState('');
  const [comoComuniquei, setComoComuniquei] = useState('');
  const [comoGostaria, setComoGostaria] = useState('');
  const [aprendizado, setAprendizado] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  // Historico
  const [historico, setHistorico] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);

  // Fetch historico
  useEffect(() => {
    if (!userId || view !== 'historico') return;
    const fetchHistorico = async () => {
      setHistoricoLoading(true);
      try {
        const { data } = await supabase
          .from('ecoa_comunicacao_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        setHistorico(data || []);
      } catch (err) {
        console.error('Erro ao carregar historico:', err);
      } finally {
        setHistoricoLoading(false);
      }
    };
    fetchHistorico();
  }, [userId, view]);

  const handlePracticeDone = useCallback(async (frase, rating) => {
    // Practice complete — just show feedback, main ecos come from journal
    setView('templates');
    setSelectedTemplate(null);
  }, []);

  const handleJournalSave = useCallback(async () => {
    if (!userId || !situacao.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ecoa_comunicacao_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          situacao: situacao.trim(),
          como_comuniquei: comoComuniquei.trim() || null,
          como_gostaria: comoGostaria.trim() || null,
          aprendizado: aprendizado.trim() || null
        });

      if (error) throw error;

      // Award 8 ecos
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('ecos_total')
        .eq('user_id', userId)
        .maybeSingle();

      if (clientData) {
        const novoTotal = (clientData.ecos_total || 0) + 8;
        await supabase
          .from('ecoa_clients')
          .update({ ecos_total: novoTotal })
          .eq('user_id', userId);
      }

      setJournalSaved(true);
    } catch (err) {
      console.error('Erro ao guardar situacao:', err);
      alert('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, situacao, comoComuniquei, comoGostaria, aprendizado]);

  const resetJournal = useCallback(() => {
    setSituacao('');
    setComoComuniquei('');
    setComoGostaria('');
    setAprendizado('');
    setJournalSaved(false);
  }, []);

  // ---- Tabs ----
  const renderTabs = () => (
    <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
      {[
        { key: 'templates', label: 'Templates' },
        { key: 'journal', label: 'Diario' },
        { key: 'historico', label: 'Historico' }
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => {
            setView(tab.key);
            if (tab.key === 'journal') resetJournal();
          }}
          className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === tab.key ? 'text-white' : 'text-gray-500'}`}
          style={view === tab.key ? { background: `${ACCENT}33` } : undefined}
          aria-pressed={view === tab.key}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Comunicacao Assertiva"
        subtitle="Diz o que precisas, com clareza e coragem"
      />

      <SoundWaveDecoration className="-mt-1" />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Comunicacao Assertiva">
        {view !== 'practice' && renderTabs()}

        {view === 'practice' && selectedTemplate ? (
          // ---- PRACTICE MODE ----
          <PracticeView
            template={selectedTemplate}
            onBack={() => { setView('templates'); setSelectedTemplate(null); }}
            onDone={handlePracticeDone}
          />
        ) : view === 'journal' ? (
          // ---- JOURNAL ----
          <div className="space-y-6 animate-fadeIn">
            {journalSaved ? (
              <div className="flex flex-col items-center text-center py-12 space-y-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
                >
                  {'\uD83D\uDCAC'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Situacao registada!
                  </h2>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Cada reflexao sobre como comunicas e um passo para a tua voz autentica. +8 Ecos {'\uD83D\uDD0A'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetJournal}
                    className="px-5 py-3 rounded-xl text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/15 transition-all"
                  >
                    Nova situacao
                  </button>
                  <button
                    onClick={() => setView('historico')}
                    className="px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                  >
                    Ver historico
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Registar situacao
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Reflecte sobre como comunicaste e como gostarias de ter comunicado
                  </p>
                </div>

                {/* Situacao */}
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Situacao</label>
                  <textarea
                    value={situacao}
                    onChange={(e) => setSituacao(e.target.value)}
                    placeholder="O que aconteceu?"
                    rows={3}
                    maxLength={1000}
                    className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                    aria-label="Situacao"
                  />
                </div>

                {/* Como comuniquei */}
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Como comuniquei</label>
                  <textarea
                    value={comoComuniquei}
                    onChange={(e) => setComoComuniquei(e.target.value)}
                    placeholder="O que disseste ou fizeste na realidade?"
                    rows={3}
                    maxLength={1000}
                    className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ background: 'rgba(239,68,68,0.06)', focusRingColor: ACCENT }}
                    aria-label="Como comuniquei"
                  />
                </div>

                {/* Como gostaria */}
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Como gostaria de ter comunicado</label>
                  <textarea
                    value={comoGostaria}
                    onChange={(e) => setComoGostaria(e.target.value)}
                    placeholder="O que gostarias de ter dito ou feito?"
                    rows={3}
                    maxLength={1000}
                    className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ background: 'rgba(74,144,164,0.06)', focusRingColor: ACCENT }}
                    aria-label="Como gostaria de ter comunicado"
                  />
                </div>

                {/* Aprendizado */}
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Aprendizado</label>
                  <textarea
                    value={aprendizado}
                    onChange={(e) => setAprendizado(e.target.value)}
                    placeholder="O que aprendeste com esta situacao?"
                    rows={3}
                    maxLength={1000}
                    className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ background: 'rgba(234,179,8,0.06)', focusRingColor: ACCENT }}
                    aria-label="Aprendizado"
                  />
                </div>

                {/* Save */}
                <button
                  onClick={handleJournalSave}
                  disabled={!situacao.trim() || saving}
                  className="w-full py-4 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: situacao.trim() ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)' }}
                >
                  {saving ? 'A guardar...' : `Guardar registo (+8 Ecos ${'\uD83D\uDD0A'})`}
                </button>
              </>
            )}
          </div>
        ) : view === 'historico' ? (
          // ---- HISTORICO ----
          <div className="space-y-3 animate-fadeIn">
            {historicoLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }} />
              </div>
            ) : historico.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl">{'\uD83D\uDCAC'}</div>
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                  Ainda sem registos
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Quando registares a tua primeira situacao de comunicacao, ela aparecera aqui.
                </p>
                <button
                  onClick={() => { setView('journal'); resetJournal(); }}
                  className="px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Registar situacao
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{historico.length} {historico.length === 1 ? 'situacao' : 'situacoes'}</p>
                {historico.map((entry) => (
                  <HistoricoEntry key={entry.id} entry={entry} />
                ))}
              </>
            )}
          </div>
        ) : (
          // ---- TEMPLATES ----
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                Templates de Assertividade
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Formulas praticas para comunicar com clareza
              </p>
            </div>

            {TEMPLATES_ASSERTIVIDADE.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPractice={(t) => { setSelectedTemplate(t); setView('practice'); }}
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
