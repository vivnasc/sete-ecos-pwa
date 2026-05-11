import { useState, useEffect } from 'react';
import { g } from '../utils/genero';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * WELCOME TUTORIAL — onboarding de primeiro acesso por Eco
 * Chave canónica única: `seteecos:tutorial:${eco}:v2:done`
 * Migração de chaves antigas no momento de leitura (idempotente).
 * Verificação síncrona no init para evitar flash.
 */

const TUTORIAL_VERSION = 'v2';

function storageKey(eco) {
  return `seteecos:tutorial:${eco}:${TUTORIAL_VERSION}:done`;
}

// Lê estado completo de forma síncrona, migrando chaves antigas.
// Devolve true se já foi visto.
export function tutorialJaVisto(eco = 'vitalis') {
  if (typeof window === 'undefined') return true;
  try {
    const canon = storageKey(eco);
    if (localStorage.getItem(canon)) return true;
    // Migrar chaves antigas (qualquer formato anterior)
    const legacyKeys = [
      `${eco}_tutorial_completed`,
      `${eco}-onboarding-complete`,
      `${eco}-tutorial-completed`,
      `${eco}_onboarding_complete`,
    ];
    for (const k of legacyKeys) {
      if (localStorage.getItem(k)) {
        localStorage.setItem(canon, new Date().toISOString());
        return true;
      }
    }
    return false;
  } catch {
    // localStorage indisponível (modo privado): assume já visto para não chatear
    return true;
  }
}

export function marcarTutorialVisto(eco = 'vitalis') {
  try {
    localStorage.setItem(storageKey(eco), new Date().toISOString());
  } catch { /* ignorar erro de quota / private mode */ }
}

export function reiniciarTutorial(eco = 'vitalis') {
  try {
    localStorage.removeItem(storageKey(eco));
    // limpar chaves antigas também
    [`${eco}_tutorial_completed`, `${eco}-onboarding-complete`, `${eco}-tutorial-completed`, `${eco}_onboarding_complete`].forEach(k => {
      localStorage.removeItem(k);
    });
  } catch { /* ignorar */ }
}

