import React from 'react'
import { Link } from 'react-router-dom'
import { ECO_PLANS } from '../lib/shared/subscriptionPlans'
import { g } from '../utils/genero'

/**
 * AURORA - Landing Page
 * "Integracao Final" - Elemento: Luz
 * Modulo final de celebracao, manutencao e renovacao
 * Tema: rosa (#D4A5A5), Cormorant Garamond
 */

const LandingAurora = () => {
  const aurora = ECO_PLANS.aurora
  const planos = [aurora.monthly, aurora.semestral, aurora.annual]

  const features = [
    {
      icone: '🌅',
      titulo: 'Cerimonia de Graduacao',
      desc: 'Celebra a tua jornada completa. Um ritual de reconhecimento por tudo o que conquistaste.'
    },
    {
      icone: '📖',
      titulo: 'Antes & Depois',
      desc: 'A tua historia contada por ti. Quem eras, o que soltaste, quem te tornaste.'
    },
    {
      icone: '📊',
      titulo: 'Resumo da Jornada',
      desc: 'Relatorio completo de toda a tua evolucao. Dados, insights e marcos de cada eco.'
    },
    {
      icone: '\u{1F6E1}\uFE0F',
      titulo: 'Modo Manutencao',
      desc: 'Check-ins mensais para manter as mudancas. Alertas de regressao de padroes.'
    },
    {
      icone: '🌟',
      titulo: 'Mentoria',
      desc: 'Partilha a tua sabedoria com quem esta a comecar. A tua experiencia inspira.'
    },
    {
      icone: '☀️',
      titulo: 'Ritual Aurora',
      desc: 'Ritual matinal que integra elementos de cada eco. Comeca o dia com consciencia.'
    },
    {
      icone: '🔄',
      titulo: 'Renovacao Anual',
      desc: 'Renova as tuas intencoes a cada ano. A jornada nunca termina — transforma-se.'
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Celebra',
      desc: 'Honra o caminho percorrido. Cerimonia de graduacao e historia Antes & Depois.'
    },
    {
      numero: '02',
      titulo: 'Mantem',
      desc: 'Check-ins mensais, rituais matinais e alertas de regressao para manter as mudancas.'
    },
    {
      numero: '03',
      titulo: 'Renova',
      desc: 'Renovacao anual de intencoes. Mentoria. A tua luz ilumina o caminho de outras.'
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ===== HERO ===== */}
      <header
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2e1a1a 0%, #3e2a2a 40%, #D4A5A5 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4A5A5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#2e1a1a]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#D4A5A5]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Integracao Final &middot; Elemento: Luz
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            AURORA
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            Integracao Final
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Celebra a tua jornada completa.
            Tu ja sabes quem es. Agora vive isso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              state={{ eco: 'Aurora' }}
              className="px-10 py-4 bg-white text-[#2e1a1a] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Comecar a minha aurora
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
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #2e1a1a, #1e1212)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Percorreste um caminho extraordinario. E agora?
          </h2>

          <p className="text-[#D4A5A5]/80 mb-10 text-lg">
            A Aurora e para quem completou a jornada e quer manter, celebrar e partilhar.
          </p>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              'Tens medo de perder as mudancas que conquistaste',
              'Queres celebrar o teu caminho mas nao sabes como',
              `Sentes que a tua experiencia pode ajudar ${g('outros', 'outras')}`
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#D4A5A5]/20"
              >
                <span className="text-[#D4A5A5] text-xl mt-0.5">&#10003;</span>
                <span className="text-white/80 text-lg">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-[#D4A5A5]/60 mt-8 text-sm">
            Gratuita para quem completou 5+ ecos, ou 500 MZN/mes standalone.
          </p>
        </div>
      </section>

      {/* ===== SOLUCAO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#1e1212' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              A Aurora e onde a tua jornada se torna eterna
            </h2>
            <p className="text-[#D4A5A5]/70 max-w-2xl mx-auto">
              Ferramentas para celebrar, manter e renovar tudo o que conquistaste.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#D4A5A5]/20 hover:bg-white/10 hover:border-[#D4A5A5]/40 transition-all group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {f.titulo}
                </h3>
                <p className="text-[#D4A5A5]/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1e1212, #2e1a1a)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Como funciona
            </h2>
            <p className="text-[#D4A5A5]/70">
              Tres passos. Celebra, mantem, renova.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div
                key={p.numero}
                className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#D4A5A5]/20"
              >
                <span
                  className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.numero}
                </span>
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5, #a07070)' }}
                >
                  {p.numero}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#D4A5A5]/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#1e1212' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#D4A5A5]/70">
              Precos simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all hover:translate-y-[-3px] hover:shadow-lg ${
                  i === 1
                    ? 'bg-[#D4A5A5]/15 border-[#D4A5A5] relative'
                    : 'bg-white/5 border-[#D4A5A5]/20'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4A5A5] text-white text-xs font-semibold rounded-full">
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
                  <span className="inline-block px-3 py-1 bg-[#D4A5A5]/20 text-[#D4A5A5] text-xs font-semibold rounded-full mb-3">
                    -{plano.discount}% desconto
                  </span>
                )}

                <div className="text-3xl font-bold text-white my-3">
                  {plano.price_mzn.toLocaleString('pt-MZ')}{' '}
                  <span className="text-sm font-normal text-[#D4A5A5]/70">MZN</span>
                </div>

                <p className="text-[#D4A5A5]/50 text-sm mb-2">
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#D4A5A5]/50 text-xs mb-4">
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mes
                  </p>
                )}

                <Link
                  to="/login"
                  state={{ eco: 'Aurora' }}
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5, #a07070)' }}
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
        style={{ background: 'linear-gradient(135deg, #2e1a1a 0%, #D4A5A5 100%)' }}
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
            Celebra a tua jornada. Mantem as mudancas. Renova as intencoes.
          </p>
          <Link
            to="/login"
            state={{ eco: 'Aurora' }}
            className="inline-block px-10 py-5 bg-white text-[#2e1a1a] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
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
        className="py-10 px-4 border-t border-[#D4A5A5]/20"
        style={{ background: '#1e1212' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-[#D4A5A5]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              AURORA
            </span>
            <span className="text-white/40 text-sm">Integracao Final</span>
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

export default LandingAurora
