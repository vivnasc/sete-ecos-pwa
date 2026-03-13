import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { g } from '../utils/genero';
import SEOHead from '../components/SEOHead';
import PartilharSocial from '../components/PartilharSocial';
import ScrollReveal from '../components/ScrollReveal';
import { ECO_PLANS, BUNDLE_PLANS, calculateBundlePrice } from '../lib/shared/subscriptionPlans';

/**
 * Landing Page de Bundles — todos os 4 níveis de desconto
 * Duo (15%), Trio (25%), Jornada (35%), Tudo (40%)
 */

const ECOS_INFO = [
  { key: 'vitalis', name: 'Vitalis', icon: '🌿', cor: '#7C8B6F', foco: 'Nutrição & Corpo' },
  { key: 'aurea', name: 'Áurea', icon: '✨', cor: '#C4A265', foco: 'Autovalor & Presença' },
  { key: 'serena', name: 'Serena', icon: '💧', cor: '#6B8E9B', foco: 'Emoções & Fluidez' },
  { key: 'ignis', name: 'Ignis', icon: '🔥', cor: '#C1634A', foco: 'Foco & Vontade' },
  { key: 'ventis', name: 'Ventis', icon: '🍃', cor: '#5D9B84', foco: 'Energia & Ritmo' },
  { key: 'ecoa', name: 'Ecoa', icon: '🔊', cor: '#4A90A4', foco: 'Voz & Expressão' },
  { key: 'imago', name: 'Imago', icon: '⭐', cor: '#8B7BA5', foco: 'Identidade & Essência' },
];

const BUNDLE_TIERS = [
  { ...BUNDLE_PLANS.duo, emoji: '🤝', destaque: false },
  { ...BUNDLE_PLANS.trio, emoji: '🌟', destaque: true },
  { ...BUNDLE_PLANS.jornada, emoji: '🚀', destaque: false },
  { ...BUNDLE_PLANS.tudo, emoji: '👑', destaque: false },
];

