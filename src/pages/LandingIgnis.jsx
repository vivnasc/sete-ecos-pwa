import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ECO_PLANS, checkEcoAccess } from '../lib/shared/subscriptionPlans'
import { useAuth } from '../contexts/AuthContext'
import { isCoach } from '../lib/coach'
import { g } from '../utils/genero'
import SEOHead from '../components/SEOHead'
import PartilharSocial from '../components/PartilharSocial'
import WhatsAppMockup from '../components/WhatsAppMockup'
import ScrollReveal from '../components/ScrollReveal'

/**
 * IGNIS - Landing Page (Expanded)
 * "Vontade & Direção Consciente" - Chakra Manipura (Plexo Solar), Elemento: Fogo
 * Módulo de escolha consciente, foco e alinhamento com valores
 */

const LandingIgnis = () => {
  const navigate = useNavigate()
  const [faqAberta, setFaqAberta] = useState(null)
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

  const dorPontos = [
    'Dizes sim por obrigação, não por vontade',
    'Sentes-te sem rumo, a reagir em vez de escolher',
    'Tens mil coisas mas nada avança',
    'Começas mil coisas e não terminas nenhuma',
    'Deixas os outros decidirem por ti',
    'Vives sem saber o que realmente queres',
    'Procrastinas o que importa',
    'Sentes-te a viver no piloto automático'
  ]

  const valoresBussola = [
    { nome: 'Coragem', icone: '🦁', desc: 'Agir apesar do medo. Enfrentar o que importa.' },
    { nome: 'Autenticidade', icone: '💎', desc: 'Viver de acordo contigo. Sem máscaras.' },
    { nome: 'Liberdade', icone: '🦅', desc: 'Escolher o teu caminho. Sem prisões externas.' },
    { nome: 'Propósito', icone: '🎯', desc: 'Cada ação tem intenção. Cada passo conta.' },
    { nome: 'Integridade', icone: '⚖️', desc: 'O que dizes, fazes. O que sentes, honras.' }
  ]

  const testemunhos = [
    {
      contacto: 'SM',
      resultado: 'Decisões alinhadas em 2 meses',
      mensagens: [
        { texto: 'A Bússola de Valores mudou a forma como tomo decisões', hora: '10:32', tipo: 'recebida' },
        { texto: 'Antes dizia sim a tudo. Agora escolho com consciência.', hora: '10:33', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'AF',
      resultado: 'De 20 para 3 tarefas/dia',
      mensagens: [
        { texto: 'Reduzi as tarefas de 20 para 3 por dia. E faço mais.', hora: '14:10', tipo: 'recebida' },
        { texto: 'Foco > quantidade. O Ignis ensinou-me isso.', hora: '14:11', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'RC',
      resultado: '5 compromissos cortados',
      mensagens: [
        { texto: 'Cortei 5 compromissos que não estavam alinhados comigo', hora: '19:45', tipo: 'recebida' },
        { texto: 'Soltar não é perder. É libertar.', hora: '19:46', tipo: 'recebida' },
      ]
    }
  ]

  const faqs = [
    {
      pergunta: 'Isto é produtividade disfarçada?',
      resposta: 'Não. Ignis não é sobre fazer mais — é sobre escolher melhor. Não medimos tarefas concluídas. Medimos alinhamento com os teus valores. É possível fazer menos e viver mais.'
    },
    {
      pergunta: 'E se eu não souber o que quero?',
      resposta: 'A Bússola de Valores ajuda-te a descobrir. Através de exercícios progressivos, defines os teus 5 valores essenciais. Não precisas saber tudo ao início — o processo revela.'
    },
    {
      pergunta: 'Quanto tempo preciso por dia?',
      resposta: '3 escolhas conscientes = 5 minutos. Os desafios de fogo = 10 minutos. O mínimo é acessível. Se quiseres ir mais fundo, o Diário de Conquistas e o Coach Ignis estão disponíveis.'
    },
    {
      pergunta: 'Posso experimentar antes de pagar?',
      resposta: 'Sim! 7 dias grátis com acesso completo. Sem compromisso, sem cartão. Se no fim dos 7 dias quiseres continuar, escolhes um plano.'
    },
    {
      pergunta: 'E se eu tiver medo de cortar compromissos?',
      resposta: 'O Exercício de Corte é progressivo. Começa com pequenos "não" antes de chegar aos grandes. E o Coach Ignis acompanha-te em cada passo. Não estás sozinha nesta jornada.'
    }
  ]

  const handleComecar = () => {
    navigate('/ignis/pagamento')
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>

      {/* ===== SEO HEAD ===== */}
      <SEOHead
        title="IGNIS - Vontade & Direção Consciente | Sete Ecos"
        description="Escolha consciente, foco e alinhamento com valores. Bússola de Valores, Escolhas Conscientes, Desafios de Fogo e Coach Ignis. Descobre o teu fogo interior."
        url="https://app.seteecos.com/ignis"
        image="https://app.seteecos.com/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "IGNIS - Vontade & Direção Consciente",
          "description": "Módulo de escolha consciente, foco e alinhamento com valores pessoais. Bússola de Valores, Exercício de Corte e coaching personalizado.",
          "brand": { "@type": "Brand", "name": "Sete Ecos" },
          "offers": [
            { "@type": "Offer", "name": "Mensal", "price": "499", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Semestral", "price": "2395", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Anual", "price": "4190", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" }
          ]
        }}
      />

      {/* ===== FIXED NAVIGATION BAR ===== */}
      <nav
        className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-xl z-50"
        style={{ background: 'rgba(46, 26, 20, 0.9)', borderBottom: '1px solid rgba(193, 99, 74, 0.3)' }}
      >
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/IGNIS-LOGO-V3.png" alt="Ignis" className="w-12 h-12" />
          <span
            className="text-2xl font-bold text-[#C1634A]"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            IGNIS
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#features" className="text-white/60 hover:text-[#C1634A] transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Funcionalidades</a>
          <a href="#como-funciona" className="text-white/60 hover:text-[#C1634A] transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Como Funciona</a>
          <a href="#resultados" className="text-white/60 hover:text-[#C1634A] transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Resultados</a>
          <a href="#precos" className="text-white/60 hover:text-[#C1634A] transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Preços</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/ignis/login"
            className="px-5 py-2 text-[#C1634A] font-semibold text-sm hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            Entrar
          </Link>
          <button
            onClick={handleComecar}
            className="px-6 py-2 text-white rounded-full font-semibold text-sm hover:translate-y-[-1px] transition-all shadow-lg shadow-[#C1634A]/30"
            style={{ background: 'linear-gradient(135deg, #C1634A, #8B4513)', fontFamily: 'var(--font-corpo)' }}
          >
            Acender o Fogo
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #4a2a1e 40%, #C1634A 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#C1634A]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#2e1a14]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#C1634A]/80 text-sm tracking-[0.3em] uppercase mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
            Manipura &middot; Plexo Solar &middot; Elemento: Fogo
          </p>

          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, #C1634A 0%, transparent 70%)', transform: 'scale(1.5)' }} />
            <div className="relative w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <img src="/logos/IGNIS-LOGO-V3.png" alt="Ignis" className="w-16 h-16" />
            </div>
          </div>

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

          <p className="text-white/60 max-w-xl mx-auto mb-10" style={{ fontFamily: 'var(--font-corpo)' }}>
            Escolhe o que é teu. Corta o que dispersa. Acende o fogo interior.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleComecar}
              className="animate-pulse-glow px-10 py-4 bg-white text-[#2e1a14] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Acender o Fogo
            </button>
            <a
              href="#como-funciona"
              className="px-10 py-4 bg-white/15 text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all border border-white/20"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Como funciona
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>92%</div>
              <div className="text-[#C1634A]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>alinhamento com valores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>3</div>
              <div className="text-[#C1634A]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>escolhas conscientes/dia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>70%</div>
              <div className="text-[#C1634A]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>redução de dispersão</div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA (EXPANDED PAIN POINTS) ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #2e1a14, #1a0f0a)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Quantas vezes disseste sim quando querias dizer não?
            </h2>

            <p className="text-[#C1634A]/80 mb-10 text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>
              Viver no piloto automático não é viver. O Ignis devolve-te o leme.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            {dorPontos.map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#C1634A]/20 hover:bg-white/10 hover:border-[#C1634A]/40 transition-all duration-300"
                >
                  <span className="text-[#C1634A] text-xl mt-0.5">&#10003;</span>
                  <span className="text-white/80 text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-[#C1634A]/60 mt-8 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
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
              <p className="text-[#C1634A]/70 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corpo)' }}>
                Ferramentas para escolher com consciência, focar no que importa e cortar o ruído.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.08}>
                <div
                  className="p-6 bg-white/5 rounded-2xl border border-[#C1634A]/20 hover:bg-white/10 hover:border-[#C1634A]/40 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icone}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    {f.titulo}
                  </h3>
                  <p className="text-[#C1634A]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-white text-[#2e1a14] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== BUSSOLA DE VALORES (Unique to Ignis) ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a0f0a, #2e1a14)' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-[#C1634A]/20 rounded-full mb-4">
                <span className="text-[#C1634A] text-sm font-semibold" style={{ fontFamily: 'var(--font-corpo)' }}>🧭 EXCLUSIVO IGNIS</span>
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Bússola de Valores — A tua direção interior
              </h2>
              <p className="text-[#C1634A]/70 max-w-2xl mx-auto text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>
                Define os teus 5 valores essenciais. Todas as decisões passam por este filtro.
              </p>
            </div>
          </ScrollReveal>

          {/* Compass Visual Layout */}
          <div className="relative max-w-3xl mx-auto mt-12">
            {/* Central compass element */}
            <div className="flex justify-center mb-8">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #C1634A, #8B4513)', boxShadow: '0 0 60px rgba(193, 99, 74, 0.3)' }}
              >
                🧭
              </div>
            </div>

            {/* Values in a responsive grid around the compass */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {valoresBussola.map((valor, i) => (
                <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                  <div
                    className="p-5 bg-white/5 rounded-2xl border border-[#C1634A]/20 text-center hover:bg-white/10 hover:border-[#C1634A]/50 transition-all duration-300 group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{valor.icone}</div>
                    <h4
                      className="text-lg font-bold text-white mb-2"
                      style={{ fontFamily: 'var(--font-titulos)' }}
                    >
                      {valor.nome}
                    </h4>
                    <p className="text-[#C1634A]/60 text-xs" style={{ fontFamily: 'var(--font-corpo)' }}>{valor.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-white/50 text-sm italic" style={{ fontFamily: 'var(--font-corpo)' }}>
                Quando sabes o que é teu, tudo o que não é... solta-se naturalmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VÊ A PLATAFORMA ===== */}
      <section className="py-20 px-4" style={{ background: '#1a0f0a' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-[#C1634A]/20 text-[#C1634A] rounded-full text-sm font-semibold mb-4">
                VÊ POR DENTRO
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Ignis na palma da tua mão
              </h2>
              <p className="text-[#C1634A]/70 max-w-xl mx-auto">
                Ferramentas de foco e disciplina consciente, sempre contigo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
            <ScrollReveal variant="fadeUp" delay={0}>
              <div className="relative mx-auto max-w-[260px]">
                <div className="absolute -inset-4 bg-[#C1634A]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Ignis-dash-portrait.png"
                  alt="Ignis Dashboard — escolhas, foco e conquistas"
                  className="relative rounded-[2rem] shadow-2xl border border-[#C1634A]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#C1634A]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Dashboard
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="relative mx-auto max-w-[260px]">
                <div className="absolute -inset-4 bg-[#C1634A]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Ignis-escolhas-portrait.png"
                  alt="Escolhas Conscientes — decisões alinhadas"
                  className="relative rounded-[2rem] shadow-2xl border border-[#C1634A]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#C1634A]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Escolhas Conscientes
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.2}>
              <div className="relative mx-auto max-w-[260px]">
                <div className="absolute -inset-4 bg-[#C1634A]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Ingis-bussula-portrait.png"
                  alt="Bússola de Valores — identifica o que te guia"
                  className="relative rounded-[2rem] shadow-2xl border border-[#C1634A]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#C1634A]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Bússola de Valores
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-[#C1634A] text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #2e1a14, #1a0f0a)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Como funciona
              </h2>
              <p className="text-[#C1634A]/70" style={{ fontFamily: 'var(--font-corpo)' }}>
                Três passos. Sem complicações.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p, i) => (
              <ScrollReveal key={p.numero} variant="fadeUp" delay={i * 0.15}>
                <div
                  className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#C1634A]/20 hover:bg-white/10 hover:border-[#C1634A]/40 transition-all duration-300"
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
                  <p className="text-[#C1634A]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTEMUNHOS (WhatsApp Mockups) ===== */}
      <section id="resultados" className="py-20 px-4" style={{ background: '#1a0f0a' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Resultados reais
              </h2>
              <p className="text-[#C1634A]/70" style={{ fontFamily: 'var(--font-corpo)' }}>
                O que dizem quem já acendeu o fogo interior
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.15}>
                <div className="flex flex-col items-center gap-3">
                  <WhatsAppMockup
                    mensagens={t.mensagens}
                    contacto={t.contacto}
                    corTema="verde"
                  />
                  <span className="inline-block px-4 py-1.5 bg-[#C1634A]/10 text-[#C1634A] rounded-full text-sm font-semibold border border-[#C1634A]/20">
                    {t.resultado}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COACH / CREATOR SECTION ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a0f0a, #2e1a14)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quem criou o IGNIS
              </h2>
              <p className="text-white/80 mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
                <strong className="text-white">Vivianne Santos</strong> é terapeuta, coach de desenvolvimento pessoal
                e criadora do Sistema Sete Ecos — um caminho de transformação que integra corpo, emoção e espírito.
              </p>
              <p className="text-white/70 mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
                O IGNIS nasceu da observação de que muitas pessoas vivem a reagir ao mundo em vez de escolher a direção.
                Dizem sim por obrigação, dispersam-se em mil tarefas, e perdem o contacto com o que realmente importa.
              </p>
              <p className="text-white/70 mb-6" style={{ fontFamily: 'var(--font-corpo)' }}>
                "O fogo interior não grita. Ele ilumina. Quando sabes o que é teu, o ruído desaparece."
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <img
                  src="/logos/seteecos_logo_v2.png"
                  alt="Sete Ecos"
                  className="w-10 h-10 opacity-70"
                />
                <span className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>Parte do Sistema Sete Ecos</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div
                className="w-64 h-64 md:w-80 md:h-80 rounded-2xl flex items-center justify-center border border-[#C1634A]/30"
                style={{ background: 'linear-gradient(135deg, rgba(193, 99, 74, 0.15), rgba(139, 69, 19, 0.15))' }}
              >
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🔥</div>
                  <p className="text-white/70 text-sm italic" style={{ fontFamily: 'var(--font-corpo)' }}>"Escolhe o que é teu. Tudo o resto é ruído."</p>
                  <p className="text-[#C1634A] text-sm mt-2 font-semibold" style={{ fontFamily: 'var(--font-corpo)' }}>— Vivianne Santos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#1a0f0a' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Escolhe o teu plano
              </h2>
              <p className="text-[#C1634A]/70" style={{ fontFamily: 'var(--font-corpo)' }}>
                Preços simples. Sem compromisso. Cancela quando quiseres.
              </p>
            </div>
          </ScrollReveal>

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

                <p className="text-[#C1634A]/50 text-sm mb-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#C1634A]/50 text-xs mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <ul className="space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2 text-white/80 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#C1634A]">&#10003;</span> Bússola de Valores
                  </li>
                  <li className="flex items-center gap-2 text-white/80 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#C1634A]">&#10003;</span> Coach Ignis
                  </li>
                  <li className="flex items-center gap-2 text-white/80 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#C1634A]">&#10003;</span> Desafios de Fogo
                  </li>
                  <li className="flex items-center gap-2 text-white/80 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#C1634A]">&#10003;</span> Diário de Conquistas
                  </li>
                  <li className="flex items-center gap-2 text-white/80 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#C1634A]">&#10003;</span> Todas as ferramentas
                  </li>
                </ul>

                <Link
                  to="/ignis/pagamento"
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:translate-y-[-2px]"
                  style={{ background: 'linear-gradient(135deg, #C1634A, #8B4513)', fontFamily: 'var(--font-corpo)' }}
                >
                  Escolher
                </Link>
              </div>
            ))}
          </div>

          {/* Garantias */}
          <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-[#C1634A]/20">
            <h3
              className="text-2xl font-bold text-white text-center mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              🛡️ Compromisso Ignis
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icone: '&#10003;', titulo: '7 Dias Garantia', desc: 'Se não gostares, reembolso total sem perguntas' },
                { icone: '🎯', titulo: 'Resultado em 30 Dias', desc: 'Ou ajustamos o teu plano gratuitamente' },
                { icone: '💬', titulo: 'Suporte Incluído', desc: `Nunca estás ${g('sozinho', 'sozinha')} nesta jornada` },
                { icone: '🚪', titulo: 'Cancela Quando Quiseres', desc: 'Sem multas, sem complicações, sem stress' }
              ].map((garantia) => (
                <div key={garantia.titulo} className="flex items-start gap-4">
                  <span className="text-2xl text-[#C1634A]" dangerouslySetInnerHTML={{ __html: garantia.icone }}></span>
                  <div>
                    <h4 className="font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>{garantia.titulo}</h4>
                    <p className="text-sm text-[#C1634A]/70" style={{ fontFamily: 'var(--font-corpo)' }}>{garantia.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a0f0a, #2e1a14)' }}>
        <div className="max-w-3xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Perguntas Frequentes
            </h2>
            <p className="text-center text-[#C1634A]/70 mb-12" style={{ fontFamily: 'var(--font-corpo)' }}>
              Respondemos as dúvidas mais comuns
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#C1634A]/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full p-5 flex justify-between items-center text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium" style={{ fontFamily: 'var(--font-corpo)' }}>{faq.pergunta}</span>
                  <span className="text-[#C1634A] text-xl ml-4">{faqAberta === i ? '−' : '+'}</span>
                </button>
                {faqAberta === i && (
                  <div className="p-5 bg-white/5 border-t border-[#C1634A]/20">
                    <p className="text-white/70 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>{faq.resposta}</p>
                  </div>
                )}
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
          <p className="text-white/70 mb-4 text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>
            Sem compromisso. Sem cartão. Cancelas quando quiseres.
          </p>
          <p className="text-white/50 mb-8" style={{ fontFamily: 'var(--font-corpo)' }}>
            Descobre como é viver com direção, clareza e fogo interior.
          </p>
          <button
            onClick={handleComecar}
            className="inline-block px-10 py-5 bg-white text-[#2e1a14] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            Quero começar HOJE
          </button>
          <p className="text-white/40 text-sm mt-6" style={{ fontFamily: 'var(--font-corpo)' }}>
            7 dias grátis &middot; Acesso completo &middot; Cancela quando quiseres
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-12 px-4 border-t border-[#C1634A]/20"
        style={{ background: '#1a0f0a' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logos/IGNIS-LOGO-V3.png" alt="Ignis" className="w-8 h-8" />
                <span
                  className="text-xl font-bold text-[#C1634A]"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  IGNIS
                </span>
              </div>
              <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                Vontade &amp; Direção Consciente.<br />
                Escolhe o que é teu. Corta o que dispersa.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#C1634A] mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>Contacto</h3>
              <p className="text-white/50 text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +258 85 100 6473
              </p>
              <p className="text-white/50 text-sm flex items-center gap-2 mt-1" style={{ fontFamily: 'var(--font-corpo)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                feedback@seteecos.com
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#C1634A] mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>Links</h3>
              <div className="flex flex-col gap-1">
                <a href="#precos" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Preços</a>
                <Link to="/landing" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Sete Ecos</Link>
                <Link to="/lumina" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Lumina</Link>
                <a href="/termos.pdf" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Termos</a>
                <a href="/privacidade.pdf" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Privacidade</a>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <PartilharSocial
              compact
              url="https://app.seteecos.com/ignis"
              titulo="IGNIS - Vontade & Direção Consciente"
              texto="Descobre o IGNIS, um programa de escolha consciente, foco e alinhamento com valores. Acende o teu fogo interior."
            />
          </div>

          <div className="border-t border-[#C1634A]/10 pt-6 text-center text-white/30 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
            &copy; 2026 Ignis &middot; Vivianne Santos &middot; Sete Ecos
          </div>
        </div>
      </footer>

      {/* ===== WhatsApp Float ===== */}
      <a
        href="https://wa.me/258851006473"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}

export default LandingIgnis
