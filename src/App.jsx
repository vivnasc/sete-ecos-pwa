import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isSessionCoach } from './lib/coach'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { I18nProvider } from './contexts/I18nContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'

// ===== PÁGINAS PRINCIPAIS (eager — carregam sempre) =====
import Home from './pages/Home'
import Login from './pages/Login'
import ComingSoon from './pages/ComingSoon'
import Auth from './components/Auth'
import MarketingDashboard from './pages/MarketingDashboard'
const CatalogoPDF = lazy(() => import('./pages/CatalogoPDF'))

// ===== LOADING FALLBACK ACESSÍVEL =====
function LoadingFallback() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span>A carregar...</span>
    </div>
  )
}

// ===== CODE SPLITTING — Lazy loading por módulo =====
// Cada Eco carrega apenas quando o utilizador navega para ele

// Páginas secundárias
const MinhaConta = lazy(() => import('./pages/MinhaConta'))
const Perfil = lazy(() => import('./pages/Perfil'))
const RecuperarPassword = lazy(() => import('./pages/RecuperarPassword'))
const Lumina = lazy(() => import('./pages/Lumina'))
const CoachDashboard = lazy(() => import('./pages/CoachDashboard'))
const CoachClienteDetalhe = lazy(() => import('./pages/CoachClienteDetalhe'))
const ChatbotTeste = lazy(() => import('./pages/ChatbotTeste'))
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'))
const LandingBundle = lazy(() => import('./pages/LandingBundle'))

// ECO 1: VITALIS (Nutrição) — ~800KB separado
const LandingVitalis = lazy(() => import('./pages/LandingVitalis'))
const PagamentoVitalis = lazy(() => import('./components/vitalis/PagamentoVitalis'))
const VitalisAccessGuard = lazy(() => import('./components/vitalis/VitalisAccessGuard'))
const VitalisIntakeComplete = lazy(() => import('./components/vitalis/VitalisIntakeComplete'))
const DashboardVitalis = lazy(() => import('./components/vitalis/DashboardVitalis'))
const CheckinDiario = lazy(() => import('./components/vitalis/CheckinDiario'))
const ReceitasBrowse = lazy(() => import('./components/vitalis/ReceitasBrowse'))
const ReceitaDetalhe = lazy(() => import('./components/vitalis/ReceitaDetalhe'))
const EspacoRetorno = lazy(() => import('./components/vitalis/EspacoRetorno'))
const PlanoAlimentar = lazy(() => import('./components/vitalis/PlanoAlimentar'))
const MealsTracker = lazy(() => import('./components/vitalis/MealsTracker'))
const RefeicoesCofig = lazy(() => import('./components/vitalis/RefeicoesCofig'))
const RelatorioSemanal = lazy(() => import('./components/vitalis/RelatorioSemanal'))
const RelatoriosHub = lazy(() => import('./components/vitalis/RelatoriosHub'))
const NotificacoesConfig = lazy(() => import('./components/vitalis/NotificacoesConfig'))
const GraficosTendencia = lazy(() => import('./components/vitalis/GraficosTendencia'))
const PerfilVitalis = lazy(() => import('./components/vitalis/PerfilVitalis'))
const ListaCompras = lazy(() => import('./components/vitalis/ListaCompras'))
const SugestoesRefeicoes = lazy(() => import('./components/vitalis/SugestoesRefeicoes'))
const ChatCoach = lazy(() => import('./components/vitalis/ChatCoach'))
const FotosProgresso = lazy(() => import('./components/vitalis/FotosProgresso'))
const DesafiosSemanais = lazy(() => import('./components/vitalis/DesafiosSemanais'))
const CalendarioRefeicoes = lazy(() => import('./components/vitalis/CalendarioRefeicoes'))
const GuiaUtilizador = lazy(() => import('./components/vitalis/GuiaUtilizador'))
const GuiaRamadao = lazy(() => import('./components/vitalis/GuiaRamadao'))
const TreinosVitalis = lazy(() => import('./components/vitalis/TreinosVitalis'))
const PlanoHTML = lazy(() => import('./pages/PlanoHTML'))

