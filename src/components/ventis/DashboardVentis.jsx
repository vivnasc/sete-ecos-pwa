import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { VENTIS_GAMIFICATION } from '../../lib/ventis/gamificacao'
import ModuleDashboardShell from '../shared/ModuleDashboardShell'
import { GamificationBadge } from '../shared/GamificationSystem'

/**
 * VENTIS — Dashboard Principal
 * Modulo de Energia & Ritmo (Chakra Anahata)
 * Tema: verde (#5D9B84), fundo escuro (#1a2e24)
 * Moeda: Folhas, Elemento: Ar/Vento
 *
 * VENTIS e sobre energia consciente — mapear os picos e vales,
 * criar rotinas que respeitam o teu ritmo, e pausar quando o corpo pede.
 */

const VENTIS_COLOR = '#5D9B84'
const VENTIS_DARK = '#1a2e24'

export default function DashboardVentis() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Gamificacao
  const [folhas, setFolhas] = useState(0)
  const [streak, setStreak] = useState(0)
  const [nivel, setNivel] = useState('')

  // Energia do dia (manha/tarde/noite)
  const [energiaHoje, setEnergiaHoje] = useState([])

  // Stats semanais
  const [checkinsEnergia, setCheckinsEnergia] = useState(0)
  const [rotinasCompletadas, setRotinasCompletadas] = useState(0)
  const [pausasFeitas, setPausasFeitas] = useState(0)

  const hoje = new Date().toISOString().split('T')[0]

  // ===== Carregar dados =====
  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/ventis/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/ventis/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Buscar dados do cliente Ventis
      const { data: clientData } = await supabase
        .from('ventis_clients')
        .select('folhas_total, streak_dias, nivel')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData) {
        setFolhas(clientData.folhas_total || 0)
        setStreak(clientData.streak_dias || 0)
        setNivel(clientData.nivel || 'Semente')
      }

      // Energia de hoje (manha/tarde/noite)
      const { data: energiaHojeData } = await supabase
        .from('ventis_energia_log')
        .select('periodo, nivel_energia, created_at')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .order('created_at', { ascending: true })

      if (energiaHojeData && energiaHojeData.length > 0) {
        setEnergiaHoje(energiaHojeData)
      }

      // Stats desta semana
      const inicioSemana = getInicioSemana()

      const { count: checkinsCount } = await supabase
        .from('ventis_energia_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)

      setCheckinsEnergia(checkinsCount || 0)

      const { count: rotinasCount } = await supabase
        .from('ventis_rotinas_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)

      setRotinasCompletadas(rotinasCount || 0)

      const { count: pausasCount } = await supabase
        .from('ventis_pausas_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)

      setPausasFeitas(pausasCount || 0)

    } catch (error) {
      console.error('DashboardVentis: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [navigate, hoje])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // ===== Helpers =====
  function getInicioSemana() {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1 // Segunda como inicio
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    return monday.toISOString().split('T')[0]
  }

  // Saudacao contextual baseada na hora — tematica de ar/brisa
  function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return 'A brisa da manha traz energia fresca'
    if (hora < 18) return 'Respira... encontra o ritmo da tarde'
    return 'O vento acalma ao anoitecer'
  }

  // Periodo actual do dia
  function getPeriodoActual() {
    const hora = new Date().getHours()
    if (hora < 12) return 'manha'
    if (hora < 18) return 'tarde'
    return 'noite'
  }

  // Verificar se o periodo ja foi registado
  function periodoRegistado(periodo) {
    return energiaHoje.some(e => e.periodo === periodo)
  }

  // Obter nivel de energia de um periodo
  function getNivelEnergia(periodo) {
    const entry = energiaHoje.find(e => e.periodo === periodo)
    return entry ? entry.nivel_energia : null
  }

  // Visual de bateria baseado no nivel de energia (1-10)
  function renderBateria(nivel) {
    if (!nivel) return null
    const blocos = Math.ceil(nivel / 2) // 1-10 -> 1-5 blocos
    const cor = nivel >= 7 ? '#4ade80' : nivel >= 4 ? '#fbbf24' : '#f87171'
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="w-3 h-5 rounded-sm"
              style={{
                background: i <= blocos ? cor : 'rgba(255,255,255,0.1)',
                border: `1px solid ${i <= blocos ? cor : 'rgba(255,255,255,0.15)'}`
              }}
            />
          ))}
        </div>
        <span className="text-white/60 text-xs ml-1">{nivel}/10</span>
      </div>
    )
  }

  // ===== Loading state =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${VENTIS_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4" style={{ animation: 'pulse 2s ease-in-out infinite, spin 4s linear infinite' }}>
            {'\u{1F343}'}
          </div>
          <p className="text-white/60 text-sm">A sentir a brisa...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              25% { transform: rotate(15deg); }
              50% { transform: rotate(0deg); }
              75% { transform: rotate(-15deg); }
              100% { transform: rotate(0deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  const periodoActual = getPeriodoActual()
  const periodoActualRegistado = periodoRegistado(periodoActual)

  // Periodos do dia para display
  const periodos = [
    { id: 'manha', label: 'Manha', icon: '\u{1F305}' },
    { id: 'tarde', label: 'Tarde', icon: '\u{2600}\uFE0F' },
    { id: 'noite', label: 'Noite', icon: '\u{1F319}' }
  ]

  // ===== Quick Actions =====
  const quickActions = [
    { label: 'Energia', to: '/ventis/energia', icon: '\u{26A1}', subtitle: 'Check-in de energia' },
    { label: 'Rotinas', to: '/ventis/rotinas', icon: '\u{1F504}', subtitle: 'Rotinas do dia' },
    { label: 'Pausas', to: '/ventis/pausas', icon: '\u{1F9D8}', subtitle: 'Pausas conscientes' },
    { label: 'Movimento', to: '/ventis/movimento', icon: '\u{1F3C3}', subtitle: 'Corpo em movimento' },
    { label: 'Natureza', to: '/ventis/natureza', icon: '\u{1F33F}', subtitle: 'Conexao natural' },
    { label: 'Ritmo', to: '/ventis/ritmo', icon: '\u{1F3B5}', subtitle: 'Mapa de ritmo' },
    { label: 'Picos & Vales', to: '/ventis/picos', icon: '\u{1F4C8}', subtitle: 'Padroes de energia' },
    { label: 'Coach Ventis', to: '/ventis/chat', icon: '\u{1F4AC}', subtitle: 'Fala comigo' }
  ]

  // ===== Stats =====
  const stats = [
    { label: 'Check-ins', value: checkinsEnergia, icon: '\u{26A1}' },
    { label: 'Rotinas', value: rotinasCompletadas, icon: '\u{1F504}' },
    { label: 'Pausas', value: pausasFeitas, icon: '\u{1F9D8}' }
  ]

  // ===== Render =====
  return (
    <ModuleDashboardShell
      eco="ventis"
      userName={userName?.split(' ')[0]}
      greeting={getSaudacao()}
      stats={stats}
      quickActions={quickActions}
      gamification={{
        icon: VENTIS_GAMIFICATION.currency.icon,
        total: folhas,
        currency: VENTIS_GAMIFICATION.currency.plural,
        level: nivel || 'Semente',
        streak: streak
      }}
    >
      {/* Energia Agora */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: `${VENTIS_COLOR}10`,
          borderColor: `${VENTIS_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Energia Agora
        </h2>

        {/* Periodos do dia */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {periodos.map((p) => {
            const registado = periodoRegistado(p.id)
            const nivelEnergia = getNivelEnergia(p.id)
            const isActual = p.id === periodoActual

            return (
              <div
                key={p.id}
                className="rounded-xl p-3 text-center"
                style={{
                  background: registado
                    ? `${VENTIS_COLOR}20`
                    : isActual
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    registado
                      ? `${VENTIS_COLOR}40`
                      : isActual
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(255,255,255,0.06)'
                  }`
                }}
              >
                <span className="text-xl block mb-1">{p.icon}</span>
                <p className="text-white/70 text-xs font-medium mb-1">{p.label}</p>
                {registado ? (
                  renderBateria(nivelEnergia)
                ) : (
                  <p className="text-white/30 text-[10px]">
                    {isActual ? 'Agora' : '---'}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA ou resumo */}
        {!periodoActualRegistado ? (
          <div className="text-center">
            <Link
              to="/ventis/energia"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
              style={{ background: VENTIS_COLOR }}
            >
              <span>{'\u{1F343}'}</span>
              <span>Registar energia da {periodoActual}</span>
            </Link>
            <p className="text-white/30 text-xs mt-3">
              {g('Estar atento', 'Estar atenta')} ao teu ritmo e o primeiro passo para {g('estar equilibrado', 'estar equilibrada')}.
            </p>
          </div>
        ) : (
          <Link
            to="/ventis/energia"
            className="block text-center text-sm mt-1 px-4 py-2 rounded-lg transition-colors"
            style={{ color: VENTIS_COLOR, background: `${VENTIS_COLOR}20` }}
          >
            Ver mapa de energia completo
          </Link>
        )}
      </div>

      {/* Mensagem motivacional */}
      <div
        className="mt-5 rounded-2xl border p-4"
        style={{
          background: `${VENTIS_COLOR}08`,
          borderColor: `${VENTIS_COLOR}15`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{'\u{1F343}'}</span>
          <div>
            <p className="text-white/80 text-sm italic leading-relaxed">
              "A energia nao se forca — observa-se, respeita-se e segue-se. Como o vento, tem o seu proprio ritmo."
            </p>
            <p className="text-white/30 text-xs mt-2">
              — O teu espaco de energia consciente
            </p>
          </div>
        </div>
      </div>

      {/* Gamificacao completa (badge) */}
      <div className="mt-5">
        <GamificationBadge
          eco="ventis"
          config={VENTIS_GAMIFICATION}
          total={folhas}
          streak={streak}
        />
      </div>

      {/* Link para ver mais */}
      <div className="mt-5 text-center">
        <Link
          to="/ventis/picos"
          className="text-sm transition-colors"
          style={{ color: `${VENTIS_COLOR}aa` }}
        >
          {g('Ver padroes de energia e ritmo', 'Ver padroes de energia e ritmo')} {'\u{2192}'}
        </Link>
      </div>
    </ModuleDashboardShell>
  )
}
