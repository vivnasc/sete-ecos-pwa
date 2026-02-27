import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { g } from '../utils/genero';
import SEOHead from '../components/SEOHead';
import PartilharSocial from '../components/PartilharSocial';
import ScrollReveal from '../components/ScrollReveal';
import { ECO_PLANS, BUNDLE_PLANS } from '../lib/shared/subscriptionPlans';

/**
 * Landing Page do Bundle Vitalis + Áurea
 * Página dedicada para promover o pacote combinado com 15% de desconto
 */

export default function LandingBundle() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const scrollToPrecos = () => {
    document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => {
    if (session) {
      navigate('/vitalis/pagamento');
    } else {
      navigate('/login', { state: { from: '/vitalis/pagamento' } });
    }
  };

  // Precos calculados dinamicamente a partir da fonte central
  const vitalis = ECO_PLANS.vitalis;
  const aurea = ECO_PLANS.aurea;
  const duoDiscount = BUNDLE_PLANS.duo.discount / 100; // 0.15
  const calcBundle = (period) => {
    const individual = (vitalis[period]?.price_mzn || 0) + (aurea[period]?.price_mzn || 0);
    const bundle = Math.round(individual * (1 - duoDiscount));
    return { individual, bundle, economia: individual - bundle };
  };
  const precos = {
    mensal: calcBundle('monthly'),
    semestral: calcBundle('semestral'),
    anual: calcBundle('annual'),
  };

  const beneficios = [
    {
      icon: '🌿',
      titulo: 'Nutrição Completa',
      descricao: 'Plano alimentar personalizado, receitas adaptadas, tracking completo',
      eco: 'Vitalis',
    },
    {
      icon: '✨',
      titulo: 'Autovalor & Presença',
      descricao: 'Micro-práticas diárias, espelho de roupa, carteira de merecimento',
      eco: 'Áurea',
    },
    {
      icon: '🧘‍♀️',
      titulo: 'Apoio Emocional',
      descricao: 'Espaço de Retorno (Vitalis) + Diário de Merecimento (Áurea)',
      eco: 'Ambos',
    },
    {
      icon: '🤖',
      titulo: 'Coach IA 24/7',
      descricao: 'Duas coaches especializadas sempre disponíveis para ti',
      eco: 'Ambos',
    },
    {
      icon: '📊',
      titulo: 'Gamificação Total',
      descricao: 'Conquistas, XP, streaks e desafios em ambos os módulos',
      eco: 'Ambos',
    },
    {
      icon: '🎯',
      titulo: 'Transformação Holística',
      descricao: 'Corpo + Mente + Emoção trabalhados em simultâneo',
      eco: 'Bundle',
    },
  ];

  const testemunhos = [
    {
      nome: 'Maria José',
      foto: null,
      texto: 'Comecei com o Vitalis e depois adicionei o Áurea. A transformação foi completa - não só perdi 8kg, mas aprendi a valorizar-me.',
      eco: 'Bundle',
    },
    {
      nome: 'Ana Paula',
      foto: null,
      texto: 'O bundle foi a melhor decisão. O Vitalis cuida do meu corpo, o Áurea cuida da minha autoestima. Trabalham perfeitamente juntos.',
      eco: 'Bundle',
    },
    {
      nome: 'Cleide',
      foto: null,
      texto: 'Poupar 15% e ter acesso aos dois programas? Foi óbvio. Estou na minha melhor versão em todos os sentidos.',
      eco: 'Bundle',
    },
  ];

  const faqs = [
    {
      q: 'O que está incluído no Bundle?',
      a: 'Acesso completo e ilimitado ao VITALIS (coaching nutricional) e ÁUREA (programa de autovalor). Todas as funcionalidades de ambos os módulos, sem restrições.',
    },
    {
      q: 'Posso começar com trial grátis?',
      a: 'Sim! Tens 7 dias de trial gratuito para experimentar AMBOS os módulos. Cancelas quando quiseres durante o trial, sem custo.',
    },
    {
      q: 'Quanto poupo com o Bundle vs comprar separado?',
      a: 'Poupas 15% em todos os planos. No plano anual, por exemplo, poupas significativamente vs comprar Vitalis e Áurea separadamente.',
    },
    {
      q: 'Preciso usar os dois ao mesmo tempo?',
      a: 'Não! Podes começar com um e adicionar o outro quando te sentires preparado/a. O acesso é simultâneo, mas o ritmo é teu.',
    },
    {
      q: 'Posso fazer upgrade do Vitalis para Bundle?',
      a: 'Sim! Se já tens Vitalis, podes fazer upgrade para Bundle pagando apenas a diferença proporcional.',
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'Aceitas M-Pesa e PayPal/cartão. O pagamento é processado de forma segura e recebes acesso imediato.',
    },
    {
      q: 'Posso cancelar a qualquer momento?',
      a: 'Sim! Não há contratos nem multas. Cancelas quando quiseres e o acesso permanece até ao fim do período pago.',
    },
    {
      q: 'Há garantia de devolução?',
      a: 'Sim! Tens 7 dias de garantia total. Se não ficares satisfeito/a, devolvemos 100% do valor pago.',
    },
  ];

  return (
    <>
      <SEOHead
        title="Bundle Vitalis + Áurea - Poupa 15% | Sete Ecos"
        description="Transformação completa: Nutrição + Autovalor. Vitalis + Áurea juntos com 15% de desconto. Coaching personalizado para mulheres em Moçambique."
        path="/bundle"
        imageUrl="https://app.seteecos.com/logos/bundle-social.png"
        type="website"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#F5F2ED] via-[#FAF6F0] to-[#F5F2ED]">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-gradient-animated">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7C8B6F]/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#C9A227]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
            {/* Back to home */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#6B5C4C] hover:text-[#4A4035] mb-8 transition-colors"
            >
              <span>←</span> Voltar ao início
            </Link>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Text */}
              <div>
                <div className="inline-block mb-4">
                  <span className="bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] text-white text-sm font-semibold px-4 py-2 rounded-full">
                    ✨ Poupa 15% com o Bundle
                  </span>
                </div>

                <h1
                  className="text-4xl md:text-5xl font-bold text-[#2D3A25] mb-6"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  Vitalis + Áurea
                  <br />
                  <span className="bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] bg-clip-text text-transparent">
                    Transformação Completa
                  </span>
                </h1>

                <p className="text-lg text-[#6B5C4C] mb-8 leading-relaxed">
                  Cuida do teu corpo com o <strong>Vitalis</strong> (nutrição) e da tua mente
                  com o <strong>Áurea</strong> (autovalor). Dois programas que trabalham em
                  sinergia para a tua melhor versão.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleCTA}
                    className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all animate-pulse-glow"
                  >
                    Começar 7 Dias Grátis
                  </button>
                  <button
                    onClick={scrollToPrecos}
                    className="border-2 border-[#7C8B6F] text-[#7C8B6F] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#7C8B6F] hover:text-white transition-all"
                  >
                    Ver Preços
                  </button>
                </div>

                <div className="flex items-center gap-6 text-sm text-[#6B5C4C]">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    7 dias grátis
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cancela quando quiser
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    15% desconto
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#E8E2D9]">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-16 h-16" />
                    <span className="text-3xl text-[#C9A227]">+</span>
                    <img src="/logos/AUREA_LOGO_V3.png" alt="Áurea" className="w-16 h-16" />
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-sm text-[#6B5C4C] mb-2">Poupa até</p>
                    <p className="text-4xl font-bold text-[#C9A227] mb-1">{precos.anual.economia.toLocaleString('pt-MZ')} MZN</p>
                    <p className="text-sm text-[#6B5C4C]">no plano anual</p>
                  </div>

                  <div className="space-y-3">
                    {['Nutrição personalizada', 'Autovalor & presença', 'Coach IA 24/7', 'Garantia 7 dias'].map(
                      (item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-[#4A4035]">{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-[#C9A227] text-white px-6 py-3 rounded-full shadow-lg transform rotate-12">
                  <p className="font-bold text-lg">-15%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-12">
                <h2
                  className="text-3xl md:text-4xl font-bold text-[#2D3A25] mb-4"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  O Melhor de Ambos os Mundos
                </h2>
                <p className="text-lg text-[#6B5C4C]">
                  Tudo o que precisas para uma transformação completa
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {beneficios.map((beneficio, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#F5F2ED] to-white p-6 rounded-2xl border-2 border-[#E8E2D9] hover:border-[#7C8B6F] transition-all duration-300 hover:shadow-lg"
                >
                  <div className="text-4xl mb-4">{beneficio.icon}</div>
                  <h3 className="font-bold text-xl text-[#2D3A25] mb-2">{beneficio.titulo}</h3>
                  <p className="text-[#6B5C4C] mb-3">{beneficio.descricao}</p>
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[#7C8B6F]/10 to-[#C9A227]/10 text-[#7C8B6F]">
                    {beneficio.eco}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Preços Section */}
        <section id="precos" className="py-16 bg-gradient-to-br from-[#2D3A25] to-[#3D4A2F] text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quanto Poupas com o Bundle?
              </h2>
              <p className="text-lg text-white/80">Comparação: Individual vs Bundle</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(precos).map(([periodo, valores]) => (
                <div
                  key={periodo}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 hover:border-[#C9A227] transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold capitalize mb-2">{periodo}</h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] mx-auto rounded-full" />
                  </div>

                  {/* Individual */}
                  <div className="mb-4 pb-4 border-b border-white/20">
                    <p className="text-sm text-white/60 mb-1">Individual (separado)</p>
                    <p className="text-xl text-white/40 line-through">
                      {valores.individual.toLocaleString('pt-MZ')} MZN
                    </p>
                  </div>

                  {/* Bundle */}
                  <div className="mb-4">
                    <p className="text-sm text-white/80 mb-1">Bundle</p>
                    <p className="text-4xl font-bold text-[#C9A227] mb-1">
                      {valores.bundle.toLocaleString('pt-MZ')}
                      <span className="text-lg text-white/60"> MZN</span>
                    </p>
                    <p className="text-sm text-white/60">
                      ≈ ${Math.round(valores.bundle / 65.5)} USD/mês
                    </p>
                  </div>

                  {/* Economia */}
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/30">
                    <p className="text-sm text-green-200 mb-1">Poupas</p>
                    <p className="text-2xl font-bold text-green-300">
                      {valores.economia.toLocaleString('pt-MZ')} MZN
                    </p>
                    <p className="text-xs text-green-200/80">
                      ≈ ${Math.round(valores.economia / 65.5)} USD
                    </p>
                  </div>

                  <button
                    onClick={handleCTA}
                    className="w-full mt-6 bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] text-white py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Começar Agora
                  </button>
                </div>
              ))}
            </div>

            <p className="text-center text-white/60 mt-8 text-sm">
              💳 M-Pesa | PayPal/Cartão • 🔒 Pagamento 100% seguro
            </p>
          </div>
        </section>

        {/* Testemunhos Section */}
        <section className="py-16 bg-[#FAF6F0]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold text-[#2D3A25] mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quem Já Transformou com o Bundle
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testemunhos.map((test, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border-2 border-[#E8E2D9] shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] flex items-center justify-center text-white font-bold text-xl">
                      {test.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3A25]">{test.nome}</p>
                      <p className="text-xs text-[#6B5C4C]">Cliente Bundle</p>
                    </div>
                  </div>
                  <p className="text-[#4A4035] italic leading-relaxed">"{test.texto}"</p>
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold text-[#2D3A25] mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-2 border-[#E8E2D9] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#F5F2ED] transition-colors"
                  >
                    <span className="font-semibold text-[#2D3A25]">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-[#7C8B6F] transition-transform ${
                        openFaq === i ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4 text-[#6B5C4C] leading-relaxed border-t border-[#E8E2D9] pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#7C8B6F] to-[#C9A227] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {g('Pronto', 'Pronta')} para a Tua Transformação Completa?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Começa com 7 dias grátis. Cancela quando quiseres. Garantia de devolução total.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleCTA}
                className="bg-white text-[#7C8B6F] px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                Começar 7 Dias Grátis
              </button>
              <Link
                to="/vitalis"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all inline-block"
              >
                Saber Mais sobre Vitalis
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-white/80">
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Cancela quando quiser</span>
              <span>✓ Apoio em português</span>
            </div>
          </div>
        </section>

        {/* Social Share */}
        <div className="py-8 bg-[#F5F2ED]">
          <div className="max-w-4xl mx-auto px-4">
            <PartilharSocial
              url="https://app.seteecos.com/bundle"
              titulo="Vitalis + Áurea Bundle - Poupa 15%"
              descricao="Transformação completa: Nutrição + Autovalor. Coaching personalizado para mulheres."
            />
          </div>
        </div>
      </div>
    </>
  );
}
