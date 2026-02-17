import React from 'react'
import { Link } from 'react-router-dom'
import { ECO_PLANS } from '../lib/shared/subscriptionPlans'
import { g } from '../utils/genero'

/**
 * SERENA - Landing Page
 * "Emoção & Fluidez" - Chakra Svadhisthana (Sacral), Elemento: Água
 * Módulo de gestão emocional e fluidez interior
 */

const LandingSerena = () => {
  const serena = ECO_PLANS.serena
  const planos = [serena.monthly, serena.semestral, serena.annual]

  const features = [
    {
      icone: '📓',
      titulo: 'Diário Emocional',
      desc: 'Regista o que sentes sem julgamento. Identifica padrões emocionais ao longo do tempo.'
    },
    {
      icone: '🌬️',
      titulo: 'Respiração Guiada',
      desc: 'Exercícios de respiração para cada estado emocional. Acalma o corpo, clareia a mente.'
    },
    {
      icone: '🆘',
      titulo: 'SOS Emocional',
      desc: 'Quando a emoção transborda, tens apoio imediato. Técnicas rápidas de 60 segundos.'
    },
    {
      icone: '🌊',
      titulo: 'Práticas de Fluidez',
      desc: 'Movimentos, visualizações e exercícios para desbloquear emoções estagnadas.'
    },
    {
      icone: '🔥',
      titulo: 'Rituais de Libertação',
      desc: 'Rituais para soltar o que já não serve. Raiva, mágoa, culpa — tudo tem saída.'
    },
    {
      icone: '💬',
      titulo: 'Coach Serena',
      desc: 'Coach virtual especializada em emoções. Guia-te com gentileza quando precisas.'
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Sente',
      desc: 'Reconhece a emoção. Dá-lhe nome. Sem fugir, sem julgar.'
    },
    {
      numero: '02',
      titulo: 'Processa',
      desc: 'Respiração, rituais, práticas. O corpo processa o que a mente não consegue sozinha.'
    },
    {
      numero: '03',
      titulo: 'Flui',
      desc: 'Deixa ir o que não serve. A emoção é energia — quando flui, liberta.'
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>

      {/* ===== HERO ===== */}
      <header
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #2a4a5a 40%, #6B8E9B 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#6B8E9B]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a2e3a]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#6B8E9B]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Svadhisthana &middot; Sacral &middot; Elemento: Água
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            SERENA
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}
          >
            Emoção &amp; Fluidez
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            O espaço onde as tuas emoções finalmente têm voz.
            Sem julgamento, sem pressa — só fluidez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/serena/pagamento"
              className="px-10 py-4 bg-white text-[#1a2e3a] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Começar a Jornada
            </Link>
            <a
              href="#como-funciona"
              className="px-10 py-4 bg-white/15 text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all border border-white/20"
            >
              Como funciona
            </a>
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2e3a, #0f1f28)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Quantas vezes engoliste o que sentias?
          </h2>

          <p className="text-[#6B8E9B]/80 mb-10 text-lg">
            A maioria de nós aprendeu a esconder o que sente. O Serena muda isso.
          </p>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              'Sorris quando querias chorar',
              'Dizes que estás bem quando não estás',
              'Explodes sem saber porquê'
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#6B8E9B]/20"
              >
                <span className="text-[#6B8E9B] text-xl mt-0.5">&#10003;</span>
                <span className="text-white/80 text-lg">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-[#6B8E9B]/60 mt-8 text-sm">
            Se te {g('reconheceste', 'reconheceste')} em pelo menos uma, o Serena foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUCAO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              O Serena é o espaço onde as tuas emoções finalmente têm voz
            </h2>
            <p className="text-[#6B8E9B]/70 max-w-2xl mx-auto">
              Ferramentas criadas para acolher, processar e libertar — ao teu ritmo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#6B8E9B]/20 hover:bg-white/10 hover:border-[#6B8E9B]/40 transition-all group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                  {f.titulo}
                </h3>
                <p className="text-[#6B8E9B]/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2e3a)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Como funciona
            </h2>
            <p className="text-[#6B8E9B]/70">
              Três passos. Sem complicações.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div
                key={p.numero}
                className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#6B8E9B]/20"
              >
                <span
                  className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {p.numero}
                </span>
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #6B8E9B, #4a6e7b)' }}
                >
                  {p.numero}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#6B8E9B]/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#6B8E9B]/70">
              Preços simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all hover:translate-y-[-3px] hover:shadow-lg ${
                  i === 1
                    ? 'bg-[#6B8E9B]/15 border-[#6B8E9B] relative'
                    : 'bg-white/5 border-[#6B8E9B]/20'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#6B8E9B] text-white text-xs font-semibold rounded-full">
                    Mais Popular
                  </span>
                )}

                <h3
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {plano.name}
                </h3>

                {plano.discount > 0 && (
                  <span className="inline-block px-3 py-1 bg-[#6B8E9B]/20 text-[#6B8E9B] text-xs font-semibold rounded-full mb-3">
                    -{plano.discount}% desconto
                  </span>
                )}

                <div className="text-3xl font-bold text-white my-3">
                  {plano.price_mzn.toLocaleString('pt-MZ')}{' '}
                  <span className="text-sm font-normal text-[#6B8E9B]/70">MZN</span>
                </div>

                <p className="text-[#6B8E9B]/50 text-sm mb-2">
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#6B8E9B]/50 text-xs mb-4">
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <Link
                  to="/serena/pagamento"
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6B8E9B, #4a6e7b)' }}
                >
                  Escolher
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRIAL CTA ===== */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #6B8E9B 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Experimenta 7 dias grátis
          </h2>
          <p className="text-white/70 mb-4 text-lg">
            Sem compromisso. Sem cartão. Cancelas quando quiseres.
          </p>
          <p className="text-white/50 mb-8">
            Descobre como é sentir sem medo e fluir sem travar.
          </p>
          <Link
            to="/serena/pagamento"
            className="inline-block px-10 py-5 bg-white text-[#1a2e3a] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
          >
            Quero começar HOJE
          </Link>
          <p className="text-white/40 text-sm mt-6">
            7 dias grátis &middot; Acesso completo &middot; Cancela quando quiseres
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-10 px-4 border-t border-[#6B8E9B]/20"
        style={{ background: '#0f1f28' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-[#6B8E9B]"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              SERENA
            </span>
            <span className="text-white/40 text-sm">Emoção &amp; Fluidez</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/landing" className="text-white/40 hover:text-white transition-colors">
              Sete Ecos
            </Link>
            <a href="/termos.pdf" className="text-white/40 hover:text-white transition-colors">
              Termos
            </a>
            <a href="/privacidade.pdf" className="text-white/40 hover:text-white transition-colors">
              Privacidade
            </a>
          </div>
          <div className="text-white/30 text-sm">
            &copy; 2026 Sete Ecos
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingSerena
