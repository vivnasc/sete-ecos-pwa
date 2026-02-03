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
import ReceitaDetalhe from './components/vitalis/ReceitaDetalhe'
import NotificacoesConfig from './components/vitalis/NotificacoesConfig'
import GraficosTendencia from './components/vitalis/GraficosTendencia'
import PerfilVitalis from './components/vitalis/PerfilVitalis'
import ListaCompras from './components/vitalis/ListaCompras'
import SugestoesRefeicoes from './components/vitalis/SugestoesRefeicoes'
import ChatCoach from './components/vitalis/ChatCoach'
import FotosProgresso from './components/vitalis/FotosProgresso'
import DesafiosSemanais from './components/vitalis/DesafiosSemanais'
import CalendarioRefeicoes from './components/vitalis/CalendarioRefeicoes'
import GuiaUtilizador from './components/vitalis/GuiaUtilizador'
import PagamentoVitalis from './components/vitalis/PagamentoVitalis'
import VitalisAccessGuard from './components/vitalis/VitalisAccessGuard'
import PlanoHTML from './pages/PlanoHTML'
import CoachDashboard from './pages/CoachDashboard'
import LandingGeral from './pages/LandingGeral'
import LandingVitalis from './pages/LandingVitalis'

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
          <Route path="/landing" element={<LandingGeral />} />
          <Route path="/vitalis" element={<LandingVitalis />} />
          <Route path="/lumina" element={session ? <Lumina /> : <Auth />} />
          <Route path="/vitalis/login" element={<VitalisAuth />} />
          <Route path="/vitalis/pagamento" element={session ? <PagamentoVitalis /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/receita/:id" element={<ReceitaDetalhe />} />
          {/* Rotas protegidas - requerem subscricao ativa */}
          <Route path="/vitalis/intake" element={session ? <VitalisAccessGuard><VitalisIntakeComplete /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/dashboard" element={session ? <VitalisAccessGuard><DashboardVitalis /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/checkin" element={session ? <VitalisAccessGuard><CheckinDiario /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/receitas" element={session ? <VitalisAccessGuard><ReceitasBrowse /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/espaco-retorno" element={session ? <VitalisAccessGuard><EspacoRetorno /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/plano" element={session ? <VitalisAccessGuard><PlanoAlimentar /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/meals" element={session ? <VitalisAccessGuard><MealsTracker /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/refeicoes-config" element={session ? <VitalisAccessGuard><RefeicoesCofig /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/relatorios" element={session ? <VitalisAccessGuard><RelatoriosHub /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/relatorio-semanal" element={session ? <VitalisAccessGuard><RelatorioSemanal /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/notificacoes" element={session ? <VitalisAccessGuard><NotificacoesConfig /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/tendencias" element={session ? <VitalisAccessGuard><GraficosTendencia /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/perfil" element={session ? <VitalisAccessGuard><PerfilVitalis /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/lista-compras" element={session ? <VitalisAccessGuard><ListaCompras /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/sugestoes" element={session ? <VitalisAccessGuard><SugestoesRefeicoes /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/chat" element={session ? <VitalisAccessGuard><ChatCoach /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/fotos-progresso" element={session ? <VitalisAccessGuard><FotosProgresso /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/desafios" element={session ? <VitalisAccessGuard><DesafiosSemanais /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/calendario" element={session ? <VitalisAccessGuard><CalendarioRefeicoes /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/guia" element={session ? <VitalisAccessGuard><GuiaUtilizador /></VitalisAccessGuard> : <Navigate to="/vitalis/login" />} />
          <Route path="/coach" element={session?.user?.email === 'viv.saraiva@gmail.com' ? <CoachDashboard /> : <Navigate to="/" />} />
          <Route path="/vitalis/plano-pdf" element={<PlanoHTML />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App
