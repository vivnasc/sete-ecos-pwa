import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Navigation({ variant = 'default' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [hasVitalisAccess, setHasVitalisAccess] = useState(false)
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
          const { data: clientData } = await supabase
            .from('vitalis_clients')
            .select('subscription_status')
            .eq('user_id', userData.id)
            .single()

          const activeStatuses = ['active', 'trial', 'tester']
          setHasVitalisAccess(clientData && activeStatuses.includes(clientData.subscription_status))
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

  const isVitalisSection = location.pathname.startsWith('/vitalis')
  const isLuminaSection = location.pathname === '/lumina'

  // Don't show navigation on landing pages or auth pages
  const hiddenPaths = ['/landing', '/vitalis/login', '/vitalis/pagamento']
  if (hiddenPaths.some(p => location.pathname === p)) {
    return null
  }

  // Vitalis-specific navigation (shown inside Vitalis module)
  if (variant === 'vitalis' || (isVitalisSection && !hiddenPaths.includes(location.pathname))) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E2D9] shadow-lg z-50">
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
            color="#4B0082"
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
              icon="👤"
              label="Perfil"
              active={isActive('/vitalis/perfil')}
              onClick={() => navigate('/vitalis/perfil')}
              color="#6B5C4C"
            />
          )}
        </div>
      </nav>
    )
  }

  // Default navigation (Home, Landing, Lumina)
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
        <NavItem
          logo="/logos/CENTRO_7ECOS.png"
          label="Início"
          active={isActive('/')}
          onClick={() => navigate('/')}
          color="#1A1A4E"
        />
        <NavItem
          logo="/logos/lumina-logo_v2.png"
          label="Lumina"
          active={isLuminaSection}
          onClick={() => navigate('/lumina')}
          color="#4B0082"
        />
        <NavItem
          logo="/logos/VITALIS_LOGO_V3.png"
          label="Vitalis"
          active={isVitalisSection}
          onClick={() => navigate(hasVitalisAccess ? '/vitalis/dashboard' : '/vitalis')}
          color="#7C8B6F"
        />
      </div>
    </nav>
  )
}

function NavItem({ icon, logo, label, active, onClick, color }) {
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
        <span className="text-xl mb-0.5">{icon}</span>
      )}
      <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </span>
    </button>
  )
}
