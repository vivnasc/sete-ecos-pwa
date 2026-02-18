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
 * ECOA - Landing Page
 * "Voz & Desbloqueio do Silencio" - Chakra Vishuddha (Garganta), Elemento: Eter/Som
 * Modulo de recuperacao da voz silenciada, expressao autentica e assertividade
 */

const LandingEcoa = () => {
  const navigate = useNavigate()
  const { session, userRecord } = useAuth()
  const ecoa = ECO_PLANS.ecoa
  const planos = [ecoa.monthly, ecoa.semestral, ecoa.annual]
  const [faqAberta, setFaqAberta] = useState(null)

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

  const fasesMicroVoz = [
    {
      semanas: 'Semana 1-2',
      titulo: 'Preferências',
      icone: '🌱',
      desc: 'Escolher o restaurante. Dizer o sabor preferido. Pedir o lugar à janela.',
      cor: '#4A90A4'
    },
    {
      semanas: 'Semana 3-4',
      titulo: 'Opiniões',
      icone: '🌿',
      desc: "Expressar desacordo gentil. Dizer 'eu prefiro'. Partilhar o que pensas.",
      cor: '#3d8496'
    },
    {
      semanas: 'Semana 5-6',
      titulo: 'Limites',
      icone: '🌳',
      desc: 'Dizer não. Pedir o que precisas. Recusar sem culpa.',
      cor: '#2a6a7a'
    },
    {
      semanas: 'Semana 7-8',
      titulo: 'Verdades',
      icone: '🌊',
      desc: 'Falar a tua verdade. Sem filtro. Com firmeza gentil.',
      cor: '#1a5060'
    }
  ]

  const testemunhos = [
    {
      contacto: 'RM',
      resultado: 'Primeira vez a discordar no trabalho',
      mensagens: [
        { texto: "Pela primeira vez disse 'não concordo' numa reunião de trabalho", hora: '14:22', tipo: 'recebida' },
        { texto: 'As mãos tremiam. Mas disse. E o mundo não acabou.', hora: '14:23', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'SS',
      resultado: 'Padrão de silêncio identificado',
      mensagens: [
        { texto: 'O Mapa de Silenciamento mostrou que me calo sempre com a minha mãe', hora: '19:45', tipo: 'recebida' },
        { texto: 'Agora tenho frases prontas para essas situações.', hora: '19:46', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'AL',
      resultado: '5 anos de palavras libertadas',
      mensagens: [
        { texto: 'Escrevi uma Carta Não Enviada ao meu ex. Libertei 5 anos de palavras presas', hora: '22:10', tipo: 'recebida' },
        { texto: 'Chorei. Mas foi libertação, não dor.', hora: '22:11', tipo: 'recebida' },
      ]
    }
  ]

  const faqs = [
    {
      pergunta: 'E se eu tiver medo de falar?',
      resposta: 'O programa Micro-Voz é progressivo. Começas com preferências simples — escolher o restaurante, dizer o sabor que preferes. Ninguém te pede para enfrentar a pessoa mais difícil da tua vida na primeira semana. A coragem constrói-se um exercício de cada vez.'
    },
    {
      pergunta: 'Isto substitui terapia da fala?',
      resposta: 'Não. O Ecoa trabalha o silenciamento emocional e social — quando te calas por medo, por hábito, por evitar conflito. Se tens dificuldades físicas na fala, recomendamos acompanhamento profissional. O Ecoa complementa, não substitui.'
    },
    {
      pergunta: 'Quanto tempo preciso por dia?',
      resposta: 'Um exercício de voz = 5 minutos. A Carta Não Enviada = 15 minutos. O Diário de Voz = o tempo que quiseres. No mínimo, 5 minutos por dia são suficientes para começar a sentir diferença.'
    },
    {
      pergunta: 'Posso experimentar antes de pagar?',
      resposta: 'Sim! 7 dias grátis com acesso completo a todas as ferramentas. Sem compromisso, sem cartão. Se no fim dos 7 dias quiseres continuar, escolhes um plano.'
    },
    {
      pergunta: 'E se eu me arrepender de ter falado?',
      resposta: 'O Ecoa distingue expressão de impulso. Ensina-te a falar com clareza e firmeza, não com raiva. Tens ferramentas de preparação (Biblioteca de Frases Difíceis) e reflexão (Diário de Voz) que te ajudam a comunicar de forma assertiva, não reactiva.'
    }
  ]

  const handleComecar = () => {
    navigate('/ecoa/pagamento')
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>
      <SEOHead
        title="ECOA - Voz & Desbloqueio do Silêncio | Sete Ecos"
        description="Recupera a voz que te silenciaram. Programa Micro-Voz de 8 semanas, Mapa de Silenciamento, Biblioteca de Frases Difíceis e comunicação assertiva. Quebra padrões de silêncio e fala a tua verdade."
        url="https://app.seteecos.com/ecoa"
        image="https://app.seteecos.com/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "ECOA - Voz & Desbloqueio do Silêncio",
          "description": "Programa de recuperação da voz silenciada com Micro-Voz progressivo, comunicação assertiva e ferramentas de expressão.",
          "brand": { "@type": "Brand", "name": "Sete Ecos" },
          "offers": [
            { "@type": "Offer", "name": "Mensal", "price": "750", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Semestral", "price": "3825", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Anual", "price": "7200", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" }
          ]
        }}
      />

      {/* ===== NAVEGACAO FIXA ===== */}
      <nav
        className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-xl z-50"
        style={{ background: 'rgba(26, 42, 52, 0.9)', borderBottom: '1px solid rgba(74, 144, 164, 0.3)' }}
      >
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/ECOA_LOGO_V3.png" alt="ECOA" className="w-12 h-12" />
          <span
            className="text-2xl font-bold text-[#4A90A4]"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            ECOA
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#features" className="text-white/70 hover:text-[#4A90A4] transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="text-white/70 hover:text-[#4A90A4] transition-colors">Como Funciona</a>
          <a href="#resultados" className="text-white/70 hover:text-[#4A90A4] transition-colors">Resultados</a>
          <a href="#precos" className="text-white/70 hover:text-[#4A90A4] transition-colors">Preços</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/ecoa/login"
            className="px-5 py-2 text-[#4A90A4] font-semibold text-sm hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <button
            onClick={handleComecar}
            className="px-6 py-2 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all shadow-md"
            style={{ background: 'linear-gradient(135deg, #4A90A4, #2a6a7a)' }}
          >
            Recuperar a Minha Voz
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
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
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            ECOA
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}
          >
            Voz &amp; Desbloqueio do Silêncio
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Recupera a voz que te silenciaram. Fala a tua verdade.
            De preferências simples a verdades profundas — um exercício de cada vez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/ecoa/pagamento"
              className="animate-pulse-glow px-10 py-4 bg-white text-[#1a2a34] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
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

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>87%</div>
              <div className="text-white/50 text-sm">redução de silenciamento</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>8 sem</div>
              <div className="text-white/50 text-sm">programa micro-voz</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>100+</div>
              <div className="text-white/50 text-sm">frases prontas</div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA / PAIN POINTS ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2a34, #0f1f28)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Quantas vezes calaste algo que precisava de ser dito?
            </h2>

            <p className="text-[#4A90A4]/80 mb-10 text-lg">
              O silêncio protege — mas quando se torna hábito, aprisiona.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            {[
              'Dizes que sim quando queres dizer não',
              'Calas o que sentes para não incomodar',
              'Sentes que a tua voz não tem peso',
              'Engoles opiniões para evitar conflito',
              'Sentes um nó na garganta quando precisas de falar',
              'Escreves mensagens e apagas antes de enviar',
              'Deixas os outros falar por ti',
              'Dizes "tanto faz" quando não é tanto faz'
            ].map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#4A90A4]/20 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[#4A90A4] text-xl mt-0.5">&#10003;</span>
                  <span className="text-white/80 text-lg">{item}</span>
                </div>
              </ScrollReveal>
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
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Ecoa é o espaço onde recuperas a tua voz
              </h2>
              <p className="text-[#4A90A4]/70 max-w-2xl mx-auto">
                Ferramentas para desbloquear o silêncio, fortalecer a expressão e falar a tua verdade.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="p-6 bg-white/5 rounded-2xl border border-[#4A90A4]/20 hover:bg-white/10 hover:border-[#4A90A4]/40 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icone}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    {f.titulo}
                  </h3>
                  <p className="text-[#4A90A4]/70 text-sm">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-white text-[#1a2a34] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== PROGRAMA MICRO-VOZ ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2a34)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-[#4A90A4]/20 rounded-full mb-4">
                <span className="text-[#4A90A4] text-sm font-semibold">🗣️ Exclusivo do Ecoa</span>
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Programa Micro-Voz — 8 semanas para recuperar a tua voz
              </h2>
              <p className="text-[#4A90A4]/70 max-w-2xl mx-auto text-lg">
                De preferências simples a verdades profundas. Progressivo, gentil, transformador.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline / Progression */}
          <div className="relative mt-14">
            {/* Linha de conexão vertical (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#4A90A4] to-[#1a5060] -translate-x-1/2"></div>

            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-1 md:gap-0">
              {fasesMicroVoz.map((fase, i) => (
                <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                  <div className={`relative md:flex items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:mb-12`}>
                    {/* Card */}
                    <div className={`md:w-5/12 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <div
                        className="p-6 rounded-2xl border border-[#4A90A4]/30 hover:border-[#4A90A4]/60 transition-all duration-300"
                        style={{ background: `linear-gradient(135deg, ${fase.cor}15, ${fase.cor}08)` }}
                      >
                        <span className="text-[#4A90A4]/60 text-xs font-semibold tracking-wider uppercase">
                          {fase.semanas}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-1 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                          {fase.icone} {fase.titulo}
                        </h3>
                        <p className="text-[#4A90A4]/70 text-sm">{fase.desc}</p>
                      </div>
                    </div>

                    {/* Center circle */}
                    <div className="hidden md:flex md:w-2/12 justify-center relative z-10">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white/20"
                        style={{ background: `linear-gradient(135deg, ${fase.cor}, ${fase.cor}cc)` }}
                      >
                        {fase.icone}
                      </div>
                    </div>

                    {/* Empty space for alternating layout */}
                    <div className="hidden md:block md:w-5/12"></div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/50 text-sm mb-6">
              Um exercício por dia. 5 minutos. A voz é um músculo — treina-se.
            </p>
            <button
              onClick={handleComecar}
              className="px-8 py-4 text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #4A90A4, #2a6a7a)' }}
            >
              Começar o Programa Micro-Voz
            </button>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Como funciona
              </h2>
              <p className="text-[#4A90A4]/70">
                Três passos. Do silêncio à voz.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <ScrollReveal key={p.numero} variant="fadeUp">
                <div
                  className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#4A90A4]/20 hover:border-[#4A90A4]/40 transition-all duration-300"
                >
                  <span
                    className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                    style={{ fontFamily: 'var(--font-titulos)' }}
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
                    style={{ fontFamily: 'var(--font-titulos)' }}
                  >
                    {p.titulo}
                  </h3>
                  <p className="text-[#4A90A4]/70 text-sm">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTEMUNHOS (WHATSAPP) ===== */}
      <section id="resultados" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2a34)' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Vozes que voltaram a ser ouvidas
              </h2>
              <p className="text-[#4A90A4]/70">
                Histórias reais de quem recuperou a voz.
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
                    corTema="verde"
                  />
                  <span className="inline-block px-4 py-1.5 bg-[#4A90A4]/10 text-[#4A90A4] rounded-full text-sm font-semibold border border-[#4A90A4]/20">
                    {t.resultado}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COACH / CRIADORA ===== */}
      <section className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quem criou o ECOA
              </h2>
              <p className="text-white/80 mb-4">
                <strong className="text-[#4A90A4]">Vivianne Santos</strong> é terapeuta, coach de desenvolvimento pessoal
                e criadora do Sistema Sete Ecos — um caminho de transformação que integra corpo, emoção e espírito.
              </p>
              <p className="text-white/70 mb-4">
                O ECOA nasceu da observação de um padrão muito comum: pessoas que se calam para manter a paz,
                que engolem opiniões, que perderam a ligação com a própria voz. O silêncio protege, mas quando se
                torna hábito, aprisiona.
              </p>
              <p className="text-white/70 mb-6">
                "Criei o ECOA para que possas recuperar a tua voz — ao teu ritmo, sem pressão, com firmeza gentil.
                Um exercício de cada vez."
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <img
                  src="/logos/SETE_ECOS_LOGO.png"
                  alt="Sete Ecos"
                  className="w-10 h-10 opacity-70"
                />
                <span className="text-white/40 text-sm">Parte do Sistema Sete Ecos</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-[#4A90A4]/20 to-[#2a6a7a]/20 border border-[#4A90A4]/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📢</div>
                  <p className="text-white/70 text-sm italic">
                    "A tua voz merece ser ouvida. Mesmo quando treme."
                  </p>
                  <p className="text-[#4A90A4] text-sm mt-2">— Vivianne Santos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRECOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f28, #1a2a34)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Escolhe o teu plano
              </h2>
              <p className="text-[#4A90A4]/70">
                Preços simples. Sem compromisso. Cancela quando quiseres.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg ${
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
                  style={{ fontFamily: 'var(--font-titulos)' }}
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

                <ul className="space-y-2 mb-6 text-left px-2">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#4A90A4]">✓</span> Programa Micro-Voz completo
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#4A90A4]">✓</span> 100+ frases prontas
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#4A90A4]">✓</span> Cartas Não Enviadas
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#4A90A4]">✓</span> Coach Ecoa
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#4A90A4]">✓</span> Todas as ferramentas
                  </li>
                </ul>

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

          {/* Garantias */}
          <div className="bg-white/5 p-8 rounded-2xl border border-[#4A90A4]/20">
            <h3
              className="text-2xl font-bold text-white text-center mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Compromisso Ecoa
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icone: '✅', titulo: '7 Dias Garantia', desc: 'Se não gostares, reembolso total sem perguntas' },
                { icone: '🎯', titulo: 'Progressão Real', desc: 'Resultados visíveis desde a primeira semana' },
                { icone: '💬', titulo: 'Suporte Incluído', desc: 'Nunca estás sozinha nesta jornada' },
                { icone: '🚪', titulo: 'Cancela Quando Quiseres', desc: 'Sem multas, sem complicações, sem stress' }
              ].map((garantia) => (
                <div key={garantia.titulo} className="flex items-start gap-4">
                  <span className="text-2xl">{garantia.icone}</span>
                  <div>
                    <h4 className="font-bold text-[#4A90A4]">{garantia.titulo}</h4>
                    <p className="text-sm text-white/60">{garantia.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4" style={{ background: '#0f1f28' }}>
        <div className="max-w-3xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Perguntas Frequentes
            </h2>
            <p className="text-center text-[#4A90A4]/70 mb-10">Respondemos às dúvidas mais comuns</p>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#4A90A4]/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full p-5 flex justify-between items-center text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">{faq.pergunta}</span>
                  <span className="text-[#4A90A4] text-xl ml-4">
                    {faqAberta === i ? '−' : '+'}
                  </span>
                </button>
                {faqAberta === i && (
                  <div className="p-5 bg-white/5 border-t border-[#4A90A4]/20">
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
        style={{ background: 'linear-gradient(135deg, #1a2a34 0%, #4A90A4 100%)' }}
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
        className="py-12 px-4 border-t border-[#4A90A4]/20"
        style={{ background: '#0f1f28' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logos/ECOA_LOGO_V3.png" alt="ECOA" className="w-8 h-8" />
                <span
                  className="font-bold text-[#4A90A4]"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  ECOA
                </span>
              </div>
              <p className="text-white/50 text-sm">
                Voz &amp; Desbloqueio do Silêncio.<br />
                A tua voz merece ser ouvida.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#4A90A4] mb-3">Contacto</h3>
              <p className="text-white/50 text-sm flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +258 85 100 6473
              </p>
              <p className="text-white/50 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                feedback@seteecos.com
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#4A90A4] mb-3">Links</h3>
              <div className="flex flex-col gap-1">
                <a href="#precos" className="text-white/50 text-sm hover:text-white transition-colors">Preços</a>
                <Link to="/landing" className="text-white/50 text-sm hover:text-white transition-colors">
                  Sete Ecos
                </Link>
                <Link to="/lumina" className="text-white/50 text-sm hover:text-white transition-colors">
                  Lumina
                </Link>
                <a href="/termos.pdf" className="text-white/50 text-sm hover:text-white transition-colors">
                  Termos
                </a>
                <a href="/privacidade.pdf" className="text-white/50 text-sm hover:text-white transition-colors">
                  Privacidade
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <PartilharSocial
              compact
              url="https://app.seteecos.com/ecoa"
              titulo="ECOA - Voz & Desbloqueio do Silêncio"
              texto="Descobre o ECOA, um programa para recuperar a tua voz silenciada. Comunicação assertiva, expressão autêntica e firmeza gentil."
            />
          </div>

          <div className="border-t border-[#4A90A4]/10 pt-6 text-center text-white/30 text-sm">
            &copy; 2026 Sete Ecos &middot; Vivianne Santos &middot; Sistema de Transmutação
          </div>
        </div>
      </footer>

      {/* ===== WHATSAPP FLOAT ===== */}
      <a
        href="https://wa.me/258851006473"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}

export default LandingEcoa
