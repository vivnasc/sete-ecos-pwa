// src/components/serena/FluidezPraticas.jsx
// Micro-praticas de fluidez (elemento agua) — SERENA

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PRATICAS_FLUIDEZ } from '../../lib/serena/gamificacao';

// ===== ICONES SVG =====

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

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

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const DropletIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-70">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

// ===== CONSTANTES =====

const NIVEL_LABELS = {
  1: 'Iniciante',
  2: 'Intermedio',
  3: 'Avancado'
};

const FILTROS = [
  { value: 'todas', label: 'Todas' },
  { value: 1, label: 'Nivel 1' },
  { value: 2, label: 'Nivel 2' },
  { value: 3, label: 'Nivel 3' }
];

// ===== UTILIDADES =====

/**
 * Converte string de duracao ('5 min', '15 min', 'quanto precisar') em segundos.
 * Retorna null para duracoes indeterminadas.
 */
function parseDuracaoSegundos(duracao) {
  if (!duracao) return null;
  const match = duracao.match(/^(\d+)\s*min/);
  if (match) return parseInt(match[1], 10) * 60;
  return null;
}

/**
 * Formata segundos em mm:ss
 */
function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

// ===== COMPONENTE: CARTAO DE PRATICA =====

function PraticaCard({ pratica, completada, bloqueada, onSelect }) {
  return (
    <button
      onClick={() => !bloqueada && onSelect(pratica)}
      disabled={bloqueada}
      className={`
        w-full text-left rounded-2xl p-4 transition-all duration-200
        ${bloqueada
          ? 'bg-[#1a2e3a]/40 opacity-50 cursor-not-allowed'
          : completada
            ? 'bg-[#1a2e3a]/60 border border-[#6B8E9B]/40 hover:border-[#6B8E9B]/70'
            : 'bg-[#1a2e3a]/80 border border-[#6B8E9B]/20 hover:border-[#6B8E9B]/50 hover:bg-[#1a2e3a]'
        }
      `}
      aria-label={bloqueada ? `${pratica.nome} — ${g('bloqueado', 'bloqueada')}` : pratica.nome}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Indicador de nivel */}
            <span className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
              ${pratica.nivel === 1 ? 'bg-[#6B8E9B]/20 text-[#8BB0BF]' : ''}
              ${pratica.nivel === 2 ? 'bg-[#6B8E9B]/30 text-[#A8CCDA]' : ''}
              ${pratica.nivel === 3 ? 'bg-[#6B8E9B]/40 text-[#C8E0EA]' : ''}
            `}>
              {bloqueada && <LockIcon />}
              {NIVEL_LABELS[pratica.nivel]}
            </span>
            {completada && (
              <span className="text-[#6B8E9B]" aria-label="Completada">
                <CheckCircleIcon />
              </span>
            )}
          </div>

          <h3 className="font-semibold text-white/90 mb-1 truncate">{pratica.nome}</h3>
          <p className="text-sm text-white/50 line-clamp-2">{pratica.descricao}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-[#6B8E9B] font-medium">{pratica.duracao}</span>
          <DropletIcon />
        </div>
      </div>
    </button>
  );
}

// ===== COMPONENTE: TIMER =====

function Timer({ duracaoSegundos, onComplete }) {
  const [tempoRestante, setTempoRestante] = useState(duracaoSegundos);
  const [ativo, setAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const intervalRef = useRef(null);

  const progresso = duracaoSegundos > 0
    ? ((duracaoSegundos - tempoRestante) / duracaoSegundos) * 100
    : 0;

  const limparInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (ativo && tempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            limparInterval();
            setAtivo(false);
            setConcluido(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return limparInterval;
  }, [ativo, limparInterval, onComplete, tempoRestante]);

  const toggleTimer = () => {
    if (concluido) return;
    setAtivo(prev => !prev);
  };

  const resetTimer = () => {
    limparInterval();
    setAtivo(false);
    setConcluido(false);
    setTempoRestante(duracaoSegundos);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Circulo de progresso */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(107,142,155,0.15)"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="#6B8E9B"
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
          {concluido && (
            <span className="text-xs text-[#6B8E9B] font-medium mt-1">
              {g('Concluido', 'Concluida')}!
            </span>
          )}
        </div>
      </div>

      {/* Botoes */}
      <div className="flex items-center gap-3">
        {!concluido ? (
          <button
            onClick={toggleTimer}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all
              ${ativo
                ? 'bg-white/10 text-white/80 hover:bg-white/15'
                : 'bg-[#6B8E9B] text-white hover:bg-[#5A7D8A]'
              }
            `}
            aria-label={ativo ? 'Pausar' : 'Iniciar'}
          >
            {ativo ? <PauseIcon /> : <PlayIcon />}
            <span>{ativo ? 'Pausar' : 'Iniciar'}</span>
          </button>
        ) : (
          <button
            onClick={resetTimer}
            className="px-6 py-3 rounded-full font-medium bg-white/10 text-white/80 hover:bg-white/15 transition-all"
          >
            Repetir
          </button>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTE: DETALHE DA PRATICA =====

function PraticaDetalhe({ pratica, userId, onBack, onSaved }) {
  const duracaoSegundos = parseDuracaoSegundos(pratica.duracao);
  const temTimer = duracaoSegundos !== null && duracaoSegundos > 0;

  const [timerConcluido, setTimerConcluido] = useState(false);
  const [praticaConcluida, setPraticaConcluida] = useState(!temTimer);
  const [sentimento, setSentimento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);

  const handleTimerComplete = useCallback(() => {
    setTimerConcluido(true);
    setPraticaConcluida(true);
  }, []);

  // Para praticas sem timer, marcar como concluida imediatamente
  const handleMarcarConcluida = () => {
    setPraticaConcluida(true);
  };

  const handleSalvar = async () => {
    if (!userId) return;
    setSalvando(true);
    setErro(null);

    try {
      const { error: dbError } = await supabase
        .from('serena_praticas_log')
        .insert({
          user_id: userId,
          pratica_id: pratica.id,
          sentimento: sentimento.trim() || null,
          reflexao: sentimento.trim() || null,
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setSalvo(true);
      onSaved?.(pratica.id);
    } catch (err) {
      console.error('Erro ao guardar pratica:', err);
      setErro('Nao foi possivel guardar. Tenta novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0d1f28 0%, #1a2e3a 50%, #0d1f28 100%)' }}>
      {/* Header com voltar */}
      <div className="sticky top-0 z-40 bg-[#0d1f28]/95 backdrop-blur-sm border-b border-[#6B8E9B]/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/70 transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeftIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white/90 truncate">{pratica.nome}</h2>
            <p className="text-xs text-[#6B8E9B]">{NIVEL_LABELS[pratica.nivel]} · {pratica.duracao}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Descricao completa */}
        <div className="bg-[#1a2e3a]/60 rounded-2xl p-5 border border-[#6B8E9B]/10">
          <p className="text-white/80 leading-relaxed">{pratica.descricao}</p>
        </div>

        {/* Timer (se aplicavel) */}
        {temTimer && (
          <div className="bg-[#1a2e3a]/60 rounded-2xl p-5 border border-[#6B8E9B]/10">
            <Timer
              duracaoSegundos={duracaoSegundos}
              onComplete={handleTimerComplete}
            />
          </div>
        )}

        {/* Sem timer: botao para marcar como concluida */}
        {!temTimer && !praticaConcluida && (
          <button
            onClick={handleMarcarConcluida}
            className="w-full py-4 rounded-2xl bg-[#6B8E9B] text-white font-semibold hover:bg-[#5A7D8A] transition-colors"
          >
            {g('Concluido', 'Concluida')}? Marcar como feito
          </button>
        )}

        {/* Reflexao pos-pratica */}
        {praticaConcluida && !salvo && (
          <div className="bg-[#1a2e3a]/60 rounded-2xl p-5 border border-[#6B8E9B]/10 space-y-4 animate-fadeIn">
            <div>
              <label htmlFor="sentimento-input" className="block text-sm font-medium text-[#6B8E9B] mb-2">
                Como te sentiste? 💧
              </label>
              <textarea
                id="sentimento-input"
                value={sentimento}
                onChange={(e) => setSentimento(e.target.value)}
                placeholder="Descreve o que sentiste durante a pratica..."
                rows={3}
                maxLength={500}
                className="w-full bg-[#0d1f28]/60 border border-[#6B8E9B]/20 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-[#6B8E9B]/50 resize-none transition-colors"
              />
              <p className="text-xs text-white/30 mt-1 text-right">{sentimento.length}/500</p>
            </div>

            {erro && (
              <p className="text-sm text-red-400">{erro}</p>
            )}

            <button
              onClick={handleSalvar}
              disabled={salvando}
              className={`
                w-full py-3.5 rounded-xl font-semibold transition-all
                ${salvando
                  ? 'bg-[#6B8E9B]/50 text-white/50 cursor-wait'
                  : 'bg-[#6B8E9B] text-white hover:bg-[#5A7D8A]'
                }
              `}
            >
              {salvando ? 'A guardar...' : 'Guardar reflexao'}
            </button>
          </div>
        )}

        {/* Confirmacao de salvo */}
        {salvo && (
          <div className="bg-[#1a2e3a]/60 rounded-2xl p-6 border border-[#6B8E9B]/20 text-center space-y-3 animate-fadeIn">
            <div className="text-4xl">💧</div>
            <p className="text-white/90 font-medium">
              Pratica registada!
            </p>
            <p className="text-sm text-white/50">
              Cada gota conta no teu caminho de fluidez.
            </p>
            <button
              onClick={onBack}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#6B8E9B]/20 text-[#6B8E9B] font-medium hover:bg-[#6B8E9B]/30 transition-colors"
            >
              Voltar as praticas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====

export default function FluidezPraticas() {
  const { user, userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [filtroNivel, setFiltroNivel] = useState('todas');
  const [praticaSelecionada, setPraticaSelecionada] = useState(null);
  const [praticasCompletadas, setPraticasCompletadas] = useState([]);
  const [nivelUtilizador, setNivelUtilizador] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados do utilizador (praticas completadas + nivel)
  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      return;
    }

    const carregarDados = async () => {
      try {
        // Praticas completadas
        const { data: logs } = await supabase
          .from('serena_praticas_log')
          .select('pratica_id')
          .eq('user_id', userId);

        if (logs) {
          const idsUnicos = [...new Set(logs.map(l => l.pratica_id))];
          setPraticasCompletadas(idsUnicos);
        }

        // Nivel do utilizador (da tabela serena_clients ou gamificacao)
        const { data: clientData } = await supabase
          .from('serena_clients')
          .select('nivel')
          .eq('user_id', userId)
          .maybeSingle();

        if (clientData?.nivel) {
          setNivelUtilizador(clientData.nivel);
        }
      } catch (err) {
        console.error('Erro ao carregar dados de praticas:', err);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [userId]);

  // Filtrar praticas por nivel
  const praticasFiltradas = filtroNivel === 'todas'
    ? PRATICAS_FLUIDEZ
    : PRATICAS_FLUIDEZ.filter(p => p.nivel === filtroNivel);

  // Verificar se nivel 3 esta bloqueado (utilizador e "Nascente")
  const nivel3Bloqueado = !nivelUtilizador || nivelUtilizador === 'Nascente';

  // Contar progresso
  const totalPraticas = PRATICAS_FLUIDEZ.length;
  const totalCompletadas = praticasCompletadas.length;

  // Sugerir proxima pratica (primeira nao completada, nivel adequado)
  const proximaPratica = PRATICAS_FLUIDEZ.find(p => {
    if (praticasCompletadas.includes(p.id)) return false;
    if (p.nivel === 3 && nivel3Bloqueado) return false;
    return true;
  });

  const handlePraticaSalva = (praticaId) => {
    if (!praticasCompletadas.includes(praticaId)) {
      setPraticasCompletadas(prev => [...prev, praticaId]);
    }
  };

  // ===== VISTA DE DETALHE =====
  if (praticaSelecionada) {
    return (
      <PraticaDetalhe
        pratica={praticaSelecionada}
        userId={userId}
        onBack={() => setPraticaSelecionada(null)}
        onSaved={handlePraticaSalva}
      />
    );
  }

  // ===== VISTA PRINCIPAL (LISTA) =====
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0d1f28 0%, #1a2e3a 50%, #0d1f28 100%)' }}>
      <ModuleHeader
        eco="serena"
        title="Praticas de Fluidez"
        subtitle="Micro-praticas do elemento agua"
      />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Progresso */}
        <div className="bg-[#1a2e3a]/60 rounded-2xl p-4 border border-[#6B8E9B]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💧</span>
              <div>
                <p className="font-semibold text-white/90 text-sm">Progresso</p>
                <p className="text-xs text-white/50">
                  {totalCompletadas} de {totalPraticas} praticas
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-[#6B8E9B]">
              {totalPraticas > 0 ? Math.round((totalCompletadas / totalPraticas) * 100) : 0}%
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-2 bg-[#0d1f28]/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6B8E9B] to-[#8BB0BF] rounded-full transition-all duration-500"
              style={{ width: `${totalPraticas > 0 ? (totalCompletadas / totalPraticas) * 100 : 0}%` }}
            />
          </div>

          {/* Sugestao de proxima pratica */}
          {proximaPratica && !carregando && (
            <button
              onClick={() => setPraticaSelecionada(proximaPratica)}
              className="mt-3 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6B8E9B]/10 hover:bg-[#6B8E9B]/20 transition-colors text-left"
            >
              <span className="text-sm">🌊</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#6B8E9B] font-medium">Proxima sugerida</p>
                <p className="text-sm text-white/70 truncate">{proximaPratica.nome}</p>
              </div>
              <span className="text-white/30 text-xs">→</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Filtrar por nivel">
          {FILTROS.map(filtro => (
            <button
              key={filtro.value}
              onClick={() => setFiltroNivel(filtro.value)}
              role="tab"
              aria-selected={filtroNivel === filtro.value}
              className={`
                shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filtroNivel === filtro.value
                  ? 'bg-[#6B8E9B] text-white shadow-lg shadow-[#6B8E9B]/20'
                  : 'bg-[#1a2e3a]/60 text-white/50 hover:text-white/70 hover:bg-[#1a2e3a]'
                }
              `}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {/* Lista de praticas */}
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-[#6B8E9B]/30 border-t-[#6B8E9B] rounded-full animate-spin" />
            <p className="text-sm text-white/40">A carregar praticas...</p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Praticas de fluidez">
            {praticasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">Nenhuma pratica neste nivel.</p>
              </div>
            ) : (
              praticasFiltradas.map(pratica => {
                const completada = praticasCompletadas.includes(pratica.id);
                const bloqueada = pratica.nivel === 3 && nivel3Bloqueado;

                return (
                  <div key={pratica.id} role="listitem">
                    <PraticaCard
                      pratica={pratica}
                      completada={completada}
                      bloqueada={bloqueada}
                      onSelect={setPraticaSelecionada}
                    />
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Nota sobre nivel 3 bloqueado */}
        {nivel3Bloqueado && filtroNivel !== 1 && filtroNivel !== 2 && (
          <div className="bg-[#1a2e3a]/40 rounded-xl p-4 border border-[#6B8E9B]/10 flex items-start gap-3">
            <span className="text-white/30 mt-0.5"><LockIcon /></span>
            <p className="text-xs text-white/40 leading-relaxed">
              As praticas de Nivel 3 desbloqueiam quando avancar{g('es', 'es')} alem do nivel Nascente.
              Continua a praticar para evoluir!
            </p>
          </div>
        )}

        {/* Espacamento final para navegacao */}
        <div className="h-20" aria-hidden="true" />
      </div>
    </div>
  );
}
