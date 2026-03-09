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
 * SERENA - Landing Page
 * "Emoção & Fluidez" - Chakra Svadhisthana (Sacral), Elemento: Água
 * Módulo de gestão emocional e fluidez interior
 */

const LandingSerena = () => {
  const navigate = useNavigate()
  const [faqAberta, setFaqAberta] = useState(null)
  const { session, userRecord } = useAuth()
  const serena = ECO_PLANS.serena
  const planos = [serena.monthly, serena.semestral, serena.annual]

  // Redireciona coaches e utilizadores com acesso activo para o dashboard
  useEffect(() => {
    if (!session) return
    if (isCoach(session.user?.email)) {
      navigate('/serena/dashboard', { replace: true })
      return
    }
    if (userRecord?.id) {
      checkEcoAccess('serena', userRecord.id).then(access => {
        if (access.hasAccess) navigate('/serena/dashboard', { replace: true })
      }).catch(() => {})
    }
  }, [session, userRecord, navigate])

  const handleComecar = () => {
    navigate(session ? '/serena/pagamento' : '/serena/pagamento')
  }

  const features = [
    {
      icone: '\uD83D\uDCD3',
      titulo: 'Diário Emocional',
      desc: 'Regista o que sentes sem julgamento. Identifica padrões emocionais ao longo do tempo.'
    },
    {
      icone: '\uD83C\uDF2C\uFE0F',
      titulo: 'Respiração Guiada',
      desc: 'Exercícios de respiração para cada estado emocional. Acalma o corpo, clareia a mente.'
    },
    {
      icone: '\uD83C\uDD98',
      titulo: 'SOS Emocional',
      desc: 'Quando a emoção transborda, tens apoio imediato. Técnicas rápidas de 60 segundos.'
    },
    {
      icone: '\uD83C\uDF0A',
      titulo: 'Práticas de Fluidez',
      desc: 'Movimentos, visualizações e exercícios para desbloquear emoções estagnadas.'
    },
    {
      icone: '\uD83D\uDD25',
      titulo: 'Rituais de Libertação',
      desc: 'Rituais para soltar o que já não serve. Raiva, mágoa, culpa \u2014 tudo tem saída.'
    },
    {
      icone: '\uD83D\uDCAC',
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
      desc: 'Deixa ir o que não serve. A emoção é energia \u2014 quando flui, liberta.'
    }
  ]

  const sosEstados = [
    {
      estado: 'Ansiedade',
      icone: '\uD83D\uDE30',
      tecnicas: ['Respiração 4-7-8', 'Grounding 5-4-3-2-1'],
      cor: '#6B8E9B'
    },
    {
      estado: 'Raiva',
      icone: '\uD83D\uDE24',
      tecnicas: ['Técnica de Contenção', 'Movimento Libertação'],
      cor: '#4a6e7b'
    },
    {
      estado: 'Tristeza',
      icone: '\uD83D\uDE22',
      tecnicas: ['Acolhimento Gentil', 'Carta ao Eu'],
      cor: '#6B8E9B'
    },
    {
      estado: 'Pânico',
      icone: '\uD83D\uDE28',
      tecnicas: ['Respiração Quadrada', 'Ancoragem Sensorial'],
      cor: '#4a6e7b'
    }
  ]

  const testemunhos = [
    {
      contacto: 'LP',
      resultado: 'Crise de ansiedade controlada',
      mensagens: [
        { texto: 'O SOS emocional salvou-me numa crise de ansiedade no trabalho', hora: '14:22', tipo: 'recebida' },
        { texto: '60 segundos e consegui voltar a respirar', hora: '14:23', tipo: 'recebida' }
      ]
    },
    {
      contacto: 'MR',
      resultado: 'Diário emocional transformador',
      mensagens: [
        { texto: 'Pela primeira vez na vida tenho um espaço para sentir sem culpa', hora: '21:10', tipo: 'recebida' },
        { texto: 'O diário emocional mudou tudo', hora: '21:11', tipo: 'recebida' }
      ]
    },
    {
      contacto: 'TC',
      resultado: 'Crises reduzidas de 4x para 1x/mês',
      mensagens: [
        { texto: 'Reduzi as crises de choro de 4x/semana para 1x/mês', hora: '08:45', tipo: 'recebida' },
        { texto: 'O Serena ensinou-me a processar em vez de engolir', hora: '08:46', tipo: 'recebida' }
      ]
    }
  ]

  const faqs = [
    {
      pergunta: 'Isto é terapia?',
      resposta: 'Não. O Serena é um espaço de auto-gestão emocional. Não substitui terapia nem acompanhamento psicológico. É uma ferramenta para o dia-a-dia que te ajuda a identificar, processar e libertar emoções de forma saudável. Se precisares de apoio profissional, recomendamos sempre um terapeuta.'
    },
    {
      pergunta: 'E se eu não souber o que sinto?',
      resposta: 'É exactamente para isso que o Serena existe. O diário emocional guia-te com perguntas simples até conseguires nomear o que sentes. Muitas pessoas nunca aprenderam a identificar emoções \u2014 o Serena ajuda-te nesse processo, passo a passo.'
    },
    {
      pergunta: 'Quanto tempo preciso por dia?',
      resposta: 'O SOS é de 60 segundos. O diário leva 3-5 minutos. As práticas de fluidez e respiração variam entre 5 e 15 minutos. Podes usar apenas o que precisas no momento \u2014 sem obrigação de seguir uma rotina rígida.'
    },
    {
      pergunta: 'Posso experimentar antes de pagar?',
      resposta: 'Sim! Tens 7 dias de trial gratuito com acesso completo a todas as funcionalidades. Sem compromisso, sem cartão de crédito. Se no fim dos 7 dias quiseres continuar, escolhes um plano.'
    },
    {
      pergunta: 'E se eu estiver em crise?',
      resposta: 'O SOS Emocional tem técnicas de 60 segundos para momentos de crise \u2014 ansiedade, pânico, raiva ou tristeza intensa. São ferramentas de primeira resposta. Para crises graves ou pensamentos de auto-mutilação, contacta sempre a linha de apoio ao cidadão ou um profissional de saúde mental.'
    }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>
      <SEOHead
        title="SERENA - Emoção & Fluidez | Sete Ecos"
        description="Programa de gestão emocional. Diário emocional, SOS Emocional, respiração guiada e coaching personalizado."
        url="https://app.seteecos.com/serena"
        image="https://app.seteecos.com/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "SERENA - Emoção & Fluidez",
          "description": "Programa de gestão emocional com diário emocional, SOS Emocional, respiração guiada e coaching personalizado.",
          "brand": { "@type": "Brand", "name": "Sete Ecos" },
          "offers": [
            { "@type": "Offer", "name": "Mensal", "price": "499", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Semestral", "price": "2395", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Anual", "price": "4190", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" }
          ]
        }}
      />

      {/* ===== NAVEGAÇÃO FIXA ===== */}
      <nav className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center bg-[#1a2e3a]/90 backdrop-blur-xl z-50 border-b border-[#6B8E9B]/15">
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/SERENA_LOGO_V3.png" alt="SERENA" className="w-12 h-12" />
          <span
            className="text-2xl font-bold text-[#6B8E9B]"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            SERENA
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#features" className="text-white/70 hover:text-[#6B8E9B] transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="text-white/70 hover:text-[#6B8E9B] transition-colors">Como Funciona</a>
          <a href="#resultados" className="text-white/70 hover:text-[#6B8E9B] transition-colors">Resultados</a>
          <a href="#precos" className="text-white/70 hover:text-[#6B8E9B] transition-colors">Preços</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/serena/login"
            className="px-5 py-2 text-[#6B8E9B] font-semibold text-sm hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <button
            onClick={handleComecar}
            className="px-6 py-2 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#6B8E9B]/30"
            style={{ background: 'linear-gradient(135deg, #6B8E9B, #4a6e7b)' }}
          >
            7 Dias Grátis
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-20"
        style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #2a4a5a 40%, #6B8E9B 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#6B8E9B]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a2e3a]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-[#6B8E9B]/20 rounded-full mb-6">
            <span className="text-[#6B8E9B] text-sm font-medium">Svadhisthana &middot; Sacral &middot; Elemento: Água</span>
          </div>

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
            Sem julgamento, sem pressa &mdash; só fluidez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleComecar}
              className="animate-pulse-glow px-10 py-4 bg-white text-[#1a2e3a] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Começar a Jornada
            </button>
            <a
              href="#como-funciona"
              className="px-10 py-4 bg-white/15 text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all border border-white/20"
            >
              Como funciona
            </a>
          </div>

          {/* Estatísticas sociais */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>94%</div>
              <div className="text-white/50 text-sm">redução de ansiedade</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>60s</div>
              <div className="text-white/50 text-sm">SOS emocional</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>8+</div>
              <div className="text-white/50 text-sm">rituais de libertação</div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2e3a, #0f1f28)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-10">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quantas vezes engoliste o que sentias?
              </h2>

              <p className="text-[#6B8E9B]/80 mb-10 text-lg">
                A maioria de nós aprendeu a esconder o que sente. O Serena muda isso.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              'Sorris quando querias chorar',
              'Dizes que estás bem quando não estás',
              'Explodes sem saber porquê',
              'Acumulas emoções até explodir',
              'Sentes que não tens direito a sentir',
              'A ansiedade controla os teus dias',
              'Choras {escondida} no carro ou no banho',
              'Cuidas de todos menos das tuas emoções'
            ].map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#6B8E9B]/20"
                >
                  <span className="text-[#6B8E9B] text-xl mt-0.5">&#10003;</span>
                  <span className="text-white/80 text-lg">
                    {item.includes('{escondida}')
                      ? item.replace('{escondida}', g('escondido', 'escondida'))
                      : item}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-center text-[#6B8E9B]/60 mt-8 text-sm">
            Se te {g('reconheceste', 'reconheceste')} em pelo menos uma, o Serena foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUÇÃO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Serena é o espaço onde as tuas emoções finalmente têm voz
              </h2>
              <p className="text-[#6B8E9B]/70 max-w-2xl mx-auto">
                Ferramentas criadas para acolher, processar e libertar &mdash; ao teu ritmo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.08}>
                <div
                  className="p-6 bg-white/5 rounded-2xl border border-[#6B8E9B]/20 hover:bg-white/10 hover:border-[#6B8E9B]/40 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icone}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    {f.titulo}
                  </h3>
                  <p className="text-[#6B8E9B]/70 text-sm">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-white text-[#1a2e3a] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== SOS EMOCIONAL ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2e3a)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-[#6B8E9B]/20 text-[#6B8E9B] rounded-full text-sm font-semibold mb-4">
                EXCLUSIVO SERENA
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                SOS Emocional &mdash; Apoio em 60 segundos
              </h2>
              <p className="text-[#6B8E9B]/70 max-w-xl mx-auto text-lg">
                Quando a emoção transborda, tens apoio imediato.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {sosEstados.map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                <div className="p-6 bg-white/5 rounded-2xl border border-[#6B8E9B]/20 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{item.icone}</span>
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: 'var(--font-titulos)' }}
                    >
                      {item.estado}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {item.tecnicas.map((tecnica, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: `${item.cor}15`, border: `1px solid ${item.cor}30` }}
                      >
                        <span className="text-[#6B8E9B]">&#10140;</span>
                        <span className="text-white/80 text-sm font-medium">{tecnica}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <div className="inline-block px-6 py-3 bg-white/5 rounded-2xl border border-[#6B8E9B]/20">
              <p className="text-[#6B8E9B]/80 text-sm">
                60 segundos. Sem necessidade de pensar. Só seguir o guia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VÊ A PLATAFORMA ===== */}
      <section className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-[#6B8E9B]/20 text-[#6B8E9B] rounded-full text-sm font-semibold mb-4">
                VÊ POR DENTRO
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Serena na palma da tua mão
              </h2>
              <p className="text-[#6B8E9B]/70 max-w-xl mx-auto">
                Uma plataforma pensada para acolher as tuas emoções, onde estiveres.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <ScrollReveal variant="fadeLeft">
              <div className="relative mx-auto max-w-[280px]">
                <div className="absolute -inset-4 bg-[#6B8E9B]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Serena-dash-portrait.png"
                  alt="Serena Dashboard — diário emocional, respiração guiada e mais"
                  className="relative rounded-[2rem] shadow-2xl border border-[#6B8E9B]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#6B8E9B]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Dashboard principal
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeRight">
              <div className="relative mx-auto max-w-[280px]">
                <div className="absolute -inset-4 bg-[#6B8E9B]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Serena-praticas-portrait.png"
                  alt="Práticas de Fluidez — exercícios do elemento água"
                  className="relative rounded-[2rem] shadow-2xl border border-[#6B8E9B]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#6B8E9B]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Práticas de Fluidez
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-[#6B8E9B] text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2e3a)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
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
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p, i) => (
              <ScrollReveal key={p.numero} variant="fadeUp" delay={i * 0.15}>
                <div
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTEMUNHOS ===== */}
      <section id="resultados" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2e3a)' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Resultados reais
              </h2>
              <p className="text-[#6B8E9B]/70">
                Histórias de quem aprendeu a sentir sem medo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.12}>
                <div className="flex flex-col items-center gap-3">
                  <WhatsAppMockup
                    mensagens={t.mensagens}
                    contacto={t.contacto}
                    corTema="azul"
                  />
                  <span className="inline-block px-4 py-1.5 bg-[#6B8E9B]/10 text-[#6B8E9B] rounded-full text-sm font-semibold border border-[#6B8E9B]/20">
                    {t.resultado}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUEM CRIOU SERENA ===== */}
      <section className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal variant="fadeLeft">
              <div className="text-center md:text-left">
                <h2
                  className="text-3xl md:text-4xl font-bold text-white mb-6"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  Quem criou SERENA
                </h2>
                <p className="text-white/80 mb-4">
                  <strong className="text-[#6B8E9B]">Vivianne Santos</strong> é terapeuta, coach de desenvolvimento pessoal
                  e criadora do Sistema Sete Ecos &mdash; um caminho de transmutação integral que integra corpo, emoção e espírito.
                </p>
                <p className="text-white/70 mb-4">
                  SERENA nasceu da observação de um padrão muito comum: pessoas que acumulam emoções
                  até o corpo e a mente não aguentarem mais. Que aprenderam a engolir o que sentem
                  para não incomodar ninguém.
                </p>
                <p className="text-white/70 mb-6">
                  &ldquo;Criei o Serena para que possas finalmente dar espaço ao que sentes &mdash; sem culpa,
                  sem pressa. Porque sentir é o primeiro acto de coragem.&rdquo;
                </p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <img
                    src="/logos/seteecos_logo_v2.png"
                    alt="Sete Ecos"
                    className="w-10 h-10 opacity-70"
                  />
                  <span className="text-white/40 text-sm">Parte do Sistema Sete Ecos</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeRight">
              <div className="flex justify-center">
                <div
                  className="w-64 h-64 md:w-80 md:h-80 rounded-2xl flex items-center justify-center border border-[#6B8E9B]/30"
                  style={{ background: 'linear-gradient(135deg, #6B8E9B/20, #4a6e7b/20)' }}
                >
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">{'\uD83C\uDF0A'}</div>
                    <p className="text-white/70 text-sm italic">&ldquo;Sentir é o primeiro acto de coragem.&rdquo;</p>
                    <p className="text-[#6B8E9B] text-sm mt-2">&mdash; Vivianne Santos</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== PREÇOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2e3a)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
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
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, i) => (
              <ScrollReveal key={plano.id} variant="fadeUp" delay={i * 0.1}>
                <div
                  className={`p-6 rounded-2xl border text-center transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg ${
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

                  <ul className="space-y-2 mb-6 text-left">
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-[#6B8E9B]">&#10003;</span> Diário Emocional
                    </li>
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-[#6B8E9B]">&#10003;</span> SOS Emocional
                    </li>
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-[#6B8E9B]">&#10003;</span> Respiração Guiada
                    </li>
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-[#6B8E9B]">&#10003;</span> 8+ Rituais de Libertação
                    </li>
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-[#6B8E9B]">&#10003;</span> Coach Serena
                    </li>
                  </ul>

                  <button
                    onClick={handleComecar}
                    className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6B8E9B, #4a6e7b)' }}
                  >
                    {i === 0 ? 'Experimentar grátis' : i === 1 ? 'Escolher este plano' : 'Subscrever anual'}
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-3xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Perguntas frequentes
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#6B8E9B]/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full p-4 flex justify-between items-center text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">{faq.pergunta}</span>
                  <span className="text-[#6B8E9B] text-xl ml-4">{faqAberta === i ? '\u2212' : '+'}</span>
                </button>
                {faqAberta === i && (
                  <div className="p-4 bg-white/5 border-t border-[#6B8E9B]/20">
                    <p className="text-white/70 leading-relaxed">{faq.resposta}</p>
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
        style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #6B8E9B 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <ScrollReveal variant="scale">
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
            <button
              onClick={handleComecar}
              className="inline-block px-10 py-5 bg-white text-[#1a2e3a] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
            >
              Quero começar HOJE
            </button>
            <p className="text-white/40 text-sm mt-6">
              7 dias grátis &middot; Acesso completo &middot; Cancela quando quiseres
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-12 px-4 border-t border-[#6B8E9B]/20"
        style={{ background: '#0f1f28' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logos/SERENA_LOGO_V3.png" alt="SERENA" className="w-8 h-8" />
                <span
                  className="text-xl font-bold text-[#6B8E9B]"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  SERENA
                </span>
              </div>
              <p className="text-white/50 text-sm">
                Emoção &amp; Fluidez.<br />
                O espaço onde as tuas emoções têm voz.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#6B8E9B] mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>Links</h3>
              <div className="flex flex-col gap-2">
                <Link to="/landing" className="text-white/40 hover:text-white transition-colors text-sm">
                  Sete Ecos
                </Link>
                <a href="#features" className="text-white/40 hover:text-white transition-colors text-sm">
                  Funcionalidades
                </a>
                <a href="#precos" className="text-white/40 hover:text-white transition-colors text-sm">
                  Preços
                </a>
                <a href="/termos.pdf" className="text-white/40 hover:text-white transition-colors text-sm">
                  Termos
                </a>
                <a href="/privacidade.pdf" className="text-white/40 hover:text-white transition-colors text-sm">
                  Privacidade
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[#6B8E9B] mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>Partilhar</h3>
              <PartilharSocial
                compact
                url="https://app.seteecos.com/serena"
                titulo="SERENA - Emoção & Fluidez"
                texto="Descobre o SERENA, um programa de gestão emocional com diário emocional, SOS Emocional e coaching personalizado."
              />
            </div>
          </div>
          <div className="border-t border-[#6B8E9B]/10 pt-6 text-center text-white/30 text-sm">
            &copy; 2026 Sete Ecos &middot; Vivianne Santos &middot; Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingSerena
