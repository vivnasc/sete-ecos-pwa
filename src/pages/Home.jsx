import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LandingGeral from './LandingGeral'

/**
 * HOME PRINCIPAL - app.seteecos.com
 * Sistema de Transmutação Feminina
 */

export default function Home() {
  const navigate = useNavigate()
  const { session, loading, userRecord, vitalisAccess } = useAuth()

  const userName = userRecord?.nome || session?.user?.email?.split('@')[0] || ''

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #FAF6F0, #F5EEE3)' }}>
        <div className="w-12 h-12 border-4 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin"></div>
      </div>
    )
  }

  // HUB AUTENTICADO - Vista personalizada para utilizadores logados
  if (session) {
    return (
      <div className="min-h-screen pb-20" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to bottom, #FAF6F0, #F5EEE3)' }}>
        {/* Header */}
        <header className="px-4 pt-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[#6B5344] text-sm">Bem-vinda de volta</p>
              <h1 className="text-2xl font-bold text-[#4A3728]">{userName || 'Guerreira'}</h1>
            </div>
            <Link to="/conta" className="w-10 h-10 bg-[#C9A227]/20 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </Link>
          </div>

          {/* Logo central */}
          <div className="text-center mb-6">
            <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-20 h-20 mx-auto mb-2" />
            <p className="text-[#6B5344] text-sm">O teu espaço de transformação</p>
          </div>
        </header>

        {/* Ecos Activos */}
        <section className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-[#4A3728] mb-4">Os teus Ecos</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Lumina - Sempre disponível */}
            <button
              onClick={() => navigate('/lumina')}
              className="bg-gradient-to-br from-[#6B4C8A] to-[#4B0082] p-4 rounded-2xl text-left shadow-lg hover:scale-[1.02] transition-transform"
            >
              <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-12 h-12 mb-2" />
              <h3 className="text-white font-bold">LUMINA</h3>
              <p className="text-white/70 text-xs">Diagnóstico</p>
            </button>

            {/* Vitalis */}
            <button
              onClick={() => navigate(vitalisAccess ? '/vitalis/dashboard' : '/vitalis')}
              className="bg-gradient-to-br from-[#7C8B6F] to-[#5A6B4D] p-4 rounded-2xl text-left shadow-lg hover:scale-[1.02] transition-transform"
            >
              <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12 mb-2" />
              <h3 className="text-white font-bold">VITALIS</h3>
              <p className="text-white/70 text-xs">{vitalisAccess ? 'Continuar' : 'Começar'}</p>
            </button>
          </div>
        </section>

        {/* Acções Rápidas */}
        <section className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-[#4A3728] mb-4">Acesso Rápido</h2>
          <div className="space-y-3">
            {vitalisAccess && (
              <>
                <Link to="/vitalis/checkin" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-semibold text-[#4A3728]">Check-in Diário</p>
                    <p className="text-xs text-[#6B5344]">Registar o teu dia</p>
                  </div>
                </Link>
                <Link to="/vitalis/receitas" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <p className="font-semibold text-[#4A3728]">Receitas</p>
                    <p className="text-xs text-[#6B5344]">Explorar receitas saudáveis</p>
                  </div>
                </Link>
              </>
            )}
            <Link to="/conta" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-semibold text-[#4A3728]">Minha Conta</p>
                <p className="text-xs text-[#6B5344]">Definições e perfil</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Descobrir mais Ecos */}
        <section className="px-4">
          <h2 className="text-lg font-semibold text-[#4A3728] mb-4">Descobrir</h2>
          <div className="bg-gradient-to-r from-[#C9A227]/20 to-[#E8D5A3]/20 p-4 rounded-xl">
            <p className="text-[#4A3728] mb-2">Explora os 7 Ecos e descobre todo o sistema de transformação.</p>
            <button
              onClick={() => navigate('/landing')}
              className="text-[#C9A227] font-semibold text-sm"
            >
              Ver todos os Ecos →
            </button>
          </div>
        </section>

        {/* Bottom Navigation provided by global Navigation component */}
      </div>
    )
  }

  // Utilizadores não autenticados vêem a Landing Geral
  return <LandingGeral />
}