// COMUNIDADE — Espaço de Autoconhecimento
const HubComunidade = lazy(() => import('./components/comunidade/HubComunidade'))
const Rio = lazy(() => import('./components/comunidade/Rio'))
const Jornada = lazy(() => import('./components/comunidade/Jornada'))
const Circulos = lazy(() => import('./components/comunidade/Circulos'))
const Fogueira = lazy(() => import('./components/comunidade/Fogueira'))
const Sussurros = lazy(() => import('./components/comunidade/Sussurros'))

// ECO 3: SERENA (Emoção & Fluidez)
const LandingSerena = lazy(() => import('./pages/LandingSerena'))
const SerenaAccessGuard = lazy(() => import('./components/serena/SerenaAccessGuard'))
const DashboardSerena = lazy(() => import('./components/serena/DashboardSerena'))
const DiarioEmocional = lazy(() => import('./components/serena/DiarioEmocional'))
const SOSEmocional = lazy(() => import('./components/serena/SOSEmocional'))
const RespiracaoGuiada = lazy(() => import('./components/serena/RespiracaoGuiada'))
const FluidezPraticas = lazy(() => import('./components/serena/FluidezPraticas'))
const RituaisLibertacao = lazy(() => import('./components/serena/RituaisLibertacao'))
const ChatSerena = lazy(() => import('./components/serena/ChatSerena'))
const InsightsSerena = lazy(() => import('./components/serena/InsightsSerena'))
const BibliotecaEmocoes = lazy(() => import('./components/serena/BibliotecaEmocoes'))
const PerfilSerena = lazy(() => import('./components/serena/PerfilSerena'))
const NotificacoesSerena = lazy(() => import('./components/serena/NotificacoesSerena'))

// ECO 4: IGNIS (Vontade & Direccao Consciente)
const LandingIgnis = lazy(() => import('./pages/LandingIgnis'))
const IgnisAccessGuard = lazy(() => import('./components/ignis/IgnisAccessGuard'))
const DashboardIgnis = lazy(() => import('./components/ignis/DashboardIgnis'))
const EscolhasConscientes = lazy(() => import('./components/ignis/EscolhasConscientes'))
const FocoConsciente = lazy(() => import('./components/ignis/FocoConsciente'))
const RastreadorDispersao = lazy(() => import('./components/ignis/RastreadorDispersao'))
const ExercicioCorte = lazy(() => import('./components/ignis/ExercicioCorte'))
const BussolaValores = lazy(() => import('./components/ignis/BussolaValores'))
const DiarioConquistas = lazy(() => import('./components/ignis/DiarioConquistas'))
const DesafiosFogo = lazy(() => import('./components/ignis/DesafiosFogo'))
const PlanoAccao = lazy(() => import('./components/ignis/PlanoAccao'))
const ChatIgnis = lazy(() => import('./components/ignis/ChatIgnis'))
const InsightsIgnis = lazy(() => import('./components/ignis/InsightsIgnis'))
const PerfilIgnis = lazy(() => import('./components/ignis/PerfilIgnis'))
const NotificacoesIgnis = lazy(() => import('./components/ignis/NotificacoesIgnis'))

// ECO 5: VENTIS (Energia & Ritmo)
const LandingVentis = lazy(() => import('./pages/LandingVentis'))
const VentisAccessGuard = lazy(() => import('./components/ventis/VentisAccessGuard'))
const DashboardVentis = lazy(() => import('./components/ventis/DashboardVentis'))
const MonitorEnergia = lazy(() => import('./components/ventis/MonitorEnergia'))
const RotinasBuilder = lazy(() => import('./components/ventis/RotinasBuilder'))
const PausasConscientes = lazy(() => import('./components/ventis/PausasConscientes'))
const MovimentoFlow = lazy(() => import('./components/ventis/MovimentoFlow'))
const NaturezaConexao = lazy(() => import('./components/ventis/NaturezaConexao'))
const RitmoAnalise = lazy(() => import('./components/ventis/RitmoAnalise'))
const MapaPicosVales = lazy(() => import('./components/ventis/MapaPicosVales'))
const DetectorBurnout = lazy(() => import('./components/ventis/DetectorBurnout'))
const RituaisVsRotinas = lazy(() => import('./components/ventis/RituaisVsRotinas'))
const ChatVentis = lazy(() => import('./components/ventis/ChatVentis'))
const InsightsVentis = lazy(() => import('./components/ventis/InsightsVentis'))
const PerfilVentis = lazy(() => import('./components/ventis/PerfilVentis'))
const NotificacoesVentis = lazy(() => import('./components/ventis/NotificacoesVentis'))

