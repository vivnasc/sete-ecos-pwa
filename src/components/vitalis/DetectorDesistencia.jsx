// src/components/vitalis/DetectorDesistencia.jsx
// Detecta padrão de "começa e pára" e intervém antes da desistência

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';
import { g } from '../../utils/genero';

/**
 * Analisa o padrão de check-ins e detecta risco de abandono.
 * Mostra um alerta compassivo no dashboard quando o utilizador
 * está no ponto crítico onde costuma desistir.
 *
 * Lógica:
 * - Calcula a "janela de risco" baseada no historial (ex: se desistiu na semana 2-3 antes, alerta na semana 2)
 * - Detecta queda de aderência (aderencia_1a10 a descer em 2+ check-ins consecutivos)
 * - Detecta gaps crescentes entre check-ins
 */

const RISK_LEVELS = {
  NONE: 'none',
  LOW: 'low',       // Aderência a descer ligeiramente
  MEDIUM: 'medium', // Padrão de desistência detectado
  HIGH: 'high'      // No ponto crítico onde costuma parar
};

export function useDetectorDesistencia(userId, client, registos) {
  const [riskData, setRiskData] = useState({
    level: RISK_LEVELS.NONE,
    message: null,
    porqueMotivacional: null,
    diasSemCheckin: 0,
    aderenciaMedia: 0,
    tendencia: 'estavel' // subindo, estavel, descendo
  });

  useEffect(() => {
    if (!userId || !client || !registos) return;
    analisarPadrao();
  }, [userId, client, registos]);

  const analisarPadrao = async () => {
    try {
      // 1. Buscar todos os check-ins ordenados por data
      const { data: todosRegistos } = await supabase
        .from('vitalis_registos')
        .select('data, aderencia_1a10, humor_1a10, energia_1a10, created_at')
        .eq('user_id', userId)
        .order('data', { ascending: true });

      if (!todosRegistos || todosRegistos.length === 0) return;

      // 2. Buscar o compromisso/porquê da cliente (do intake)
      const { data: intake } = await supabase
        .from('vitalis_intake')
        .select('objectivo_principal, motivacao_principal, gatilhos_saida')
        .eq('user_id', userId)
        .maybeSingle();

      // 3. Calcular dias sem check-in
      const ultimoCheckin = new Date(todosRegistos[todosRegistos.length - 1].data);
      const hoje = new Date();
      const diasSemCheckin = Math.floor((hoje - ultimoCheckin) / (1000 * 60 * 60 * 24));

      // 4. Calcular tendência de aderência (últimos 3-5 check-ins)
      const ultimosCheckins = todosRegistos.slice(-5);
      const aderencias = ultimosCheckins
        .map(r => r.aderencia_1a10)
        .filter(a => a != null && !isNaN(a));

      let tendencia = 'estavel';
      let aderenciaMedia = 0;

      if (aderencias.length >= 2) {
        aderenciaMedia = aderencias.reduce((a, b) => a + b, 0) / aderencias.length;
        const primeiraMetade = aderencias.slice(0, Math.ceil(aderencias.length / 2));
        const segundaMetade = aderencias.slice(Math.floor(aderencias.length / 2));
        const mediaPrimeira = primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length;
        const mediaSegunda = segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length;

        if (mediaSegunda < mediaPrimeira - 1) tendencia = 'descendo';
        else if (mediaSegunda > mediaPrimeira + 1) tendencia = 'subindo';
      }

      // 5. Calcular dia do programa
      const dataInicio = client.data_inicio ? new Date(client.data_inicio) : null;
      const diaPrograma = dataInicio ? Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24)) : 0;

      // 6. Detectar gaps no historial (padrão de começa-pára)
      const gaps = [];
      for (let i = 1; i < todosRegistos.length; i++) {
        const diff = Math.floor(
          (new Date(todosRegistos[i].data) - new Date(todosRegistos[i - 1].data)) / (1000 * 60 * 60 * 24)
        );
        if (diff > 3) gaps.push(diff);
      }
      const temPadraoGaps = gaps.length >= 2; // Já teve 2+ pausas longas antes

      // 7. Determinar nível de risco
      let level = RISK_LEVELS.NONE;
      let message = null;
      let porqueMotivacional = null;

      // Buscar o "porquê" guardado no compromisso
      const compromissoGuardado = typeof window !== 'undefined'
        ? localStorage.getItem(`vitalis-compromisso-porque-${userId}`)
        : null;

      // RISCO ALTO: padrão de gaps + aderência a descer + dias sem check-in
      if (temPadraoGaps && diasSemCheckin >= 3 && tendencia === 'descendo') {
        level = RISK_LEVELS.HIGH;
        message = g(
          'Ei, estás no ponto onde costumas parar. Desta vez, vamos fazer diferente.',
          'Ei, estás no ponto onde costumas parar. Desta vez, vamos fazer diferente.'
        );
        if (compromissoGuardado) {
          porqueMotivacional = compromissoGuardado;
        }
      }
      // RISCO MÉDIO: aderência a descer consistentemente OU dias sem check-in >= 4
      else if ((tendencia === 'descendo' && aderenciaMedia < 6) || diasSemCheckin >= 4) {
        level = RISK_LEVELS.MEDIUM;
        if (diasSemCheckin >= 4) {
          message = `Já passaram ${diasSemCheckin} dias sem check-in. Não precisas de ser ${g('perfeito', 'perfeita')} — só precisas de voltar.`;
        } else {
          message = `A tua aderência está a descer. Está tudo bem — vamos ajustar juntas em vez de desistir.`;
        }
        if (compromissoGuardado) {
          porqueMotivacional = compromissoGuardado;
        }
      }
      // RISCO BAIXO: primeiros sinais (aderência < 5 no último check-in ou 2 dias sem check-in)
      else if (
        (aderencias.length > 0 && aderencias[aderencias.length - 1] < 5) ||
        diasSemCheckin >= 2
      ) {
        level = RISK_LEVELS.LOW;
        message = 'Um dia difícil não apaga o progresso que já fizeste. Volta quando puderes.';
      }
      // Semana 2-3 (período crítico estatístico) mesmo sem sinais claros
      else if (diaPrograma >= 10 && diaPrograma <= 25 && temPadraoGaps) {
        level = RISK_LEVELS.LOW;
        message = g(
          'Estás na fase onde muitos param. Tu não és "muitos" — és tu, e estás aqui.',
          'Estás na fase onde muitas param. Tu não és "muitas" — és tu, e estás aqui.'
        );
      }

      setRiskData({
        level,
        message,
        porqueMotivacional,
        diasSemCheckin,
        aderenciaMedia: Math.round(aderenciaMedia * 10) / 10,
        tendencia
      });

    } catch (error) {
      console.error('Erro no detector de desistência:', error);
    }
  };

  return riskData;
}

