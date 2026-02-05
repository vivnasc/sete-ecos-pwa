import { useState, useEffect } from 'react';

/**
 * WELCOME TUTORIAL - First-time user onboarding
 * Shows a step-by-step tutorial for first-time users
 * Saves completion state to localStorage
 */
export default function WelcomeTutorial({ eco = 'vitalis', onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const storageKey = `${eco}_tutorial_completed`;

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const tutorials = {
    vitalis: {
      title: 'Bem-vinda ao Vitalis!',
      color: '#7C8B6F',
      steps: [
        {
          title: 'O teu Dashboard',
          description: 'Aqui vais encontrar um resumo do teu progresso, streaks e conquistas. Acompanha a tua jornada diariamente!',
          icon: '📊'
        },
        {
          title: 'Check-in Diario',
          description: 'Regista as tuas refeicoes, agua, sono e exercicio. A consistencia e a chave para resultados duradouros.',
          icon: '✅'
        },
        {
          title: 'Plano Alimentar',
          description: 'O teu plano personalizado com porcoes medidas pela tua mao. Simples e pratico!',
          icon: '🥗'
        },
        {
          title: 'Receitas',
          description: 'Centenas de receitas saudaveis e deliciosas para inspirar as tuas refeicoes.',
          icon: '👩‍🍳'
        },
        {
          title: 'Chat com Coach',
          description: 'Duvidas? Fala comigo a qualquer momento. Estou aqui para te apoiar!',
          icon: '💬'
        },
        {
          title: 'Estamos juntas!',
          description: 'Esta e a TUA jornada. Vai ao teu ritmo, celebra cada pequena vitoria. Estou aqui contigo!',
          icon: '💚'
        }
      ]
    },
    aurea: {
      title: 'Bem-vinda ao Aurea!',
      color: '#C9A227',
      steps: [
        {
          title: 'O teu Espaco Dourado',
          description: 'Um lugar para reconheceres o teu valor e cultivares a tua presenca.',
          icon: '✨'
        },
        {
          title: 'Micro-Praticas',
          description: 'Pequenos momentos de consciencia que transformam o teu dia.',
          icon: '🌟'
        },
        {
          title: 'Carteira de Merecimento',
          description: 'Guarda aqui as provas do teu valor. Relembra sempre que es merecedora.',
          icon: '💛'
        },
        {
          title: 'Diario de Reflexao',
          description: 'Um espaco seguro para os teus pensamentos e descobertas.',
          icon: '📝'
        },
        {
          title: 'Brilha!',
          description: 'O teu brilho interior esta sempre la. Aurea ajuda-te a ve-lo.',
          icon: '👑'
        }
      ]
    },
    lumina: {
      title: 'Bem-vinda ao Lumina!',
      color: '#8B5CF6',
      steps: [
        {
          title: 'Diagnostico Diario',
          description: 'Responde a 7 perguntas simples sobre como te sentes hoje.',
          icon: '🔮'
        },
        {
          title: 'Leitura Personalizada',
          description: 'Recebe uma interpretacao unica baseada nas tuas respostas.',
          icon: '📖'
        },
        {
          title: 'Padroes e Insights',
          description: 'Ao longo do tempo, descobre padroes no teu bem-estar.',
          icon: '💜'
        }
      ]
    }
  };

  const tutorial = tutorials[eco] || tutorials.vitalis;
  const totalSteps = tutorial.steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = tutorial.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header with progress */}
        <div
          className="p-6 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${tutorial.color}, ${tutorial.color}dd)` }}
        >
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {currentStep === 0 ? tutorial.title : step.title}
          </h2>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {tutorial.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-white w-6'
                    : index < currentStep
                    ? 'bg-white/80'
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">{step.icon}</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${tutorial.color}, ${tutorial.color}dd)` }}
          >
            {currentStep < totalSteps - 1 ? 'Continuar' : 'Comecar!'}
          </button>

          <div className="flex justify-between items-center">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Voltar
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Saltar tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if tutorial should be shown
 */
export function useTutorialStatus(eco) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`${eco}_tutorial_completed`);
    setShouldShow(!completed);
  }, [eco]);

  const markComplete = () => {
    localStorage.setItem(`${eco}_tutorial_completed`, 'true');
    setShouldShow(false);
  };

  const reset = () => {
    localStorage.removeItem(`${eco}_tutorial_completed`);
    setShouldShow(true);
  };

  return { shouldShow, markComplete, reset };
}
