// src/components/ventis/NaturezaConexao.jsx
// Actividades de conexao com a natureza — VENTIS

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ACTIVIDADES_NATUREZA } from '../../lib/ventis/gamificacao';

// ===== ICONES SVG =====

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const JournalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// ===== CONSTANTES =====

const TABS = [
  { id: 'explorar', label: 'Actividades' },
  { id: 'diario', label: 'Diario' }
];

// ===== UTILIDADES =====

function parseDuracaoMinutos(duracao) {
  if (!duracao) return null;
  const match = duracao.match(/^(\d+)\s*min/);
  if (match) return parseInt(match[1], 10);
  return null;
}

function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

function formatarData(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getNumeroSemana(dateStr) {
  const d = new Date(dateStr);
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

function getSemanaLabel(dateStr) {
  const d = new Date(dateStr);
  const semana = getNumeroSemana(dateStr);
  const ano = d.getFullYear();

  // Calcular inicio e fim da semana
  const dia = d.getDay();
  const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);
  const inicioSemana = new Date(d);
  inicioSemana.setDate(diff);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  const opts = { day: 'numeric', month: 'short' };
  return `${inicioSemana.toLocaleDateString('pt', opts)} — ${fimSemana.toLocaleDateString('pt', opts)}, ${ano}`;
}

// ===== COMPONENTE: CARTAO DE ACTIVIDADE =====

function ActividadeCard({ actividade, onSelect }) {
  return (
    <button
      onClick={() => onSelect(actividade)}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 bg-[#1a2e24]/80 border border-[#5D9B84]/20 hover:border-[#5D9B84]/50 hover:bg-[#1a2e24]"
      aria-label={`${actividade.nome} — ${actividade.duracao}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">{actividade.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white/90 text-sm truncate">{actividade.nome}</h3>
          <p className="text-xs text-white/50 line-clamp-2 mt-0.5">{actividade.descricao}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#5D9B84]/70 shrink-0">
          <ClockIcon />
          <span>{actividade.duracao}</span>
        </div>
      </div>
    </button>
  );
}

// ===== COMPONENTE: TIMER CIRCULAR =====

function TimerCircular({ duracaoSegundos, tempoRestante }) {
  const progresso = duracaoSegundos > 0
    ? ((duracaoSegundos - tempoRestante) / duracaoSegundos) * 100
    : 0;

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="rgba(93,155,132,0.15)"
          strokeWidth="6"
        />
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="#5D9B84"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 44}`}
          strokeDashoffset={`${2 * Math.PI * 44 * (1 - progresso / 100)}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white/90 tabular-nums">
          {formatarTempo(tempoRestante)}
        </span>
      </div>
    </div>
  );
}

// ===== COMPONENTE: SESSAO DE ACTIVIDADE =====

function SessaoActividade({ actividade, userId, onBack, onSaved }) {
  const duracaoMinutos = parseDuracaoMinutos(actividade.duracao);
  const duracaoSegundos = duracaoMinutos ? duracaoMinutos * 60 : 0;

  const [timerAtivo, setTimerAtivo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(duracaoSegundos);
  const [timerConcluido, setTimerConcluido] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const [reflexao, setReflexao] = useState('');
  const [descricaoVisual, setDescricaoVisual] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);
  const intervalRef = useRef(null);

  const limparInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerAtivo && tempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            limparInterval();
            setTimerAtivo(false);
            setTimerConcluido(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return limparInterval;
  }, [timerAtivo, tempoRestante, limparInterval]);

  const handleIniciar = () => {
    setIniciado(true);
    setTempoRestante(duracaoSegundos);
    setTimerAtivo(true);
  };

  const toggleTimer = () => {
    if (timerConcluido) return;
    setTimerAtivo(prev => !prev);
  };

  const handleSalvar = async () => {
    if (!userId) return;
    setSalvando(true);
    setErro(null);

    try {
      const { error: dbError } = await supabase
        .from('ventis_natureza_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString(),
          actividade: actividade.id,
          foto_url: descricaoVisual.trim() || null,
          reflexao: reflexao.trim() || null
        });

      if (dbError) throw dbError;

      setSalvo(true);
      onSaved?.();
    } catch (err) {
      console.error('Erro ao guardar actividade:', err);
      setErro('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f2018 0%, #1a2e24 50%, #0f2018 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f2018]/95 backdrop-blur-sm border-b border-[#5D9B84]/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/70 transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeftIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white/90 truncate">{actividade.nome}</h2>
            <p className="text-xs text-[#5D9B84]">{actividade.duracao}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Info da actividade */}
        <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 text-center space-y-3">
          <span className="text-5xl">{actividade.icon}</span>
          <h3
            className="text-xl font-bold text-white/90"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {actividade.nome}
          </h3>
          <p className="text-white/70 leading-relaxed text-sm">{actividade.descricao}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-[#5D9B84]">
            <ClockIcon />
            <span>Duracao sugerida: {actividade.duracao}</span>
          </div>
        </div>

        {/* Botao Iniciar (antes de comecar) */}
        {!iniciado && !timerConcluido && (
          <button
            onClick={handleIniciar}
            className="w-full py-4 rounded-2xl bg-[#5D9B84] text-white font-semibold hover:bg-[#4d8a73] transition-colors text-lg"
          >
            Iniciar 🍃
          </button>
        )}

        {/* Timer em execucao */}
        {iniciado && !timerConcluido && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 flex flex-col items-center gap-4">
            <TimerCircular
              duracaoSegundos={duracaoSegundos}
              tempoRestante={tempoRestante}
            />
            <button
              onClick={toggleTimer}
              className={`
                flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                ${timerAtivo
                  ? 'bg-white/10 text-white/80 hover:bg-white/15'
                  : 'bg-[#5D9B84] text-white hover:bg-[#4d8a73]'
                }
              `}
              aria-label={timerAtivo ? 'Pausar' : 'Retomar'}
            >
              {timerAtivo ? <PauseIcon /> : <PlayIcon />}
              <span>{timerAtivo ? 'Pausar' : 'Retomar'}</span>
            </button>
          </div>
        )}

        {/* Pos-actividade: Reflexao */}
        {timerConcluido && !salvo && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 space-y-5 animate-fadeIn">
            {/* Reflexao */}
            <div>
              <label htmlFor="reflexao-input" className="block text-sm font-medium text-[#5D9B84] mb-2">
                O que sentiste? 🍃
              </label>
              <textarea
                id="reflexao-input"
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder={g('Descreve o que sentiste...', 'Descreve o que sentiste...')}
                rows={3}
                maxLength={500}
                className="w-full bg-[#0f2018]/60 border border-[#5D9B84]/20 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/50 resize-none transition-colors"
              />
              <p className="text-xs text-white/30 mt-1 text-right">{reflexao.length}/500</p>
            </div>

            {/* Nota visual (substitui foto) */}
            <div>
              <label htmlFor="visual-input" className="block text-sm font-medium text-[#5D9B84] mb-2">
                Descreve o que viste (opcional)
              </label>
              <textarea
                id="visual-input"
                value={descricaoVisual}
                onChange={(e) => setDescricaoVisual(e.target.value)}
                placeholder="Cores, formas, luz, texturas..."
                rows={2}
                maxLength={300}
                className="w-full bg-[#0f2018]/60 border border-[#5D9B84]/20 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/50 resize-none transition-colors"
              />
              <p className="text-xs text-white/30 mt-1 text-right">{descricaoVisual.length}/300</p>
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              onClick={handleSalvar}
              disabled={salvando}
              className={`
                w-full py-3.5 rounded-xl font-semibold transition-all
                ${salvando
                  ? 'bg-[#5D9B84]/30 text-white/40 cursor-wait'
                  : 'bg-[#5D9B84] text-white hover:bg-[#4d8a73]'
                }
              `}
            >
              {salvando ? 'A guardar...' : 'Guardar experiencia'}
            </button>
          </div>
        )}

        {/* Confirmacao */}
        {salvo && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-6 border border-[#5D9B84]/20 text-center space-y-3 animate-fadeIn">
            <div className="text-4xl">🍃</div>
            <p className="text-white/90 font-medium">
              Experiencia registada! +6 Folhas
            </p>
            <p className="text-sm text-white/50">
              Cada momento na natureza fortalece o teu ritmo interior.
            </p>
            <button
              onClick={onBack}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#5D9B84]/20 text-[#5D9B84] font-medium hover:bg-[#5D9B84]/30 transition-colors"
            >
              Voltar as actividades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTE: DIARIO =====

function Diario({ userId }) {
  const [experiencias, setExperiencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [actividadeFavorita, setActividadeFavorita] = useState(null);

  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      return;
    }

    const carregar = async () => {
      try {
        const { data: logs } = await supabase
          .from('ventis_natureza_log')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: false })
          .limit(50);

        if (logs) {
          setExperiencias(logs);
          setTotalCount(logs.length);

          // Actividade favorita
          const contagem = {};
          logs.forEach(l => {
            contagem[l.actividade] = (contagem[l.actividade] || 0) + 1;
          });
          const maxAct = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
          if (maxAct) {
            const actInfo = ACTIVIDADES_NATUREZA.find(a => a.id === maxAct[0]);
            setActividadeFavorita(actInfo || null);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar diario:', err);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [userId]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#5D9B84]/30 border-t-[#5D9B84] rounded-full animate-spin" />
        <p className="text-sm text-white/40">A carregar diario...</p>
      </div>
    );
  }

  if (experiencias.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="text-4xl">🌿</span>
        <p className="text-white/50 text-sm">O teu diario de natureza esta vazio.</p>
        <p className="text-white/30 text-xs">Faz uma actividade e a tua experiencia aparece aqui.</p>
      </div>
    );
  }

  // Agrupar por semana
  const porSemana = {};
  experiencias.forEach(exp => {
    const semanaKey = `${new Date(exp.data).getFullYear()}-W${getNumeroSemana(exp.data)}`;
    if (!porSemana[semanaKey]) {
      porSemana[semanaKey] = { label: getSemanaLabel(exp.data), items: [] };
    }
    porSemana[semanaKey].items.push(exp);
  });

  return (
    <div className="space-y-5">
      {/* Estatisticas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a2e24]/60 rounded-xl p-3 border border-[#5D9B84]/10 text-center">
          <p className="text-lg font-bold text-[#5D9B84]">{totalCount}</p>
          <p className="text-xs text-white/40">actividades totais</p>
        </div>
        <div className="bg-[#1a2e24]/60 rounded-xl p-3 border border-[#5D9B84]/10 text-center">
          {actividadeFavorita ? (
            <>
              <p className="text-lg">{actividadeFavorita.icon}</p>
              <p className="text-xs text-white/40 truncate">{actividadeFavorita.nome}</p>
            </>
          ) : (
            <>
              <p className="text-lg text-white/30">-</p>
              <p className="text-xs text-white/40">favorita</p>
            </>
          )}
        </div>
      </div>

      {/* Experiencias agrupadas por semana */}
      {Object.entries(porSemana).map(([semanaKey, semana]) => (
        <div key={semanaKey}>
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <JournalIcon />
            {semana.label}
          </h3>
          <div className="space-y-2" role="list">
            {semana.items.map((exp, idx) => {
              const actInfo = ACTIVIDADES_NATUREZA.find(a => a.id === exp.actividade);
              return (
                <div
                  key={exp.id || idx}
                  role="listitem"
                  className="bg-[#1a2e24]/60 rounded-xl p-4 border border-[#5D9B84]/10"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{actInfo?.icon || '🌿'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white/80 truncate">
                          {actInfo?.nome || exp.actividade}
                        </p>
                        <span className="text-xs text-white/30 shrink-0">
                          {formatarData(exp.data)}
                        </span>
                      </div>
                      {exp.reflexao && (
                        <p className="text-xs text-white/50 mt-1.5 leading-relaxed italic">
                          &ldquo;{exp.reflexao}&rdquo;
                        </p>
                      )}
                      {exp.foto_url && (
                        <p className="text-xs text-[#5D9B84]/60 mt-1">
                          Observacao visual: {exp.foto_url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====

export default function NaturezaConexao() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [tabActiva, setTabActiva] = useState('explorar');
  const [actividadeSelecionada, setActividadeSelecionada] = useState(null);

  const handleSaved = () => {
    // Forca recarga do diario ao voltar
  };

  // ===== VISTA DE SESSAO =====
  if (actividadeSelecionada) {
    return (
      <SessaoActividade
        actividade={actividadeSelecionada}
        userId={userId}
        onBack={() => setActividadeSelecionada(null)}
        onSaved={handleSaved}
      />
    );
  }

  // ===== VISTA PRINCIPAL =====
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f2018 0%, #1a2e24 50%, #0f2018 100%)' }}>
      <ModuleHeader
        eco="ventis"
        title="Conexao com a Natureza"
        subtitle={g('Reconectado', 'Reconectada') + ' com o mundo natural'}
      />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Tabs */}
        <div className="flex gap-2" role="tablist" aria-label="Seccoes de natureza">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`
                flex-1 py-2.5 rounded-xl text-sm font-medium transition-all text-center
                ${tabActiva === tab.id
                  ? 'bg-[#5D9B84] text-white shadow-lg shadow-[#5D9B84]/20'
                  : 'bg-[#1a2e24]/60 text-white/50 hover:text-white/70 hover:bg-[#1a2e24]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Explorar */}
        {tabActiva === 'explorar' && (
          <div className="grid grid-cols-1 gap-3" role="list" aria-label="Actividades de natureza">
            {ACTIVIDADES_NATUREZA.map(act => (
              <div key={act.id} role="listitem">
                <ActividadeCard actividade={act} onSelect={setActividadeSelecionada} />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Diario */}
        {tabActiva === 'diario' && (
          <Diario userId={userId} />
        )}

        {/* Espacamento final para navegacao */}
        <div className="h-20" aria-hidden="true" />
      </div>
    </div>
  );
}
