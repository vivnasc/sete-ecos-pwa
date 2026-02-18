import React from 'react'
import { Link } from 'react-router-dom'
import { g } from '../utils/genero'
import ScrollReveal from '../components/ScrollReveal'

/**
 * AURORA - Landing Page
 * "Integração Final" - Elemento: Luz
 * Módulo final de celebração, manutenção e renovação
 * GRATUITA — desbloqueia ao completar todos os 7 ecos
 * Tema: rosa (#D4A5A5), Playfair Display
 */

const LandingAurora = () => {
  const features = [
    {
      icone: '🌅',
      titulo: 'Cerimónia de Graduação',
      desc: 'Celebra a tua jornada completa. Um ritual de reconhecimento por tudo o que conquistaste.'
    },
    {
      icone: '📖',
      titulo: 'Antes & Depois',
      desc: 'A tua história contada por ti. Quem eras, o que soltaste, quem te tornaste.'
    },
    {
      icone: '📊',
      titulo: 'Resumo da Jornada',
      desc: 'Relatório completo de toda a tua evolução. Dados, insights e marcos de cada eco.'
    },
    {
      icone: '\u{1F6E1}\uFE0F',
      titulo: 'Modo Manutenção',
      desc: 'Check-ins mensais para manter as mudanças. Alertas de regressão de padrões.'
    },
    {
      icone: '🌟',
      titulo: 'Mentoria',
      desc: 'Partilha a tua sabedoria com quem está a começar. A tua experiência inspira.'
    },
    {
      icone: '☀️',
      titulo: 'Ritual Aurora',
      desc: 'Ritual matinal que integra elementos de cada eco. Começa o dia com consciência.'
    },
    {
      icone: '🔄',
      titulo: 'Renovação Anual',
      desc: 'Renova as tuas intenções a cada ano. A jornada nunca termina — transforma-se.'
    }
  ]

  const passos = [
    {
      numero: '01',
      titulo: 'Completa',
      desc: 'Percorre os 7 ecos: Vitalis, Áurea, Serena, Ignis, Ventis, Ecoa e Imago.'
    },
    {
      numero: '02',
      titulo: 'Desbloqueia',
      desc: 'Ao completar todos os ecos, a Aurora abre-se automaticamente. É a tua recompensa.'
    },
    {
      numero: '03',
      titulo: 'Celebra & Renova',
      desc: 'Cerimónia de graduação, história Antes & Depois, mentoria e renovação anual.'
    }
  ]

  const ecos = [
    { name: 'Vitalis', icon: '🌿', color: '#7C8B6F', desc: 'Corpo & Nutrição' },
    { name: 'Áurea', icon: '✨', color: '#C4A265', desc: 'Valor & Presença' },
    { name: 'Serena', icon: '🌊', color: '#6B8E9B', desc: 'Emoção & Fluidez' },
    { name: 'Ignis', icon: '🔥', color: '#C1634A', desc: 'Vontade & Foco' },
    { name: 'Ventis', icon: '🍃', color: '#5D9B84', desc: 'Energia & Ritmo' },
    { name: 'Ecoa', icon: '🗣️', color: '#4A90A4', desc: 'Expressão & Voz' },
    { name: 'Imago', icon: '🔮', color: '#8B7BA5', desc: 'Identidade & Visão' }
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-corpo)' }}>

      {/* ===== HERO ===== */}
      <header
        className="hero-gradient-animated relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2e1a1a 0%, #3e2a2a 40%, #D4A5A5 100%)' }}
      >
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4A5A5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#2e1a1a]/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#D4A5A5]/80 text-sm tracking-[0.3em] uppercase mb-4">
            Integração Final &middot; Elemento: Luz
          </p>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            AURORA
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 mb-2"
            style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}
          >
            Integração Final
          </p>

          <p className="text-white/60 max-w-xl mx-auto mb-4">
            Celebra a tua jornada completa.
            Tu já sabes quem és. Agora vive isso.
          </p>

          <div className="inline-block px-6 py-2 bg-white/10 rounded-full border border-[#D4A5A5]/40 mb-10">
            <span className="text-[#D4A5A5] font-semibold">
              100% Gratuita — Desbloqueia ao completar os 7 ecos
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#como-funciona"
              className="animate-pulse-glow px-10 py-4 bg-white text-[#2e1a1a] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Como desbloquear
            </a>
            <Link
              to="/landing"
              className="px-10 py-4 bg-white/15 text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all border border-white/20"
            >
              Ver os 7 ecos
            </Link>
          </div>
        </div>
      </header>

      {/* ===== MENSAGEM ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, #2e1a1a, #1e1212)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Percorreste um caminho extraordinário. E agora?
            </h2>

            <p className="text-[#D4A5A5]/80 mb-10 text-lg">
              A Aurora é a tua recompensa por completar toda a jornada.
              Não se compra — conquista-se.
            </p>
          </ScrollReveal>

          <div className="grid gap-4 max-w-lg mx-auto text-left">
            {[
              'Celebra tudo o que conquistaste com uma cerimónia de graduação',
              'Mantém as mudanças com check-ins mensais e rituais matinais',
              `Partilha a tua sabedoria como mentora e inspira ${g('outros', 'outras')}`
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

          <div className="mt-10 p-6 bg-[#D4A5A5]/10 rounded-2xl border border-[#D4A5A5]/30">
            <p className="text-[#D4A5A5] font-semibold text-lg mb-1">
              Aurora é 100% gratuita
            </p>
            <p className="text-white/60 text-sm">
              Completa todos os 7 ecos e a Aurora desbloqueia automaticamente. Sem custos adicionais.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 px-4" style={{ background: '#1e1212' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                A Aurora é onde a tua jornada se torna eterna
              </h2>
              <p className="text-[#D4A5A5]/70 max-w-2xl mx-auto">
                Ferramentas para celebrar, manter e renovar tudo o que conquistaste.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-[#D4A5A5]/20 hover:bg-white/10 hover:border-[#D4A5A5]/40 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icone}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
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
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Como desbloquear a Aurora
            </h2>
            <p className="text-[#D4A5A5]/70">
              Três passos. Completa, desbloqueia, celebra.
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
                  style={{ fontFamily: 'var(--font-titulos)' }}
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
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {p.titulo}
                </h3>
                <p className="text-[#D4A5A5]/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OS 7 ECOS ===== */}
      <section className="py-20 px-4" style={{ background: '#1e1212' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Os 7 ecos que desbloqueiam a Aurora
            </h2>
            <p className="text-[#D4A5A5]/70">
              Cada eco é uma dimensão da tua transformação.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ecos.map((eco) => (
              <Link
                key={eco.name}
                to={`/${eco.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {eco.icon}
                </div>
                <h3 className="text-white font-bold mb-1" style={{ color: eco.color }}>
                  {eco.name}
                </h3>
                <p className="text-white/50 text-xs">{eco.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #2e1a1a 0%, #D4A5A5 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            A Aurora espera por ti
          </h2>
          <p className="text-white/70 mb-4 text-lg">
            Completa os 7 ecos e desbloqueia a tua recompensa final.
          </p>
          <p className="text-white/50 mb-8">
            Sem custos. Sem compromisso. Apenas a tua dedicação.
          </p>
          <Link
            to="/landing"
            className="inline-block px-10 py-5 bg-white text-[#2e1a1a] rounded-full font-bold text-xl hover:translate-y-[-3px] hover:shadow-xl transition-all"
          >
            Começar a jornada
          </Link>
          <p className="text-white/40 text-sm mt-6">
            Gratuita &middot; Desbloqueia ao completar todos os ecos
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
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              AURORA
            </span>
            <span className="text-white/40 text-sm">Integração Final</span>
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
