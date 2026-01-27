import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './pages/Home'
import Lumina from './pages/Lumina'
import Navigation from './components/Navigation'

// Vitalis (novo)
import VitalisAuth from './components/vitalis/Auth'
import VitalisIntakeComplete from './components/vitalis/VitalisIntakeComplete'
import DashboardVitalis from './components/vitalis/DashboardVitalis'
import CheckinDiario from './components/vitalis/CheckinDiario'
import ReceitasBrowse from './components/vitalis/ReceitasBrowse'
import EspacoRetorno from './components/vitalis/EspacoRetorno'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="loading">A carregar...</div>

  if (!session) return <Auth />

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lumina" element={<Lumina />} />
          
          {/* Rotas Vitalis */}
          <Route path="/vitalis/login" element={<VitalisAuth />} />
          <Route path="/vitalis/intake" element={<VitalisIntakeComplete />} />
          <Route path="/vitalis/dashboard" element={<DashboardVitalis />} />
          <Route path="/vitalis/checkin" element={<CheckinDiario />} />
          <Route path="/vitalis/receitas" element={<ReceitasBrowse />} />
          <Route path="/vitalis/espaco-retorno" element={<EspacoRetorno />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App
