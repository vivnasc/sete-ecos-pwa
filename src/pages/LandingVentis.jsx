import React from 'react'
import { Link } from 'react-router-dom'
import { ECO_PLANS } from '../lib/shared/subscriptionPlans'
import { g } from '../utils/genero'

/**
 * VENTIS - Landing Page
 * "Energia & Ritmo" - Chakra Anahata (Coracao), Elemento: Ar
 * Modulo de gestao energetica, ritmo sustentavel e conexao com a natureza
 */

const LandingVentis = () => {
  const ventis = ECO_PLANS.ventis
  const planos = [ventis.monthly, ventis.semestral, ventis.annual]

  const features = [
    {
      icone: '⚡',
      titulo: 'Monitor de Energia',
      desc: 'Regista a tua energia 3 vezes ao dia. Descobre os teus picos e vales naturais.'
    },
    {
      icone: '🔄',
      titulo: 'Rotinas & Rituais',
      desc: 'Cria micro-rotinas que respeitam o teu ritmo. Sem rigidez, com consistencia.'
    },
    {
      icone: '🍃',
      titulo: 'Pausas Conscientes',
      desc: 'Micro-pausas de 1 a 5 minutos para oxigenar o dia. Parar e avancar.'
    },
    {
      icone: '🧘',
      titulo: 'Movimento Flow',
      desc: 'Yoga suave, danca livre, caminhada consciente. Move-te ao teu ritmo, nao ao do mundo.'
    },
    {
      icone: '🌿',
      titulo: 'Conexao Natureza',
      desc: 'Actividades para reconectar com o ar, a terra, o sol. A natureza e o ritmo original.'
    },
    {
      icone: '📊',
      titulo: 'Analise de Ritmo',
      desc: 'Insights semanais sobre a tua energia. Descobre padroes e optimiza o teu dia.'
    },
    {
      icone: '📈',
      titulo: 'Mapa Picos & Vales',
      desc: 'Visualiza quando tens mais e menos energia. Planeia o dia em harmonia com o corpo.'
    },
    {
      icone: '🛡️',
      titulo: 'Detector de Burnout',
      desc: 'Alertas quando a energia cai consistentemente. Prevenir e melhor que recuperar.'
    },
    {
      icone: '💬',
      titulo: 'Coach Ventis',
      desc: `Coach virtual ${g('gentil', 'gentil')} como uma brisa. Guia-te para encontrar o teu ritmo sustentavel.`
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Monitoriza a energia',
      desc: 'Regista como te sentes ao acordar, a meio do dia e ao deitar. O corpo fala — aprende a ouvir.'
    },
    {
      numero: '02',
      titulo: 'Cria rotinas e rituais',
      desc: 'Micro-rotinas que respeitam o teu ritmo. Pausas que oxigenam. Movimento que liberta.'
    },
    {
      numero: '03',
      titulo: 'Encontra o ritmo sustentavel',
      desc: 'Nao mais rapido. Nao mais lento. O teu ritmo. Sustentavel, natural, teu.'
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ===== HERO ===== */}
      <header
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2e24 0%, #2a4a3a 40%, #5D9B84 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#5D9B84]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a2e24]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#5D9B84]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Anahata &middot; Coracao &middot; Elemento: Ar
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            VENTIS
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            Energia &amp; Ritmo
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Encontra o teu ritmo. Respira no teu tempo. Sustenta a tua energia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              state={{ eco: 'Ventis' }}
              className="px-10 py-4 bg-white text-[#1a2e24] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Encontrar o Meu Ritmo
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
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2e24, #0f1f18)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Quantas vezes sentiste que a energia acabou antes do dia?
          </h2>

          <p className="text-[#5D9B84]/80 mb-10 text-lg">
            Correr sem parar nao e viver. O Ventis devolve-te o ritmo.
          </p>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              'Acordas cansada e adormeces exausta',
              'Nao tens pausas — so urgencias',
              'Sentes que vives em piloto automatico sem energia'
            ].map((item, i) => {
              const textoFinal = i === 0
                ? `Acordas ${g('cansado', 'cansada')} e adormeces ${g('exausto', 'exausta')}`
                : i === 2
                  ? `Sentes que vives em piloto automatico sem energia`
                  : item
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#5D9B84]/20"
                >
                  <span className="text-[#5D9B84] text-xl mt-0.5">&#10003;</span>
                  <span className="text-white/80 text-lg">{textoFinal}</span>
                </div>
              )
            })}
          </div>

          <p className="text-[#5D9B84]/60 mt-8 text-sm">
            Se te reconheceste em pelo menos uma, o Ventis foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUCAO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#0f1f18' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              O Ventis e o espaco onde encontras o teu ritmo natural
            </h2>
            <p className="text-[#5D9B84]/70 max-w-2xl mx-auto">
              Ferramentas para monitorizar, sustentar e harmonizar a tua energia — ao teu ritmo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#5D9B84]/20 hover:bg-white/10 hover:border-[#5D9B84]/40 transition-all group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {f.titulo}
                </h3>
                <p className="text-[#5D9B84]/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f18, #1a2e24)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Como funciona
            </h2>
            <p className="text-[#5D9B84]/70">
              Tres passos. Sem complicacoes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div
                key={p.numero}
                className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#5D9B84]/20"
              >
                <span
                  className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.numero}
                </span>
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #5D9B84, #3a6b5a)' }}
                >
                  {p.numero}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#5D9B84]/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#0f1f18' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#5D9B84]/70">
              Precos simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all hover:translate-y-[-3px] hover:shadow-lg ${
                  i === 1
                    ? 'bg-[#5D9B84]/15 border-[#5D9B84] relative'
                    : 'bg-white/5 border-[#5D9B84]/20'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#5D9B84] text-white text-xs font-semibold rounded-full">
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
                  <span className="inline-block px-3 py-1 bg-[#5D9B84]/20 text-[#5D9B84] text-xs font-semibold rounded-full mb-3">
                    -{plano.discount}% desconto
                  </span>
                )}

                <div className="text-3xl font-bold text-white my-3">
                  {plano.price_mzn.toLocaleString('pt-MZ')}{' '}
                  <span className="text-sm font-normal text-[#5D9B84]/70">MZN</span>
                </div>

                <p className="text-[#5D9B84]/50 text-sm mb-2">
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#5D9B84]/50 text-xs mb-4">
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mes
                  </p>
                )}

                <Link
                  to="/login"
              state={{ eco: 'Ventis' }}
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #5D9B84, #3a6b5a)' }}
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
        style={{ background: 'linear-gradient(135deg, #1a2e24 0%, #5D9B84 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Experimenta 7 dias gratis
          </h2>
          <p className="text-white/70 mb-4 text-lg">
            Sem compromisso. Sem cartao. Cancelas quando quiseres.
          </p>
          <p className="text-white/50 mb-8">
            Descobre como e viver ao teu ritmo, com energia sustentavel e pausas que renovam.
          </p>
          <Link
            to="/ventis/pagamento"
            className="inline-block px-10 py-5 bg-white text-[#1a2e24] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
          >
            Quero comecar HOJE
          </Link>
          <p className="text-white/40 text-sm mt-6">
            7 dias gratis &middot; Acesso completo &middot; Cancela quando quiseres
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-10 px-4 border-t border-[#5D9B84]/20"
        style={{ background: '#0f1f18' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-[#5D9B84]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              VENTIS
            </span>
            <span className="text-white/40 text-sm">Energia &amp; Ritmo</span>
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

export default LandingVentis
