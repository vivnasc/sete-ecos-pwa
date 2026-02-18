import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../contexts/AuthContext';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';

// ============================================================
// ECOA — Afirmacoes Diarias
// Afirmacoes personalizadas baseadas em padroes de silenciamento
// Chakra: Vishuddha (Garganta) | Moeda: Ecos
// ============================================================

const ACCENT = '#4A90A4';
const ACCENT_DARK = '#1a2a34';
const ACCENT_LIGHT = '#6BAABB';
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)';

// ---- Mapeamento de padroes para afirmacoes ----
const AFIRMACAO_MAP = {
  casa: [
    'A minha voz importa na minha casa.',
    'Tenho o direito de falar no meu espaco.',
    'A minha casa e um lugar seguro para a minha verdade.'
  ],
  parceiro: [
    'Posso ser honesta na minha relacao.',
    'A minha verdade fortalece a minha relacao.',
    'Mereco ser ouvida pela pessoa que amo.'
  ],
  'nao mereco': [
    'A minha voz merece ser ouvida.',
    'O que eu sinto e valido.',
    'Mereco ocupar espaco com as minhas palavras.'
  ],
  'vou magoar': [
    'Posso ser honesta e gentil ao mesmo tempo.',
    'A verdade dita com amor cura.',
    'Nao sou responsavel pelas reaccoes dos outros a minha verdade.'
  ],
  limite: [
    'Os meus limites sao validos.',
    'Dizer nao e um acto de amor proprio.',
    'Tenho o direito de proteger o meu espaco.'
  ]
};

const DEFAULT_AFIRMACOES = [
  'A minha voz tem valor. Eu mereco ser ouvida.',
  'Cada palavra que digo e um acto de coragem.',
  'A minha verdade e o meu superpoder.'
];

// ---- Sound wave decorative SVG ----
const SoundWaveDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 40" className="w-full h-10 opacity-20" fill="none" stroke={ACCENT_LIGHT} strokeWidth="1.5">
      <path d="M10,20 Q30,5 50,20 Q70,35 90,20 Q110,5 130,20 Q150,35 170,20 Q190,5 200,20" />
      <path d="M10,20 Q30,10 50,20 Q70,30 90,20 Q110,10 130,20 Q150,30 170,20 Q190,10 200,20" opacity="0.5" />
    </svg>
  </div>
);

// ---- Detectar padrao dominante ----
function detectarPadrao(silenciamentoData) {
  if (!silenciamentoData) return null;

  const { zonas, pessoas, verdades_nao_ditas } = silenciamentoData;

  // Check zonas for casa
  if (Array.isArray(zonas) && zonas.some(z =>
    (typeof z === 'string' ? z : z?.zona || '').toLowerCase().includes('casa')
  )) {
    return 'casa';
  }

  // Check pessoas for parceiro
  if (Array.isArray(pessoas) && pessoas.some(p =>
    (typeof p === 'string' ? p : p?.pessoa || '').toLowerCase().match(/parceiro|marido|namorado|companheiro|parceira|esposa|namorada|companheira/)
  )) {
    return 'parceiro';
  }

  // Check verdades_nao_ditas
  if (Array.isArray(verdades_nao_ditas)) {
    for (const v of verdades_nao_ditas) {
      const texto = (typeof v === 'string' ? v : v?.verdade || v?.texto || '').toLowerCase();
      if (texto.includes('nao mereco') || texto.includes('nao valho')) return 'nao mereco';
      if (texto.includes('magoar') || texto.includes('ferir') || texto.includes('culpa')) return 'vou magoar';
    }
  }

  // Check zonas for limite
  if (Array.isArray(zonas) && zonas.some(z =>
    (typeof z === 'string' ? z : z?.zona || '').toLowerCase().match(/trabalho|chefe|amigos|familia/)
  )) {
    return 'limite';
  }

  return null;
}

