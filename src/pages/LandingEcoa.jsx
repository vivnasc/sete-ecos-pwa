import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ECO_PLANS, checkEcoAccess } from '../lib/shared/subscriptionPlans'
import { useAuth } from '../contexts/AuthContext'
import { isCoach } from '../lib/coach'
import { g } from '../utils/genero'

/**
 * ECOA - Landing Page
 * "Voz & Desbloqueio do Silêncio" - Chakra Vishuddha (Garganta), Elemento: Éter/Som
 * Módulo de recuperação da voz silenciada, expressão autêntica e assertividade
 */

const LandingEcoa = () => {
  const navigate = useNavigate()
  const { session, userRecord } = useAuth()
  const ecoa = ECO_PLANS.ecoa
  const planos = [ecoa.monthly, ecoa.semestral, ecoa.annual]

  useEffect(() => {
    if (!session) return
    if (isCoach(session.user?.email)) {
      navigate('/ecoa/dashboard', { replace: true })
      return
    }
    if (userRecord?.id) {
      checkEcoAccess('ecoa', userRecord.id).then(access => {
        if (access.hasAccess) navigate('/ecoa/dashboard', { replace: true })
      }).catch(() => {})
    }
  }, [session, userRecord, navigate])

  const features = [
    {
      icone: '🗺️',
      titulo: 'Mapa de Silenciamento',
      desc: 'Identifica onde, quando e com quem te calas. O primeiro passo é ver o padrão.'
    },
    {
      icone: '🗣️',
      titulo: 'Programa Micro-Voz',
      desc: '8 semanas progressivas: de preferências simples a verdades profundas. Um exercício por dia.'
    },
    {
      icone: '📖',
      titulo: 'Biblioteca de Frases Difíceis',
      desc: `Frases prontas para situações em que normalmente te calas. Pratica antes de precisar.`
    },
    {
      icone: '💬',
      titulo: 'Registo de Voz Recuperada',
      desc: `Celebra cada vez que ${g('disseste', 'disseste')} algo que normalmente calarias. Cada voz conta.`
    },
    {
      icone: '📝',
      titulo: 'Diário de Voz',
      desc: 'Espaço seguro para escrever o que a tua voz quer dizer — sem filtro, sem julgamento.'
    },
    {
      icone: '📨',
      titulo: 'Cartas Não Enviadas',
      desc: 'Escreve cartas a quem te silenciou. Liberta as palavras presas. Não precisas de enviar.'
    },
    {
      icone: '🔊',
      titulo: 'Afirmações Personalizadas',
      desc: 'Afirmações de voz para repetir em voz alta. A repetição transforma crença em verdade.'
    },
    {
      icone: '✍️',
      titulo: 'Exercícios de Expressão',
      desc: 'Escrita livre, listas de verdade, manifestos pessoais. Ferramentas para libertar a voz interior.'
    },
    {
      icone: '💎',
      titulo: 'Comunicação Assertiva',
      desc: `Templates e técnicas para comunicar com clareza e firmeza. Ser ${g('directo', 'directa')} sem ser ${g('agressivo', 'agressiva')}.`
    },
    {
      icone: '🤖',
      titulo: 'Coach Ecoa',
      desc: `Coach virtual ${g('encorajador', 'encorajadora')} que te guia na recuperação da tua voz. Sem julgamento, com firmeza gentil.`
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Mapeia onde te calas',
      desc: 'Identifica os padrões de silêncio: com quem, quando e porquê. Consciência é o primeiro som.'
    },
    {
      numero: '02',
      titulo: 'Pratica a tua voz progressivamente',
      desc: 'De preferências simples a verdades profundas. Um exercício por dia. A voz é um músculo — treina-se.'
    },
    {
      numero: '03',
      titulo: 'Fala a tua verdade',
      desc: `${g('Torna-te quem', 'Torna-te quem')} sempre foste — mas em voz alta. A tua voz merece ser ouvida.`
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ===== HERO ===== */}
      <header
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2a34 0%, #2a4a54 40%, #4A90A4 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#4A90A4]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a2a34]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#4A90A4]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Vishuddha &middot; Garganta &middot; Elemento: Som
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            ECOA
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            Voz &amp; Desbloqueio do Silêncio
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Recupera a voz que te silenciaram. Fala a tua verdade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ecoa/pagamento"
              className="px-10 py-4 bg-white text-[#1a2a34] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Recuperar a Minha Voz
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
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2a34, #0f1f28)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Quantas vezes calaste algo que precisava de ser dito?
          </h2>

          <p className="text-[#4A90A4]/80 mb-10 text-lg">
            O silêncio protege — mas quando se torna hábito, aprisiona.
          </p>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              { text: `Dizes que sim quando queres dizer não`, useG: false },
              { text: `Calas o que sentes para não incomodar`, useG: false },
              { text: `Sentes que a tua voz não tem peso`, useG: false }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#4A90A4]/20"
              >
                <span className="text-[#4A90A4] text-xl mt-0.5">&#10003;</span>
                <span className="text-white/80 text-lg">{item.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[#4A90A4]/60 mt-8 text-sm">
            Se te reconheceste em pelo menos uma, o Ecoa foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUCAO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              O Ecoa é o espaço onde recuperas a tua voz
            </h2>
            <p className="text-[#4A90A4]/70 max-w-2xl mx-auto">
              Ferramentas para desbloquear o silêncio, fortalecer a expressão e falar a tua verdade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#4A90A4]/20 hover:bg-white/10 hover:border-[#4A90A4]/40 transition-all group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {f.titulo}
                </h3>
                <p className="text-[#4A90A4]/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2a34)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Como funciona
            </h2>
            <p className="text-[#4A90A4]/70">
              Três passos. Do silêncio à voz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div
                key={p.numero}
                className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#4A90A4]/20"
              >
                <span
                  className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.numero}
                </span>
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #4A90A4, #2a6a7a)' }}
                >
                  {p.numero}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#4A90A4]/70 text-sm">{p.desc}</p>
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
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#4A90A4]/70">
              Preços simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all hover:translate-y-[-3px] hover:shadow-lg ${
                  i === 1
                    ? 'bg-[#4A90A4]/15 border-[#4A90A4] relative'
                    : 'bg-white/5 border-[#4A90A4]/20'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#4A90A4] text-white text-xs font-semibold rounded-full">
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
                  <span className="inline-block px-3 py-1 bg-[#4A90A4]/20 text-[#4A90A4] text-xs font-semibold rounded-full mb-3">
                    -{plano.discount}% desconto
                  </span>
                )}

                <div className="text-3xl font-bold text-white my-3">
                  {plano.price_mzn.toLocaleString('pt-MZ')}{' '}
                  <span className="text-sm font-normal text-[#4A90A4]/70">MZN</span>
                </div>

                <p className="text-[#4A90A4]/50 text-sm mb-2">
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#4A90A4]/50 text-xs mb-4">
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <Link
                  to="/ecoa/pagamento"
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4A90A4, #2a6a7a)' }}
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
        style={{ background: 'linear-gradient(135deg, #1a2a34 0%, #4A90A4 100%)' }}
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
            Descobre como é viver com a tua voz — sem filtros, sem medo, sem silêncio forçado.
          </p>
          <Link
            to="/ecoa/pagamento"
            className="inline-block px-10 py-5 bg-white text-[#1a2a34] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
          >
            Quero recuperar a minha voz
          </Link>
          <p className="text-white/40 text-sm mt-6">
            7 dias grátis &middot; Acesso completo &middot; Cancela quando quiseres
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-10 px-4 border-t border-[#4A90A4]/20"
        style={{ background: '#0f1f28' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-[#4A90A4]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              ECOA
            </span>
            <span className="text-white/40 text-sm">Voz &amp; Desbloqueio do Silêncio</span>
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

export default LandingEcoa