export default function LandingBundle() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [selectedEcos, setSelectedEcos] = useState(['vitalis', 'aurea']);
  const [periodo, setPeriodo] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleEco = (key) => {
    setSelectedEcos(prev => {
      if (prev.includes(key)) {
        if (prev.length <= 2) return prev; // mínimo 2
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  };

  const bundleCalc = useMemo(
    () => calculateBundlePrice(selectedEcos, periodo),
    [selectedEcos, periodo]
  );

  const handleCTA = () => {
    if (session) {
      navigate('/vitalis/pagamento');
    } else {
      navigate('/login', { state: { from: '/vitalis/pagamento' } });
    }
  };

  const scrollToCalculadora = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
  };

  const periodoLabels = { monthly: 'Mensal', semestral: 'Semestral', annual: 'Anual' };

  const faqs = [
    {
      q: 'Como funcionam os bundles?',
      a: 'Escolhes os ecos que queres combinar e o desconto é aplicado automaticamente. Quanto mais ecos combinares, maior o desconto: 2 ecos = 15%, 3 = 25%, 5+ = 35%, todos os 7 = 40%.',
    },
    {
      q: 'Posso começar com trial grátis?',
      a: 'Sim! Tens 7 dias de trial gratuito para experimentar TODOS os ecos do bundle. Cancelas quando quiseres durante o trial, sem custo.',
    },
    {
      q: 'Posso alterar os ecos do meu bundle depois?',
      a: 'Sim! Podes adicionar ou remover ecos a qualquer momento. O preço é recalculado automaticamente conforme a nova combinação.',
    },
    {
      q: 'Preciso usar todos os ecos ao mesmo tempo?',
      a: 'Não! Podes começar com um e ir explorando os outros ao teu ritmo. O acesso é simultâneo mas o ritmo é teu.',
    },
    {
      q: 'O que é o Aurora? Porque é gratuito?',
      a: 'Aurora é o módulo de integração final. Desbloqueia automaticamente quando completares todos os 7 ecos — é a tua graduação, sem custo adicional.',
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'Aceitamos M-Pesa e PayPal/cartão. O pagamento é processado de forma segura e recebes acesso imediato a todos os ecos do bundle.',
    },
    {
      q: 'Posso cancelar a qualquer momento?',
      a: 'Sim! Não há contratos nem multas. Cancelas quando quiseres e o acesso permanece até ao fim do período pago.',
    },
  ];

  return (
    <>
      <SEOHead
        title="Bundles — Combina Ecos e Poupa até 40% | Sete Ecos"
        description="Combina 2 ou mais ecos e poupa até 40%. Nutrição, emoções, foco, energia, voz, identidade — tudo num só pacote com desconto progressivo."
        path="/bundle"
        type="website"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#F5F2ED] via-[#FAF6F0] to-[#F5F2ED]">
        {/* Hero */}
        <section className="relative overflow-hidden hero-gradient-animated">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#6B5C4C] hover:text-[#4A4035] mb-6 transition-colors text-sm"
            >
              <span>←</span> Voltar ao início
            </Link>

            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Poupa até 40% com Bundles
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D3A25] mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Combina Ecos.{' '}
                <span className="bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  Poupa Mais.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B5C4C] mb-8 leading-relaxed">
                Quanto mais dimensões trabalhares, maior a transformação — e maior o desconto.
                De 15% (2 ecos) até 40% (todos os 7).
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <button
                  onClick={scrollToCalculadora}
                  className="bg-gradient-to-r from-purple-600 to-amber-500 text-white px-8 py-3.5 rounded-full font-semibold text-base hover:shadow-lg hover:scale-105 transition-all"
                >
                  Montar o Meu Bundle
                </button>
                <button
                  onClick={handleCTA}
                  className="border-2 border-[#7C8B6F] text-[#7C8B6F] px-8 py-3.5 rounded-full font-semibold text-base hover:bg-[#7C8B6F] hover:text-white transition-all"
                >
                  Começar 7 Dias Grátis
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-[#6B5C4C]">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  7 dias grátis
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancela quando quiser
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Até 40% desconto
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Bundle Tiers */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-10">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2D3A25] mb-3"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  4 Níveis de Bundle
                </h2>
                <p className="text-[#6B5C4C]">Quanto mais ecos, maior o desconto</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {BUNDLE_TIERS.map((tier) => {
                const exampleEcos = ECOS_INFO.slice(0, tier.minEcos).map(e => e.key);
                const calc = calculateBundlePrice(exampleEcos, 'monthly');
                return (
                  <div
                    key={tier.id}
                    className={`relative rounded-2xl p-4 sm:p-6 border-2 transition-all ${
                      tier.destaque
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-amber-50 shadow-lg scale-[1.02]'
                        : 'border-[#E8E2D9] bg-white hover:border-purple-300'
                    }`}
                  >
                    {tier.destaque && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Mais Popular
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl">{tier.emoji}</span>
                      <h3 className="font-bold text-base sm:text-lg text-[#2D3A25] mt-2 mb-1">{tier.name}</h3>
                      <div className="inline-block bg-gradient-to-r from-purple-600 to-amber-500 text-white text-xl sm:text-2xl font-bold px-4 py-1.5 rounded-full mb-2">
                        -{tier.discount}%
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5C4C] mb-3">{tier.description}</p>
                      {calc && (
                        <p className="text-xs text-[#6B5C4C]">
                          Ex: <span className="line-through">{calc.individualTotal.toLocaleString('pt-MZ')}</span>{' '}
                          → <span className="font-bold text-purple-700">{calc.bundlePrice.toLocaleString('pt-MZ')} MZN/mês</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Calculadora Interactiva */}
        <section id="calculadora" className="py-12 sm:py-16 bg-gradient-to-br from-[#2D3A25] to-[#3D4A2F] text-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Monta o Teu Bundle
              </h2>
              <p className="text-white/70">Selecciona os ecos que queres combinar (mínimo 2)</p>
            </div>

            {/* Eco Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {ECOS_INFO.map((eco) => {
                const isSelected = selectedEcos.includes(eco.key);
                const price = ECO_PLANS[eco.key]?.monthly?.price_mzn;
                return (
                  <button
                    key={eco.key}
                    onClick={() => toggleEco(eco.key)}
                    className={`relative rounded-xl p-3 sm:p-4 border-2 transition-all text-left ${
                      isSelected
                        ? 'border-white bg-white/15 shadow-lg'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className="text-xl sm:text-2xl">{eco.icon}</span>
                    <p className="font-bold text-sm sm:text-base mt-1">{eco.name}</p>
                    <p className="text-white/60 text-xs">{eco.foco}</p>
                    {price && <p className="text-white/50 text-xs mt-1">{price.toLocaleString('pt-MZ')} MZN/mês</p>}
                  </button>
                );
              })}
              {/* Aurora card */}
              <div className="rounded-xl p-3 sm:p-4 border-2 border-white/10 bg-white/5 opacity-60">
                <span className="text-xl sm:text-2xl">🌅</span>
                <p className="font-bold text-sm sm:text-base mt-1">Aurora</p>
                <p className="text-white/60 text-xs">Integração Final</p>
                <p className="text-green-400 text-xs mt-1 font-medium">Grátis com 7 ecos</p>
              </div>
            </div>

            {/* Periodo Toggle */}
            <div className="flex justify-center gap-1 mb-6 bg-white/10 rounded-full p-1 max-w-sm mx-auto">
              {(['monthly', 'semestral', 'annual']).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                    periodo === p ? 'bg-white text-[#2D3A25]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {periodoLabels[p]}
                </button>
              ))}
            </div>

            {/* Price Result */}
            {bundleCalc && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border-2 border-white/20 max-w-lg mx-auto text-center">
                <div className="mb-4">
                  <p className="text-white/60 text-sm mb-1">{selectedEcos.length} ecos seleccionados — {bundleCalc.bundle.name}</p>
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{bundleCalc.discount}% desconto
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-white/40 line-through text-lg">{bundleCalc.individualTotal.toLocaleString('pt-MZ')} MZN</p>
                  <p className="text-4xl sm:text-5xl font-bold text-white">
                    {bundleCalc.bundlePrice.toLocaleString('pt-MZ')}
                    <span className="text-lg text-white/60"> MZN</span>
                  </p>
                  <p className="text-white/50 text-sm">{periodoLabels[periodo]}</p>
                </div>

                <div className="bg-green-500/20 rounded-xl p-3 border border-green-400/30 mb-6">
                  <p className="text-green-200 text-sm">
                    Poupas <span className="font-bold text-green-300 text-lg">{bundleCalc.savings.toLocaleString('pt-MZ')} MZN</span>
                  </p>
                </div>

                {/* Selected ecos summary */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {selectedEcos.map(key => {
                    const eco = ECOS_INFO.find(e => e.key === key);
                    return eco ? (
                      <span key={key} className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                        {eco.icon} {eco.name}
                      </span>
                    ) : null;
                  })}
                  {selectedEcos.length === 7 && (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      🌅 Aurora (grátis)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCTA}
                  className="w-full bg-gradient-to-r from-purple-600 to-amber-500 text-white py-3.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all text-base"
                >
                  Começar 7 Dias Grátis
                </button>
                <p className="text-white/40 text-xs mt-3">M-Pesa | PayPal/Cartão • Pagamento seguro</p>
              </div>
            )}
          </div>
        </section>

        {/* O que cada eco inclui */}
        <section className="py-12 sm:py-16 bg-[#FAF6F0]">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-10">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2D3A25] mb-3"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  O Que Cada Eco Te Oferece
                </h2>
                <p className="text-[#6B5C4C]">7 dimensões, 1 transformação completa</p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ECOS_INFO.map((eco) => (
                <div
                  key={eco.key}
                  className="bg-white rounded-xl p-5 border-2 border-[#E8E2D9] hover:shadow-md transition-all"
                  style={{ borderLeftColor: eco.cor, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{eco.icon}</span>
                    <div>
                      <h3 className="font-bold text-[#2D3A25]">{eco.name}</h3>
                      <p className="text-xs text-[#6B5C4C]">{eco.foco}</p>
                    </div>
                    <span className="ml-auto text-sm font-semibold" style={{ color: eco.cor }}>
                      {ECO_PLANS[eco.key]?.monthly?.price_mzn?.toLocaleString('pt-MZ')} MZN/mês
                    </span>
                  </div>
                  <EcoFeatures eco={eco.key} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparação: separado vs bundle */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-10">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2D3A25] mb-3"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  Separado vs Bundle — A Diferença
                </h2>
              </div>
            </ScrollReveal>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#E8E2D9]">
                    <th className="text-left py-3 px-2 text-[#6B5C4C] font-medium">Combinação</th>
                    <th className="text-right py-3 px-2 text-[#6B5C4C] font-medium">Separado</th>
                    <th className="text-right py-3 px-2 text-purple-700 font-bold">Bundle</th>
                    <th className="text-right py-3 px-2 text-green-700 font-bold">Poupas</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Vitalis + Áurea', ecos: ['vitalis', 'aurea'] },
                    { label: 'Vitalis + Serena + Ignis', ecos: ['vitalis', 'serena', 'ignis'] },
                    { label: '5 Ecos (Jornada)', ecos: ['vitalis', 'aurea', 'serena', 'ignis', 'ventis'] },
                    { label: 'Todos os 7 Ecos', ecos: ['vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago'] },
                  ].map(({ label, ecos }) => {
                    const calc = calculateBundlePrice(ecos, 'monthly');
                    if (!calc) return null;
                    return (
                      <tr key={label} className="border-b border-[#E8E2D9]">
                        <td className="py-3 px-2 font-medium text-[#2D3A25]">{label}</td>
                        <td className="py-3 px-2 text-right text-[#6B5C4C] line-through">{calc.individualTotal.toLocaleString('pt-MZ')} MZN</td>
                        <td className="py-3 px-2 text-right font-bold text-purple-700">{calc.bundlePrice.toLocaleString('pt-MZ')} MZN</td>
                        <td className="py-3 px-2 text-right">
                          <span className="inline-block bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs">
                            -{calc.discount}% ({calc.savings.toLocaleString('pt-MZ')} MZN)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-[#6B5C4C] mt-2 text-center">Preços mensais. Descontos adicionais nos planos semestral e anual.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-[#FAF6F0]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#2D3A25] mb-3"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border-2 border-[#E8E2D9] rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-[#F5F2ED] transition-colors"
                  >
                    <span className="font-semibold text-[#2D3A25] text-sm sm:text-base">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-[#7C8B6F] transition-transform flex-shrink-0 ml-2 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-[#6B5C4C] leading-relaxed border-t border-[#E8E2D9] pt-3 text-sm">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-700 to-amber-500 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {g('Pronto', 'Pronta')} para Transformar Tudo?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-8">
              Começa com 7 dias grátis em qualquer bundle. Cancela quando quiseres.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={scrollToCalculadora}
                className="bg-white text-purple-700 px-8 py-3.5 rounded-full font-semibold text-base hover:shadow-lg hover:scale-105 transition-all"
              >
                Montar o Meu Bundle
              </button>
              <Link
                to="/"
                className="border-2 border-white text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-white/10 transition-all inline-block"
              >
                Explorar Ecos Individuais
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/80">
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Cancela quando quiser</span>
              <span>✓ Apoio em português</span>
            </div>
          </div>
        </section>

        {/* Social Share */}
        <div className="py-6 bg-[#F5F2ED]">
          <div className="max-w-4xl mx-auto px-4">
            <PartilharSocial
              url="https://app.seteecos.com/bundle"
              titulo="Bundles Sete Ecos — Poupa até 40%"
              descricao="Combina ecos e transforma todas as dimensões com desconto progressivo."
            />
          </div>
        </div>
      </div>
    </>
  );
}

/** Mini features list per eco */
function EcoFeatures({ eco }) {
  const features = {
    vitalis: ['Plano alimentar personalizado', 'Receitas adaptadas', 'Tracking diário', 'Coach IA 24/7'],
    aurea: ['100+ micro-práticas', 'Espelho de roupa', 'Carteira de merecimento', 'Diário de valor'],
    serena: ['Jornal emocional (16 emoções)', '6 técnicas de respiração', 'Rastreio de ciclo', 'SOS emocional'],
    ignis: ['Sessões de foco', 'Detector de dispersão', '16 desafios de fogo', 'Plano de acção'],
    ventis: ['Monitor de energia', 'Rotinas conscientes', '8 tipos de pausa', 'Detector de burnout'],
    ecoa: ['Micro-Voz (8 semanas)', 'Cartas não enviadas', 'Biblioteca de frases', 'Comunicação assertiva'],
    imago: ['Espelho triplo', 'Arqueologia pessoal', '50 valores nucleares', '5 meditações guiadas'],
  };
  const list = features[eco] || [];
  return (
    <ul className="space-y-1">
      {list.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-[#6B5C4C]">
          <span className="w-1 h-1 rounded-full bg-[#7C8B6F] flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
  );
}
