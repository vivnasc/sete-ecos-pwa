import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navigation({ variant = 'default' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, vitalisAccess: hasVitalisAccess, aureaAccess: hasAureaAccess, isCoachUser } = useAuth()
  const isAuthenticated = !!session

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Detect current Eco section
  const isVitalisSection = location.pathname.startsWith('/vitalis')
  const isAureaSection = location.pathname.startsWith('/aurea')
  const isLuminaSection = location.pathname === '/lumina'
  const isAccountSection = location.pathname === '/conta' || location.pathname === '/perfil'
  const isCommunitySection = location.pathname.startsWith('/comunidade')
  const isCoachSection = location.pathname.startsWith('/coach')

  // Get current Eco info for header badge
  const getCurrentEco = () => {
    if (isVitalisSection) return { name: 'Vitalis', color: '#7C8B6F', logo: '/logos/VITALIS_LOGO_V3.png' }
    if (isAureaSection) return { name: 'Aurea', color: '#C9A227', logo: '/logos/logo_aurea.png' }
    if (isLuminaSection) return { name: 'Lumina', color: '#8B5CF6', logo: '/logos/lumina-logo_v2.png' }
    return null
  }

  const currentEco = getCurrentEco()

  // Don't show navigation on certain pages
  const hiddenPaths = ['/landing', '/vitalis/login', '/vitalis/pagamento', '/aurea/pagamento', '/login', '/recuperar-password']
  if (hiddenPaths.some(p => location.pathname === p || location.pathname.startsWith(p))) {
    return null
  }

  // Landing/marketing pages: hide bottom nav but keep chatbot "V" on Vitalis landing
  const landingPages = ['/vitalis', '/aurea', '/sete-ecos', '/bundle', '/serena', '/ignis', '/ventis', '/ecoa', '/imago', '/aurora']
  if (landingPages.includes(location.pathname)) {
    // On Vitalis landing, show only the chatbot button (above WhatsApp)
    if (location.pathname === '/vitalis') {
      return (
        <button
          onClick={() => navigate('/vitalis/chat')}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#7C8B6F] to-[#5D6B4F] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 border-white/30"
          aria-label="Falar com Vivianne"
        >
          <span className="text-white font-bold text-lg">V</span>
        </button>
      )
    }
    return null
  }

  // Coach navigation
  if (isCoachSection && isCoachUser) {
    const isClientes = location.pathname === '/coach' || location.pathname.startsWith('/coach/cliente')
    const isMarketing = location.pathname === '/coach/marketing'
    const isAnalytics = location.pathname === '/coach/analytics'

    return (
      <nav role="navigation" aria-label="Navegacao Coach" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl z-50">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-[10px] font-semibold tracking-[0.2em]">COACH</span>
          </div>
        </div>
        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
          <NavItem
            icon="clientes"
            label="Clientes"
            active={isClientes}
            onClick={() => navigate('/coach')}
            color="#1F2937"
          />
          <NavItem
            icon="marketing"
            label="Marketing"
            active={isMarketing}
            onClick={() => navigate('/coach/marketing')}
            color="#DB2777"
          />
          <NavItem
            icon="analytics"
            label="Analytics"
            active={isAnalytics}
            onClick={() => navigate('/coach/analytics')}
            color="#4F46E5"
          />
          <NavItem
            logo="/logos/VITALIS_LOGO_V3.png"
            label="Vitalis"
            active={isVitalisSection}
            onClick={() => navigate('/vitalis/dashboard')}
            color="#7C8B6F"
          />
          <NavItem
            icon="community"
            label="Comunidade"
            active={isCommunitySection}
            onClick={() => navigate('/comunidade')}
            color="#8B5CF6"
          />
          <NavItem
            icon="account"
            label="Conta"
            active={isAccountSection}
            onClick={() => navigate('/conta')}
            color="#6B5C4C"
          />
        </div>
      </nav>
    )
  }

  // Aurea-specific navigation
  if (isAureaSection) {
    return (
      <nav role="navigation" aria-label="Navegacao Aurea" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8D5A3]/30 shadow-2xl z-50">
        {/* Current Eco indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#C9A227] to-[#B8911E] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-[10px] font-semibold tracking-[0.2em]">AUREA</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
          <NavItem
            logo="/logos/CENTRO_7ECOS.png"
            label="Hub"
            active={isActive('/')}
            onClick={() => navigate('/')}
            color="#4A3728"
          />
          <NavItem
            logo="/logos/logo_aurea.png"
            label="Aurea"
            active={isAureaSection}
            onClick={() => navigate(hasAureaAccess ? '/aurea/dashboard' : '/aurea')}
            color="#C9A227"
          />
          {isAuthenticated && (
            <NavItem
              icon="community"
              label="Rio"
              active={isCommunitySection}
              onClick={() => navigate('/comunidade')}
              color="#8B5CF6"
            />
          )}
          {isAuthenticated && (
            <NavItem
              icon="account"
              label="Conta"
              active={isAccountSection}
              onClick={() => navigate('/conta')}
              color="#6B5344"
            />
          )}
        </div>
      </nav>
    )
  }

  // Vitalis-specific navigation
  const isChatPage = location.pathname === '/vitalis/chat'

  if (variant === 'vitalis' || isVitalisSection) {
    return (
      <>
        {/* Floating Vivianne chat button */}
        {!isChatPage && (
          <button
            onClick={() => navigate('/vitalis/chat')}
            className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#7C8B6F] to-[#5D6B4F] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 border-white/30"
            aria-label="Falar com Vivianne"
          >
            <span className="text-white font-bold text-lg">V</span>
          </button>
        )}

        <nav role="navigation" aria-label="Navegacao Vitalis" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8E2D9]/30 shadow-2xl z-50">
        {/* Current Eco indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5D6B4F] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-[10px] font-semibold tracking-[0.2em]">VITALIS</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
          <NavItem
            logo="/logos/CENTRO_7ECOS.png"
            label="Hub"
            active={isActive('/')}
            onClick={() => navigate('/')}
            color="#4A4035"
          />
          <NavItem
            logo="/logos/lumina-logo_v2.png"
            label="Lumina"
            active={isActive('/lumina')}
            onClick={() => navigate('/lumina')}
            color="#8B5CF6"
          />
          <NavItem
            logo="/logos/VITALIS_LOGO_V3.png"
            label="Vitalis"
            active={isVitalisSection}
            onClick={() => navigate(hasVitalisAccess ? '/vitalis/dashboard' : '/vitalis')}
            color="#7C8B6F"
          />
          {isAuthenticated && (
            <NavItem
              icon="community"
              label="Rio"
              active={isCommunitySection}
              onClick={() => navigate('/comunidade')}
              color="#8B5CF6"
            />
          )}
          {isAuthenticated && (
            <NavItem
              icon="account"
              label="Conta"
              active={isAccountSection}
              onClick={() => navigate('/conta')}
              color="#6B5C4C"
            />
          )}
        </div>
      </nav>
      </>
    )
  }

  // Lumina navigation
  if (isLuminaSection) {
    return (
      <nav role="navigation" aria-label="Navegacao Lumina" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/30 shadow-2xl z-50">
        {/* Current Eco indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-[10px] font-semibold tracking-[0.2em]">LUMINA</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
          <NavItem
            logo="/logos/CENTRO_7ECOS.png"
            label="Hub"
            active={isActive('/')}
            onClick={() => navigate('/')}
            color="#1A1A4E"
          />
          <NavItem
            logo="/logos/lumina-logo_v2.png"
            label="Lumina"
            active={isLuminaSection}
            onClick={() => navigate('/lumina')}
            color="#8B5CF6"
          />
          <NavItem
            logo="/logos/VITALIS_LOGO_V3.png"
            label="Vitalis"
            active={isVitalisSection}
            onClick={() => navigate(hasVitalisAccess ? '/vitalis/dashboard' : '/vitalis')}
            color="#7C8B6F"
          />
          {isAuthenticated && (
            <NavItem
              icon="community"
              label="Rio"
              active={isCommunitySection}
              onClick={() => navigate('/comunidade')}
              color="#8B5CF6"
            />
          )}
          {isAuthenticated && (
            <NavItem
              icon="account"
              label="Conta"
              active={isAccountSection}
              onClick={() => navigate('/conta')}
              color="#6B5C4C"
            />
          )}
        </div>
      </nav>
    )
  }

  // Community section navigation
  if (isCommunitySection) {
    const isRio = location.pathname === '/comunidade/rio'
    const isCirculos = location.pathname === '/comunidade/circulos'
    const isFogueira = location.pathname === '/comunidade/fogueira'
    const isSussurros = location.pathname === '/comunidade/sussurros'

    return (
      <nav role="navigation" aria-label="Navegacao Comunidade" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-purple-100/30 shadow-2xl z-50">
        {/* Current section indicator — clickable to go to community hub */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <button onClick={() => navigate('/comunidade')} className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] px-4 py-1 rounded-t-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity">
            <span className="text-white text-[10px] font-semibold tracking-[0.2em]">COMUNIDADE</span>
          </button>
        </div>

        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
          <NavItem
            logo="/logos/CENTRO_7ECOS.png"
            label="Hub"
            active={false}
            onClick={() => navigate('/')}
            color="#1A1A4E"
          />
          <NavItem
            icon="rio"
            label="Rio"
            active={isRio}
            onClick={() => navigate('/comunidade/rio')}
            color="#8B5CF6"
          />
          <NavItem
            icon="circulos"
            label="Circulos"
            active={isCirculos}
            onClick={() => navigate('/comunidade/circulos')}
            color="#8B5CF6"
          />
          <NavItem
            icon="fogueira"
            label="Fogueira"
            active={isFogueira}
            onClick={() => navigate('/comunidade/fogueira')}
            color="#F97316"
          />
          <NavItem
            icon="sussurros"
            label="Sussurros"
            active={isSussurros}
            onClick={() => navigate('/comunidade/sussurros')}
            color="#EC4899"
          />
        </div>
      </nav>
    )
  }

  // Default navigation (Home)
  return (
    <nav role="navigation" aria-label="Navegacao principal" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/30 shadow-2xl z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
        <NavItem
          logo="/logos/CENTRO_7ECOS.png"
          label="Hub"
          active={isActive('/')}
          onClick={() => navigate('/')}
          color="#1A1A4E"
        />
        <NavItem
          logo="/logos/lumina-logo_v2.png"
          label="Lumina"
          active={isLuminaSection}
          onClick={() => navigate('/lumina')}
          color="#8B5CF6"
        />
        <NavItem
          logo="/logos/VITALIS_LOGO_V3.png"
          label="Vitalis"
          active={isVitalisSection}
          onClick={() => navigate(hasVitalisAccess ? '/vitalis/dashboard' : '/vitalis')}
          color="#7C8B6F"
        />
        {isAuthenticated && (
          <NavItem
            icon="community"
            label="Comunidade"
            active={isCommunitySection}
            onClick={() => navigate('/comunidade')}
            color="#8B5CF6"
          />
        )}
        {isAuthenticated && (
          <NavItem
            icon="account"
            label="Conta"
            active={isAccountSection}
            onClick={() => navigate('/conta')}
            color="#6B5C4C"
          />
        )}
      </div>
    </nav>
  )
}

function NavItem({ icon, logo, label, active, onClick, color }) {
  // Render account icon as SVG
  const renderIcon = () => {
    if (icon === 'clientes') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      )
    }
    if (icon === 'marketing') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      )
    }
    if (icon === 'analytics') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )
    }
    if (icon === 'account') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
    if (icon === 'community' || icon === 'rio') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      )
    }
    if (icon === 'circulos') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    }
    if (icon === 'fogueira') {
      return <span className="text-xl mb-0.5" style={{ opacity: active ? 1 : 0.5 }}>🔥</span>
    }
    if (icon === 'sussurros') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      )
    }
    return <span className="text-xl mb-0.5">{icon}</span>
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Navegar para ${label}`}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-300 ${
        active
          ? 'bg-gray-100/80 scale-105'
          : 'hover:bg-gray-50 hover:scale-105'
      }`}
      style={{
        color: active ? color : '#9CA3AF',
        minWidth: '60px'
      }}
    >
      {logo ? (
        <img src={logo} alt="" aria-hidden="true" className="w-6 h-6 mb-0.5 object-contain" style={{ opacity: active ? 1 : 0.5 }} />
      ) : (
        renderIcon()
      )}
      <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </span>
    </button>
  )
}