function getAfirmacoes(padrao) {
  if (padrao && AFIRMACAO_MAP[padrao]) {
    return AFIRMACAO_MAP[padrao];
  }
  return DEFAULT_AFIRMACOES;
}

// ---- Historico entry ----
const HistoricoEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const data = new Date(entry.created_at).toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const afirmacoes = entry.afirmacoes || [];

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
      style={{ background: expanded ? ACCENT_SUBTLE : 'rgba(255,255,255,0.03)' }}
      aria-expanded={expanded}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ background: `${ACCENT}22` }}
          >
            {'\uD83D\uDD0A'}
          </div>
          <div>
            <span className="text-sm font-medium text-white">{data}</span>
            {entry.padrao_silenciamento && (
              <span className="text-xs text-gray-500 ml-2">({entry.padrao_silenciamento})</span>
            )}
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
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-fadeIn">
          {afirmacoes.map((af, i) => (
            <p key={i} className="text-sm text-gray-300 italic pl-2 border-l-2" style={{ borderColor: ACCENT }}>
              "{af}"
            </p>
          ))}
        </div>
      )}
    </button>
  );
};

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function AfirmacoesDiarias() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [view, setView] = useState('pratica'); // 'pratica' | 'historico'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [padrao, setPadrao] = useState(null);
  const [afirmacoes, setAfirmacoes] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [historico, setHistorico] = useState([]);

  // Fetch silenciamento patterns
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get silenciamento data
        const { data: silData } = await supabase
          .from('ecoa_silenciamento')
          .select('zonas, pessoas, verdades_nao_ditas')
          .eq('user_id', userId)
          .maybeSingle();

        const detectedPadrao = detectarPadrao(silData);
        setPadrao(detectedPadrao);
        setAfirmacoes(getAfirmacoes(detectedPadrao));

        // Check if already done today
        const hoje = new Date().toISOString().split('T')[0];
        const { data: todayLog } = await supabase
          .from('ecoa_afirmacoes_log')
          .select('id')
          .eq('user_id', userId)
          .eq('data', hoje)
          .maybeSingle();

        if (todayLog) {
          setSaved(true);
        }
      } catch (err) {
        console.error('Erro ao carregar dados de silenciamento:', err);
        setAfirmacoes(DEFAULT_AFIRMACOES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Fetch historico
  useEffect(() => {
    if (!userId || view !== 'historico') return;
    const fetchHistorico = async () => {
      try {
        const { data } = await supabase
          .from('ecoa_afirmacoes_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        setHistorico(data || []);
      } catch (err) {
        console.error('Erro ao carregar historico:', err);
      }
    };
    fetchHistorico();
  }, [userId, view]);

  const toggleCheck = useCallback((idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const allChecked = afirmacoes.length > 0 && afirmacoes.every((_, i) => checkedItems[i]);

  const handleSave = useCallback(async () => {
    if (!userId || !allChecked) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ecoa_afirmacoes_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          afirmacoes: afirmacoes,
          padrao_silenciamento: padrao || 'geral'
        });

      if (error) throw error;

      // Award 4 ecos
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('ecos_total')
        .eq('user_id', userId)
        .maybeSingle();

      if (clientData) {
        const novoTotal = (clientData.ecos_total || 0) + 4;
        await supabase
          .from('ecoa_clients')
          .update({ ecos_total: novoTotal })
          .eq('user_id', userId);
      }

      setSaved(true);
    } catch (err) {
      console.error('Erro ao guardar afirmacoes:', err);
      alert('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, allChecked, afirmacoes, padrao]);

  // ---- Tabs ----
  const renderTabs = () => (
    <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => setView('pratica')}
        className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'pratica' ? 'text-white' : 'text-gray-500'}`}
        style={view === 'pratica' ? { background: `${ACCENT}33` } : undefined}
        aria-pressed={view === 'pratica'}
      >
        Pratica Diaria
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

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="ecoa" title="Afirmacoes Diarias" subtitle="A tua voz interior" />
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Afirmacoes Diarias"
        subtitle="Reprograma a voz interior"
      />

      <SoundWaveDecoration className="-mt-1" />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Afirmacoes Diarias">
        {renderTabs()}

        {view === 'historico' ? (
          // ---- HISTORICO ----
          <div className="space-y-3 animate-fadeIn">
            {historico.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl">{'\uD83D\uDD0A'}</div>
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                  Ainda sem afirmacoes
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Quando completares a tua primeira pratica, ela aparecera aqui.
                </p>
                <button
                  onClick={() => setView('pratica')}
                  className="px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Comecar pratica
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{historico.length} {historico.length === 1 ? 'dia de pratica' : 'dias de pratica'}</p>
                {historico.map((entry) => (
                  <HistoricoEntry key={entry.id} entry={entry} />
                ))}
              </>
            )}
          </div>
        ) : (
          // ---- PRATICA DIARIA ----
          <div className="space-y-6 animate-fadeIn">
            {saved ? (
              // Success state
              <div className="flex flex-col items-center text-center py-12 space-y-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
                >
                  {'\uD83D\uDD0A'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Pratica {g('completo', 'completa')}!
                  </h2>
                  <p className="text-sm text-gray-400 max-w-xs">
                    A tua voz interior esta mais forte hoje. +4 Ecos {'\uD83D\uDD0A'}
                  </p>
                </div>
                <button
                  onClick={() => setView('historico')}
                  className="px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Ver historico
                </button>
              </div>
            ) : (
              <>
                {/* Pattern info */}
                {padrao && (
                  <div className="p-4 rounded-xl" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-xs text-gray-400">
                      Padrao {g('detectado', 'detectada')}: <span className="text-white font-medium">{padrao}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Estas afirmacoes foram {g('escolhido', 'escolhidas')} para ti com base no teu mapa de silenciamento.
                    </p>
                  </div>
                )}

                {/* Instructions */}
                <div className="text-center py-4">
                  <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Repete cada uma em voz alta 3 vezes
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    Lentamente. Com intencao. Marca quando terminares.
                  </p>
                </div>

                {/* Affirmations with checkboxes */}
                <div className="space-y-4">
                  {afirmacoes.map((af, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`w-full text-left p-5 rounded-xl transition-all duration-300 flex items-start gap-4 ${
                        checkedItems[idx] ? 'ring-1' : 'hover:bg-white/5'
                      }`}
                      style={{
                        background: checkedItems[idx] ? `${ACCENT}15` : 'rgba(255,255,255,0.04)',
                        ringColor: checkedItems[idx] ? ACCENT : undefined
                      }}
                      aria-pressed={!!checkedItems[idx]}
                    >
                      {/* Checkbox */}
                      <div
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200"
                        style={{
                          borderColor: checkedItems[idx] ? ACCENT : 'rgba(255,255,255,0.2)',
                          background: checkedItems[idx] ? ACCENT : 'transparent'
                        }}
                      >
                        {checkedItems[idx] && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Affirmation text */}
                      <div className="flex-1">
                        <p
                          className={`text-base leading-relaxed transition-all duration-200 ${
                            checkedItems[idx] ? 'text-white' : 'text-gray-300'
                          }`}
                          style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.1rem' }}
                        >
                          "{af}"
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Repete 3x em voz alta
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Save button */}
                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={!allChecked || saving}
                    className="w-full py-4 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: allChecked ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)' }}
                  >
                    {saving ? 'A guardar...' : allChecked ? `Concluir pratica (+4 Ecos ${'\uD83D\uDD0A'})` : 'Marca todas as afirmacoes para continuar'}
                  </button>
                </div>

                {/* Tip */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(74,144,164,0.08)' }}>
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    A repeticao em voz alta reprograma os padroes internos. Nao importa se nao acreditas no inicio
                    — a tua voz precisa de ouvir estas palavras vindas de ti.
                  </p>
                </div>
              </>
            )}
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
