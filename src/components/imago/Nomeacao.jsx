import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { g } from '../../utils/genero';
import ModuleHeader from '../shared/ModuleHeader';

// ============================================================
// IMAGO — Nomeacao (Ritual de Auto-Nomeacao)
// Eco da Identidade (Sahasrara)
// "Como te nomeias agora?"
// ============================================================

const ACCENT = '#8B7BA5';
const ACCENT_DARK = '#1a1a2e';
const ACCENT_LIGHT = '#A99BC2';
const ACCENT_SUBTLE = 'rgba(139,123,165,0.12)';

const EXEMPLOS_NOMES = [
  'A que escolhe',
  'A que habita fronteira',
  'A indomavel',
  'A que renasceu',
  'A que volta a si',
  'A que se ouve'
];

// ---- Decorative crown SVG ----
const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_LIGHT} strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <path d="M2 17l3-11 5 6 2-8 2 8 5-6 3 11H2z" />
    <path d="M2 17h20v2H2z" fill={`${ACCENT_LIGHT}33`} />
  </svg>
);

// ---- Quill/feather icon for history ----
const FeatherIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

// ---- Sparkle icon for ritual button ----
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden="true">
    <path d="M12 2l1.09 3.26L16.36 6.36l-3.27 1.09L12 10.72l-1.09-3.27L7.64 6.36l3.27-1.1z" />
    <path d="M18 12l.72 2.18 2.28.82-2.28.82L18 18l-.72-2.18L15 15l2.28-.82z" />
    <path d="M6 14l.54 1.63 1.46.37-1.46.63L6 18l-.54-1.37L4 16l1.46-.63z" />
  </svg>
);

// ---- Timeline dot ----
const TimelineDot = ({ isFirst }) => (
  <div className="flex flex-col items-center" aria-hidden="true">
    <div
      className="w-3 h-3 rounded-full border-2 shrink-0"
      style={{
        borderColor: ACCENT,
        background: isFirst ? ACCENT : 'transparent'
      }}
    />
    <div className="w-0.5 flex-1 min-h-[24px]" style={{ background: `${ACCENT}33` }} />
  </div>
);

// ==========================
// Seccao: Introducao
// ==========================
const IntroSection = () => (
  <div className="text-center space-y-4 py-6 animate-fadeInImago">
    <div className="flex justify-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
      >
        <CrownIcon />
      </div>
    </div>
    <div>
      <h2
        className="text-xl font-semibold text-white"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Ritual de Nomeacao
      </h2>
      <p className="text-sm text-gray-400 mt-3 leading-relaxed max-w-sm mx-auto">
        Nomear-se e um acto de poder. O nome que escolhes agora reflecte quem es neste momento
        — nao para sempre, mas para agora. Os nomes evoluem contigo.
      </p>
    </div>
  </div>
);

// ==========================
// Seccao: Nome actual
// ==========================
const NomeActualDisplay = ({ nome, significado }) => (
  <div className="text-center py-8 space-y-3 animate-fadeInImago">
    <p className="text-xs uppercase tracking-widest text-gray-500">
      {g('Sou chamado', 'Sou chamada')}
    </p>
    <h2
      className="text-3xl font-bold text-white leading-tight"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        textShadow: `0 0 30px ${ACCENT}44`
      }}
    >
      {nome}
    </h2>
    {significado && (
      <p className="text-sm text-gray-400 italic max-w-xs mx-auto leading-relaxed">
        &ldquo;{significado}&rdquo;
      </p>
    )}
    <div
      className="w-16 h-0.5 mx-auto rounded-full mt-4"
      style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
      aria-hidden="true"
    />
  </div>
);

