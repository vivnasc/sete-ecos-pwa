import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ECO_PLANS, checkEcoAccess } from '../lib/shared/subscriptionPlans'
import { useAuth } from '../contexts/AuthContext'
import { isCoach } from '../lib/coach'
import { g } from '../utils/genero'
import ScrollReveal from '../components/ScrollReveal'

/**
 * IGNIS - Landing Page
 * "Vontade & Direção Consciente" - Chakra Manipura (Plexo Solar), Elemento: Fogo
 * Módulo de escolha consciente, foco e alinhamento com valores
 */

const LandingIgnis = () => {
  const navigate = useNavigate()
  const { session, userRecord } = useAuth()
  const ignis = ECO_PLANS.ignis
  const planos = [ignis.monthly, ignis.semestral, ignis.annual]

  useEffect(() => {
    if (!session) return
    if (isCoach(session.user?.email)) {
      navigate('/ignis/dashboard', { replace: true })
      return
    }
    if (userRecord?.id) {
      checkEcoAccess('ignis', userRecord.id).then(access => {
        if (access.hasAccess) navigate('/ignis/dashboard', { replace: true })
      }).catch(() => {})
    }
  }, [session, userRecord, navigate])

  const features = [
    {
      icone: '🎯',
      titulo: 'Escolhas Conscientes',
      desc: 'Define 3 escolhas por dia alinhadas com os teus valores. Não reages — escolhes.'
    },
    {
      icone: '🧠',
      titulo: 'Foco Consciente',
      desc: 'Sessões de foco com intenção. Sem distrações, sem multitarefa. Profundidade.'
    },
    {
      icone: '🌪️',
      titulo: 'Rastreador de Dispersão',
      desc: 'Regista quando dizes sim mas querias não. Consciência é o primeiro passo para mudar.'
    },
    {
      icone: '🗡️',
      titulo: 'Exercício de Corte',
      desc: 'Aprende a soltar o que não é teu. Compromissos, hábitos, relações que te dispersam.'
    },
    {
      icone: '🧭',
      titulo: 'Bússola de Valores',
      desc: 'Define os teus 5 valores essenciais. Todas as decisões passam por este filtro.'
    },
    {
      icone: '🏆',
      titulo: 'Diário de Conquistas',
      desc: 'Regista as tuas vitórias diárias. Celebrar o que conquistaste alimenta o fogo.'
    },
    {
      icone: '🦁',
      titulo: 'Desafios de Fogo',
      desc: 'Desafios semanais em 4 categorias: Coragem, Corte, Alinhamento e Iniciativa.'
    },
    {
      icone: '💬',
      titulo: 'Coach Ignis',
      desc: `Coach virtual ${g('directo', 'directa')} e sem paternalismo. Questiona, ilumina, não acaricia.`
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Define valores',
      desc: 'Descobre os teus 5 valores essenciais. A bússola interior que guia cada decisão.'
    },
    {
      numero: '02',
      titulo: 'Escolhe com consciência',
      desc: 'Cada dia, 3 escolhas alinhadas. Não é produtividade — é direção.'
    },
    {
      numero: '03',
      titulo: 'Corta o que dispersa',
      desc: 'O que não é teu, solta. O fogo só queima o que não pertence.'
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #4a2a1e 40%, #C1634A 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#C1634A]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#2e1a14]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#C1634A]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Manipura &middot; Plexo Solar &middot; Elemento: Fogo
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            IGNIS
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}
          >
            Vontade &amp; Direção Consciente
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Escolhe o que é teu. Corta o que dispersa. Acende o fogo interior.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ignis/pagamento"
              className="animate-pulse-glow px-10 py-4 bg-white text-[#2e1a14] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Acender o Fogo
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
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #2e1a14, #1a0f0a)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Quantas vezes disseste sim quando querias dizer não?
            </h2>

            <p className="text-[#C1634A]/80 mb-10 text-lg">
              Viver no piloto automático não é viver. O Ignis devolve-te o leme.
            </p>
          </ScrollReveal>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              'Dizes sim por obrigação, não por vontade',
              'Sentes-te sem rumo, a reagir em vez de escolher',
              'Tens mil coisas mas nada avança'
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#C1634A]/20"
              >
                <span className="text-[#C1634A] text-xl mt-0.5">&#10003;</span>
                <span className="text-white/80 text-lg">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-[#C1634A]/60 mt-8 text-sm">
            Se te reconheceste em pelo menos uma, o Ignis foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUCAO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#1a0f0a' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Ignis é o espaço onde retomas a direção da tua vida
              </h2>
              <p className="text-[#C1634A]/70 max-w-2xl mx-auto">
                Ferramentas para escolher com consciência, focar no que importa e cortar o ruído.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#C1634A]/20 hover:bg-white/10 hover:border-[#C1634A]/40 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                  {f.titulo}
                </h3>
                <p className="text-[#C1634A]/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a0f0a, #2e1a14)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Como funciona
            </h2>
            <p className="text-[#C1634A]/70">
              Três passos. Sem complicações.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div
                key={p.numero}
                className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#C1634A]/20"
              >
                <span
                  className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {p.numero}
                </span>
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #C1634A, #8B4513)' }}
                >
                  {p.numero}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#C1634A]/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#1a0f0a' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#C1634A]/70">
              Preços simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg ${
                  i === 1
                    ? 'bg-[#C1634A]/15 border-[#C1634A] relative'
                    : 'bg-white/5 border-[#C1634A]/20'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C1634A] text-white text-xs font-semibold rounded-full">
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
                  <span className="inline-block px-3 py-1 bg-[#C1634A]/20 text-[#C1634A] text-xs font-semibold rounded-full mb-3">
                    -{plano.discount}% desconto
                  </span>
                )}

                <div className="text-3xl font-bold text-white my-3">
                  {plano.price_mzn.toLocaleString('pt-MZ')}{' '}
                  <span className="text-sm font-normal text-[#C1634A]/70">MZN</span>
                </div>

                <p className="text-[#C1634A]/50 text-sm mb-2">
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#C1634A]/50 text-xs mb-4">
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <Link
                  to="/ignis/pagamento"
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #C1634A, #8B4513)' }}
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
        style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #C1634A 100%)' }}
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
            Descobre como é viver com direção, clareza e fogo interior.
          </p>
          <Link
            to="/ignis/pagamento"
            className="inline-block px-10 py-5 bg-white text-[#2e1a14] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
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
        className="py-10 px-4 border-t border-[#C1634A]/20"
        style={{ background: '#1a0f0a' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-[#C1634A]"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              IGNIS
            </span>
            <span className="text-white/40 text-sm">Vontade &amp; Direção Consciente</span>
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

export default LandingIgnis
