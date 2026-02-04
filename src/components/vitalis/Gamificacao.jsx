// src/components/vitalis/Gamificacao.jsx
// Sistema de gamificação: Badges, Conquistas e Celebrações

import React, { useState, useEffect } from 'react';

// Definição de todas as conquistas possíveis
export const CONQUISTAS = {
  // Primeiro passo
  primeiro_registo: { id: 'primeiro_registo', nome: 'Primeiro Passo', descricao: 'Primeiro registo na app', icone: '🎊', cor: 'from-pink-400 to-rose-500', pontos: 50, xp: 50 },

  // Streaks
  streak_3: { id: 'streak_3', nome: 'Início Promissor', descricao: '3 dias consecutivos', icone: '🌱', cor: 'from-green-400 to-emerald-500', pontos: 100, xp: 100 },
  streak_7: { id: 'streak_7', nome: 'Semana Vitalis', descricao: '7 dias consecutivos', icone: '🌿', cor: 'from-emerald-500 to-teal-600', pontos: 200, xp: 200 },
  streak_14: { id: 'streak_14', nome: 'Guerreira de 2 Semanas', descricao: '14 dias consecutivos', icone: '🌳', cor: 'from-teal-500 to-cyan-600', pontos: 350, xp: 350 },
  streak_30: { id: 'streak_30', nome: 'Mestre do Mês', descricao: '30 dias consecutivos', icone: '🏆', cor: 'from-amber-400 to-orange-500', pontos: 500, xp: 500 },
  streak_60: { id: 'streak_60', nome: 'Lenda Vitalis', descricao: '60 dias consecutivos', icone: '👑', cor: 'from-purple-500 to-pink-600', pontos: 1000, xp: 1000 },

  // Água
  agua_1: { id: 'agua_1', nome: 'Primeira Gota', descricao: 'Primeiro registo de água', icone: '💧', cor: 'from-blue-300 to-cyan-400', pontos: 50, xp: 50 },
  agua_50: { id: 'agua_50', nome: 'Hidratação Master', descricao: '50 registos de água', icone: '🌊', cor: 'from-cyan-500 to-blue-600', pontos: 150, xp: 150 },

  // Treino
  treino_1: { id: 'treino_1', nome: 'Corpo em Movimento', descricao: 'Primeiro treino registado', icone: '🏃‍♀️', cor: 'from-orange-300 to-red-400', pontos: 75, xp: 75 },
  treino_10: { id: 'treino_10', nome: 'Atleta em Treino', descricao: '10 treinos registados', icone: '💪', cor: 'from-orange-400 to-red-500', pontos: 200, xp: 200 },
  treino_25: { id: 'treino_25', nome: 'Guerreira Fitness', descricao: '25 treinos registados', icone: '🔥', cor: 'from-red-500 to-orange-600', pontos: 350, xp: 350 },
  treino_50: { id: 'treino_50', nome: 'Mestre do Movimento', descricao: '50 treinos registados', icone: '🏆', cor: 'from-amber-500 to-yellow-500', pontos: 500, xp: 500 },
  treino_semana: { id: 'treino_semana', nome: 'Semana Activa', descricao: '4 treinos numa semana', icone: '📅', cor: 'from-green-400 to-emerald-500', pontos: 150, xp: 150 },
  treino_consistente: { id: 'treino_consistente', nome: 'Consistência', descricao: '3 semanas seguidas a treinar', icone: '⭐', cor: 'from-yellow-400 to-amber-500', pontos: 250, xp: 250 },

  // Refeições
  refeicoes_10: { id: 'refeicoes_10', nome: 'Chef Iniciante', descricao: '10 refeições registadas', icone: '🍽️', cor: 'from-amber-400 to-yellow-500', pontos: 100, xp: 100 },
  refeicoes_50: { id: 'refeicoes_50', nome: 'Chef Dedicada', descricao: '50 refeições registadas', icone: '👩‍🍳', cor: 'from-yellow-500 to-orange-500', pontos: 250, xp: 250 },

  // Peso
  peso_1kg: { id: 'peso_1kg', nome: 'Primeiro Quilo', descricao: 'Perdeste 1kg', icone: '⚖️', cor: 'from-lime-400 to-green-500', pontos: 150, xp: 150 },
  peso_5kg: { id: 'peso_5kg', nome: 'Transformação', descricao: 'Perdeste 5kg', icone: '🎯', cor: 'from-green-500 to-emerald-600', pontos: 300, xp: 300 },
  peso_10kg: { id: 'peso_10kg', nome: 'Nova Pessoa', descricao: 'Perdeste 10kg', icone: '🦋', cor: 'from-violet-500 to-purple-600', pontos: 500, xp: 500 },
  peso_meta: { id: 'peso_meta', nome: 'Objectivo Alcançado!', descricao: 'Atingiste o peso meta', icone: '🎉', cor: 'from-yellow-400 to-amber-500', pontos: 1000, xp: 1000 },

  // Check-ins
  checkin_7: { id: 'checkin_7', nome: 'Consistente', descricao: '7 check-ins feitos', icone: '✅', cor: 'from-indigo-400 to-violet-500', pontos: 75, xp: 75 },
  checkin_30: { id: 'checkin_30', nome: 'Comprometida', descricao: '30 check-ins feitos', icone: '📝', cor: 'from-violet-500 to-purple-600', pontos: 200, xp: 200 },

  // Fases
  fase_inducao: { id: 'fase_inducao', nome: 'Indução Completa', descricao: 'Completaste a Fase 1', icone: '🌅', cor: 'from-amber-400 to-orange-500', pontos: 250, xp: 250 },
  fase_estabilizacao: { id: 'fase_estabilizacao', nome: 'Estabilização Completa', descricao: 'Completaste a Fase 2', icone: '⛰️', cor: 'from-orange-500 to-red-500', pontos: 350, xp: 350 },
  fase_reeducacao: { id: 'fase_reeducacao', nome: 'Reeducação Completa', descricao: 'Completaste a Fase 3', icone: '🎓', cor: 'from-red-500 to-pink-500', pontos: 500, xp: 500 },

  // Especiais
  sono_perfeito: { id: 'sono_perfeito', nome: 'Bela Adormecida', descricao: '7 noites com 7+ horas', icone: '😴', cor: 'from-indigo-500 to-blue-600', pontos: 125, xp: 125 },
  receita_5: { id: 'receita_5', nome: 'Explorador de Receitas', descricao: 'Viste 5 receitas', icone: '📚', cor: 'from-amber-400 to-yellow-500', pontos: 50, xp: 50 },
};

