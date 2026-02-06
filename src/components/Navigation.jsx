import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navigation({ variant = 'default' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, vitalisAccess: hasVitalisAccess, aureaAccess: hasAureaAccess } = useAuth()
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

  // Aurea-specific navigation
  if (isAureaSection) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D5A3] shadow-lg z-50">
        {/* Current Eco indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#C9A227] to-[#B8911E] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-xs font-semibold tracking-wide">AUREA</span>
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
  if (variant === 'vitalis' || isVitalisSection) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E2D9] shadow-lg z-50">
        {/* Current Eco indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5D6B4F] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-xs font-semibold tracking-wide">VITALIS</span>
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
    )
  }

  // Lumina navigation
  if (isLuminaSection) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Current Eco indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-xs font-semibold tracking-wide">LUMINA</span>
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
    const isRio = location.pathname === '/comunidade'
    const isCirculos = location.pathname === '/comunidade/circulos'
    const isFogueira = location.pathname === '/comunidade/fogueira'
    const isSussurros = location.pathname === '/comunidade/sussurros'

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 shadow-lg z-50">
        {/* Current section indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] px-4 py-1 rounded-t-lg shadow-md">
            <span className="text-white text-xs font-semibold tracking-wide">COMUNIDADE</span>
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
            icon="rio"
            label="Rio"
            active={isRio}
            onClick={() => navigate('/comunidade')}
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
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
            label="Social"
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
    if (icon === 'account') {
      return (
        <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.5 }}>
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
      className={`flex flex-col items-center justify-center px-4 py-1 rounded-lg transition-all ${
        active
          ? 'bg-gray-100'
          : 'hover:bg-gray-50'
      }`}
      style={{
        color: active ? color : '#9CA3AF',
        minWidth: '60px'
      }}
    >
      {logo ? (
        <img src={logo} alt={label} className="w-6 h-6 mb-0.5 object-contain" style={{ opacity: active ? 1 : 0.5 }} />
      ) : (
        renderIcon()
      )}
      <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </span>
    </button>
  )
}
