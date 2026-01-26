import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()
  
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1A1A4E', fontSize: '2rem' }}>SETE ECOS</h1>
        <p style={{ color: '#6B6B9D' }}>Uma PWA. Sete caminhos. Uma travessia.</p>
      </div>
      
      <div onClick={() => navigate('/lumina')} style={{ background: 'linear-gradient(135deg, #1A1A4E, #4B0082)', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '15px', cursor: 'pointer' }}>
        <h2 style={{ marginBottom: '8px' }}>✨ LUMINA</h2>
        <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Check-in diário — Como te sentes hoje?</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[{n:'VITALIS',c:'#C1634A',a:'Corpo'},{n:'SERENA',c:'#5B9AA0',a:'Emoção'},{n:'IGNIS',c:'#FFB300',a:'Vontade'},{n:'VENTIS',c:'#8FBC8F',a:'Ritmo'},{n:'ECOA',c:'#87CEEB',a:'Voz'},{n:'IMAGO',c:'#FFD700',a:'Identidade'}].map(e => (
          <div key={e.n} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #E8E8F0', borderLeft: `4px solid ${e.c}`, opacity: 0.6 }}>
            <strong>{e.n}</strong><br/><small style={{color:'#6B6B9D'}}>{e.a}</small><br/><small style={{color:'#999'}}>Em breve</small>
          </div>
        ))}
      </div>
      
      <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '30px', width: '100%', padding: '12px', background: 'none', border: '1px solid #E8E8F0', borderRadius: '8px', color: '#6B6B9D', cursor: 'pointer' }}>Sair</button>
    </div>
  )
}