// ==========================
// Seccao: Formulario
// ==========================
const NomeForm = ({ nome, setNome, significado, setSignificado, onSubmit, saving, hasExisting }) => (
  <div className="space-y-5 animate-fadeInImago">
    <div>
      <label htmlFor="nome-input" className="block text-sm font-medium text-gray-300 mb-2">
        {hasExisting ? 'Novo nome' : 'Como te nomeias agora?'}
      </label>
      <input
        id="nome-input"
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: A que escolhe..."
        maxLength={100}
        className="w-full p-4 rounded-xl text-white placeholder-gray-500 text-lg focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          fontFamily: "'Cormorant Garamond', serif",
          focusRingColor: ACCENT
        }}
        aria-label="O teu nome escolhido"
      />
      <p className="text-xs text-gray-600 mt-1 text-right">{nome.length}/100</p>
    </div>

    <div>
      <label htmlFor="significado-input" className="block text-sm font-medium text-gray-300 mb-2">
        Significado
      </label>
      <textarea
        id="significado-input"
        value={significado}
        onChange={(e) => setSignificado(e.target.value)}
        placeholder="Porque escolheste este nome? O que representa para ti agora?"
        rows={4}
        maxLength={500}
        className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          focusRingColor: ACCENT
        }}
        aria-label="Significado do nome escolhido"
      />
      <p className="text-xs text-gray-600 mt-1 text-right">{significado.length}/500</p>
    </div>

    <button
      onClick={onSubmit}
      disabled={saving || !nome.trim()}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-white transition-all duration-300 hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
        boxShadow: nome.trim() ? `0 4px 20px ${ACCENT}44` : 'none'
      }}
      aria-label={hasExisting ? 'Actualizar nome' : 'Completar ritual de nomeacao'}
    >
      <SparkleIcon />
      <span>{saving ? 'A consagrar...' : hasExisting ? 'Renomear-me' : 'Ritual de Nomeacao'}</span>
    </button>
  </div>
);

// ==========================
// Seccao: Exemplos inspiradores
// ==========================
const ExemplosInspiradores = ({ onSelect }) => (
  <div className="space-y-3 animate-fadeInImago">
    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
      <FeatherIcon />
      Inspiracoes
    </h3>
    <div className="flex flex-wrap gap-2">
      {EXEMPLOS_NOMES.map((exemplo) => (
        <button
          key={exemplo}
          onClick={() => onSelect(exemplo)}
          className="px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: ACCENT_SUBTLE,
            color: ACCENT_LIGHT,
            border: `1px solid ${ACCENT}33`
          }}
          aria-label={`Usar o nome: ${exemplo}`}
        >
          {exemplo}
        </button>
      ))}
    </div>
  </div>
);

