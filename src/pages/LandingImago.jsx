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
import PodcastPlayer from '../components/shared/PodcastPlayer'

/**
 * IMAGO - Landing Page
 * "Identidade & Espelho" - Chakra Sahasrara (Coroa), Elemento: Consciência
 * Módulo de autoconhecimento profundo, identidade e integração
 * Tema: roxo (#8B7BA5), Playfair Display
 */

const LandingImago = () => {
  const navigate = useNavigate()
  const { session, userRecord } = useAuth()
  const imago = ECO_PLANS.imago
  const planos = [imago.monthly, imago.semestral, imago.annual]
  const [faqAberta, setFaqAberta] = useState(null)

  useEffect(() => {
    if (!session) return
    if (isCoach(session.user?.email)) {
      navigate('/imago/dashboard', { replace: true })
      return
    }
    if (userRecord?.id) {
      checkEcoAccess('imago', userRecord.id).then(access => {
        if (access.hasAccess) navigate('/imago/dashboard', { replace: true })
      }).catch(() => {})
    }
  }, [session, userRecord, navigate])

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

  const testemunhos = [
    {
      contacto: 'MC',
      resultado: 'Espelho Triplo mudou tudo',
      mensagens: [
        { texto: 'O Espelho Triplo mostrou-me que a pessoa que mostro no trabalho não tem nada a ver comigo', hora: '10:14', tipo: 'recebida' },
        { texto: 'Pela primeira vez, entendi porque me sentia tão cansada de ser quem não sou.', hora: '10:15', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'JR',
      resultado: 'Arqueologia de Si reveladora',
      mensagens: [
        { texto: 'A Arqueologia de Si foi brutal. Descobri que vivo a vida que a minha mãe queria', hora: '21:32', tipo: 'recebida' },
        { texto: 'Chorei. Mas agora sei. E saber é o primeiro passo para mudar.', hora: '21:33', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'TS',
      resultado: 'Nomeação transformadora',
      mensagens: [
        { texto: 'A Nomeação mudou tudo. Escolhi como me definir.', hora: '15:07', tipo: 'recebida' },
        { texto: 'Não sou o que me disseram. Sou o que escolho ser. \uD83D\uDC9C', hora: '15:08', tipo: 'recebida' },
      ]
    }
  ]

  const faqs = [
    {
      pergunta: 'Isto é psicologia?',
      resposta: 'Não. O Imago é um programa de autoconhecimento prático, baseado em exercícios de reflexão e integração. Não substitui terapia nem diagnostica. É uma ferramenta para te conheceres melhor — ao teu ritmo, com profundidade e sem julgamento.'
    },
    {
      pergunta: 'E se eu não gostar do que encontrar?',
      resposta: 'O Imago não te julga. Mostra-te quem és para que possas escolher quem queres ser. Não há respostas certas ou erradas — há honestidade. E essa honestidade é o início de tudo.'
    },
    {
      pergunta: 'Quanto tempo preciso por dia?',
      resposta: 'O Espelho Triplo = 10 min. A Arqueologia = 15 min. Os exercícios diários = 5 min. Podes fazer mais se quiseres, mas o essencial é acessível e rápido.'
    },
    {
      pergunta: 'Posso experimentar antes de pagar?',
      resposta: 'Sim! 7 dias grátis com acesso completo. Sem compromisso, sem cartão. Se no fim dos 7 dias quiseres continuar, escolhes o teu plano.'
    },
    {
      pergunta: 'Qual a ligação com os outros Ecos?',
      resposta: 'O Imago é o módulo de integração. Conecta corpo (Vitalis), emoção (Serena), vontade (Ignis), energia (Ventis), voz (Ecoa) e valor (Aurea). É o espaço onde tudo se encontra e ganha sentido.'
    }
  ]

  const handleComecar = () => {
    navigate('/imago/pagamento')
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>

      <SEOHead
        title="IMAGO - Identidade & Espelho | Sete Ecos"
        description="Autoconhecimento profundo. Descobre quem és, quem mostras ao mundo e quem queres ser. Espelho Triplo, Arqueologia de Si, Mapa de Identidade e integração dos 7 Ecos. Desde 499 MZN/mês."
        url="https://app.seteecos.com/imago"
        image="https://app.seteecos.com/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "IMAGO - Identidade & Espelho",
          "description": "Programa de autoconhecimento profundo com Espelho Triplo, Arqueologia de Si, Mapa de Identidade e integração dos 7 Ecos.",
          "brand": { "@type": "Brand", "name": "Sete Ecos" },
          "offers": [
            { "@type": "Offer", "name": "Mensal", "price": "499", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Semestral", "price": "2395", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Anual", "price": "4190", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" }
          ]
        }}
      />

      {/* ===== NAVEGAÇÃO FIXA ===== */}
      <nav
        className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-xl z-50"
        style={{ background: 'rgba(26, 26, 46, 0.9)', borderBottom: '1px solid rgba(139, 123, 165, 0.25)' }}
      >
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/IMAGO_LOGO_V3.png" alt="Imago" className="w-12 h-12" />
          <span
            className="text-2xl font-bold text-[#8B7BA5]"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            IMAGO
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#features" className="text-white/60 hover:text-[#8B7BA5] transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="text-white/60 hover:text-[#8B7BA5] transition-colors">Como Funciona</a>
          <a href="#resultados" className="text-white/60 hover:text-[#8B7BA5] transition-colors">Resultados</a>
          <a href="#precos" className="text-white/60 hover:text-[#8B7BA5] transition-colors">Preços</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/imago/login"
            className="px-5 py-2 text-[#8B7BA5] font-semibold text-sm hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <button
            onClick={handleComecar}
            className="px-6 py-2 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#8B7BA5]/30"
            style={{ background: 'linear-gradient(135deg, #8B7BA5, #5a4d7a)' }}
          >
            Descobrir quem sou
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2e2a3e 40%, #8B7BA5 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#8B7BA5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a1a2e]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#8B7BA5]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Sahasrara &middot; Coroa &middot; Elemento: Consciência
          </p>

          <div className="relative w-24 h-24 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full opacity-30 animate-pulse"
              style={{ background: 'radial-gradient(circle, #8B7BA5 0%, transparent 70%)', transform: 'scale(1.5)' }}
            />
            <div className="relative w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <img src="/logos/IMAGO_LOGO_V3.png" alt="Imago" className="w-16 h-16" />
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            IMAGO
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}
          >
            Identidade &amp; Espelho
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10" style={{ fontFamily: 'var(--font-corpo)' }}>
            Quem sou vs. quem mostro vs. quem quero ser.
            O espaço onde finalmente te encontras.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleComecar}
              className="animate-pulse-glow px-10 py-4 bg-white text-[#1a1a2e] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Descobrir quem sou
            </button>
            <a
              href="#como-funciona"
              className="px-10 py-4 bg-white/15 text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all border border-white/20"
            >
              Como funciona
            </a>
          </div>

          {/* Social proof stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>7</div>
              <div className="text-[#8B7BA5]/70 text-sm">dimensões de identidade</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>3</div>
              <div className="text-[#8B7BA5]/70 text-sm">espelhos de auto-conhecimento</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>100%</div>
              <div className="text-[#8B7BA5]/70 text-sm">integração dos ecos</div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a1a2e, #12121e)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Quantas versões de ti criaste para agradar os outros?
            </h2>

            <p className="text-[#8B7BA5]/80 mb-10 text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>
              A maioria de nós vive atrás de máscaras. O Imago devolve-te o espelho.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            {[
              'Sentes que não sabes quem és realmente',
              `Vives para os outros e esqueces-te de ti ${g('mesmo', 'mesma')}`,
              'Usas máscaras diferentes com cada pessoa',
              'Mudas de personalidade conforme quem está na sala',
              'Não sabes o que queres porque sempre fizeste o que os outros esperavam',
              'Sentes que perdeste a tua essência ao longo dos anos',
              'Olhas ao espelho e não te reconheces',
              'Tens medo de descobrir quem és de verdade'
            ].map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#8B7BA5]/20 hover:bg-white/10 hover:border-[#8B7BA5]/40 transition-all duration-300"
                >
                  <span className="text-[#8B7BA5] text-xl mt-0.5">&#10003;</span>
                  <span className="text-white/80 text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-[#8B7BA5]/60 mt-10 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
            Se te reconheceste em pelo menos uma, o Imago foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUÇÃO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#12121e' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Imago é o espaço onde te encontras para além de tudo o que já disseram que eras
              </h2>
              <p className="text-[#8B7BA5]/70 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corpo)' }}>
                Ferramentas de autoconhecimento profundo para quem quer viver como realmente é.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="p-6 bg-white/5 rounded-2xl border border-[#8B7BA5]/20 hover:bg-white/10 hover:border-[#8B7BA5]/40 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icone}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    {f.titulo}
                  </h3>
                  <p className="text-[#8B7BA5]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-white text-[#1a1a2e] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== ESPELHO TRIPLO (secção especial única do Imago) ===== */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #12121e 0%, #2e2a3e 50%, #12121e 100%)' }}>
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#8B7BA5]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-[#5a4d7a]/15 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-[#8B7BA5]/20 rounded-full mb-4">
                <span className="text-[#8B7BA5] text-sm font-medium">Exclusivo Imago</span>
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Espelho Triplo — Quem sou vs. quem mostro vs. quem quero ser
              </h2>
              <p className="text-[#8B7BA5]/80 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corpo)' }}>
                Três dimensões de ti. Um exercício que muda tudo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mt-12 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#8B7BA5]/30 via-[#8B7BA5]/60 to-[#8B7BA5]/30" style={{ transform: 'translateY(-50%)' }}></div>

            {[
              {
                icone: '\uD83E\uDE9E',
                titulo: 'Espelho Interior',
                subtitulo: 'Quem sou quando ninguém vê.',
                desc: 'A essência crua. O que sentes quando paras. A voz que só ouves no silêncio.',
                cor: 'from-[#8B7BA5]/20 to-[#5a4d7a]/20'
              },
              {
                icone: '\uD83C\uDFAD',
                titulo: 'Espelho Social',
                subtitulo: 'Quem mostro ao mundo.',
                desc: 'As máscaras que usas. Os papéis que representas. A versão que os outros conhecem.',
                cor: 'from-[#5a4d7a]/20 to-[#8B7BA5]/20'
              },
              {
                icone: '\u2728',
                titulo: 'Espelho Futuro',
                subtitulo: 'Quem quero ser.',
                desc: 'A versão que te chama. O potencial que sentes mas ainda não viveste. A escolha que te espera.',
                cor: 'from-[#8B7BA5]/20 to-[#5a4d7a]/20'
              }
            ].map((espelho, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.15}>
                <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${espelho.cor} border border-[#8B7BA5]/30 text-center hover:border-[#8B7BA5]/60 transition-all duration-300 group backdrop-blur-sm`}>
                  {/* Glow indicator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#8B7BA5] shadow-lg shadow-[#8B7BA5]/50 z-10 group-hover:scale-110 transition-transform"></div>

                  <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">{espelho.icone}</div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-titulos)' }}
                  >
                    {espelho.titulo}
                  </h3>
                  <p className="text-[#8B7BA5] font-medium text-sm mb-3" style={{ fontFamily: 'var(--font-corpo)' }}>
                    {espelho.subtitulo}
                  </p>
                  <p className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    {espelho.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#8B7BA5]/70 text-sm mb-6" style={{ fontFamily: 'var(--font-corpo)' }}>
              O Espelho Triplo demora 10 minutos. Os resultados ficam para a vida.
            </p>
            <button
              onClick={handleComecar}
              className="px-8 py-4 text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all shadow-lg shadow-[#8B7BA5]/30"
              style={{ background: 'linear-gradient(135deg, #8B7BA5, #5a4d7a)' }}
            >
              Experimentar o Espelho Triplo
            </button>
          </div>
        </div>
      </section>

      {/* ===== VÊ A PLATAFORMA ===== */}
      <section className="py-20 px-4" style={{ background: '#12121e' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-[#8B7BA5]/20 text-[#8B7BA5] rounded-full text-sm font-semibold mb-4">
                VÊ POR DENTRO
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Imago na palma da tua mão
              </h2>
              <p className="text-[#8B7BA5]/70 max-w-xl mx-auto">
                Descobre quem és por baixo de tudo o que construíste.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <ScrollReveal variant="fadeLeft">
              <div className="relative mx-auto max-w-[280px]">
                <div className="absolute -inset-4 bg-[#8B7BA5]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Imago-dash-portrait.png"
                  alt="Imago Dashboard — espelho triplo, valores e meditações"
                  className="relative rounded-[2rem] shadow-2xl border border-[#8B7BA5]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#8B7BA5]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Dashboard principal
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeRight">
              <div className="relative mx-auto max-w-[280px]">
                <div className="absolute -inset-4 bg-[#8B7BA5]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Imago-arqueologia-portrait.png"
                  alt="Arqueologia de Si — escavar camadas da tua identidade"
                  className="relative rounded-[2rem] shadow-2xl border border-[#8B7BA5]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#8B7BA5]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Arqueologia de Si
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-[#8B7BA5] text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #12121e, #1a1a2e)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Como funciona
            </h2>
            <p className="text-[#8B7BA5]/70" style={{ fontFamily: 'var(--font-corpo)' }}>
              Três passos. Sem complicações.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <ScrollReveal key={p.numero} variant="fadeUp" delay={parseInt(p.numero) * 0.1}>
                <div
                  className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#8B7BA5]/20 hover:bg-white/10 hover:border-[#8B7BA5]/40 transition-all duration-300"
                >
                  <span
                    className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                    style={{ fontFamily: 'var(--font-titulos)' }}
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
                    style={{ fontFamily: 'var(--font-titulos)' }}
                  >
                    {p.titulo}
                  </h3>
                  <p className="text-[#8B7BA5]/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTEMUNHOS WHATSAPP ===== */}
      <section id="resultados" className="py-20 px-4" style={{ background: '#12121e' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O que dizem quem já se olhou ao espelho
              </h2>
              <p className="text-[#8B7BA5]/70" style={{ fontFamily: 'var(--font-corpo)' }}>
                Histórias reais de auto-descoberta
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                <div className="flex flex-col items-center gap-3">
                  <WhatsAppMockup
                    mensagens={t.mensagens}
                    contacto={t.contacto}
                    corTema="dourado"
                  />
                  <span className="inline-block px-4 py-1.5 bg-[#8B7BA5]/10 text-[#8B7BA5] rounded-full text-sm font-semibold border border-[#8B7BA5]/20">
                    {t.resultado}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COACH / CRIADORA ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #12121e, #1a1a2e)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left order-2 md:order-1">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quem criou o IMAGO
              </h2>
              <p className="text-white/80 mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
                <strong className="text-[#8B7BA5]">Vivianne Santos</strong> é terapeuta, coach de desenvolvimento pessoal
                e criadora do Sistema Sete Ecos — um caminho de transformação que integra corpo, emoção e espírito.
              </p>
              <p className="text-white/70 mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
                O Imago nasceu da certeza de que a maior jornada que podemos fazer é para dentro de nós.
                Não para nos julgarmos, mas para nos reconhecermos. Para além dos rótulos, das expectativas, das máscaras.
              </p>
              <p className="text-white/70 mb-6" style={{ fontFamily: 'var(--font-corpo)' }}>
                O Espelho Triplo, a Arqueologia de Si, a Nomeação — são ferramentas que nasceram de anos
                de trabalho com pessoas que viviam a vida de toda a gente, menos a delas.
              </p>
              <div
                className="p-6 rounded-xl border-l-4 border-[#8B7BA5] italic"
                style={{ background: 'rgba(139, 123, 165, 0.1)' }}
              >
                <p className="text-white/90" style={{ fontFamily: 'var(--font-corpo)' }}>
                  "Conhece-te. Para além de tudo o que já disseram que eras."
                </p>
                <cite
                  className="block text-right font-semibold text-[#8B7BA5] mt-3 not-italic"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  — Vivianne Santos
                </cite>
              </div>
              <div className="flex items-center gap-4 justify-center md:justify-start mt-6">
                <img
                  src="/logos/seteecos_logo_v2.png"
                  alt="Sete Ecos"
                  className="w-10 h-10 opacity-70"
                />
                <span className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>Parte do Sistema Sete Ecos</span>
              </div>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-[#8B7BA5]/20 to-[#5a4d7a]/20 border border-[#8B7BA5]/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">{'\uD83E\uDE9E'}</div>
                  <p className="text-white/70 text-sm italic" style={{ fontFamily: 'var(--font-corpo)' }}>"Conhece-te."</p>
                  <p className="text-[#8B7BA5] text-sm mt-2" style={{ fontFamily: 'var(--font-titulos)' }}>— Vivianne Santos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREÇOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#12121e' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#8B7BA5]/70" style={{ fontFamily: 'var(--font-corpo)' }}>
              Preços simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg ${
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
                  style={{ fontFamily: 'var(--font-titulos)' }}
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

                <p className="text-[#8B7BA5]/50 text-sm mb-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                  (~${plano.price_usd} USD)
                </p>

                {plano.duration > 1 && (
                  <p className="text-[#8B7BA5]/50 text-xs mb-4" style={{ fontFamily: 'var(--font-corpo)' }}>
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <ul className="space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2 text-white/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#8B7BA5]">&#10003;</span> Espelho Triplo completo
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#8B7BA5]">&#10003;</span> Arqueologia de Si
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#8B7BA5]">&#10003;</span> Mapa de Identidade 7D
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#8B7BA5]">&#10003;</span> Meditações de Essência
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                    <span className="text-[#8B7BA5]">&#10003;</span> Todas as ferramentas
                  </li>
                </ul>

                <Link
                  to="/imago/pagamento"
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #8B7BA5, #5a4d7a)' }}
                >
                  Escolher
                </Link>
              </div>
            ))}
          </div>

          {/* Garantias */}
          <div className="mt-10 p-8 bg-white/5 rounded-2xl border border-[#8B7BA5]/20">
            <h3
              className="text-2xl font-bold text-white text-center mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Compromisso Imago
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icone: '&#10003;', titulo: '7 Dias Grátis', desc: 'Experimenta sem compromisso, sem cartão' },
                { icone: '\uD83C\uDFAF', titulo: 'Resultados em 10 min', desc: 'O Espelho Triplo muda a tua perspectiva desde o primeiro dia' },
                { icone: '\uD83D\uDCAC', titulo: 'Suporte Incluído', desc: 'Nunca estás sozinha nesta jornada' },
                { icone: '\uD83D\uDEAA', titulo: 'Cancela Quando Quiseres', desc: 'Sem multas, sem complicações, sem stress' }
              ].map((garantia) => (
                <div key={garantia.titulo} className="flex items-start gap-4">
                  <span className="text-2xl text-[#8B7BA5]" dangerouslySetInnerHTML={{ __html: garantia.icone }}></span>
                  <div>
                    <h4 className="font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>{garantia.titulo}</h4>
                    <p className="text-sm text-[#8B7BA5]/70" style={{ fontFamily: 'var(--font-corpo)' }}>{garantia.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #12121e, #1a1a2e)' }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Perguntas Frequentes
          </h2>
          <p className="text-center text-[#8B7BA5]/70 mb-10" style={{ fontFamily: 'var(--font-corpo)' }}>
            Respondemos as dúvidas mais comuns
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-[#8B7BA5]/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full p-5 flex justify-between items-center text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium" style={{ fontFamily: 'var(--font-corpo)' }}>{faq.pergunta}</span>
                  <span className="text-[#8B7BA5] text-xl ml-4">
                    {faqAberta === i ? '\u2212' : '+'}
                  </span>
                </button>
                {faqAberta === i && (
                  <div className="p-5 bg-white/5 border-t border-[#8B7BA5]/20">
                    <p className="text-white/70 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>{faq.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vivianne Explica — Podcast teaser */}
      <section className="py-12 px-4" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #FDF8F3 100%)' }}>
        <div className="max-w-lg mx-auto">
          <ScrollReveal>
            <p className="text-center text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#6C3483' }}>
              Ouve a Vivianne
            </p>
            <PodcastPlayer eco="imago" />
          </ScrollReveal>
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
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Experimenta 7 dias grátis
          </h2>
          <p className="text-white/70 mb-4 text-lg" style={{ fontFamily: 'var(--font-corpo)' }}>
            Sem compromisso. Sem cartão. Cancelas quando quiseres.
          </p>
          <p className="text-white/50 mb-8" style={{ fontFamily: 'var(--font-corpo)' }}>
            Descobre quem és para além de tudo o que já disseram que eras.
          </p>
          <button
            onClick={handleComecar}
            className="inline-block px-10 py-5 bg-white text-[#1a1a2e] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
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
        className="py-12 px-4 border-t border-[#8B7BA5]/20"
        style={{ background: '#12121e' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logos/IMAGO_LOGO_V3.png" alt="Imago" className="w-8 h-8" />
                <span
                  className="font-bold text-[#8B7BA5]"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  IMAGO
                </span>
              </div>
              <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
                Identidade &amp; Espelho.<br />
                O espaço onde te encontras.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#8B7BA5] mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>Contacto</h3>
              <p className="text-white/50 text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +258 85 100 6473
              </p>
              <p className="text-white/50 text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                feedback@seteecos.com
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#8B7BA5] mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>Links</h3>
              <div className="flex flex-col gap-1">
                <a href="#precos" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Preços</a>
                <Link to="/landing" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Sete Ecos</Link>
                <Link to="/vitalis" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Vitalis</Link>
                <Link to="/lumina" className="text-white/50 text-sm hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>Lumina</Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <PartilharSocial
              compact
              url="https://app.seteecos.com/imago"
              titulo="IMAGO - Identidade & Espelho"
              texto="Descobre o IMAGO, um programa de autoconhecimento profundo. Quem sou vs. quem mostro vs. quem quero ser."
            />
          </div>

          <div className="border-t border-[#8B7BA5]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm">
              <Link to="/landing" className="text-white/40 hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>
                Sete Ecos
              </Link>
              <a href="/termos.pdf" className="text-white/40 hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>
                Termos
              </a>
              <a href="/privacidade.pdf" className="text-white/40 hover:text-white transition-colors" style={{ fontFamily: 'var(--font-corpo)' }}>
                Privacidade
              </a>
            </div>
            <div className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
              &copy; 2026 Sete Ecos &middot; Vivianne Santos
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/258851006473"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
        aria-label="Contactar via WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}

export default LandingImago
