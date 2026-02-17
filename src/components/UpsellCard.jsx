import React from 'react';
import { Link } from 'react-router-dom';

/**
 * UPSELL CARD - Recomendação contextual apos leitura Lumina
 *
 * Aparece apos a leitura com mensagem adaptada ao padrao detectado.
 * So visivel para quem NAO tem Vitalis/Aurea activo.
 *
 * Props:
 * - padrao: string - o padrao detectado pela leitura Lumina
 * - onDismiss: function - callback para fechar o card
 */

// Mapeamento de padroes Lumina para mensagens de upsell
const UPSELL_MAP = {
  // Padroes relacionados com corpo/energia → VITALIS
  corpoGrita: {
    eco: 'vitalis',
    titulo: 'O teu corpo esta a pedir atencao',
    mensagem: 'O Vitalis oferece um plano alimentar personalizado para cuidar do que o teu corpo precisa — sem restricoes, sem culpa.',
    cta: 'Experimentar Vitalis'
  },
  esgotamento: {
    eco: 'vitalis',
    titulo: 'Esgotamento pede nutricao real',
    mensagem: 'Quando o corpo esta esgotado, a alimentacao certa faz toda a diferenca. O Vitalis ajuda-te com isso.',
    cta: 'Experimentar Vitalis'
  },
  corpoLidera: {
    eco: 'vitalis',
    titulo: 'O teu corpo quer liderar',
    mensagem: 'Aproveita este impulso! O Vitalis da-te um plano para acompanhar a energia do teu corpo.',
    cta: 'Experimentar Vitalis'
  },

  // Padroes relacionados com mente/emocao → AUREA
  menteSabota: {
    eco: 'aurea',
    titulo: 'A mente precisa de cuidado',
    mensagem: 'O Aurea tem micro-praticas diarias para reconectar contigo mesma quando a mente sabota.',
    cta: 'Experimentar Aurea'
  },
  falsaClareza: {
    eco: 'aurea',
    titulo: 'Clareza real vem de dentro',
    mensagem: 'O Aurea ajuda-te a construir presenca verdadeira com praticas simples e profundas.',
    cta: 'Experimentar Aurea'
  },
  dissociacao: {
    eco: 'aurea',
    titulo: 'Reconecta contigo',
    mensagem: 'O Aurea tem ferramentas para voltares a sentir-te presente — sem pressa, ao teu ritmo.',
    cta: 'Experimentar Aurea'
  },

  // Padroes criticos → VITALIS (suporte da coach)
  crit_vid: {
    eco: 'vitalis',
    titulo: 'Precisas de apoio real',
    mensagem: 'No Vitalis, a coach Vivianne acompanha-te pessoalmente. Nao tens de fazer isto sozinha.',
    cta: 'Conhecer o suporte'
  },
  crit_pfm: {
    eco: 'vitalis',
    titulo: 'Um passo de cada vez',
    mensagem: 'O Vitalis tem um Espaco de Retorno criado para momentos assim — ferramentas de respiracao, escrita e apoio.',
    cta: 'Conhecer o suporte'
  },
  crit_tba: {
    eco: 'vitalis',
    titulo: 'Dia de sobrevivencia',
    mensagem: 'O Vitalis entende dias assim. O Espaco de Retorno ajuda-te a cuidar de ti sem pressao.',
    cta: 'Conhecer o suporte'
  },

  // Padroes positivos → VITALIS (maximizar)
  forcaMax: {
    eco: 'vitalis',
    titulo: 'Estas no teu melhor',
    mensagem: 'Maximiza este momento! O Vitalis ajuda-te a manter este equilibrio com um plano feito para ti.',
    cta: 'Aproveitar agora'
  },
  alinhamento: {
    eco: 'vitalis',
    titulo: 'Alinhada e pronta',
    mensagem: 'Este e o momento perfeito para comecar. O Vitalis potencia o que ja estas a sentir.',
    cta: 'Comecar agora'
  },
  presencaRara: {
    eco: 'aurea',
    titulo: 'Presenca rara merece cuidado',
    mensagem: 'Protege este estado. O Aurea tem praticas para honrar e manter esta presenca.',
    cta: 'Experimentar Aurea'
  },

  // Default para padroes sem mapeamento especifico
  _default: {
    eco: 'vitalis',
    titulo: 'Transforma a tua leitura em accao',
    mensagem: 'O SETE ECOS tem ferramentas para cada momento do teu dia. Experimenta 7 dias gratis.',
    cta: 'Experimentar gratis'
  }
};

const ECO_STYLES = {
  vitalis: {
    gradient: 'from-[#7C8B6F] to-[#5A6B4F]',
    accent: '#7C8B6F',
    link: '/vitalis/pagamento',
    logo: '/logos/VITALIS_LOGO_V3.png'
  },
  aurea: {
    gradient: 'from-[#C9A227] to-[#8B6914]',
    accent: '#C9A227',
    link: '/aurea/pagamento',
    logo: '/logos/logo_aurea.png'
  }
};

export default function UpsellCard({ padrao, onDismiss }) {
  const upsell = UPSELL_MAP[padrao] || UPSELL_MAP._default;
  const style = ECO_STYLES[upsell.eco];

  return (
    <div className="mt-6 relative overflow-hidden rounded-2xl shadow-xl border border-white/10">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-90`} />

      {/* Content */}
      <div className="relative p-5">
        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Logo + title */}
        <div className="flex items-center gap-3 mb-3">
          <img src={style.logo} alt="" className="w-8 h-8 opacity-80" onError={(e) => { e.target.style.display = 'none'; }} />
          <h3 className="text-white font-bold text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {upsell.titulo}
          </h3>
        </div>

        {/* Message */}
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          {upsell.mensagem}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            to={style.link}
            className="flex-1 text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
          >
            {upsell.cta}
          </Link>
          <span className="text-white/40 text-xs">7 dias gratis</span>
        </div>
      </div>
    </div>
  );
}
