import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { isSessionCoach } from './lib/coach'

// ===== PÁGINAS PRINCIPAIS =====
import Home from './pages/Home'
import Lumina from './pages/Lumina'
import ComingSoon from './pages/ComingSoon'
import Auth from './components/Auth'
import Navigation from './components/Navigation'
import CoachDashboard from './pages/CoachDashboard'
import LandingGeral from './pages/LandingGeral'

// ===== ECO 1: VITALIS (Nutrição) =====
import LandingVitalis from './pages/LandingVitalis'
import VitalisAuth from './components/vitalis/Auth'
import VitalisAccessGuard from './components/vitalis/VitalisAccessGuard'
import PagamentoVitalis from './components/vitalis/PagamentoVitalis'
import VitalisIntakeComplete from './components/vitalis/VitalisIntakeComplete'
import DashboardVitalis from './components/vitalis/DashboardVitalis'
import CheckinDiario from './components/vitalis/CheckinDiario'
import ReceitasBrowse from './components/vitalis/ReceitasBrowse'
import ReceitaDetalhe from './components/vitalis/ReceitaDetalhe'
import EspacoRetorno from './components/vitalis/EspacoRetorno'
import PlanoAlimentar from './components/vitalis/PlanoAlimentar'
import MealsTracker from './components/vitalis/MealsTracker'
import RefeicoesCofig from './components/vitalis/RefeicoesCofig'
import RelatorioSemanal from './components/vitalis/RelatorioSemanal'
import RelatoriosHub from './components/vitalis/RelatoriosHub'
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
import PlanoHTML from './pages/PlanoHTML'

// ===== ECO 2: ÁUREA (Valor & Presença) =====
import LandingAurea from './pages/LandingAurea'
import AureaAuth from './components/aurea/Auth'
import AureaAccessGuard from './components/aurea/AureaAccessGuard'
import PagamentoAurea from './components/aurea/PagamentoAurea'
import AureaOnboarding from './components/aurea/Onboarding'
import DashboardAurea from './components/aurea/DashboardAurea'
import MicroPraticas from './components/aurea/MicroPraticas'
import EspelhoRoupa from './components/aurea/EspelhoRoupa'
import CarteiraMerecimento from './components/aurea/CarteiraMerecimento'
import DiarioMerecimento from './components/aurea/DiarioMerecimento'
import InsightsSemanal from './components/aurea/InsightsSemanal'
import PerfilAurea from './components/aurea/PerfilAurea'

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
          {/* ===== ROTAS PÚBLICAS ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<LandingGeral />} />

          {/* ===== LUMINA - Diagnóstico Gratuito ===== */}
          <Route path="/lumina" element={session ? <Lumina /> : <Auth />} />

          {/* ===== ECO 1: VITALIS - Nutrição ===== */}
          <Route path="/vitalis" element={<LandingVitalis />} />
          <Route path="/vitalis/login" element={<VitalisAuth />} />
          <Route path="/vitalis/pagamento" element={<PagamentoVitalis />} />
          <Route path="/vitalis/receita/:id" element={<ReceitaDetalhe />} />
          <Route path="/vitalis/plano-pdf" element={<PlanoHTML />} />
          {/* Vitalis - Rotas protegidas (requerem subscrição activa) */}
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

          {/* ===== ECO 2: ÁUREA - Valor & Presença ===== */}
          <Route path="/aurea" element={<LandingAurea />} />
          <Route path="/aurea/login" element={<AureaAuth />} />
          <Route path="/aurea/pagamento" element={<PagamentoAurea />} />
          <Route path="/aurea/onboarding" element={session ? <AureaAccessGuard><AureaOnboarding /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/dashboard" element={session ? <AureaAccessGuard><DashboardAurea /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/praticas" element={session ? <AureaAccessGuard><MicroPraticas /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/roupa" element={session ? <AureaAccessGuard><EspelhoRoupa /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/carteira" element={session ? <AureaAccessGuard><CarteiraMerecimento /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/diario" element={session ? <AureaAccessGuard><DiarioMerecimento /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/insights" element={session ? <AureaAccessGuard><InsightsSemanal /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />
          <Route path="/aurea/perfil" element={session ? <AureaAccessGuard><PerfilAurea /></AureaAccessGuard> : <Navigate to="/aurea/login" />} />

          {/* ===== ECOS 3-7: Em Breve ===== */}
          <Route path="/serena" element={<ComingSoon />} />
          <Route path="/ignis" element={<ComingSoon />} />
          <Route path="/ventis" element={<ComingSoon />} />
          <Route path="/ecoa" element={<ComingSoon />} />
          <Route path="/imago" element={<ComingSoon />} />

          {/* ===== AURORA - Integração Final ===== */}
          <Route path="/aurora" element={<ComingSoon />} />

          {/* ===== ADMIN / COACH ===== */}
          <Route path="/coach" element={
            isSessionCoach(session)
              ? <CoachDashboard />
              : <Navigate to="/" />
          } />

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App