export default function WelcomeTutorial({ eco = 'vitalis', onComplete }) {
  // Estado inicial DERIVED — sem flash, sem race condition com useEffect
  const [isVisible, setIsVisible] = useState(() => !tutorialJaVisto(eco));
  const [currentStep, setCurrentStep] = useState(0);

  // Permitir fechar com ESC (também marca como visto)
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleComplete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const tutorials = {
    vitalis: {
      title: g('bem-vindo ao vitalis', 'bem-vinda ao vitalis'),
      steps: [
        { title: 'a tua página hoje', description: 'um resumo do dia: jejum em curso, refeições, macros, água, treino. é o que importa agora.' },
        { title: 'check-in diário', description: 'regista água, sono, exercício e humor. consistência abre o caminho.' },
        { title: 'plano alimentar', description: 'plano personalizado com porções medidas pela tua mão. sem balança.' },
        { title: 'receitas e menu', description: 'centenas de receitas e menu semanal com lista de compras automática.' },
        { title: 'fala comigo', description: 'dúvidas? toca no V no canto inferior direito. estou aqui contigo.' },
        { title: g('estamos juntos', 'estamos juntas'), description: 'vai ao teu ritmo. celebra cada pequena vitória.' }
      ]
    },
    aurea: {
      title: g('bem-vindo ao aurea', 'bem-vinda ao aurea'),
      steps: [
        { title: 'o teu espaço dourado', description: 'um lugar para reconhecer o teu valor e cultivar presença.' },
        { title: 'micro-práticas', description: 'pequenos momentos de consciência que transformam o dia.' },
        { title: 'carteira de merecimento', description: 'guarda aqui as provas do teu valor.' },
        { title: 'diário de reflexão', description: 'um espaço seguro para os teus pensamentos.' },
        { title: 'brilha', description: 'o teu brilho está sempre lá. o aurea ajuda-te a vê-lo.' }
      ]
    },
    lumina: {
      title: g('bem-vindo ao lumina', 'bem-vinda ao lumina'),
      steps: [
        { title: 'diagnóstico diário', description: 'responde a 7 perguntas simples sobre como te sentes hoje.' },
        { title: 'leitura personalizada', description: 'recebe uma interpretação única baseada nas tuas respostas.' },
        { title: 'padrões e insights', description: 'ao longo do tempo, descobre padrões no teu bem-estar.' }
      ]
    },
    serena: {
      title: g('bem-vindo ao serena', 'bem-vinda ao serena'),
      steps: [
        { title: 'diário emocional', description: 'roda de 16 emoções e onde as sentes no corpo.' },
        { title: 'respiração guiada', description: '6 técnicas para cada situação.' },
        { title: 'rituais de libertação', description: 'práticas simbólicas para soltar.' },
        { title: 'padrões e ciclos', description: 'descobre os teus padrões ao longo do tempo.' },
        { title: g('estamos juntos', 'estamos juntas'), description: 'sentir é coragem. sem julgamento.' }
      ]
    },
    ignis: {
      title: g('bem-vindo ao ignis', 'bem-vinda ao ignis'),
      steps: [
        { title: 'escolhas conscientes', description: 'percebe se escolhes por medo ou vontade.' },
        { title: 'sessões de foco', description: 'timer de concentração com rastreio de distracções.' },
        { title: 'desafios de fogo', description: '16 desafios em 4 categorias.' },
        { title: 'plano de acção', description: 'transforma intenções em passos com prazos.' },
        { title: 'acende o fogo', description: 'cada escolha consciente fortalece a chama interior.' }
      ]
    },
    ventis: {
      title: g('bem-vindo ao ventis', 'bem-vinda ao ventis'),
      steps: [
        { title: 'monitor de energia', description: 'descobre os teus picos e vales.' },
        { title: 'rotinas e rituais', description: 'transforma hábitos em rituais com intenção.' },
        { title: 'pausas conscientes', description: '8 tipos de pausa para recarregar.' },
        { title: 'movimento e natureza', description: 'yoga, dança, caminhada consciente.' },
        { title: 'flui', description: 'aprende a fluir sem forçar.' }
      ]
    },
    ecoa: {
      title: g('bem-vindo ao ecoa', 'bem-vinda ao ecoa'),
      steps: [
        { title: 'mapa de silenciamento', description: 'identifica onde te calas.' },
        { title: 'programa micro-voz', description: '8 semanas para recuperar a expressão.' },
        { title: 'cartas não enviadas', description: 'escreve o que nunca disseste.' },
        { title: 'comunicação assertiva', description: 'templates para comunicar com clareza.' },
        { title: 'fala', description: 'a tua voz existe.' }
      ]
    },
    imago: {
      title: g('bem-vindo ao imago', 'bem-vinda ao imago'),
      steps: [
        { title: 'espelho triplo', description: 'essência, máscara e aspiração.' },
        { title: 'arqueologia de si', description: 'escava 5 camadas da tua história.' },
        { title: 'valores essenciais', description: 'selecciona os teus valores-guia.' },
        { title: 'meditações de essência', description: '5 meditações guiadas.' },
        { title: 'descobre-te', description: 'a identidade é um rio.' }
      ]
    }
  };

  const tutorial = tutorials[eco] || tutorials.vitalis;
  const totalSteps = tutorial.steps.length;

  const handleComplete = () => {
    marcarTutorialVisto(eco);
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
    else handleComplete();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!isVisible) return null;

  const step = tutorial.steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fnx-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        // Click no backdrop fecha (também marca como visto)
        if (e.target === e.currentTarget) handleComplete();
      }}
    >
      <div
        className="relative w-full max-w-md fnx-card-feature"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Header editorial */}
        <div style={{ padding: '24px 24px 16px' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <span className="fnx-label-cap">
                passo {currentStep + 1} de {totalSteps}
              </span>
              <h2
                className="fnx-text-ink mt-2"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '22px',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                {currentStep === 0 ? tutorial.title : step.title}
              </h2>
              <div
                aria-hidden
                className="mt-3"
                style={{ height: '1px', width: '24px', background: 'var(--fnx-ouro)' }}
              />
            </div>
            <button
              onClick={handleComplete}
              className="fnx-text-faint hover:opacity-70 fnx-transition p-1 -mt-1 -mr-1"
              aria-label="fechar tutorial"
            >
              <X size={18} strokeWidth={1.4} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '4px 24px 16px' }}>
          {currentStep > 0 && (
            <h3
              className="fnx-text-ink mb-2"
              style={{ fontFamily: 'var(--font-editorial)', fontSize: '17px', fontWeight: 400, letterSpacing: '-0.015em' }}
            >
              {step.title}
            </h3>
          )}
          <p
            className="fnx-text-soft"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: '15px',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Progress hairline */}
        <div className="h-px w-full" style={{ background: 'var(--fnx-hair)' }}>
          <div
            className="h-px"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              background: 'var(--fnx-ouro)',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between" style={{ padding: '16px 24px 24px' }}>
          <button
            onClick={handlePrev}
            className="fnx-btn-ghost"
            disabled={currentStep === 0}
            style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
            aria-hidden={currentStep === 0}
          >
            <ArrowLeft size={14} strokeWidth={1.4} />
            <span>voltar</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              className="fnx-text-faint fnx-transition hover:opacity-70"
              style={{ fontSize: '12.5px', letterSpacing: '0.04em' }}
            >
              saltar
            </button>
            <button onClick={handleNext} className="fnx-btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
              <span>{currentStep < totalSteps - 1 ? 'próximo' : 'começar'}</span>
              <ArrowRight size={14} strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook simples — não usado directamente pelo Dashboard mas mantido
 * para compatibilidade com outros sítios que o importem.
 */
export function useTutorialStatus(eco) {
  const [shouldShow, setShouldShow] = useState(() => !tutorialJaVisto(eco));
  return {
    shouldShow,
    markComplete: () => { marcarTutorialVisto(eco); setShouldShow(false); },
    reset: () => { reiniciarTutorial(eco); setShouldShow(true); }
  };
}
