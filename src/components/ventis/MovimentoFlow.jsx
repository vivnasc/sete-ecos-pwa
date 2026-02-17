// src/components/ventis/MovimentoFlow.jsx
// Sequencias de movimento/flow — yoga, tai chi, alongamentos, caminhada consciente, danca livre, sacudimento

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ModuleHeader from '../shared/ModuleHeader';
import { g } from '../../utils/genero';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TIPOS_MOVIMENTO } from '../../lib/ventis/gamificacao';

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

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M12 8v4l3 3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-70">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
);

// ===== CONSTANTES =====

const INTENSIDADE_CONFIG = {
  suave: { label: 'Suave', bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  moderado: { label: 'Moderado', bg: 'bg-amber-500/20', text: 'text-amber-300' },
  intenso: { label: 'Intenso', bg: 'bg-red-500/20', text: 'text-red-300' }
};

const SENSACOES = [
  { id: 'energizado', label: g('Energizado', 'Energizada'), icon: '⚡' },
  { id: 'calmo', label: g('Calmo', 'Calma'), icon: '🧘' },
  { id: 'relaxado', label: g('Relaxado', 'Relaxada'), icon: '😌' },
  { id: 'igual', label: 'Igual', icon: '😐' }
];

const TABS = [
  { id: 'explorar', label: 'Explorar' },
  { id: 'historico', label: 'Historico' }
];

// ===== UTILIDADES =====

function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

function formatarData(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInicioSemana() {
  const now = new Date();
  const dia = now.getDay();
  const diff = now.getDate() - dia + (dia === 0 ? -6 : 1);
  const inicio = new Date(now.setDate(diff));
  inicio.setHours(0, 0, 0, 0);
  return inicio.toISOString();
}

function getInicioMes() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// ===== COMPONENTE: CARTAO DE MOVIMENTO =====

function MovimentoCard({ tipo, onSelect }) {
  const intensidade = INTENSIDADE_CONFIG[tipo.intensidade] || INTENSIDADE_CONFIG.suave;

  return (
    <button
      onClick={() => onSelect(tipo)}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 bg-[#1a2e24]/80 border border-[#5D9B84]/20 hover:border-[#5D9B84]/50 hover:bg-[#1a2e24]"
      aria-label={`${tipo.nome} — ${intensidade.label}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{tipo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white/90 truncate">{tipo.nome}</h3>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${intensidade.bg} ${intensidade.text}`}>
              {intensidade.label}
            </span>
          </div>
          <p className="text-sm text-white/50 line-clamp-2">{tipo.descricao}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-[#5D9B84]/70">
            <ClockIcon />
            <span>{tipo.duracoes.join(' / ')} min</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ===== COMPONENTE: TIMER CIRCULAR =====

function TimerCircular({ duracaoSegundos, ativo, tempoRestante }) {
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
        {ativo && (
          <span className="text-xs text-[#5D9B84] font-medium mt-1">
            Em curso
          </span>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTE: SESSAO DE MOVIMENTO =====

function SessaoMovimento({ tipo, userId, onBack, onSaved }) {
  const [duracaoEscolhida, setDuracaoEscolhida] = useState(null);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [timerConcluido, setTimerConcluido] = useState(false);
  const [passoActual, setPassoActual] = useState(0);
  const [sensacao, setSensacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);
  const intervalRef = useRef(null);

  const duracaoSegundos = duracaoEscolhida ? duracaoEscolhida * 60 : 0;

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

  const handleComecar = () => {
    if (!duracaoEscolhida) return;
    setTempoRestante(duracaoEscolhida * 60);
    setTimerAtivo(true);
    setPassoActual(0);
  };

  const toggleTimer = () => {
    if (timerConcluido) return;
    setTimerAtivo(prev => !prev);
  };

  const proximoPasso = () => {
    if (passoActual < tipo.passos.length - 1) {
      setPassoActual(prev => prev + 1);
    }
  };

  const passoAnterior = () => {
    if (passoActual > 0) {
      setPassoActual(prev => prev - 1);
    }
  };

  const handleSalvar = async () => {
    if (!userId || !sensacao) return;
    setSalvando(true);
    setErro(null);

    try {
      const { error: dbError } = await supabase
        .from('ventis_movimento_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString(),
          tipo: tipo.id,
          duracao_minutos: duracaoEscolhida,
          intensidade: tipo.intensidade,
          sensacao
        });

      if (dbError) throw dbError;

      setSalvo(true);
      onSaved?.();
    } catch (err) {
      console.error('Erro ao guardar sessao:', err);
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
            <h2 className="font-semibold text-white/90 truncate">{tipo.nome}</h2>
            <p className="text-xs text-[#5D9B84]">
              {INTENSIDADE_CONFIG[tipo.intensidade]?.label} {duracaoEscolhida ? `· ${duracaoEscolhida} min` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Descricao */}
        <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{tipo.icon}</span>
            <span className="text-sm text-[#5D9B84] font-medium">{tipo.nome}</span>
          </div>
          <p className="text-white/80 leading-relaxed text-sm">{tipo.descricao}</p>
        </div>

        {/* Escolha de duracao (antes de comecar) */}
        {!duracaoEscolhida && !timerAtivo && !timerConcluido && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 space-y-4">
            <h3 className="text-white/90 font-semibold text-sm">Escolhe a duracao</h3>
            <div className="flex gap-3">
              {tipo.duracoes.map(dur => (
                <button
                  key={dur}
                  onClick={() => setDuracaoEscolhida(dur)}
                  className="flex-1 py-3 rounded-xl border border-[#5D9B84]/30 text-white/80 font-medium hover:bg-[#5D9B84]/20 hover:border-[#5D9B84]/50 transition-all text-center"
                >
                  {dur} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botao Comecar (apos escolher duracao) */}
        {duracaoEscolhida && !timerAtivo && !timerConcluido && tempoRestante === 0 && (
          <button
            onClick={handleComecar}
            className="w-full py-4 rounded-2xl bg-[#5D9B84] text-white font-semibold hover:bg-[#4d8a73] transition-colors text-lg"
          >
            Comecar {duracaoEscolhida} min 🍃
          </button>
        )}

        {/* Timer em execucao */}
        {(timerAtivo || (tempoRestante > 0 && !timerConcluido)) && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 flex flex-col items-center gap-4">
            <TimerCircular
              duracaoSegundos={duracaoSegundos}
              ativo={timerAtivo}
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

        {/* Guia passo-a-passo (durante o timer) */}
        {(timerAtivo || (tempoRestante > 0 && !timerConcluido) || timerConcluido) && duracaoEscolhida && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white/90 font-semibold text-sm">
                Passo {passoActual + 1} de {tipo.passos.length}
              </h3>
              <span className="text-xs text-[#5D9B84]">Guia</span>
            </div>

            {/* Barra de progresso dos passos */}
            <div className="flex gap-1">
              {tipo.passos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= passoActual ? 'bg-[#5D9B84]' : 'bg-[#5D9B84]/20'
                  }`}
                />
              ))}
            </div>

            {/* Passo actual */}
            <div className="bg-[#0f2018]/60 rounded-xl p-4 min-h-[80px] flex items-center">
              <p className="text-white/80 leading-relaxed">{tipo.passos[passoActual]}</p>
            </div>

            {/* Navegacao de passos */}
            <div className="flex items-center justify-between">
              <button
                onClick={passoAnterior}
                disabled={passoActual === 0}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  passoActual === 0
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-[#5D9B84] hover:bg-[#5D9B84]/10'
                }`}
                aria-label="Passo anterior"
              >
                <ChevronLeftIcon />
                Anterior
              </button>
              <button
                onClick={proximoPasso}
                disabled={passoActual === tipo.passos.length - 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  passoActual === tipo.passos.length - 1
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-[#5D9B84] hover:bg-[#5D9B84]/10'
                }`}
                aria-label="Proximo passo"
              >
                Proximo
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}

        {/* Pos-sessao: Como te sentes? */}
        {timerConcluido && !salvo && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-5 border border-[#5D9B84]/10 space-y-4 animate-fadeIn">
            <h3 className="text-white/90 font-semibold">Como te sentes? 🍃</h3>
            <div className="grid grid-cols-2 gap-3">
              {SENSACOES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSensacao(s.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                    ${sensacao === s.id
                      ? 'border-[#5D9B84] bg-[#5D9B84]/20 text-white'
                      : 'border-[#5D9B84]/20 text-white/60 hover:border-[#5D9B84]/40 hover:text-white/80'
                    }
                  `}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              onClick={handleSalvar}
              disabled={salvando || !sensacao}
              className={`
                w-full py-3.5 rounded-xl font-semibold transition-all
                ${salvando || !sensacao
                  ? 'bg-[#5D9B84]/30 text-white/40 cursor-not-allowed'
                  : 'bg-[#5D9B84] text-white hover:bg-[#4d8a73]'
                }
              `}
            >
              {salvando ? 'A guardar...' : 'Guardar sessao'}
            </button>
          </div>
        )}

        {/* Confirmacao */}
        {salvo && (
          <div className="bg-[#1a2e24]/60 rounded-2xl p-6 border border-[#5D9B84]/20 text-center space-y-3 animate-fadeIn">
            <div className="text-4xl">🍃</div>
            <p className="text-white/90 font-medium">
              Sessao registada! +7 Folhas
            </p>
            <p className="text-sm text-white/50">
              O teu corpo agradece cada momento de movimento consciente.
            </p>
            <button
              onClick={onBack}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#5D9B84]/20 text-[#5D9B84] font-medium hover:bg-[#5D9B84]/30 transition-colors"
            >
              Voltar aos movimentos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTE: HISTORICO =====

function Historico({ userId }) {
  const [sessoes, setSessoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [tempoSemana, setTempoSemana] = useState(0);
  const [tempoMes, setTempoMes] = useState(0);
  const [tipoFavorito, setTipoFavorito] = useState(null);

  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      return;
    }

    const carregar = async () => {
      try {
        // Sessoes recentes
        const { data: logs } = await supabase
          .from('ventis_movimento_log')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: false })
          .limit(20);

        if (logs) {
          setSessoes(logs);

          // Tempo esta semana
          const inicioSemana = getInicioSemana();
          const sessSemana = logs.filter(l => l.data >= inicioSemana);
          setTempoSemana(sessSemana.reduce((acc, l) => acc + (l.duracao_minutos || 0), 0));

          // Tempo este mes
          const inicioMes = getInicioMes();
          const sessMes = logs.filter(l => l.data >= inicioMes);
          setTempoMes(sessMes.reduce((acc, l) => acc + (l.duracao_minutos || 0), 0));

          // Tipo favorito
          const contagem = {};
          logs.forEach(l => {
            contagem[l.tipo] = (contagem[l.tipo] || 0) + 1;
          });
          const maxTipo = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
          if (maxTipo) {
            const tipoInfo = TIPOS_MOVIMENTO.find(t => t.id === maxTipo[0]);
            setTipoFavorito(tipoInfo || null);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar historico:', err);
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
        <p className="text-sm text-white/40">A carregar historico...</p>
      </div>
    );
  }

  if (sessoes.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="text-4xl">🍃</span>
        <p className="text-white/50 text-sm">Ainda nao tens sessoes de movimento.</p>
        <p className="text-white/30 text-xs">Comeca com uma sessao e os teus dados aparecem aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Estatisticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a2e24]/60 rounded-xl p-3 border border-[#5D9B84]/10 text-center">
          <p className="text-lg font-bold text-[#5D9B84]">{tempoSemana}</p>
          <p className="text-xs text-white/40">min esta semana</p>
        </div>
        <div className="bg-[#1a2e24]/60 rounded-xl p-3 border border-[#5D9B84]/10 text-center">
          <p className="text-lg font-bold text-[#5D9B84]">{tempoMes}</p>
          <p className="text-xs text-white/40">min este mes</p>
        </div>
        <div className="bg-[#1a2e24]/60 rounded-xl p-3 border border-[#5D9B84]/10 text-center">
          {tipoFavorito ? (
            <>
              <p className="text-lg">{tipoFavorito.icon}</p>
              <p className="text-xs text-white/40 truncate">{tipoFavorito.nome}</p>
            </>
          ) : (
            <>
              <p className="text-lg text-white/30">-</p>
              <p className="text-xs text-white/40">favorito</p>
            </>
          )}
        </div>
      </div>

      {/* Sessoes recentes */}
      <div>
        <h3 className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
          <HistoryIcon />
          Sessoes recentes
        </h3>
        <div className="space-y-2" role="list" aria-label="Sessoes recentes de movimento">
          {sessoes.map((sessao, idx) => {
            const tipoInfo = TIPOS_MOVIMENTO.find(t => t.id === sessao.tipo);
            const sensacaoInfo = SENSACOES.find(s => s.id === sessao.sensacao);
            return (
              <div
                key={sessao.id || idx}
                role="listitem"
                className="bg-[#1a2e24]/60 rounded-xl p-3 border border-[#5D9B84]/10 flex items-center gap-3"
              >
                <span className="text-xl">{tipoInfo?.icon || '🏃'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {tipoInfo?.nome || sessao.tipo}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatarData(sessao.data)} · {sessao.duracao_minutos} min
                  </p>
                </div>
                {sensacaoInfo && (
                  <span className="text-lg" title={sensacaoInfo.label}>{sensacaoInfo.icon}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====

export default function MovimentoFlow() {
  const { userRecord } = useAuth();
  const userId = userRecord?.id || null;

  const [tabActiva, setTabActiva] = useState('explorar');
  const [tipoSelecionado, setTipoSelecionado] = useState(null);

  const handleSaved = () => {
    // Forca recarga do historico ao voltar
  };

  // ===== VISTA DE SESSAO =====
  if (tipoSelecionado) {
    return (
      <SessaoMovimento
        tipo={tipoSelecionado}
        userId={userId}
        onBack={() => setTipoSelecionado(null)}
        onSaved={handleSaved}
      />
    );
  }

  // ===== VISTA PRINCIPAL =====
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f2018 0%, #1a2e24 50%, #0f2018 100%)' }}>
      <ModuleHeader
        eco="ventis"
        title="Movimento & Flow"
        subtitle={g('Conectado', 'Conectada') + ' ao ritmo do corpo'}
      />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Tabs */}
        <div className="flex gap-2" role="tablist" aria-label="Seccoes de movimento">
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
          <div className="space-y-3" role="list" aria-label="Tipos de movimento">
            {TIPOS_MOVIMENTO.map(tipo => (
              <div key={tipo.id} role="listitem">
                <MovimentoCard tipo={tipo} onSelect={setTipoSelecionado} />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Historico */}
        {tabActiva === 'historico' && (
          <Historico userId={userId} />
        )}

        {/* Espacamento final para navegacao */}
        <div className="h-20" aria-hidden="true" />
      </div>
    </div>
  );
}
