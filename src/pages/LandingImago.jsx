import React from 'react'
import { Link } from 'react-router-dom'
import { ECO_PLANS } from '../lib/shared/subscriptionPlans'
import { g } from '../utils/genero'

/**
 * IMAGO - Landing Page
 * "Identidade & Espelho" - Chakra Sahasrara (Coroa), Elemento: Consciência
 * Módulo de autoconhecimento profundo, identidade e integração
 * Tema: roxo (#8B7BA5), Cormorant Garamond
 */

const LandingImago = () => {
  const imago = ECO_PLANS.imago
  const planos = [imago.monthly, imago.semestral, imago.annual]

  const features = [
    {
      icone: '🪞',
      titulo: 'Espelho Triplo',
      desc: 'Quem sou vs. quem mostro vs. quem quero ser. Três dimensões de ti num só exercício.'
    },
    {
      icone: '⛏️',
      titulo: 'Arqueologia de Si',
      desc: 'Escava camadas de identidade — infância, adolescência, relações, rupturas. Descobre quem foste para entender quem és.'
    },
    {
      icone: '📜',
      titulo: 'Nomeação',
      desc: 'Como te nomeias agora? Um ritual de auto-definição que muda com o teu crescimento.'
    },
    {
      icone: '🗺️',
      titulo: 'Mapa de Identidade',
      desc: '7 dimensões do teu ser — uma por eco. Corpo, emoção, vontade, energia, voz, valor e essência.'
    },
    {
      icone: '💠',
      titulo: 'Valores Essenciais',
      desc: 'Define os teus 3 valores fundamentais. A bússola que guia quando o mapa desaparece.'
    },
    {
      icone: '🧘',
      titulo: 'Meditações de Essência',
      desc: 'Meditações guiadas para conectar com o teu eu mais autêntico, para além dos rótulos.'
    },
    {
      icone: '🔮',
      titulo: 'Visão Futuro',
      desc: 'Quadro de visão digital. Quem queres ser daqui a 1, 3, 5 anos? Visualiza e manifesta.'
    },
    {
      icone: '🌀',
      titulo: 'Integração dos Ecos',
      desc: 'Conexões entre todos os módulos. O Imago une tudo — corpo, emoção, vontade, ritmo, voz.'
    },
    {
      icone: '👗',
      titulo: 'Roupa como Identidade',
      desc: 'O que vestes comunica quem és. Explora a relação entre imagem exterior e identidade interior.'
    },
    {
      icone: '📊',
      titulo: 'Timeline',
      desc: 'A tua jornada completa de identidade. Vê como evoluíste ao longo do tempo.'
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Descobre',
      desc: 'Olha-te no Espelho Triplo. Escava na Arqueologia. Quem és sem máscaras?'
    },
    {
      numero: '02',
      titulo: 'Integra',
      desc: 'Conecta as partes de ti. Valores, essência, aspiração — tudo no mesmo mapa.'
    },
    {
      numero: '03',
      titulo: 'Transforma',
      desc: 'Nomeia-te de novo. A identidade não é fixa — é uma escolha que renovas todos os dias.'
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ===== HERO ===== */}
      <header
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2e2a3e 40%, #8B7BA5 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#8B7BA5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a1a2e]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#8B7BA5]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Sahasrara &middot; Coroa &middot; Elemento: Consciência
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            IMAGO
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            Identidade &amp; Espelho
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Quem sou vs. quem mostro vs. quem quero ser.
            O espaço onde finalmente te encontras.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              state={{ eco: 'Imago' }}
              className="px-10 py-4 bg-white text-[#1a1a2e] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Descobrir quem sou
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
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a1a2e, #12121e)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Quantas versões de ti criaste para agradar os outros?
          </h2>

          <p className="text-[#8B7BA5]/80 mb-10 text-lg">
            A maioria de nós vive atrás de máscaras. O Imago devolve-te o espelho.
          </p>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              'Sentes que não sabes quem és realmente',
              `Vives para os outros e esqueces-te de ti ${g('mesmo', 'mesma')}`,
              'Usas máscaras diferentes com cada pessoa'
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#8B7BA5]/20"
              >
                <span className="text-[#8B7BA5] text-xl mt-0.5">&#10003;</span>
                <span className="text-white/80 text-lg">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-[#8B7BA5]/60 mt-8 text-sm">
            Se te {g('reconheceste', 'reconheceste')} em pelo menos uma, o Imago foi {g('criado', 'criado')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUCAO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#12121e' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              O Imago é o espaço onde te encontras para além de tudo o que já disseram que eras
            </h2>
            <p className="text-[#8B7BA5]/70 max-w-2xl mx-auto">
              Ferramentas de autoconhecimento profundo para quem quer viver como realmente é.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#8B7BA5]/20 hover:bg-white/10 hover:border-[#8B7BA5]/40 transition-all group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {f.titulo}
                </h3>
                <p className="text-[#8B7BA5]/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #12121e, #1a1a2e)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Como funciona
            </h2>
            <p className="text-[#8B7BA5]/70">
              Três passos. Sem complicações.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div
                key={p.numero}
                className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#8B7BA5]/20"
              >
                <span
                  className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.numero}
                </span>
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #8B7BA5, #5a4d7a)' }}
                >
                  {p.numero}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#8B7BA5]/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#12121e' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#8B7BA5]/70">
              Preços simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all hover:translate-y-[-3px] hover:shadow-lg ${
                  i === 1
                    ? 'bg-[#8B7BA5]/15 border-[#8B7BA5] relative'
                    : 'bg-white/5 border-[#8B7BA5]/20'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#8B7BA5] text-white text-xs font-semibold rounded-full">
                    Mais Popular
                  </span>
                )}

                <h3
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {plano.name}
                </h3>

                {plano.discount > 0 && (
                  <span className="inline-block px-3 py-1 bg-[#8B7BA5]/20 text-[#8B7BA5] text-xs font-semibold rounded-full mb-3">
                    -{plano.discount}% desconto
                  </span>
                )}

                <div className="text-3xl font-bold text-white my-3">
                  {plano.price_mzn.toLocaleString('pt-MZ')}{' '}
                  <span className="text-sm font-normal text-[#8B7BA5]/70">MZN</span>
                </div>

                <p className="text-[#8B7BA5]/50 text-sm mb-2">
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#8B7BA5]/50 text-xs mb-4">
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <Link
                  to="/login"
                  state={{ eco: 'Imago' }}
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #8B7BA5, #5a4d7a)' }}
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
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #8B7BA5 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Experimenta 7 dias grátis
          </h2>
          <p className="text-white/70 mb-4 text-lg">
            Sem compromisso. Sem cartão. Cancelas quando quiseres.
          </p>
          <p className="text-white/50 mb-8">
            Descobre quem és para além de tudo o que já disseram que eras.
          </p>
          <Link
            to="/login"
            state={{ eco: 'Imago' }}
            className="inline-block px-10 py-5 bg-white text-[#1a1a2e] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
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
        className="py-10 px-4 border-t border-[#8B7BA5]/20"
        style={{ background: '#12121e' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-[#8B7BA5]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              IMAGO
            </span>
            <span className="text-white/40 text-sm">Identidade &amp; Espelho</span>
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

export default LandingImago
