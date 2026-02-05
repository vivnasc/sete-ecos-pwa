import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Navigation({ variant = 'default' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [hasVitalisAccess, setHasVitalisAccess] = useState(false)
  const [hasAureaAccess, setHasAureaAccess] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndAccess()
  }, [])

  const checkAuthAndAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userData) {
          // Check Vitalis access
          const { data: vitalisData } = await supabase
            .from('vitalis_clients')
            .select('subscription_status')
            .eq('user_id', userData.id)
            .single()

          const activeStatuses = ['active', 'trial', 'tester']
          setHasVitalisAccess(vitalisData && activeStatuses.includes(vitalisData.subscription_status))

          // Check Aurea access
          const { data: aureaData } = await supabase
            .from('aurea_clients')
            .select('subscription_status')
            .eq('user_id', userData.id)
            .single()

          setHasAureaAccess(aureaData && activeStatuses.includes(aureaData.subscription_status))
        }
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error)
    }
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Detect current Eco section
  const isVitalisSection = location.pathname.startsWith('/vitalis')
  const isAureaSection = location.pathname.startsWith('/aurea')
  const isLuminaSection = location.pathname === '/lumina'
  const isAccountSection = location.pathname === '/conta' || location.pathname === '/perfil'

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
