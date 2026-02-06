// src/components/vitalis/OnboardingTutorial.jsx
// Tutorial interactivo para novos utilizadores

import React, { useState, useEffect } from 'react';
import { g } from '../../utils/genero';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    titulo: g('Bem-vindo ao Vitalis! 🌱', 'Bem-vinda ao Vitalis! 🌱'),
    descricao: 'A tua jornada de transformação começa aqui. Deixa-me mostrar-te como tirar o máximo proveito da app.',
    icone: '🌿',
    cor: 'from-[#7C8B6F] to-[#6B7A5D]',
    imagem: null
  },
  {
    id: 'dashboard',
    titulo: 'O Teu Dashboard',
    descricao: 'Este é o teu centro de controlo. Aqui vês o progresso do dia, streak, refeições e muito mais.',
    icone: '📊',
    cor: 'from-emerald-500 to-teal-600',
    dica: 'Visita o dashboard todos os dias para manter o teu streak activo!'
  },
  {
    id: 'agua',
    titulo: 'Regista a Água 💧',
    descricao: 'Clica nos botões de água para registar cada copo. A meta é 2 litros por dia!',
    icone: '💧',
    cor: 'from-blue-400 to-cyan-500',
    dica: 'Bebe um copo de água assim que acordas para activar o metabolismo.'
  },
  {
    id: 'refeicoes',
    titulo: 'Regista as Refeições 🍽️',
    descricao: 'Clica em "Registar" ao lado de cada refeição para indicar se seguiste o plano.',
    icone: '🍽️',
    cor: 'from-orange-400 to-red-500',
    dica: 'Usa o método da mão: palma = proteína, punho = hidratos, polegar = gordura.'
  },
  {
    id: 'macros',
    titulo: 'Os Teus Macros',
    descricao: 'Acompanha as porções de proteína, hidratos e gordura. Os círculos mostram o teu progresso.',
    icone: '🥩',
    cor: 'from-red-400 to-pink-500',
    dica: 'Prioriza sempre a proteína em cada refeição!'
  },
  {
    id: 'streak',
    titulo: 'Mantém o Streak 🔥',
    descricao: 'Cada dia que registares algo, o teu streak aumenta. Não quebre a sequência!',
    icone: '🔥',
    cor: 'from-amber-400 to-orange-500',
    dica: 'Streaks de 7, 14 e 30 dias desbloqueiam conquistas especiais.'
  },
  {
    id: 'conquistas',
    titulo: 'Conquistas & Badges 🏅',
    descricao: 'Ganha badges ao atingir objectivos. Cada conquista dá-te pontos e aproxima-te do próximo nível!',
    icone: '🏆',
    cor: 'from-purple-400 to-indigo-500',
    dica: 'Consulta as conquistas na secção de Relatórios.'
  },
  {
    id: 'notificacoes',
    titulo: 'Activa as Notificações 🔔',
    descricao: 'Recebe lembretes para beber água, comer e fazer check-in. Configura os horários que te convêm.',
    icone: '🔔',
    cor: 'from-pink-400 to-rose-500',
    dica: 'Vai a Definições > Notificações para personalizar.'
  },
  {
    id: 'ready',
    titulo: g('Estás Pronto! 🚀', 'Estás Pronta! 🚀'),
    descricao: 'Agora tens tudo o que precisas. Lembra-te: consistência supera perfeição. Um dia de cada vez!',
    icone: '✨',
    cor: 'from-[#7C8B6F] to-[#9CAF88]',
    citacao: '"Quando o excesso cai, o corpo responde."'
  }
];

export default function OnboardingTutorial({ onComplete, onSkip }) {
  const [stepActual, setStepActual] = useState(0);
  const [animating, setAnimating] = useState(false);

  const step = TUTORIAL_STEPS[stepActual];
  const isFirst = stepActual === 0;
  const isLast = stepActual === TUTORIAL_STEPS.length - 1;
  const progress = ((stepActual + 1) / TUTORIAL_STEPS.length) * 100;

  const nextStep = () => {
    if (isLast) {
      localStorage.setItem('vitalis-onboarding-complete', 'true');
      if (onComplete) onComplete();
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setStepActual(prev => prev + 1);
      setAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    if (isFirst) return;
    setAnimating(true);
    setTimeout(() => {
      setStepActual(prev => prev - 1);
      setAnimating(false);
    }, 300);
  };

  const skip = () => {
    localStorage.setItem('vitalis-onboarding-complete', 'true');
    if (onSkip) onSkip();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] z-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-[#7C8B6F] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skip button */}
      {!isLast && (
        <div className="absolute top-4 right-4">
          <button
            onClick={skip}
            className="text-white/60 text-sm hover:text-white/80 transition-colors"
          >
            Saltar tutorial →
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div
          className={`max-w-md w-full transition-all duration-300 ${
            animating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
          }`}
        >
          {/* Icon */}
          <div
            className={`w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.cor} flex items-center justify-center shadow-2xl animate-float`}
          >
            <span className="text-5xl">{step.icone}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            {step.titulo}
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-center text-lg leading-relaxed mb-6">
            {step.descricao}
          </p>

          {/* Tip box */}
          {step.dica && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-white/80 text-sm">{step.dica}</p>
              </div>
            </div>
          )}

          {/* Quote */}
          {step.citacao && (
            <div className="text-center mb-6">
              <p className="text-xl text-white/90 italic font-light">
                {step.citacao}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 pb-8">
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === stepActual
                  ? 'w-6 bg-[#7C8B6F]'
                  : i < stepActual
                    ? 'bg-[#7C8B6F]/50'
                    : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 max-w-md mx-auto">
          {!isFirst && (
            <button
              onClick={prevStep}
              className="flex-1 py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              ← Anterior
            </button>
          )}
          <button
            onClick={nextStep}
            className={`flex-1 py-4 bg-gradient-to-r ${step.cor} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity ${
              isFirst ? 'text-lg' : ''
            }`}
          >
            {isLast ? 'Começar! 🚀' : isFirst ? 'Vamos lá! →' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook para verificar se deve mostrar o onboarding
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('vitalis-onboarding-complete');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('vitalis-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('vitalis-onboarding-complete');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding
  };
}

// Componente wrapper que mostra o onboarding se necessário
export function OnboardingWrapper({ children }) {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  if (showOnboarding) {
    return (
      <OnboardingTutorial
        onComplete={completeOnboarding}
        onSkip={completeOnboarding}
      />
    );
  }

  return children;
}