// ECO 2: ÁUREA (Valor & Presença)
const LandingAurea = lazy(() => import('./pages/LandingAurea'))
const PagamentoAurea = lazy(() => import('./components/aurea/PagamentoAurea'))
const AureaAccessGuard = lazy(() => import('./components/aurea/AureaAccessGuard'))
const AureaOnboarding = lazy(() => import('./components/aurea/Onboarding'))
const DashboardAurea = lazy(() => import('./components/aurea/DashboardAurea'))
const MicroPraticas = lazy(() => import('./components/aurea/MicroPraticas'))
const EspelhoRoupa = lazy(() => import('./components/aurea/EspelhoRoupa'))
const CarteiraMerecimento = lazy(() => import('./components/aurea/CarteiraMerecimento'))
const DiarioMerecimento = lazy(() => import('./components/aurea/DiarioMerecimento'))
const InsightsSemanal = lazy(() => import('./components/aurea/InsightsSemanal'))
const PerfilAurea = lazy(() => import('./components/aurea/PerfilAurea'))
const ChatAurea = lazy(() => import('./components/aurea/ChatAurea'))
const AnalisePadroes = lazy(() => import('./components/aurea/AnalisePadroes'))
const AudioMeditacoes = lazy(() => import('./components/aurea/AudioMeditacoes'))
const NotificacoesAurea = lazy(() => import('./components/aurea/NotificacoesAurea'))

// ===== HELPER: Rota protegida com lazy guard =====
function ProtectedRoute({ children, guard: Guard, eco }) {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/login" state={{ from: window.location.pathname, eco }} />
  }
  if (Guard) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Guard>{children}</Guard>
      </Suspense>
    )
  }
  return children
}

function VitalisRoute({ children }) {
  return (
    <ProtectedRoute guard={VitalisAccessGuard} eco="Vitalis">
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ProtectedRoute>
  )
}

function AureaRoute({ children }) {
  return (
    <ProtectedRoute guard={AureaAccessGuard} eco="Áurea">
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ProtectedRoute>
  )
}

function SerenaRoute({ children }) {
  return (
    <ProtectedRoute guard={SerenaAccessGuard} eco="Serena">
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ProtectedRoute>
  )
}

function IgnisRoute({ children }) {
  return (
    <ProtectedRoute guard={IgnisAccessGuard} eco="Ignis">
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ProtectedRoute>
  )
}

function VentisRoute({ children }) {
  return (
    <ProtectedRoute guard={VentisAccessGuard} eco="Ventis">
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ProtectedRoute>
  )
}

