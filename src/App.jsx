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
          <Route path="/vitalis/receita/:id" element={<ReceitaDetalhe />} />
          <Route path="/vitalis/notificacoes" element={session ? <NotificacoesConfig /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/tendencias" element={session ? <GraficosTendencia /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/perfil" element={session ? <PerfilVitalis /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/lista-compras" element={session ? <ListaCompras /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/sugestoes" element={session ? <SugestoesRefeicoes /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/chat" element={session ? <ChatCoach /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/fotos-progresso" element={session ? <FotosProgresso /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/desafios" element={session ? <DesafiosSemanais /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/calendario" element={session ? <CalendarioRefeicoes /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/guia" element={session ? <GuiaUtilizador /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/pagamento" element={session ? <PagamentoVitalis /> : <Navigate to="/vitalis/login" />} />
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