// Componente de Badge Individual
export function Badge({ conquista, desbloqueada = false, tamanho = 'normal', mostrarNome = true }) {
  const config = CONQUISTAS[conquista] || conquista;
  const tamanhos = {
    pequeno: 'w-10 h-10 text-lg',
    normal: 'w-14 h-14 text-2xl',
    grande: 'w-20 h-20 text-4xl'
  };

  return (
    <div className={`flex flex-col items-center ${mostrarNome ? 'gap-1' : ''}`}>
      <div
        className={`
          ${tamanhos[tamanho]} rounded-full flex items-center justify-center
          ${desbloqueada
            ? `bg-gradient-to-br ${config.cor} shadow-lg`
            : 'bg-gray-200'
          }
          transition-all duration-300
          ${desbloqueada ? 'animate-pulse-subtle' : 'opacity-40 grayscale'}
        `}
      >
        <span className={desbloqueada ? '' : 'opacity-50'}>{config.icone}</span>
      </div>
      {mostrarNome && (
        <div className="text-center">
          <p className={`text-xs font-medium ${desbloqueada ? 'text-gray-800' : 'text-gray-400'}`}>
            {config.nome}
          </p>
          {desbloqueada && config.pontos && (
            <p className="text-xs text-amber-600">+{config.pontos} pts</p>
          )}
        </div>
      )}
    </div>
  );
}