function AuthRoute({ children, from }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" state={{ from }} />
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

// ===== ROTAS =====
function AppRoutes() {
  const { session, loading, isCoachUser } = useAuth()

  if (loading) return <LoadingFallback />

  return (
    <>
      <main id="main-content" role="main">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* ===== ROTAS PÚBLICAS ===== */}
            <Route path="/" element={isCoachUser ? <Navigate to="/coach" replace /> : <Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/landing" element={<Navigate to="/" />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/bundle" element={<LandingBundle />} />

            {/* ===== CONTA E PERFIL ===== */}
            <Route path="/conta" element={<AuthRoute from="/conta"><MinhaConta /></AuthRoute>} />
            <Route path="/perfil" element={<AuthRoute from="/perfil"><Perfil /></AuthRoute>} />

            {/* ===== LUMINA - Diagnóstico Gratuito (aberto a todos) ===== */}
            <Route path="/lumina" element={<Lumina />} />

            {/* ===== ECO 1: VITALIS - Nutrição ===== */}
            <Route path="/vitalis" element={<LandingVitalis />} />
            <Route path="/vitalis/login" element={<Navigate to="/login" state={{ from: '/vitalis/pagamento', eco: 'Vitalis' }} />} />
            <Route path="/vitalis/pagamento" element={<PagamentoVitalis />} />
            <Route path="/vitalis/receita/:id" element={<ReceitaDetalhe />} />
            <Route path="/vitalis/plano-pdf" element={<PlanoHTML />} />
            <Route path="/vitalis/intake" element={<VitalisRoute><VitalisIntakeComplete /></VitalisRoute>} />
            <Route path="/vitalis/dashboard" element={<VitalisRoute><DashboardVitalis /></VitalisRoute>} />
            <Route path="/vitalis/checkin" element={<VitalisRoute><CheckinDiario /></VitalisRoute>} />
            <Route path="/vitalis/receitas" element={<VitalisRoute><ReceitasBrowse /></VitalisRoute>} />
            <Route path="/vitalis/espaco-retorno" element={<VitalisRoute><EspacoRetorno /></VitalisRoute>} />
            <Route path="/vitalis/plano" element={<VitalisRoute><PlanoAlimentar /></VitalisRoute>} />
            <Route path="/vitalis/meals" element={<VitalisRoute><MealsTracker /></VitalisRoute>} />
            <Route path="/vitalis/refeicoes-config" element={<VitalisRoute><RefeicoesCofig /></VitalisRoute>} />
            <Route path="/vitalis/relatorios" element={<VitalisRoute><RelatoriosHub /></VitalisRoute>} />
            <Route path="/vitalis/relatorio-semanal" element={<VitalisRoute><RelatorioSemanal /></VitalisRoute>} />
            <Route path="/vitalis/notificacoes" element={<VitalisRoute><NotificacoesConfig /></VitalisRoute>} />
            <Route path="/vitalis/tendencias" element={<VitalisRoute><GraficosTendencia /></VitalisRoute>} />
            <Route path="/vitalis/perfil" element={<VitalisRoute><PerfilVitalis /></VitalisRoute>} />
            <Route path="/vitalis/lista-compras" element={<VitalisRoute><ListaCompras /></VitalisRoute>} />
            <Route path="/vitalis/sugestoes" element={<VitalisRoute><SugestoesRefeicoes /></VitalisRoute>} />
            <Route path="/vitalis/chat" element={<VitalisRoute><ChatCoach /></VitalisRoute>} />
            <Route path="/vitalis/fotos-progresso" element={<VitalisRoute><FotosProgresso /></VitalisRoute>} />
            <Route path="/vitalis/desafios" element={<VitalisRoute><DesafiosSemanais /></VitalisRoute>} />
            <Route path="/vitalis/calendario" element={<VitalisRoute><CalendarioRefeicoes /></VitalisRoute>} />
            <Route path="/vitalis/guia" element={<VitalisRoute><GuiaUtilizador /></VitalisRoute>} />
            <Route path="/vitalis/guia-ramadao" element={<VitalisRoute><GuiaRamadao /></VitalisRoute>} />
            <Route path="/vitalis/treinos" element={<VitalisRoute><TreinosVitalis /></VitalisRoute>} />

            {/* ===== ECO 2: ÁUREA - Valor & Presença ===== */}
            <Route path="/aurea" element={<LandingAurea />} />
            <Route path="/aurea/login" element={<Navigate to="/login" state={{ from: '/aurea/pagamento', eco: 'Áurea' }} />} />
            <Route path="/aurea/pagamento" element={<PagamentoAurea />} />
            <Route path="/aurea/onboarding" element={<AureaRoute><AureaOnboarding /></AureaRoute>} />
            <Route path="/aurea/dashboard" element={<AureaRoute><DashboardAurea /></AureaRoute>} />
            <Route path="/aurea/praticas" element={<AureaRoute><MicroPraticas /></AureaRoute>} />
            <Route path="/aurea/roupa" element={<AureaRoute><EspelhoRoupa /></AureaRoute>} />
            <Route path="/aurea/carteira" element={<AureaRoute><CarteiraMerecimento /></AureaRoute>} />
            <Route path="/aurea/diario" element={<AureaRoute><DiarioMerecimento /></AureaRoute>} />
            <Route path="/aurea/insights" element={<AureaRoute><InsightsSemanal /></AureaRoute>} />
            <Route path="/aurea/perfil" element={<AureaRoute><PerfilAurea /></AureaRoute>} />
            <Route path="/aurea/chat" element={<AureaRoute><ChatAurea /></AureaRoute>} />
            <Route path="/aurea/padroes" element={<AureaRoute><AnalisePadroes /></AureaRoute>} />
            <Route path="/aurea/audios" element={<AureaRoute><AudioMeditacoes /></AureaRoute>} />
            <Route path="/aurea/meditacoes" element={<AureaRoute><AudioMeditacoes /></AureaRoute>} />
            <Route path="/aurea/notificacoes" element={<AureaRoute><NotificacoesAurea /></AureaRoute>} />

            {/* ===== COMUNIDADE ===== */}
            <Route path="/comunidade" element={<AuthRoute from="/comunidade"><HubComunidade /></AuthRoute>} />
            <Route path="/comunidade/rio" element={<AuthRoute from="/comunidade"><Rio /></AuthRoute>} />
            <Route path="/comunidade/jornada/:userId" element={<AuthRoute from="/comunidade"><Jornada /></AuthRoute>} />
            <Route path="/comunidade/circulos" element={<AuthRoute from="/comunidade"><Circulos /></AuthRoute>} />
            <Route path="/comunidade/fogueira" element={<AuthRoute from="/comunidade"><Fogueira /></AuthRoute>} />
            <Route path="/comunidade/sussurros" element={<AuthRoute from="/comunidade"><Sussurros /></AuthRoute>} />

            {/* ===== ECO 3: SERENA - Emoção & Fluidez ===== */}
            <Route path="/serena" element={<LandingSerena />} />
            <Route path="/serena/dashboard" element={<SerenaRoute><DashboardSerena /></SerenaRoute>} />
            <Route path="/serena/diario" element={<SerenaRoute><DiarioEmocional /></SerenaRoute>} />
            <Route path="/serena/sos" element={<SOSEmocional />} />
            <Route path="/serena/respiracao" element={<SerenaRoute><RespiracaoGuiada /></SerenaRoute>} />
            <Route path="/serena/praticas" element={<SerenaRoute><FluidezPraticas /></SerenaRoute>} />
            <Route path="/serena/rituais" element={<SerenaRoute><RituaisLibertacao /></SerenaRoute>} />
            <Route path="/serena/chat" element={<SerenaRoute><ChatSerena /></SerenaRoute>} />
            <Route path="/serena/insights" element={<SerenaRoute><InsightsSerena /></SerenaRoute>} />
            <Route path="/serena/biblioteca" element={<SerenaRoute><BibliotecaEmocoes /></SerenaRoute>} />
            <Route path="/serena/perfil" element={<SerenaRoute><PerfilSerena /></SerenaRoute>} />
            <Route path="/serena/notificacoes" element={<SerenaRoute><NotificacoesSerena /></SerenaRoute>} />

            {/* ===== ECO 4: IGNIS - Vontade & Direccao Consciente ===== */}
            <Route path="/ignis" element={<LandingIgnis />} />
            <Route path="/ignis/dashboard" element={<IgnisRoute><DashboardIgnis /></IgnisRoute>} />
            <Route path="/ignis/escolhas" element={<IgnisRoute><EscolhasConscientes /></IgnisRoute>} />
            <Route path="/ignis/foco" element={<IgnisRoute><FocoConsciente /></IgnisRoute>} />
            <Route path="/ignis/dispersao" element={<IgnisRoute><RastreadorDispersao /></IgnisRoute>} />
            <Route path="/ignis/corte" element={<IgnisRoute><ExercicioCorte /></IgnisRoute>} />
            <Route path="/ignis/bussola" element={<IgnisRoute><BussolaValores /></IgnisRoute>} />
            <Route path="/ignis/conquistas" element={<IgnisRoute><DiarioConquistas /></IgnisRoute>} />
            <Route path="/ignis/desafios" element={<IgnisRoute><DesafiosFogo /></IgnisRoute>} />
            <Route path="/ignis/plano" element={<IgnisRoute><PlanoAccao /></IgnisRoute>} />
            <Route path="/ignis/chat" element={<IgnisRoute><ChatIgnis /></IgnisRoute>} />
            <Route path="/ignis/insights" element={<IgnisRoute><InsightsIgnis /></IgnisRoute>} />
            <Route path="/ignis/perfil" element={<IgnisRoute><PerfilIgnis /></IgnisRoute>} />
            <Route path="/ignis/notificacoes" element={<IgnisRoute><NotificacoesIgnis /></IgnisRoute>} />

            {/* ===== ECO 5: VENTIS - Energia & Ritmo ===== */}
            <Route path="/ventis" element={<LandingVentis />} />
            <Route path="/ventis/dashboard" element={<VentisRoute><DashboardVentis /></VentisRoute>} />
            <Route path="/ventis/energia" element={<VentisRoute><MonitorEnergia /></VentisRoute>} />
            <Route path="/ventis/rotinas" element={<VentisRoute><RotinasBuilder /></VentisRoute>} />
            <Route path="/ventis/pausas" element={<VentisRoute><PausasConscientes /></VentisRoute>} />
            <Route path="/ventis/movimento" element={<VentisRoute><MovimentoFlow /></VentisRoute>} />
            <Route path="/ventis/natureza" element={<VentisRoute><NaturezaConexao /></VentisRoute>} />
            <Route path="/ventis/ritmo" element={<VentisRoute><RitmoAnalise /></VentisRoute>} />
            <Route path="/ventis/picos" element={<VentisRoute><MapaPicosVales /></VentisRoute>} />
            <Route path="/ventis/burnout" element={<VentisRoute><DetectorBurnout /></VentisRoute>} />
            <Route path="/ventis/rituais" element={<VentisRoute><RituaisVsRotinas /></VentisRoute>} />
            <Route path="/ventis/chat" element={<VentisRoute><ChatVentis /></VentisRoute>} />
            <Route path="/ventis/insights" element={<VentisRoute><InsightsVentis /></VentisRoute>} />
            <Route path="/ventis/perfil" element={<VentisRoute><PerfilVentis /></VentisRoute>} />
            <Route path="/ventis/notificacoes" element={<VentisRoute><NotificacoesVentis /></VentisRoute>} />

            {/* ===== ECOS 6-7: Em Breve ===== */}
            <Route path="/ecoa" element={<ComingSoon />} />
            <Route path="/imago" element={<ComingSoon />} />
            <Route path="/aurora" element={<ComingSoon />} />

            {/* ===== ADMIN / COACH ===== */}
            <Route path="/coach" element={
              isSessionCoach(session)
                ? <CoachDashboard />
                : <Navigate to="/" />
            } />

            <Route path="/coach/cliente/:userId" element={
              isSessionCoach(session)
                ? <CoachClienteDetalhe />
                : <Navigate to="/" />
            } />

            <Route path="/coach/marketing" element={
              isSessionCoach(session)
                ? <MarketingDashboard />
                : <Navigate to="/" />
            } />

            <Route path="/catalogo" element={<CatalogoPDF />} />

            <Route path="/coach/analytics" element={
              isSessionCoach(session)
                ? <AnalyticsDashboard />
                : <Navigate to="/" />
            } />

            <Route path="/coach/chatbot-teste" element={
              isSessionCoach(session)
                ? <ChatbotTeste />
                : <Navigate to="/" />
            } />

            {/* ===== 404 ===== */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      <Navigation />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
            <div className="app">
              <AppRoutes />
            </div>
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
