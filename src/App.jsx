import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './pages/Home'
import Lumina from './pages/Lumina'
import Navigation from './components/Navigation'
// Vitalis
import VitalisAuth from './components/vitalis/Auth'
import VitalisIntakeComplete from './components/vitalis/VitalisIntakeComplete'
import DashboardVitalis from './components/vitalis/DashboardVitalis'
import CheckinDiario from './components/vitalis/CheckinDiario'
import ReceitasBrowse from './components/vitalis/ReceitasBrowse'
import EspacoRetorno from './components/vitalis/EspacoRetorno'
import PlanoAlimentar from './components/vitalis/PlanoAlimentar'
import MealsTracker from './components/vitalis/MealsTracker'
import RefeicoesCofig from './components/vitalis/RefeicoesCofig'
import RelatorioSemanal from './components/vitalis/RelatorioSemanal'
import RelatoriosHub from './components/vitalis/RelatoriosHub'
import PlanoHTML from './pages/PlanoHTML'

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
  
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lumina" element={session ? <Lumina /> : <Auth />} />
          <Route path="/vitalis/login" element={<VitalisAuth />} />
          <Route path="/vitalis/intake" element={session ? <VitalisIntakeComplete /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/dashboard" element={session ? <DashboardVitalis /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/checkin" element={session ? <CheckinDiario /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/receitas" element={session ? <ReceitasBrowse /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/espaco-retorno" element={session ? <EspacoRetorno /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/plano" element={session ? <PlanoAlimentar /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/meals" element={session ? <MealsTracker /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/refeicoes-config" element={session ? <RefeicoesCofig /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/relatorios" element={session ? <RelatoriosHub /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/relatorio-semanal" element={session ? <RelatorioSemanal /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/plano-pdf" element={<PlanoHTML />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App
