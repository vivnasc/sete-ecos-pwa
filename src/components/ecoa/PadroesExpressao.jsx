import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../contexts/AuthContext';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';

// ============================================================
// ECOA — Padrões de Expressão
// Analytics dashboard: estatísticas, temas, evolução, insights
// Chakra: Vishuddha (Garganta) | Moeda: Ecos
// ============================================================

const ACCENT = '#4A90A4';
const ACCENT_DARK = '#1a2a34';
const ACCENT_LIGHT = '#6BAABB';
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)';

// ---- Sound wave decoration ----
const SoundWaveDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 40" className="w-full h-10 opacity-20" fill="none" stroke={ACCENT_LIGHT} strokeWidth="1.5">
      <path d="M10,20 Q30,5 50,20 Q70,35 90,20 Q110,5 130,20 Q150,35 170,20 Q190,5 200,20" />
      <path d="M10,20 Q30,10 50,20 Q70,30 90,20 Q110,10 130,20 Q150,30 170,20 Q190,10 200,20" opacity="0.5" />
    </svg>
  </div>
);

// ---- Simple bar chart component ----
const SimpleBarChart = ({ data, maxValue, label }) => {
  if (!data || data.length === 0) return null;
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {label && <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>}
      {data.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </span>
            <span className="text-xs font-medium" style={{ color: ACCENT_LIGHT }}>{item.value}</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                background: `linear-gradient(90deg, ${item.color || ACCENT}88, ${item.color || ACCENT})`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Stat card ----
const StatCard = ({ icon, value, label, sublabel }) => (
  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {value}
    </div>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
    {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
  </div>
);

// ---- Insight card ----
const InsightCard = ({ text, icon = '\uD83D\uDD0A' }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: ACCENT_SUBTLE }}>
    <span className="text-lg shrink-0">{icon}</span>
    <p className="text-sm text-gray-300 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {text}
    </p>
  </div>
);

// ---- Helper: get last 30 days date ----
function getLast30Days() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

// ---- Categorize sobre_o_que themes ----
function categorizeTema(texto) {
  if (!texto) return 'outro';
  const t = texto.toLowerCase();
  if (t.includes('limite') || t.includes('nao')) return 'limite';
  if (t.includes('necessidade') || t.includes('preciso')) return 'necessidade';
  if (t.includes('desacordo') || t.includes('discordo') || t.includes('opiniao')) return 'desacordo';
  if (t.includes('dor') || t.includes('magoou') || t.includes('feriu')) return 'dor';
  if (t.includes('verdade') || t.includes('honest')) return 'verdade';
  if (t.includes('medo') || t.includes('receio')) return 'medo';
  return 'outro';
}

const TEMA_LABELS = {
  limite: { label: 'Limites', icon: '\u2705', color: '#4A90A4' },
  necessidade: { label: 'Necessidades', icon: '\uD83D\uDCA7', color: '#6BAA7E' },
  desacordo: { label: 'Desacordos', icon: '\u26A1', color: '#D4A84B' },
  dor: { label: 'Dor', icon: '\uD83D\uDD25', color: '#C45B5B' },
  verdade: { label: 'Verdade', icon: '\uD83D\uDC8E', color: '#8B6BAA' },
  medo: { label: 'Medo', icon: '\uD83C\uDF19', color: '#5B7EC4' },
  outro: { label: 'Outros', icon: '\uD83D\uDD39', color: '#888' }
};

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function PadroesExpressao() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState({
    vozRecuperada: [],
    diarioVoz: [],
    cartas: [],
    exerciciosLog: [],
    comunicacaoLog: [],
    silenciamento: null
  });

  // Fetch all data
  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      setLoading(true);
      const desde = getLast30Days();

      try {
        const [vozRes, diarioRes, cartasRes, exerciciosRes, comunicacaoRes, silRes] = await Promise.all([
          supabase
            .from('ecoa_voz_recuperada')
            .select('*')
            .eq('user_id', userId)
            .gte('data', desde)
            .order('data', { ascending: false }),
          supabase
            .from('ecoa_diario_voz')
            .select('*')
            .eq('user_id', userId)
            .gte('data', desde)
            .order('data', { ascending: false }),
          supabase
            .from('ecoa_cartas')
            .select('*')
            .eq('user_id', userId)
            .gte('data', desde)
            .order('data', { ascending: false }),
          supabase
            .from('ecoa_exercicios_log')
            .select('*')
            .eq('user_id', userId)
            .gte('data', desde)
            .order('data', { ascending: false }),
          supabase
            .from('ecoa_comunicacao_log')
            .select('*')
            .eq('user_id', userId)
            .gte('data', desde)
            .order('data', { ascending: false }),
          supabase
            .from('ecoa_silenciamento')
            .select('zonas, pessoas, verdades_nao_ditas')
            .eq('user_id', userId)
            .maybeSingle()
        ]);

        setRawData({
          vozRecuperada: vozRes.data || [],
          diarioVoz: diarioRes.data || [],
          cartas: cartasRes.data || [],
          exerciciosLog: exerciciosRes.data || [],
          comunicacaoLog: comunicacaoRes.data || [],
          silenciamento: silRes.data || null
        });
      } catch (err) {
        console.error('Erro ao carregar dados de expressão:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  // ---- Computed analytics ----
  const analytics = useMemo(() => {
    const { vozRecuperada, diarioVoz, cartas, exerciciosLog, comunicacaoLog, silenciamento } = rawData;

    // Total expressions
    const totalExpressoes = vozRecuperada.length + diarioVoz.length + cartas.length + exerciciosLog.length;

    // Meios usados
    const meiosUsados = [
      { label: 'Texto (diário)', icon: '\u270D\uFE0F', value: diarioVoz.filter(d => d.tipo === 'texto').length, color: '#4A90A4' },
      { label: 'Cartas', icon: '\uD83D\uDCDD', value: cartas.length, color: '#6BAA7E' },
      { label: 'Micro-voz', icon: '\uD83C\uDFA4', value: vozRecuperada.length, color: '#D4A84B' },
      { label: 'Exercícios', icon: '\u2728', value: exerciciosLog.length, color: '#8B6BAA' }
    ];

    // Temas recorrentes (from sobre_o_que in voz_recuperada)
    const temaCount = {};
    vozRecuperada.forEach(v => {
      const tema = categorizeTema(v.sobre_o_que);
      temaCount[tema] = (temaCount[tema] || 0) + 1;
    });

    const temasRecorrentes = Object.entries(temaCount)
      .map(([key, count]) => ({
        label: TEMA_LABELS[key]?.label || key,
        icon: TEMA_LABELS[key]?.icon || '\uD83D\uDD39',
        value: count,
        color: TEMA_LABELS[key]?.color || '#888'
      }))
      .sort((a, b) => b.value - a.value);

    // Evolução assertividade: comunicação entries grouped by week
    const evolucaoSemanal = [];
    const weekMap = {};
    comunicacaoLog.forEach(entry => {
      const d = new Date(entry.created_at || entry.data);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });
    Object.entries(weekMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([week, count]) => {
        const weekDate = new Date(week);
        evolucaoSemanal.push({
          label: weekDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }),
          value: count,
          color: ACCENT
        });
      });

    // Zonas de silêncio que estão a abrir
    const zonasAbertas = [];
    if (silenciamento && Array.isArray(silenciamento.zonas)) {
      const zonasOrigem = silenciamento.zonas.map(z =>
        (typeof z === 'string' ? z : z?.zona || z?.nome || '').toLowerCase()
      ).filter(Boolean);

      // Check which zones have voice recovery
      const comQuemRecuperado = vozRecuperada.map(v => (v.com_quem || '').toLowerCase());

      zonasOrigem.forEach(zona => {
        const recuperadas = comQuemRecuperado.filter(cq => cq.includes(zona)).length;
        zonasAbertas.push({
          zona,
          label: zona.charAt(0).toUpperCase() + zona.slice(1),
          vozesRecuperadas: recuperadas,
          aAbrir: recuperadas > 0
        });
      });
    }

    // Tema dominante
    const temaDominante = temasRecorrentes.length > 0 ? temasRecorrentes[0] : null;

    // Zona que mais está a abrir
    const zonaAberta = zonasAbertas
      .filter(z => z.aAbrir)
      .sort((a, b) => b.vozesRecuperadas - a.vozesRecuperadas)[0] || null;

    return {
      totalExpressoes,
      meiosUsados,
      temasRecorrentes,
      evolucaoSemanal,
      zonasAbertas,
      comunicacaoTotal: comunicacaoLog.length,
      temaDominante,
      zonaAberta
    };
  }, [rawData]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="ecoa" title="Padrões de Expressão" subtitle="A tua voz em números" />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }} />
        </div>
      </div>
    );
  }

  const hasData = analytics.totalExpressoes > 0 || analytics.comunicacaoTotal > 0;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Padroes de Expressao"
        subtitle="A tua voz em numeros"
      />

      <SoundWaveDecoration className="-mt-1" />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Padrões de Expressão">
        {!hasData ? (
          // ---- EMPTY STATE ----
          <div className="text-center py-16 space-y-4 animate-fadeIn">
            <div className="text-4xl">{'\uD83D\uDCCA'}</div>
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Os teus padrões vão aparecer aqui
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Quando começares a usar os exercícios de expressão, diário de voz e comunicação assertiva,
              os teus padrões serão {g('analisado', 'analisados')} aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">

            {/* ---- STATS GRID ---- */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon="\uD83D\uDD0A"
                value={analytics.totalExpressoes}
                label="Vezes expressas"
                sublabel="nos últimos 30 dias"
              />
              <StatCard
                icon="\uD83D\uDCAC"
                value={analytics.comunicacaoTotal}
                label="Situações registadas"
                sublabel="comunicação assertiva"
              />
            </div>

            {/* ---- MEIOS USADOS ---- */}
            {analytics.meiosUsados.some(m => m.value > 0) && (
              <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Meios usados
                </h3>
                <SimpleBarChart data={analytics.meiosUsados.filter(m => m.value > 0)} />
              </div>
            )}

            {/* ---- TEMAS RECORRENTES ---- */}
            {analytics.temasRecorrentes.length > 0 && (
              <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Temas recorrentes
                </h3>
                <SimpleBarChart data={analytics.temasRecorrentes} />
              </div>
            )}

            {/* ---- EVOLUCAO DA ASSERTIVIDADE ---- */}
            {analytics.evolucaoSemanal.length > 0 && (
              <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Evolução da assertividade
                </h3>
                <p className="text-xs text-gray-500 mb-3">Registos de comunicação por semana</p>
                <SimpleBarChart data={analytics.evolucaoSemanal} />
              </div>
            )}

            {/* ---- ZONAS DE SILENCIO QUE ESTAO A ABRIR ---- */}
            {analytics.zonasAbertas.length > 0 && (
              <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Zonas de silêncio que estão a abrir
                </h3>
                <div className="space-y-3">
                  {analytics.zonasAbertas.map((zona, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: zona.aAbrir ? `${ACCENT}15` : 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{zona.aAbrir ? '\uD83D\uDD13' : '\uD83D\uDD12'}</span>
                        <div>
                          <span className="text-sm text-white">{zona.label}</span>
                          {zona.aAbrir && (
                            <p className="text-xs text-gray-500">{zona.vozesRecuperadas} {zona.vozesRecuperadas === 1 ? 'voz recuperada' : 'vozes recuperadas'}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: zona.aAbrir ? '#4ade80' : 'rgba(255,255,255,0.15)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---- INSIGHTS ---- */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Os teus insights
              </h3>

              <InsightCard
                text={`Já te expressaste ${analytics.totalExpressoes} ${analytics.totalExpressoes === 1 ? 'vez' : 'vezes'} este mês. Cada uma é um acto de coragem.`}
                icon="\uD83D\uDD0A"
              />

              {analytics.temaDominante && (
                <InsightCard
                  text={`As tuas maiores coragens são sobre ${analytics.temaDominante.label.toLowerCase()}. É aí que a tua voz mais precisa de ser ouvida.`}
                  icon={analytics.temaDominante.icon}
                />
              )}

              {analytics.zonaAberta && (
                <InsightCard
                  text={`A zona que mais está a abrir é "${analytics.zonaAberta.label}". O silêncio está a transformar-se em expressão.`}
                  icon="\uD83D\uDD13"
                />
              )}

              {analytics.comunicacaoTotal > 5 && (
                <InsightCard
                  text={`Já reflectiste sobre ${analytics.comunicacaoTotal} situações de comunicação. A consciência é o primeiro passo para a mudança.`}
                  icon="\uD83D\uDCAC"
                />
              )}

              {analytics.totalExpressoes === 0 && analytics.comunicacaoTotal > 0 && (
                <InsightCard
                  text={`Estás a reflectir sobre como comunicas — experimenta também os exercícios de expressão para fortalecer a tua voz.`}
                  icon="\u2728"
                />
              )}
            </div>

            {/* ---- MOTIVATIONAL NOTE ---- */}
            <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(74,144,164,0.08)' }}>
              <p className="text-sm text-gray-300 italic leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {g(
                  'Cada palavra que dizes é um eco que ressoa além de ti. Estás a construir uma voz que ninguém pode silenciar.',
                  'Cada palavra que dizes é um eco que ressoa além de ti. Estás a construir uma voz que ninguém pode silenciar.'
                )}
              </p>
            </div>
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