/**
 * Componente visual do alerta de desistência no dashboard.
 * Aparece apenas quando há risco detectado.
 */
export function AlertaDesistencia({ riskData, userId }) {
  const [dismissed, setDismissed] = useState(false);

  if (!riskData || riskData.level === RISK_LEVELS.NONE || dismissed) return null;

  const configs = {
    [RISK_LEVELS.LOW]: {
      bgGradient: 'from-amber-50 to-orange-50',
      border: 'border-amber-300',
      iconBg: 'bg-amber-100',
      icon: '🌤️',
      titulo: 'Lembrete Gentil',
      textColor: 'text-amber-900',
      subtextColor: 'text-amber-700'
    },
    [RISK_LEVELS.MEDIUM]: {
      bgGradient: 'from-orange-50 to-red-50',
      border: 'border-orange-400',
      iconBg: 'bg-orange-100',
      icon: '🔥',
      titulo: 'Momento de Atenção',
      textColor: 'text-orange-900',
      subtextColor: 'text-orange-700'
    },
    [RISK_LEVELS.HIGH]: {
      bgGradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-400',
      iconBg: 'bg-purple-100',
      icon: '💜',
      titulo: 'Estou Aqui Contigo',
      textColor: 'text-purple-900',
      subtextColor: 'text-purple-700'
    }
  };

  const config = configs[riskData.level];

  return (
    <div className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-r ${config.bgGradient} border-l-4 ${config.border} shadow-md transition-all`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center text-xl shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${config.textColor} text-sm sm:text-base`}>
            {config.titulo}
          </h4>
          <p className={`${config.subtextColor} text-sm mt-1`}>
            {riskData.message}
          </p>

          {/* Mostrar o "porquê" da pessoa quando risco é médio ou alto */}
          {riskData.porqueMotivacional && riskData.level !== RISK_LEVELS.LOW && (
            <div className="mt-3 p-3 bg-white/60 rounded-xl border border-white/80">
              <p className="text-xs text-gray-500 mb-1">O teu porquê:</p>
              <p className={`${config.textColor} text-sm font-medium italic`}>
                "{riskData.porqueMotivacional}"
              </p>
            </div>
          )}

          {/* Acções */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              to="/vitalis/checkin"
              className="px-3 py-1.5 bg-[#7C8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#6B7A5D] transition-colors active:scale-95"
            >
              Fazer check-in
            </Link>
            <Link
              to="/vitalis/espaco-retorno"
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors active:scale-95"
            >
              Espaço de Retorno
            </Link>
            <Link
              to="/vitalis/compromisso"
              className="px-3 py-1.5 bg-white/80 text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition-colors active:scale-95 border border-gray-200"
            >
              Meu Compromisso
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertaDesistencia;
