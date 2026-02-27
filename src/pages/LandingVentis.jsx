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
 * VENTIS - Landing Page
 * "Energia & Ritmo" - Chakra Anahata (Coração), Elemento: Ar
 * Módulo de gestão energética, ritmo sustentável e conexão com a natureza
 */

const LandingVentis = () => {
  const navigate = useNavigate()
  const { session, userRecord } = useAuth()
  const ventis = ECO_PLANS.ventis
  const planos = [ventis.monthly, ventis.semestral, ventis.annual]
  const [faqAberta, setFaqAberta] = useState(null)

  useEffect(() => {
    if (!session) return
    if (isCoach(session.user?.email)) {
      navigate('/ventis/dashboard', { replace: true })
      return
    }
    if (userRecord?.id) {
      checkEcoAccess('ventis', userRecord.id).then(access => {
        if (access.hasAccess) navigate('/ventis/dashboard', { replace: true })
      }).catch(() => {})
    }
  }, [session, userRecord, navigate])

  const features = [
    {
      icone: '⚡',
      titulo: 'Monitor de Energia',
      desc: 'Regista a tua energia 3 vezes ao dia. Descobre os teus picos e vales naturais.'
    },
    {
      icone: '🔄',
      titulo: 'Rotinas & Rituais',
      desc: 'Cria micro-rotinas que respeitam o teu ritmo. Sem rigidez, com consistência.'
    },
    {
      icone: '🍃',
      titulo: 'Pausas Conscientes',
      desc: 'Micro-pausas de 1 a 5 minutos para oxigenar o dia. Parar e avançar.'
    },
    {
      icone: '🧘',
      titulo: 'Movimento Flow',
      desc: 'Yoga suave, dança livre, caminhada consciente. Move-te ao teu ritmo, não ao do mundo.'
    },
    {
      icone: '🌿',
      titulo: 'Conexão Natureza',
      desc: 'Actividades para reconectar com o ar, a terra, o sol. A natureza é o ritmo original.'
    },
    {
      icone: '📊',
      titulo: 'Análise de Ritmo',
      desc: 'Insights semanais sobre a tua energia. Descobre padrões e optimiza o teu dia.'
    },
    {
      icone: '📈',
      titulo: 'Mapa Picos & Vales',
      desc: 'Visualiza quando tens mais e menos energia. Planeia o dia em harmonia com o corpo.'
    },
    {
      icone: '🛡️',
      titulo: 'Detector de Burnout',
      desc: 'Alertas quando a energia cai consistentemente. Prevenir é melhor que recuperar.'
    },
    {
      icone: '💬',
      titulo: 'Coach Ventis',
      desc: `Coach virtual ${g('gentil', 'gentil')} como uma brisa. Guia-te para encontrar o teu ritmo sustentável.`
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
      titulo: 'Encontra o ritmo sustentável',
      desc: `Não mais rápido. Não mais lento. O teu ritmo. Sustentável, natural, teu.`
    }
  ]

  const dorFrases = [
    `Acordas ${g('cansado', 'cansada')} e adormeces ${g('exausto', 'exausta')}`,
    'Não tens pausas — só urgências',
    'Sentes que vives em piloto automático sem energia',
    'Não tens energia para o que te dá prazer',
    `Vives à base de café e força de vontade`,
    'Os fins-de-semana não bastam para recuperar',
    'Sentes que o corpo já não aguenta o ritmo',
    `Dizes "estou bem" quando estás ${g('exausto', 'exausta')}`
  ]

  const burnoutNiveis = [
    {
      nivel: 'Verde',
      icone: '⚡',
      label: 'Energia OK',
      cor: '#22c55e',
      corBg: 'rgba(34, 197, 94, 0.15)',
      corBorda: 'rgba(34, 197, 94, 0.3)',
      desc: 'O teu ritmo está saudável. Continua a respeitar os teus ciclos.'
    },
    {
      nivel: 'Amarelo',
      icone: '⚠️',
      label: 'Atenção',
      cor: '#eab308',
      corBg: 'rgba(234, 179, 8, 0.15)',
      corBorda: 'rgba(234, 179, 8, 0.3)',
      desc: 'Sinais de desgaste. Hora de abrandar e implementar pausas.'
    },
    {
      nivel: 'Laranja',
      icone: '🔶',
      label: 'Alerta',
      cor: '#f97316',
      corBg: 'rgba(249, 115, 22, 0.15)',
      corBorda: 'rgba(249, 115, 22, 0.3)',
      desc: 'Burnout iminente. Pausas urgentes e reorganização do dia.'
    },
    {
      nivel: 'Vermelho',
      icone: '🔴',
      label: 'Perigo',
      cor: '#ef4444',
      corBg: 'rgba(239, 68, 68, 0.15)',
      corBorda: 'rgba(239, 68, 68, 0.3)',
      desc: 'Burnout activo. Plano de recuperação activado automaticamente.'
    }
  ]

  const testemunhos = [
    {
      contacto: 'CL',
      resultado: 'Produtividade dobrou',
      mensagens: [
        { texto: 'O Monitor de Energia mostrou-me que os meus picos são de manhã', hora: '08:32', tipo: 'recebida' },
        { texto: 'Reorganizei o meu dia todo. Rendo o dobro sem esforço extra.', hora: '08:33', tipo: 'recebida' }
      ]
    },
    {
      contacto: 'AR',
      resultado: 'Burnout prevenido',
      mensagens: [
        { texto: 'O Detector de Burnout avisou-me 2 semanas antes de eu quebrar', hora: '19:10', tipo: 'recebida' },
        { texto: 'Pela primeira vez, preveni em vez de remediar.', hora: '19:11', tipo: 'recebida' }
      ]
    },
    {
      contacto: 'PS',
      resultado: 'Mais energia sem café',
      mensagens: [
        { texto: 'Substitui 3 hábitos de café por pausas conscientes', hora: '17:05', tipo: 'recebida' },
        { texto: 'Mais energia às 17h do que tinha às 10h com café.', hora: '17:06', tipo: 'recebida' }
      ]
    }
  ]

  const faqs = [
    {
      pergunta: 'Isto substitui um médico?',
      resposta: `Não. O Ventis é um programa de auto-gestão energética e prevenção de burnout. Não substitui acompanhamento médico. Se tens sintomas persistentes de exaustão, consulta um profissional de saúde. O Ventis complementa — não substitui.`
    },
    {
      pergunta: 'E se eu não souber os meus picos de energia?',
      resposta: 'É exactamente para isso que o Monitor de Energia existe. Nos primeiros 7 dias, registas como te sentes 3 vezes ao dia. O sistema analisa os dados e mostra-te os teus padrões naturais. A maioria das pessoas descobre coisas surpreendentes na primeira semana.'
    },
    {
      pergunta: 'Quanto tempo preciso por dia?',
      resposta: '3 check-ins de energia = 30 segundos cada. Pausas conscientes = 5 minutos (quando quiseres). No total, menos de 10 minutos por dia para transformar completamente a tua relação com a energia.'
    },
    {
      pergunta: 'Posso experimentar antes de pagar?',
      resposta: 'Sim! 7 dias grátis com acesso completo. Sem compromisso, sem cartão. Se no fim dos 7 dias quiseres continuar, escolhes um plano. Se não, não pagas nada.'
    },
    {
      pergunta: 'E se eu estiver já em burnout?',
      resposta: `O Detector de Burnout cria um plano de recuperação personalizado quando detecta que estás em nível vermelho. Inclui pausas obrigatórias, redução gradual de carga, e exercícios de restauração energética. Não é tarde — o corpo sabe regenerar-se quando lhe dás espaço.`
    }
  ]

  const handleComecar = () => {
    navigate('/ventis/pagamento')
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>
      <SEOHead
        title="VENTIS - Energia & Ritmo | Sete Ecos"
        description="Gestão de energia sustentável, ritmo natural e prevenção de burnout. Monitor de energia, pausas conscientes e Detector de Burnout. Desde 499 MZN/mês."
        url="https://app.seteecos.com/ventis"
        image="https://app.seteecos.com/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "VENTIS - Energia & Ritmo",
          "description": "Programa de gestão energética com Monitor de Energia, Detector de Burnout, pausas conscientes e coaching personalizado.",
          "brand": { "@type": "Brand", "name": "Sete Ecos" },
          "offers": [
            { "@type": "Offer", "name": "Mensal", "price": "499", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Semestral", "price": "2395", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Anual", "price": "4190", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" }
          ]
        }}
      />

      {/* ===== NAVEGAÇÃO FIXA ===== */}
      <nav className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-xl z-50" style={{ background: 'rgba(15, 31, 24, 0.9)', borderBottom: '1px solid rgba(93, 155, 132, 0.3)' }}>
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/VENTIS_LOGO_V3.png" alt="Ventis" className="w-12 h-12" />
          <span className="text-2xl font-bold text-[#5D9B84]" style={{ fontFamily: 'var(--font-titulos)' }}>
            VENTIS
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#features" className="text-white/60 hover:text-[#5D9B84] transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="text-white/60 hover:text-[#5D9B84] transition-colors">Como Funciona</a>
          <a href="#resultados" className="text-white/60 hover:text-[#5D9B84] transition-colors">Resultados</a>
          <a href="#precos" className="text-white/60 hover:text-[#5D9B84] transition-colors">Preços</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/ventis/login"
            className="px-5 py-2 text-[#5D9B84] font-semibold text-sm hover:text-[#7BA38E] transition-colors"
          >
            Entrar
          </Link>
          <button
            onClick={handleComecar}
            className="px-6 py-2 text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all shadow-md"
            style={{ background: 'linear-gradient(135deg, #5D9B84, #3a6b5a)' }}
          >
            Encontrar o meu Ritmo
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2e24 0%, #2a4a3a 40%, #5D9B84 100%)' }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#5D9B84]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#1a2e24]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center pt-20">
          <p className="text-[#5D9B84]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Anahata &middot; Coração &middot; Elemento: Ar
          </p>

          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, #5D9B84 0%, transparent 70%)', transform: 'scale(1.5)' }} />
            <div className="relative w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <img src="/logos/VENTIS_LOGO_V3.png" alt="Ventis" className="w-16 h-16" />
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            VENTIS
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}
          >
            Energia &amp; Ritmo
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Encontra o teu ritmo. Respira no teu tempo. Sustenta a tua energia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleComecar}
              className="animate-pulse-glow px-10 py-4 bg-white text-[#1a2e24] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Encontrar o Meu Ritmo
            </button>
            <a
              href="#como-funciona"
              className="px-10 py-4 bg-white/15 text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all border border-white/20"
            >
              Como funciona
            </a>
          </div>

          {/* Hero social proof stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-[#5D9B84]" style={{ fontFamily: 'var(--font-titulos)' }}>85%</div>
              <div className="text-white/50 text-sm">melhoria de energia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#5D9B84]" style={{ fontFamily: 'var(--font-titulos)' }}>3x</div>
              <div className="text-white/50 text-sm">check-ins diários</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#5D9B84]" style={{ fontFamily: 'var(--font-titulos)' }}>40%</div>
              <div className="text-white/50 text-sm">redução de burnout</div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2e24, #0f1f18)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Quantas vezes sentiste que a energia acabou antes do dia?
            </h2>

            <p className="text-[#5D9B84]/80 mb-10 text-lg">
              Correr sem parar não é viver. O Ventis devolve-te o ritmo.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            {dorFrases.map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-[#5D9B84]/20 hover:bg-white/10 transition-all"
                >
                  <span className="text-[#5D9B84] text-xl mt-0.5">&#10003;</span>
                  <span className="text-white/80 text-lg">{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-[#5D9B84]/60 mt-8 text-sm">
            Se te reconheceste em pelo menos uma, o Ventis foi {g('criado', 'criada')} para ti.
          </p>
        </div>
      </section>

      {/* ===== SOLUÇÃO / FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#0f1f18' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Ventis é o espaço onde encontras o teu ritmo natural
              </h2>
              <p className="text-[#5D9B84]/70 max-w-2xl mx-auto">
                Ferramentas para monitorizar, sustentar e harmonizar a tua energia — ao teu ritmo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.05}>
                <div
                  className="p-6 bg-white/5 rounded-2xl border border-[#5D9B84]/20 hover:bg-white/10 hover:border-[#5D9B84]/40 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icone}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                    {f.titulo}
                  </h3>
                  <p className="text-[#5D9B84]/70 text-sm">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-white text-[#1a2e24] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar Agora
            </button>
          </div>
        </div>
      </section>

      {/* ===== DETECTOR DE BURNOUT ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f18, #1a2e24)' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-[#5D9B84]/20 rounded-full mb-4">
                <span className="text-[#5D9B84] text-sm font-medium">🛡️ Exclusivo Ventis</span>
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Detector de Burnout — Previne antes de quebrar
              </h2>
              <p className="text-[#5D9B84]/70 max-w-2xl mx-auto text-lg">
                O teu corpo avisa antes de ceder. Aprende a ouvir.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {burnoutNiveis.map((item, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                <div
                  className="p-6 bg-white/5 rounded-2xl border text-center hover:translate-y-[-3px] transition-all duration-300"
                  style={{ borderColor: item.corBorda, background: item.corBg }}
                >
                  <div className="text-4xl mb-3">{item.icone}</div>
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ fontFamily: 'var(--font-titulos)', color: item.cor }}
                  >
                    {item.nivel}
                  </h3>
                  <p className="text-white/60 text-sm font-semibold mb-3">{item.label}</p>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#5D9B84]/60 text-sm max-w-xl mx-auto">
              O Detector analisa os teus check-ins diários e alerta-te antes do burnout chegar.
              Quanto mais cedo agires, mais rápido recuperas.
            </p>
          </div>
        </div>
      </section>

      {/* ===== VÊ A PLATAFORMA ===== */}
      <section className="py-20 px-4" style={{ background: '#0f1f18' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-[#5D9B84]/20 text-[#5D9B84] rounded-full text-sm font-semibold mb-4">
                VÊ POR DENTRO
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O Ventis na palma da tua mão
              </h2>
              <p className="text-[#5D9B84]/70 max-w-xl mx-auto">
                Energia, ritmo e equilíbrio — tudo num só lugar.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <ScrollReveal variant="fadeLeft">
              <div className="relative mx-auto max-w-[280px]">
                <div className="absolute -inset-4 bg-[#5D9B84]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Ventis-dash-portrait.png"
                  alt="Ventis Dashboard — energia, rotinas e pausas conscientes"
                  className="relative rounded-[2rem] shadow-2xl border border-[#5D9B84]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#5D9B84]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Dashboard principal
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeRight">
              <div className="relative mx-auto max-w-[280px]">
                <div className="absolute -inset-4 bg-[#5D9B84]/10 rounded-[2.5rem] blur-xl" />
                <img
                  src="/mockups/Ventis-praticas-portrait.png"
                  alt="Movimento & Flow — yoga, tai chi, dança"
                  className="relative rounded-[2rem] shadow-2xl border border-[#5D9B84]/20 w-full"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/70 via-black/40 to-transparent rounded-t-[2rem] z-10 pointer-events-none" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#5D9B84]/90 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Movimento & Flow
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-[#5D9B84] text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #1a2e24, #0f1f18)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Como funciona
            </h2>
            <p className="text-[#5D9B84]/70">
              Três passos. Sem complicações.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <ScrollReveal key={p.numero} variant="fadeUp">
                <div
                  className="relative text-center p-8 bg-white/5 rounded-2xl border border-[#5D9B84]/20 hover:bg-white/10 transition-all"
                >
                  <span
                    className="absolute top-3 right-4 text-5xl font-bold text-white/5"
                    style={{ fontFamily: 'var(--font-titulos)' }}
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
                    style={{ fontFamily: 'var(--font-titulos)' }}
                  >
                    {p.titulo}
                  </h3>
                  <p className="text-[#5D9B84]/70 text-sm">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTEMUNHOS ===== */}
      <section id="resultados" className="py-20 px-4" style={{ background: '#0f1f18' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                O que dizem {g('os utilizadores', 'as utilizadoras')}
              </h2>
              <p className="text-[#5D9B84]/70">
                Histórias reais de quem encontrou o seu ritmo
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <WhatsAppMockup
                  mensagens={t.mensagens}
                  contacto={t.contacto}
                  corTema="verde"
                />
                <span className="inline-block px-4 py-1.5 bg-[#5D9B84]/10 text-[#5D9B84] rounded-full text-sm font-semibold border border-[#5D9B84]/20">
                  {t.resultado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COACH / CRIADORA ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f18, #1a2e24)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Quem criou o Ventis
              </h2>
              <p className="text-white/80 mb-4">
                <strong className="text-[#5D9B84]">Vivianne Santos</strong> é terapeuta, coach de desenvolvimento pessoal
                e criadora do Sistema Sete Ecos — um caminho de transformação que integra corpo, emoção e espírito.
              </p>
              <p className="text-white/70 mb-4">
                O Ventis nasceu da observação de um padrão moderno: corpos esgotados, mentes aceleradas, ritmos artificiais.
                A energia não se gasta — distribui-se. E isso pode ser aprendido.
              </p>
              <p className="text-white/70 mb-6">
                "O corpo tem um ritmo próprio. Quando o respeitas, tudo flui — o trabalho, o descanso, o prazer.
                O Ventis ensina-te a ouvir esse ritmo."
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
            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-[#5D9B84]/20 to-[#3a6b5a]/20 border border-[#5D9B84]/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🍃</div>
                  <p className="text-white/70 text-sm italic">"O corpo tem um ritmo. Quando o respeitas, tudo flui."</p>
                  <p className="text-[#5D9B84] text-sm mt-2">— Vivianne Santos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREÇOS ===== */}
      <section id="precos" className="py-20 px-4" style={{ background: '#0f1f18' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Escolhe o teu plano
            </h2>
            <p className="text-[#5D9B84]/70">
              Preços simples. Sem compromisso. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {planos.map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border text-center transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg ${
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
                  style={{ fontFamily: 'var(--font-titulos)' }}
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
                    {Math.round(plano.price_mzn / plano.duration).toLocaleString('pt-MZ')} MZN/mês
                  </p>
                )}

                <ul className="space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#5D9B84]">&#10003;</span> Monitor de Energia
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#5D9B84]">&#10003;</span> Detector de Burnout
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#5D9B84]">&#10003;</span> Pausas Conscientes
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#5D9B84]">&#10003;</span> Coach Ventis
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-[#5D9B84]">&#10003;</span> Todas as ferramentas
                  </li>
                </ul>

                <button
                  onClick={handleComecar}
                  className="mt-4 block w-full py-3 text-white rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #5D9B84, #3a6b5a)' }}
                >
                  Escolher
                </button>
              </div>
            ))}
          </div>

          {/* Garantias */}
          <div className="bg-white/5 p-8 rounded-2xl border border-[#5D9B84]/20">
            <h3 className="text-2xl font-bold text-white text-center mb-6" style={{ fontFamily: 'var(--font-titulos)' }}>
              🛡️ Compromisso Ventis
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icone: '✅', titulo: '7 Dias Grátis', desc: 'Experimenta tudo sem compromisso nem cartão' },
                { icone: '🎯', titulo: 'Resultados em 14 Dias', desc: 'Descobre os teus padrões de energia na primeira quinzena' },
                { icone: '💬', titulo: 'Suporte Incluído', desc: `Nunca estás ${g('sozinho', 'sozinha')} — apoio disponível sempre` },
                { icone: '🚪', titulo: 'Cancela Quando Quiseres', desc: 'Sem multas, sem complicações, sem stress' }
              ].map((garantia) => (
                <div key={garantia.titulo} className="flex items-start gap-4">
                  <span className="text-2xl">{garantia.icone}</span>
                  <div>
                    <h4 className="font-bold text-[#5D9B84]">{garantia.titulo}</h4>
                    <p className="text-sm text-white/60">{garantia.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0f1f18, #1a2e24)' }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Perguntas Frequentes
          </h2>
          <p className="text-center text-[#5D9B84]/70 mb-10">
            Respondemos às dúvidas mais comuns
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#5D9B84]/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full p-5 flex justify-between items-center text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">{faq.pergunta}</span>
                  <span className="text-[#5D9B84] text-xl ml-4">
                    {faqAberta === i ? '−' : '+'}
                  </span>
                </button>
                {faqAberta === i && (
                  <div className="p-5 bg-white/5 border-t border-[#5D9B84]/20">
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
        style={{ background: 'linear-gradient(135deg, #1a2e24 0%, #5D9B84 100%)' }}
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
            Descobre como é viver ao teu ritmo, com energia sustentável e pausas que renovam.
          </p>
          <button
            onClick={handleComecar}
            className="inline-block px-10 py-5 bg-white text-[#1a2e24] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
          >
            Quero começar HOJE
          </button>
          <p className="text-white/40 text-sm mt-6">
            7 dias grátis &middot; Acesso completo &middot; Cancela quando quiseres
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-12 px-4 border-t border-[#5D9B84]/20"
        style={{ background: '#0f1f0a' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logos/VENTIS_LOGO_V3.png" alt="Ventis" className="w-8 h-8" />
                <span
                  className="text-xl font-bold text-[#5D9B84]"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  VENTIS
                </span>
              </div>
              <p className="text-white/50 text-sm">
                Energia &amp; Ritmo.<br />
                Encontra o teu ritmo. Sustenta a tua energia.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#5D9B84] mb-3">Contacto</h3>
              <p className="text-white/50 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +258 85 100 6473
              </p>
              <p className="text-white/50 text-sm flex items-center gap-2 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                feedback@seteecos.com
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#5D9B84] mb-3">Links</h3>
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
              url="https://app.seteecos.com/ventis"
              titulo="VENTIS - Energia & Ritmo"
              texto="Descobre o VENTIS, um programa de gestão energética com Monitor de Energia, Detector de Burnout e coaching personalizado."
            />
          </div>
          <div className="border-t border-[#5D9B84]/10 pt-6 text-center text-white/30 text-sm">
            &copy; 2026 Ventis &middot; Vivianne Santos &middot; Sete Ecos
          </div>
        </div>
      </footer>

      {/* ===== WHATSAPP FLOAT ===== */}
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

export default LandingVentis
