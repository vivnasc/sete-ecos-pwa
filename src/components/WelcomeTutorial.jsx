import { useState, useEffect } from 'react';
import { g } from '../utils/genero';

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
    // Check if tutorial was already completed (check both key formats for backwards compat)
    const completed = localStorage.getItem(storageKey) || localStorage.getItem(`${eco}-onboarding-complete`);
    if (!completed) {
      setIsVisible(true);
    }
  }, [storageKey, eco]);

  const tutorials = {
    vitalis: {
      title: g('Bem-vindo ao Vitalis!', 'Bem-vinda ao Vitalis!'),
      color: '#7C8B6F',
      steps: [
        {
          title: 'O teu Dashboard',
          description: 'Aqui vais encontrar um resumo do teu progresso, streaks e conquistas. Acompanha a tua jornada diariamente!',
          icon: '📊'
        },
        {
          title: 'Check-in Diário',
          description: 'Regista as tuas refeições, água, sono e exercício. A consistência é a chave para resultados duradouros.',
          icon: '✅'
        },
        {
          title: 'Plano Alimentar',
          description: 'O teu plano personalizado com porções medidas pela tua mão. Simples e prático!',
          icon: '🥗'
        },
        {
          title: 'Receitas',
          description: 'Centenas de receitas saudáveis e deliciosas para inspirar as tuas refeições.',
          icon: '👩‍🍳'
        },
        {
          title: 'Chat com Coach',
          description: 'Dúvidas? Fala comigo a qualquer momento. Estou aqui para te apoiar!',
          icon: '💬'
        },
        {
          title: g('Estamos juntos!', 'Estamos juntas!'),
          description: 'Esta é a TUA jornada. Vai ao teu ritmo, celebra cada pequena vitória. Estou aqui contigo!',
          icon: '💚'
        }
      ]
    },
    aurea: {
      title: g('Bem-vindo ao Aurea!', 'Bem-vinda ao Aurea!'),
      color: '#C9A227',
      steps: [
        {
          title: 'O teu Espaço Dourado',
          description: 'Um lugar para reconheceres o teu valor e cultivares a tua presença.',
          icon: '✨'
        },
        {
          title: 'Micro-Práticas',
          description: 'Pequenos momentos de consciência que transformam o teu dia.',
          icon: '🌟'
        },
        {
          title: 'Carteira de Merecimento',
          description: 'Guarda aqui as provas do teu valor. Relembra sempre que és merecedora.',
          icon: '💛'
        },
        {
          title: 'Diário de Reflexão',
          description: 'Um espaço seguro para os teus pensamentos e descobertas.',
          icon: '📝'
        },
        {
          title: 'Brilha!',
          description: 'O teu brilho interior está sempre lá. Aurea ajuda-te a vê-lo.',
          icon: '👑'
        }
      ]
    },
    lumina: {
      title: g('Bem-vindo ao Lumina!', 'Bem-vinda ao Lumina!'),
      color: '#8B5CF6',
      steps: [
        {
          title: 'Diagnóstico Diário',
          description: 'Responde a 7 perguntas simples sobre como te sentes hoje.',
          icon: '🔮'
        },
        {
          title: 'Leitura Personalizada',
          description: 'Recebe uma interpretação única baseada nas tuas respostas.',
          icon: '📖'
        },
        {
          title: 'Padrões e Insights',
          description: 'Ao longo do tempo, descobre padrões no teu bem-estar.',
          icon: '💜'
        }
      ]
    },
    serena: {
      title: g('Bem-vindo ao Serena!', 'Bem-vinda ao Serena!'),
      color: '#6B8E9B',
      steps: [
        {
          title: 'Diário Emocional',
          description: 'Regista as tuas emoções com a roda de 16 emoções e mapeia onde as sentes no corpo.',
          icon: '📝'
        },
        {
          title: 'Respiração Guiada',
          description: '6 técnicas de respiração para cada situação — da ansiedade ao sono.',
          icon: '🫁'
        },
        {
          title: 'Rituais de Libertação',
          description: 'Práticas simbólicas para soltar o que já não te serve.',
          icon: '🦋'
        },
        {
          title: 'Padrões e Ciclos',
          description: 'Descobre os teus padrões emocionais ao longo do tempo.',
          icon: '🔄'
        },
        {
          title: g('Estamos juntos!', 'Estamos juntas!'),
          description: 'Sentir é coragem. O Serena está aqui para ti, sem julgamento.',
          icon: '💧'
        }
      ]
    },
    ignis: {
      title: g('Bem-vindo ao Ignis!', 'Bem-vinda ao Ignis!'),
      color: '#C1634A',
      steps: [
        {
          title: 'Escolhas Conscientes',
          description: 'Regista cada decisão importante e percebe se escolhes por medo ou por vontade.',
          icon: '🎯'
        },
        {
          title: 'Sessões de Foco',
          description: 'Timer de concentração com rastreamento de distracções.',
          icon: '🔬'
        },
        {
          title: 'Desafios de Fogo',
          description: '16 desafios em 4 categorias: coragem, corte, alinhamento e iniciativa.',
          icon: '⚔️'
        },
        {
          title: 'Plano de Acção',
          description: 'Transforma intenções em passos concretos com prazos.',
          icon: '📋'
        },
        {
          title: 'Acende o Fogo!',
          description: 'Cada escolha consciente fortalece a tua chama interior.',
          icon: '🔥'
        }
      ]
    },
    ventis: {
      title: g('Bem-vindo ao Ventis!', 'Bem-vinda ao Ventis!'),
      color: '#5D9B84',
      steps: [
        {
          title: 'Monitor de Energia',
          description: 'Regista o teu nível de energia ao longo do dia e descobre os teus picos e vales.',
          icon: '⚡'
        },
        {
          title: 'Rotinas & Rituais',
          description: 'Constrói rotinas sustentáveis e transforma hábitos em rituais com intenção.',
          icon: '🔄'
        },
        {
          title: 'Pausas Conscientes',
          description: '8 tipos de pausa para recarregar — de micro-pausas a meditações.',
          icon: '⏸️'
        },
        {
          title: 'Movimento & Natureza',
          description: 'Yoga, dança, caminhada consciente e conexão com a natureza.',
          icon: '🌿'
        },
        {
          title: 'Flui!',
          description: 'A energia não é infinita — é renovável. Aprende a fluir sem forçar.',
          icon: '🍃'
        }
      ]
    },
    ecoa: {
      title: g('Bem-vindo ao Ecoa!', 'Bem-vinda ao Ecoa!'),
      color: '#4A90A4',
      steps: [
        {
          title: 'Mapa de Silenciamento',
          description: 'Identifica onde te calas: família, trabalho, relações, contigo.',
          icon: '🤐'
        },
        {
          title: 'Programa Micro-Voz',
          description: '8 semanas de exercícios progressivos para recuperar a tua expressão.',
          icon: '🎤'
        },
        {
          title: 'Cartas Não Enviadas',
          description: 'Escreve o que nunca disseste — perdão, raiva, gratidão, verdade.',
          icon: '✉️'
        },
        {
          title: 'Comunicação Assertiva',
          description: 'Templates para comunicar com clareza sem agressividade.',
          icon: '🗣️'
        },
        {
          title: 'Fala!',
          description: 'A tua voz existe. O Ecoa dá-te permissão para a usar.',
          icon: '🔊'
        }
      ]
    },
    imago: {
      title: g('Bem-vindo ao Imago!', 'Bem-vinda ao Imago!'),
      color: '#8B7BA5',
      steps: [
        {
          title: 'Espelho Triplo',
          description: 'Descobre a tua essência, máscara e aspiração — 3 dimensões de quem és.',
          icon: '🪞'
        },
        {
          title: 'Arqueologia de Si',
          description: 'Escava 5 camadas: infância, adolescência, juventude, vida adulta, presente.',
          icon: '⛏️'
        },
        {
          title: 'Valores Essenciais',
          description: 'Selecciona os teus valores-guia entre 50 opções universais.',
          icon: '💎'
        },
        {
          title: 'Meditações de Essência',
          description: '5 meditações guiadas para te encontrares a um nível mais profundo.',
          icon: '🧘'
        },
        {
          title: 'Descobre-te!',
          description: 'A identidade é um rio, não uma pedra. O Imago é a tua lente.',
          icon: '⭐'
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
    localStorage.setItem(`${eco}-onboarding-complete`, 'true');
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
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
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
            {currentStep < totalSteps - 1 ? 'Continuar' : 'Começar!'}
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
