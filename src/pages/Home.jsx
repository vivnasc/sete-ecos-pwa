import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * HOME PRINCIPAL - app.seteecos.com
 * Sistema de Transmutação Feminina
 */

export default function Home() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  // 7 Ecos na ordem correcta (Aurea é o 2º)
  const ecos = [
    {
      nome: 'VITALIS',
      slogan: 'A raiz da transformação',
      descricao: 'Corpo & Nutrição',
      logo: '/logos/VITALIS_LOGO_V3.png',
      cor: '#7C8B6F',
      disponivel: true,
      rota: '/vitalis'
    },
    {
      nome: 'AUREA',
      slogan: 'A luz interior',
      descricao: 'Clareza & Visão',
      logo: '/logos/AUREA_LOGO_V3.png',
      cor: '#C9A227',
      disponivel: false,
      rota: '/aurea'
    },
    {
      nome: 'SERENA',
      slogan: 'Regular para fluir',
      descricao: 'Emoção & Equilíbrio',
      logo: '/logos/SERENA_LOGO_V3.png',
      cor: '#6B8E9B',
      disponivel: false,
      rota: '/serena'
    },
    {
      nome: 'IGNIS',
      slogan: 'Agir com direcção',
      descricao: 'Vontade & Foco',
      logo: '/logos/IGNIS-LOGO-V3.png',
      cor: '#C1634A',
      disponivel: false,
      rota: '/ignis'
    },
    {
      nome: 'VENTIS',
      slogan: 'Ritmo sustentável',
      descricao: 'Energia & Movimento',
      logo: '/logos/VENTIS_LOGO_V3.png',
      cor: '#5D9B84',
      disponivel: false,
      rota: '/ventis'
    },
    {
      nome: 'ECOA',
      slogan: 'A expressão que ressoa',
      descricao: 'Voz & Comunicação',
      logo: '/logos/ECOA_LOGO_V3.png',
      cor: '#4A90A4',
      disponivel: false,
      rota: '/ecoa'
    },
    {
      nome: 'IMAGO',
      slogan: 'O reflexo da essência',
      descricao: 'Identidade & Propósito',
      logo: '/logos/IMAGO_LOGO_V3.png',
      cor: '#8B7BA5',
      disponivel: false,
      rota: '/imago'
    }
  ]

  const handleEcoClick = (eco) => {
    if (eco.disponivel) {
      navigate(eco.rota)
    }
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to bottom, #FAF6F0, #F5EEE3)' }}>

      {/* Navegação */}
      <nav className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center bg-[#FAF6F0]/95 backdrop-blur-sm z-50 border-b border-[#E8D5A3]/30">
        <div className="flex items-center gap-3">
          <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-10 h-10" />
          <span className="text-xl font-bold text-[#4A3728]" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.15em' }}>
            SETE ECOS
          </span>
        </div>
        <div className="hidden md:flex gap-6">
          <a href="#lumina" className="text-[#4A3728] hover:text-[#C9A227] transition-colors">Lumina</a>
          <a href="#ecos" className="text-[#4A3728] hover:text-[#C9A227] transition-colors">Os 7 Ecos</a>
          <a href="#aurora" className="text-[#4A3728] hover:text-[#C9A227] transition-colors">Aurora</a>
          <a href="#vivianne" className="text-[#4A3728] hover:text-[#C9A227] transition-colors">Sobre</a>
        </div>
        {session ? (
          <Link
            to="/lumina"
            className="px-5 py-2 bg-[#6B4C8A] text-white rounded-full font-semibold text-sm hover:bg-[#5A3D7A] transition-all shadow-md"
          >
            Meu Espaço
          </Link>
        ) : (
          <Link
            to="/lumina"
            className="px-5 py-2 bg-[#C9A227] text-white rounded-full font-semibold text-sm hover:bg-[#B8911E] transition-all shadow-md"
          >
            Começar
          </Link>
        )}
      </nav>

      {/* Hero */}
      <header className="pt-24 pb-12 px-4 text-center relative overflow-hidden min-h-[70vh] flex flex-col justify-center"
        style={{
          background: 'linear-gradient(180deg, #FAF6F0 0%, #F5EEE3 50%, rgba(232, 213, 163, 0.3) 100%)'
        }}>
        <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-[#C9A227]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-[#6B4C8A]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-28 h-28 mx-auto mb-6">
            <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-full h-full object-contain drop-shadow-lg" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-[#4A3728] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.2em' }}>
            SETE ECOS
          </h1>
          <p className="text-xl md:text-2xl text-[#6B5344] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
            Sistema de Transmutação Feminina
          </p>
          <p className="text-[#6B5344] mb-8 max-w-xl mx-auto">
            Sete caminhos. Uma transformação completa.
            Desperta cada eco da tua essência feminina.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/lumina')}
              className="px-8 py-4 bg-gradient-to-r from-[#6B4C8A] to-[#4B0082] text-white rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              ✨ Começa com Lumina — Gratuito
            </button>
          </div>
        </div>
      </header>

      {/* Lumina - Porta de Entrada */}
      <section id="lumina" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-gradient-to-br from-[#6B4C8A] via-[#4B0082] to-[#2A1B5E] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden cursor-pointer hover:translate-y-[-4px] hover:shadow-2xl transition-all"
            onClick={() => navigate('/lumina')}
          >
            <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl"></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-32 h-32 flex-shrink-0">
                <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-full h-full object-contain drop-shadow-lg" />
              </div>

              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.15em' }}>
                  LUMINA
                </h2>
                <p className="text-xl text-white/90 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  O Espelho Interior
                </p>
                <p className="text-white/80 mb-4">
                  Ferramenta gratuita de diagnóstico. Descobre onde estás e qual Eco precisa da tua atenção.
                  Em apenas 2 minutos, recebe uma leitura personalizada.
                </p>
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD700]/20 text-[#FFD700] rounded-full font-semibold border border-[#FFD700]/30">
                  Começa Aqui — É Gratuito →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Os 7 Ecos */}
      <section id="ecos" className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A3728] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Os Sete Caminhos
            </h2>
            <p className="text-[#6B5344] max-w-xl mx-auto">
              Cada Eco trabalha uma dimensão da tua essência. Juntos, formam um sistema completo de transformação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ecos.map((eco, index) => (
              <div
                key={eco.nome}
                onClick={() => handleEcoClick(eco)}
                className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                  eco.disponivel
                    ? 'border-[#E8D5A3] hover:border-[#C9A227] cursor-pointer hover:translate-y-[-4px] hover:shadow-lg'
                    : 'border-[#E8E2D9] opacity-75 cursor-default'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex-shrink-0 relative">
                    <img src={eco.logo} alt={eco.nome} className="w-full h-full object-contain" />
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-[#FAF6F0] border-2 border-[#E8D5A3] rounded-full flex items-center justify-center text-xs font-bold text-[#C9A227]">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: eco.cor }}>
                      {eco.nome}
                    </h3>
                    <p className="text-xs text-[#6B5344] mb-1">{eco.descricao}</p>
                    <p className="text-sm text-[#6B5344] italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      "{eco.slogan}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
                  {eco.disponivel ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: eco.cor }}>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Disponível — Explorar →
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-[#C9A227]">
                      <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                      Em breve
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aurora - A Coroação */}
      <section id="aurora" className="py-16 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(232, 213, 163, 0.2) 0%, rgba(212, 165, 165, 0.15) 50%, #FAF6F0 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#C9A227] to-transparent"></div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <img src="/logos/AURORA_LOGO_V3.png" alt="Aurora" className="w-full h-full object-contain drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 20px rgba(201, 162, 39, 0.4))' }} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#C9A227] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.2em' }}>
            AURŌRA
          </h2>
          <p className="text-xl text-[#6B5344] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
            A Coroação — Presença Plena
          </p>
          <p className="text-[#6B5344] mb-6">
            O destino de quem percorre todos os caminhos. Quando os 7 Ecos se unem, nasce uma nova mulher.
          </p>

          <div className="bg-white/80 rounded-2xl p-6 border border-[#E8D5A3]">
            <div className="flex justify-between text-sm text-[#6B5344] mb-3">
              <span>A tua jornada</span>
              <span className="font-semibold">1 de 7 Ecos</span>
            </div>
            <div className="h-3 bg-[#E8E2D9] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#D4A5A5] to-[#C9A227]" style={{ width: '14%' }}></div>
            </div>
            <p className="text-xs text-[#C9A227] mt-3">
              ✨ Desbloqueia ao completar os 7 caminhos
            </p>
          </div>
        </div>
      </section>

      {/* Vivianne */}
      <section id="vivianne" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <div className="relative inline-block">
                <img
                  src="/vivianne-foto.jpeg"
                  alt="Vivianne Saraiva"
                  className="w-48 h-48 object-cover rounded-2xl shadow-lg mx-auto md:mx-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-48 h-48 bg-gradient-to-br from-[#C9A227] to-[#6B4C8A] rounded-2xl items-center justify-center text-white text-5xl mx-auto md:mx-0">
                  VS
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#4A3728] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Vivianne Saraiva
              </h3>
              <p className="text-[#C9A227] text-sm font-semibold mb-4">Criadora do Sistema Sete Ecos</p>

              <p className="text-[#6B5344] mb-4">
                Autora de <em>Os 7 Véus</em>, onde exploro os véus que nos separam de nós mesmas.
                O Sistema Sete Ecos nasce dessa mesma sabedoria: cada eco é um véu a ser transcendido.
              </p>

              <p className="text-[#6B5344] mb-4">
                Certificada em Precision Nutrition e ISSA, combino ciência, espiritualidade e tecnologia
                para criar ferramentas de transformação únicas em Moçambique.
              </p>

              <a
                href="https://wa.me/258845243875?text=Olá%20Vivianne%2C%20vim%20do%20Sete%20Ecos%20e%20gostaria%20de%20saber%20mais."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#20BD5A] transition-all"
              >
                💬 Falar com Vivianne
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 text-center" style={{ background: 'linear-gradient(135deg, #6B4C8A 0%, #4B0082 100%)' }}>
        <div className="max-w-2xl mx-auto text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Pronta para despertar os teus Ecos?
          </h2>
          <p className="text-white/80 mb-8">
            Começa com Lumina — é gratuito e leva apenas 2 minutos.
            Descobre qual Eco precisa da tua atenção agora.
          </p>
          <button
            onClick={() => navigate('/lumina')}
            className="px-10 py-4 bg-white text-[#6B4C8A] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
          >
            Começar com Lumina →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#4A3728] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-8 h-8" />
                <h3 className="font-bold text-[#E8D5A3]">Sete Ecos</h3>
              </div>
              <p className="text-white/70 text-sm">
                Sistema de Transmutação Feminina.<br />
                Sete caminhos. Uma transformação completa.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#E8D5A3] mb-3">Contacto</h3>
              <p className="text-white/70 text-sm">📱 +258 84 524 3875</p>
              <p className="text-white/70 text-sm">📧 feedback@seteecos.com</p>
              <p className="text-white/70 text-sm">📍 Maputo, Moçambique</p>
            </div>
            <div>
              <h3 className="font-bold text-[#E8D5A3] mb-3">Ecos Disponíveis</h3>
              <div className="flex flex-col gap-1">
                <Link to="/lumina" className="text-white/70 text-sm hover:text-white">Lumina (Gratuito)</Link>
                <Link to="/vitalis" className="text-white/70 text-sm hover:text-white">Vitalis</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/50 text-sm">
            © 2026 Sete Ecos · Vivianne Saraiva · Todos os direitos reservados
          </div>
        </div>
      </footer>

      {/* WhatsApp Flutuante */}
      <a
        href="https://wa.me/258845243875?text=Olá%20Vivianne%2C%20vim%20do%20Sete%20Ecos%20e%20gostaria%20de%20saber%20mais."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform z-50"
        title="Falar no WhatsApp"
      >
        💬
      </a>

      {/* Spacer for mobile nav */}
      <div className="h-20 md:h-0"></div>
    </div>
  )
}
