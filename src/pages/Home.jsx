import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { g } from '../utils/genero'
import { isRamadan, observaRamadao } from '../utils/ramadao'
import LandingGeral from './LandingGeral'

/**
 * HOME PRINCIPAL - app.seteecos.com
 * Sistema de Transmutacao Integral
 */

export default function Home() {
  const navigate = useNavigate()
  const { session, loading, userRecord, vitalisAccess, aureaAccess } = useAuth()

  const userName = userRecord?.nome || session?.user?.email?.split('@')[0] || ''

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (isRamadan() && observaRamadao()) return 'Ramadan Mubarak'
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 50%, #E8D5A3 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#C9A227]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-[#C9A227] rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-[#6B5344] text-sm animate-pulse" style={{ fontFamily: "'Cormorant Garamond', serif" }}>A preparar o teu espaço...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen pb-24" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Decorative background */}
        <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 50%, #E8D5A3 100%)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-40 left-0 w-60 h-60 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>

       <div className="max-w-lg mx-auto">
        {/* Header hero area */}
        <header className="relative px-5 pt-8 pb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[#C9A227] text-xs font-semibold tracking-widest uppercase mb-1">{getGreeting()}</p>
              <h1 className="text-3xl font-bold text-[#4A3728]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {userName || g('Guerreiro', 'Guerreira')}
              </h1>
            </div>
            <Link
              to="/conta"
              className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/50 hover:scale-105 transition-transform"
            >
              <svg className="w-5 h-5 text-[#4A3728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>

          {/* Central logo with glow */}
          <div className="text-center mb-2">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'scale(1.5)' }} />
              <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-20 h-20 mx-auto relative" />
            </div>
            <p className="text-[#6B5344]/70 text-sm mt-3 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              O teu espaço de transformação
            </p>
          </div>
        </header>

        {/* Eco Cards */}
        <section className="px-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-[#C9A227] to-[#C9A227]/30 rounded-full" />
            <h2 className="text-sm font-semibold text-[#4A3728] tracking-widest uppercase">Os teus Ecos</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Lumina */}
            <button
              onClick={() => navigate('/lumina')}
              className="group relative overflow-hidden rounded-3xl text-left shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#4B0082]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
              <div className="relative p-4 flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">LUMINA</h3>
                  <p className="text-white/60 text-xs mt-0.5">Diagnostico diario</p>
                  <span className="inline-block mt-2 text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">Gratuito</span>
                </div>
              </div>
            </button>

            {/* Vitalis */}
            <button
              onClick={() => navigate(vitalisAccess ? '/vitalis/dashboard' : '/vitalis')}
              className="group relative overflow-hidden rounded-3xl text-left shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C8B6F] to-[#3D4D35]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
              <div className="relative p-4 flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">VITALIS</h3>
                  <p className="text-white/60 text-xs mt-0.5">Corpo & Nutricao</p>
                  <span className="inline-block mt-2 text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                    {vitalisAccess ? 'Activo' : 'Comecar'}
                  </span>
                </div>
              </div>
            </button>

            {/* Aurea */}
            <button
              onClick={() => navigate(aureaAccess ? '/aurea/dashboard' : '/aurea')}
              className="group relative overflow-hidden rounded-3xl text-left shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227] to-[#8B6914]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
              <div className="relative p-4 flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <img src="/logos/logo_aurea.png" alt="Aurea" className="w-8 h-8" onError={(e) => { e.target.style.display = 'none' }} />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">AUREA</h3>
                  <p className="text-white/60 text-xs mt-0.5">Autocuidado & Beleza</p>
                  <span className="inline-block mt-2 text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                    {aureaAccess ? 'Activo' : 'Comecar'}
                  </span>
                </div>
              </div>
            </button>

            {/* Comunidade */}
            <button
              onClick={() => navigate('/comunidade')}
              className="group relative overflow-hidden rounded-3xl text-left shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#EC4899] to-[#9333EA]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
              <div className="relative p-4 flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">COMUNIDADE</h3>
                  <p className="text-white/60 text-xs mt-0.5">Reflexao & Partilha</p>
                  <span className="inline-block mt-2 text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">Aberto</span>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Quick Access */}
        {vitalisAccess && (
          <section className="px-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-[#7C8B6F] to-[#7C8B6F]/30 rounded-full" />
              <h2 className="text-sm font-semibold text-[#4A3728] tracking-widest uppercase">Acesso Rapido</h2>
            </div>
            <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg overflow-hidden">
              <Link to="/vitalis/checkin" className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors border-b border-[#E8D5A3]/20">
                <div className="w-11 h-11 bg-gradient-to-br from-[#7C8B6F]/20 to-[#7C8B6F]/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#7C8B6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#4A3728] text-sm">Check-in Diario</p>
                  <p className="text-xs text-[#6B5344]/60">Registar o teu dia</p>
                </div>
                <svg className="w-4 h-4 text-[#6B5344]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/vitalis/receitas" className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors border-b border-[#E8D5A3]/20">
                <div className="w-11 h-11 bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#C9A227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#4A3728] text-sm">Receitas</p>
                  <p className="text-xs text-[#6B5344]/60">Explorar receitas saudaveis</p>
                </div>
                <svg className="w-4 h-4 text-[#6B5344]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/vitalis/plano" className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors">
                <div className="w-11 h-11 bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#4A3728] text-sm">Plano Alimentar</p>
                  <p className="text-xs text-[#6B5344]/60">O teu plano personalizado</p>
                </div>
                <svg className="w-4 h-4 text-[#6B5344]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* Discover section */}
        <section className="px-5 mb-6">
          <div className="relative overflow-hidden rounded-3xl" style={{ background: 'linear-gradient(135deg, #4A3728 0%, #2A1F18 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }} />
            <div className="relative p-6">
              <p className="text-[#C9A227] text-xs font-semibold tracking-widest uppercase mb-2">Descobrir</p>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                Explora os 7 Ecos e descobre todo o sistema de transformacao integral.
              </p>
              <button
                onClick={() => navigate('/landing')}
                className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm group"
              >
                Ver todos os Ecos
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
       </div>
      </div>
    )
  }

  return <LandingGeral />
}