// Modal de Celebração (aparece quando desbloqueia conquista)
export function CelebracaoModal({ conquista, onClose, show }) {
  const config = CONQUISTAS[conquista] || conquista;

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop com confetti */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Confetti animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-bounceIn text-center">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${config.cor} rounded-3xl blur-lg opacity-30 animate-pulse`} />

        <div className="relative">
          {/* Badge grande */}
          <div className={`w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.cor} flex items-center justify-center shadow-xl animate-bounce-slow`}>
            <span className="text-6xl">{config.icone}</span>
          </div>

          {/* Texto */}
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Nova Conquista!</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{config.nome}</h2>
          <p className="text-gray-600 mb-4">{config.descricao}</p>

          {/* Pontos */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-6">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-amber-600">+{config.pontos} pontos</span>
          </div>

          {/* Botão */}
          <button
            onClick={onClose}
            className={`w-full py-3 bg-gradient-to-r ${config.cor} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity`}
          >
            Continuar a Brilhar! ✨
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de Streak melhorado
export function StreakDisplay({ streak, melhorStreak = 0, compacto = false }) {
  const nivelStreak =
    streak >= 60 ? { nome: 'Lenda', cor: 'from-purple-500 to-pink-600', icone: '👑' } :
    streak >= 30 ? { nome: 'Mestre', cor: 'from-amber-400 to-orange-500', icone: '🏆' } :
    streak >= 14 ? { nome: 'Guerreira', cor: 'from-teal-500 to-cyan-600', icone: '🌳' } :
    streak >= 7 ? { nome: 'Dedicada', cor: 'from-emerald-500 to-teal-600', icone: '🌿' } :
    streak >= 3 ? { nome: 'Promissora', cor: 'from-green-400 to-emerald-500', icone: '🌱' } :
    { nome: 'Iniciante', cor: 'from-gray-400 to-gray-500', icone: '🌰' };

  if (compacto) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${nivelStreak.cor} text-white shadow-lg`}>
        <span className="text-lg animate-pulse">{streak > 0 ? '🔥' : '❄️'}</span>
        <span className="font-bold">{streak}</span>
        <span className="text-xs opacity-80">dias</span>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${nivelStreak.cor} rounded-2xl p-4 text-white shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-bounce-slow">{streak > 0 ? '🔥' : '❄️'}</div>
          <div>
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-white/80 text-xs">dias consecutivos</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl">{nivelStreak.icone}</div>
          <p className="text-xs text-white/80">{nivelStreak.nome}</p>
        </div>
      </div>

      {melhorStreak > streak && (
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-xs text-white/70">Melhor streak:</span>
          <span className="font-semibold">{melhorStreak} dias 🏅</span>
        </div>
      )}

      {/* Próximo milestone */}
      {streak < 60 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>Próximo: {streak < 3 ? '3' : streak < 7 ? '7' : streak < 14 ? '14' : streak < 30 ? '30' : '60'} dias</span>
            <span>{streak < 3 ? 3 - streak : streak < 7 ? 7 - streak : streak < 14 ? 14 - streak : streak < 30 ? 30 - streak : 60 - streak} para desbloquear</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{
                width: `${streak < 3 ? (streak/3)*100 : streak < 7 ? (streak/7)*100 : streak < 14 ? (streak/14)*100 : streak < 30 ? (streak/30)*100 : (streak/60)*100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Barra de Progresso com Nível
export function NivelProgresso({ pontosTotal }) {
  const niveis = [
    { nivel: 1, nome: 'Semente', pontos: 0, icone: '🌰' },
    { nivel: 2, nome: 'Broto', pontos: 50, icone: '🌱' },
    { nivel: 3, nome: 'Planta', pontos: 150, icone: '🌿' },
    { nivel: 4, nome: 'Árvore', pontos: 300, icone: '🌳' },
    { nivel: 5, nome: 'Floresta', pontos: 500, icone: '🌲' },
    { nivel: 6, nome: 'Jardim', pontos: 750, icone: '🌸' },
    { nivel: 7, nome: 'Paraíso', pontos: 1000, icone: '🏝️' },
    { nivel: 8, nome: 'Lenda', pontos: 1500, icone: '👑' },
  ];

  const nivelActual = niveis.reduce((acc, n) => pontosTotal >= n.pontos ? n : acc, niveis[0]);
  const proximoNivel = niveis.find(n => n.pontos > pontosTotal) || niveis[niveis.length - 1];
  const progressoNivel = proximoNivel.pontos > nivelActual.pontos
    ? ((pontosTotal - nivelActual.pontos) / (proximoNivel.pontos - nivelActual.pontos)) * 100
    : 100;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{nivelActual.icone}</span>
          <div>
            <p className="font-bold text-gray-800">Nível {nivelActual.nivel}: {nivelActual.nome}</p>
            <p className="text-xs text-gray-500">{pontosTotal} pontos totais</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Próximo nível</p>
          <p className="font-medium text-gray-600">{proximoNivel.icone} {proximoNivel.nome}</p>
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7C8B6F] via-[#9CAF88] to-[#6B7A5D] rounded-full transition-all"
          style={{ width: `${progressoNivel}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        {proximoNivel.pontos - pontosTotal} pontos para o próximo nível
      </p>
    </div>
  );
}

// Secção de Conquistas no Perfil
export function ConquistasSection({ conquistasDesbloqueadas = [], mostrarTodas = false }) {
  const [showAll, setShowAll] = useState(mostrarTodas);

  const todasConquistas = Object.values(CONQUISTAS);
  const conquistas = showAll ? todasConquistas : todasConquistas.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏅</span>
          <h3 className="font-bold text-gray-800">Conquistas</h3>
        </div>
        <span className="text-sm text-gray-500">
          {conquistasDesbloqueadas.length}/{todasConquistas.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {conquistas.map((conquista) => (
          <Badge
            key={conquista.id}
            conquista={conquista}
            desbloqueada={conquistasDesbloqueadas.includes(conquista.id)}
            tamanho="normal"
          />
        ))}
      </div>

      {!showAll && todasConquistas.length > 8 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-4 py-2 text-sm text-[#7C8B6F] hover:bg-[#F5F2ED] rounded-lg transition-colors"
        >
          Ver todas ({todasConquistas.length}) →
        </button>
      )}
    </div>
  );
}

// CSS para animações (adicionar ao index.css ou tailwind)
export const gamificacaoStyles = `
  @keyframes confetti {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pulse-subtle {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-confetti {
    animation: confetti 3s ease-out forwards;
  }

  .animate-bounceIn {
    animation: bounceIn 0.5s ease-out forwards;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
`;

export default {
  CONQUISTAS,
  Badge,
  CelebracaoModal,
  StreakDisplay,
  NivelProgresso,
  ConquistasSection,
  gamificacaoStyles
};
