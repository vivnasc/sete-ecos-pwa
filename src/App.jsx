import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isSessionCoach } from './lib/coach'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// ===== PÁGINAS PRINCIPAIS =====
import Home from './pages/Home'
import Login from './pages/Login'
import MinhaConta from './pages/MinhaConta'
import Perfil from './pages/Perfil'
import RecuperarPassword from './pages/RecuperarPassword'
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
import TreinosVitalis from './components/vitalis/TreinosVitalis'
import PlanoHTML from './pages/PlanoHTML'

// ===== COMUNIDADE — Espaço de Autoconhecimento =====
import Rio from './components/comunidade/Rio'
import Jornada from './components/comunidade/Jornada'
import Circulos from './components/comunidade/Circulos'
import Fogueira from './components/comunidade/Fogueira'
import Sussurros from './components/comunidade/Sussurros'

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
import ChatAurea from './components/aurea/ChatAurea'
import AnalisePadroes from './components/aurea/AnalisePadroes'
import AudioMeditacoes from './components/aurea/AudioMeditacoes'
import NotificacoesAurea from './components/aurea/NotificacoesAurea'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) return <div className="loading">A carregar...</div>

  return (
    <>
      <Routes>
          {/* ===== ROTAS PÚBLICAS ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<LandingGeral />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />

          {/* ===== CONTA E PERFIL (requerem auth) ===== */}
          <Route path="/conta" element={session ? <MinhaConta /> : <Navigate to="/login" state={{ from: '/conta' }} />} />
          <Route path="/perfil" element={session ? <Perfil /> : <Navigate to="/login" state={{ from: '/perfil' }} />} />

          {/* ===== LUMINA - Diagnóstico Gratuito ===== */}
          <Route path="/lumina" element={session ? <Lumina /> : <Navigate to="/login" state={{ from: '/lumina', eco: 'Lumina' }} />} />

          {/* ===== ECO 1: VITALIS - Nutrição ===== */}
          <Route path="/vitalis" element={<LandingVitalis />} />
          <Route path="/vitalis/login" element={<Navigate to="/login" state={{ from: '/vitalis/pagamento', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/pagamento" element={<PagamentoVitalis />} />
          <Route path="/vitalis/receita/:id" element={<ReceitaDetalhe />} />
          <Route path="/vitalis/plano-pdf" element={<PlanoHTML />} />
          {/* Vitalis - Rotas protegidas (requerem subscrição activa) */}
          <Route path="/vitalis/intake" element={session ? <VitalisAccessGuard><VitalisIntakeComplete /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/intake', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/dashboard" element={session ? <VitalisAccessGuard><DashboardVitalis /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/dashboard', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/checkin" element={session ? <VitalisAccessGuard><CheckinDiario /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/checkin', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/receitas" element={session ? <VitalisAccessGuard><ReceitasBrowse /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/receitas', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/espaco-retorno" element={session ? <VitalisAccessGuard><EspacoRetorno /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/espaco-retorno', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/plano" element={session ? <VitalisAccessGuard><PlanoAlimentar /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/plano', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/meals" element={session ? <VitalisAccessGuard><MealsTracker /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/meals', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/refeicoes-config" element={session ? <VitalisAccessGuard><RefeicoesCofig /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/refeicoes-config', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/relatorios" element={session ? <VitalisAccessGuard><RelatoriosHub /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/relatorios', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/relatorio-semanal" element={session ? <VitalisAccessGuard><RelatorioSemanal /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/relatorio-semanal', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/notificacoes" element={session ? <VitalisAccessGuard><NotificacoesConfig /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/notificacoes', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/tendencias" element={session ? <VitalisAccessGuard><GraficosTendencia /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/tendencias', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/perfil" element={session ? <VitalisAccessGuard><PerfilVitalis /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/perfil', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/lista-compras" element={session ? <VitalisAccessGuard><ListaCompras /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/lista-compras', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/sugestoes" element={session ? <VitalisAccessGuard><SugestoesRefeicoes /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/sugestoes', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/chat" element={session ? <VitalisAccessGuard><ChatCoach /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/chat', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/fotos-progresso" element={session ? <VitalisAccessGuard><FotosProgresso /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/fotos-progresso', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/desafios" element={session ? <VitalisAccessGuard><DesafiosSemanais /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/desafios', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/calendario" element={session ? <VitalisAccessGuard><CalendarioRefeicoes /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/calendario', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/guia" element={session ? <VitalisAccessGuard><GuiaUtilizador /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/guia', eco: 'Vitalis' }} />} />
          <Route path="/vitalis/treinos" element={session ? <VitalisAccessGuard><TreinosVitalis /></VitalisAccessGuard> : <Navigate to="/login" state={{ from: '/vitalis/treinos', eco: 'Vitalis' }} />} />

          {/* ===== ECO 2: ÁUREA - Valor & Presença ===== */}
          <Route path="/aurea" element={<LandingAurea />} />
          <Route path="/aurea/login" element={<Navigate to="/login" state={{ from: '/aurea/pagamento', eco: 'Áurea' }} />} />
          <Route path="/aurea/pagamento" element={<PagamentoAurea />} />
          <Route path="/aurea/onboarding" element={session ? <AureaAccessGuard><AureaOnboarding /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/onboarding', eco: 'Áurea' }} />} />
          <Route path="/aurea/dashboard" element={session ? <AureaAccessGuard><DashboardAurea /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/dashboard', eco: 'Áurea' }} />} />
          <Route path="/aurea/praticas" element={session ? <AureaAccessGuard><MicroPraticas /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/praticas', eco: 'Áurea' }} />} />
          <Route path="/aurea/roupa" element={session ? <AureaAccessGuard><EspelhoRoupa /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/roupa', eco: 'Áurea' }} />} />
          <Route path="/aurea/carteira" element={session ? <AureaAccessGuard><CarteiraMerecimento /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/carteira', eco: 'Áurea' }} />} />
          <Route path="/aurea/diario" element={session ? <AureaAccessGuard><DiarioMerecimento /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/diario', eco: 'Áurea' }} />} />
          <Route path="/aurea/insights" element={session ? <AureaAccessGuard><InsightsSemanal /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/insights', eco: 'Áurea' }} />} />
          <Route path="/aurea/perfil" element={session ? <AureaAccessGuard><PerfilAurea /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/perfil', eco: 'Áurea' }} />} />
          <Route path="/aurea/chat" element={session ? <AureaAccessGuard><ChatAurea /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/chat', eco: 'Áurea' }} />} />
          <Route path="/aurea/padroes" element={session ? <AureaAccessGuard><AnalisePadroes /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/padroes', eco: 'Áurea' }} />} />
          <Route path="/aurea/audios" element={session ? <AureaAccessGuard><AudioMeditacoes /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/audios', eco: 'Áurea' }} />} />
          <Route path="/aurea/meditacoes" element={session ? <AureaAccessGuard><AudioMeditacoes /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/meditacoes', eco: 'Áurea' }} />} />
          <Route path="/aurea/notificacoes" element={session ? <AureaAccessGuard><NotificacoesAurea /></AureaAccessGuard> : <Navigate to="/login" state={{ from: '/aurea/notificacoes', eco: 'Áurea' }} />} />

          {/* ===== COMUNIDADE — Espaço de Autoconhecimento ===== */}
          <Route path="/comunidade" element={session ? <Rio /> : <Navigate to="/login" state={{ from: '/comunidade' }} />} />
          <Route path="/comunidade/jornada/:userId" element={session ? <Jornada /> : <Navigate to="/login" state={{ from: '/comunidade' }} />} />
          <Route path="/comunidade/circulos" element={session ? <Circulos /> : <Navigate to="/login" state={{ from: '/comunidade' }} />} />
          <Route path="/comunidade/fogueira" element={session ? <Fogueira /> : <Navigate to="/login" state={{ from: '/comunidade' }} />} />
          <Route path="/comunidade/sussurros" element={session ? <Sussurros /> : <Navigate to="/login" state={{ from: '/comunidade' }} />} />

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
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