// ==========================
// Seccao: Historico de nomes (timeline)
// ==========================
const HistoricoNomes = ({ historico }) => {
  if (!historico || historico.length === 0) return null;

  // Ordenar do mais recente ao mais antigo
  const sorted = [...historico].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="space-y-4 animate-fadeInImago">
      <h3
        className="text-lg font-semibold text-white"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Nomes que ja habitei
      </h3>
      <div className="space-y-0">
        {sorted.map((item, i) => {
          const dataFormatada = new Date(item.data).toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          return (
            <div key={`${item.nome}-${item.data}-${i}`} className="flex gap-3">
              <TimelineDot isFirst={i === 0} />
              <div className="pb-6 flex-1 min-w-0">
                <p
                  className="text-base font-medium text-white/90"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {item.nome}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{dataFormatada}</p>
                {item.significado && (
                  <p className="text-sm text-gray-400 mt-1 italic leading-relaxed">
                    &ldquo;{item.significado}&rdquo;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================
// Sucesso apos ritual
// ==========================
const SuccessScreen = ({ nome, onContinue }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeInImago">
    <div className="relative">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}33` }}
      >
        <CrownIcon />
      </div>
      <div
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm"
        style={{ background: `${ACCENT}33`, color: ACCENT_LIGHT }}
        aria-hidden="true"
      >
        ✓
      </div>
    </div>
    <div>
      <h2
        className="text-xl font-semibold text-white mb-2"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {g('Es agora nomeado', 'Es agora nomeada')}
      </h2>
      <p
        className="text-2xl font-bold mt-3"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: ACCENT_LIGHT,
          textShadow: `0 0 20px ${ACCENT}44`
        }}
      >
        {nome}
      </p>
      <p className="text-sm text-gray-400 max-w-xs mx-auto mt-4 leading-relaxed">
        Este nome e teu. Usa-o como ancora, como lembrete de quem escolhes ser.
        Quando sentires que ja nao te serve, volta e renomeia-te.
      </p>
    </div>
    <button
      onClick={onContinue}
      className="px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:shadow-xl active:scale-[0.97]"
      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
    >
      Continuar
    </button>
  </div>
);

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function Nomeacao() {
  const navigate = useNavigate();
  const { user, userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Dados existentes
  const [nomeActual, setNomeActual] = useState('');
  const [significadoActual, setSignificadoActual] = useState('');
  const [historicoNomes, setHistoricoNomes] = useState([]);
  const [existingEntryId, setExistingEntryId] = useState(null);

  // Formulario
  const [novoNome, setNovoNome] = useState('');
  const [novoSignificado, setNovoSignificado] = useState('');

  // ---- Carregar dados existentes ----
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('imago_nomeacao')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingEntryId(data.id);
        setNomeActual(data.nome_actual || '');
        setSignificadoActual(data.significado || '');
        setHistoricoNomes(data.historico_nomes || []);
      }
    } catch (err) {
      console.error('Erro ao carregar nomeacao:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Guardar/Actualizar nome ----
  const handleSubmit = useCallback(async () => {
    if (!userId || !novoNome.trim()) return;
    setSaving(true);

    try {
      const hoje = new Date().toISOString().split('T')[0];
      const nomeClean = novoNome.trim();
      const sigClean = novoSignificado.trim() || null;

      if (existingEntryId && nomeActual) {
        // Actualizar entrada existente — mover nome actual para historico
        const novoHistorico = [
          ...(historicoNomes || []),
          {
            nome: nomeActual,
            significado: significadoActual || null,
            data: hoje
          }
        ];

        const { error } = await supabase
          .from('imago_nomeacao')
          .update({
            nome_actual: nomeClean,
            significado: sigClean,
            historico_nomes: novoHistorico,
            data: hoje
          })
          .eq('id', existingEntryId);

        if (error) throw error;

        setHistoricoNomes(novoHistorico);
      } else {
        // Criar nova entrada
        const { data, error } = await supabase
          .from('imago_nomeacao')
          .insert({
            user_id: userId,
            nome_actual: nomeClean,
            significado: sigClean,
            historico_nomes: [],
            data: hoje
          })
          .select('id')
          .single();

        if (error) throw error;
        setExistingEntryId(data.id);
        setHistoricoNomes([]);
      }

      // Actualizar imago_clients.nomeacao_actual
      try {
        await supabase
          .from('imago_clients')
          .update({ nomeacao_actual: nomeClean })
          .eq('user_id', userId);
      } catch (clientErr) {
        // Nao bloquear se imago_clients nao existir ou falhar
        console.warn('Aviso: nao foi possivel actualizar imago_clients:', clientErr);
      }

      setNomeActual(nomeClean);
      setSignificadoActual(sigClean || '');
      setNovoNome('');
      setNovoSignificado('');
      setShowSuccess(true);
    } catch (err) {
      console.error('Erro ao guardar nomeacao:', err);
      alert('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, novoNome, novoSignificado, existingEntryId, nomeActual, significadoActual, historicoNomes]);

  // ---- Seleccionar exemplo ----
  const handleExemploSelect = useCallback((exemplo) => {
    setNovoNome(exemplo);
  }, []);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader
          eco="imago"
          title="Nomeacao"
          subtitle="Como te nomeias agora?"
        />
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
            role="status"
            aria-label="A carregar"
          />
        </div>
      </div>
    );
  }

  // ---- Success state ----
  if (showSuccess) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader
          eco="imago"
          title="Nomeacao"
          subtitle="Como te nomeias agora?"
        />
        <div className="max-w-lg mx-auto px-4">
          <SuccessScreen
            nome={nomeActual}
            onContinue={() => setShowSuccess(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="imago"
        title="Nomeacao"
        subtitle="Como te nomeias agora?"
      />

      <div
        className="max-w-lg mx-auto px-4 pb-24 space-y-8"
        role="main"
        aria-label="Ritual de Nomeacao"
      >
        {/* Introducao */}
        <IntroSection />

        {/* Nome actual (se existir) */}
        {nomeActual && (
          <NomeActualDisplay
            nome={nomeActual}
            significado={significadoActual}
          />
        )}

        {/* Separador */}
        {nomeActual && (
          <div className="flex items-center gap-4" aria-hidden="true">
            <div className="flex-1 h-px" style={{ background: `${ACCENT}22` }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {g('Pronto', 'Pronta')} para mudar?
            </p>
            <div className="flex-1 h-px" style={{ background: `${ACCENT}22` }} />
          </div>
        )}

        {/* Formulario */}
        <NomeForm
          nome={novoNome}
          setNome={setNovoNome}
          significado={novoSignificado}
          setSignificado={setNovoSignificado}
          onSubmit={handleSubmit}
          saving={saving}
          hasExisting={!!nomeActual}
        />

        {/* Exemplos inspiradores */}
        <ExemplosInspiradores onSelect={handleExemploSelect} />

        {/* Historico de nomes */}
        {historicoNomes.length > 0 && (
          <>
            <div className="flex items-center gap-4" aria-hidden="true">
              <div className="flex-1 h-px" style={{ background: `${ACCENT}22` }} />
              <p className="text-xs text-gray-500 uppercase tracking-wider">Linha do tempo</p>
              <div className="flex-1 h-px" style={{ background: `${ACCENT}22` }} />
            </div>
            <HistoricoNomes historico={historicoNomes} />
          </>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeInImago {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInImago {
          animation: fadeInImago 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
