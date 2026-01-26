import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Verifica o teu email para confirmar o registo.')
      }
    } catch (error) {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ color: '#1A1A4E', marginBottom: '30px' }}>SETE ECOS</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #E8E8F0', borderRadius: '8px', fontSize: '16px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #E8E8F0', borderRadius: '8px', fontSize: '16px' }} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#1A1A4E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>{loading ? 'A processar...' : isLogin ? 'Entrar' : 'Registar'}</button>
      </form>
      {message && <p style={{ marginTop: '15px', color: '#C1634A' }}>{message}</p>}
      <p style={{ marginTop: '20px' }}><button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#4B0082', cursor: 'pointer' }}>{isLogin ? 'Criar conta' : 'Já tenho conta'}</button></p>
    </div>
  )
}
