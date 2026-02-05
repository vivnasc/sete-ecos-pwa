import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Auth.css'

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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // Garantir que existe registo na tabela users
        if (data.user) {
          await supabase.from('users').upsert({
            auth_id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' })
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Criar registo na tabela users
        if (data.user) {
          await supabase.from('users').upsert({
            auth_id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' })
        }

        setMessage('Conta criada! Podes entrar agora.')
        setIsLogin(true)
      }
    } catch (error) {
      setMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      
      <div className="auth-content">
        <div className="auth-header">
          <div className="auth-logo">✦</div>
          <h1 className="auth-title">SETE ECOS</h1>
          <p className="auth-subtitle">Uma PWA. Sete caminhos. Uma travessia.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'A processar...' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {message && (
          <p className={`auth-message ${message.includes('Conta criada') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <div className="auth-switch">
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
          </button>
        </div>

        <p className="auth-footer">Sistema de Transmutação Feminina</p>
      </div>
    </div>
  )
}
