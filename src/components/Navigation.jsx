import { useNavigate, useLocation } from 'react-router-dom'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E8E8F0', display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', color: location.pathname === '/' ? '#1A1A4E' : '#6B6B9D', fontWeight: location.pathname === '/' ? '600' : '400' }}>Início</button>
      <button onClick={() => navigate('/lumina')} style={{ background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', color: location.pathname === '/lumina' ? '#4B0082' : '#6B6B9D', fontWeight: location.pathname === '/lumina' ? '600' : '400' }}>LUMINA</button>
    </nav>
  )
}
