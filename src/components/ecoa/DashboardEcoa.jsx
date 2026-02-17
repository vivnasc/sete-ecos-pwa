import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { ECOA_GAMIFICATION } from '../../lib/ecoa/gamificacao'
import ModuleDashboardShell from '../shared/ModuleDashboardShell'
import { GamificationBadge } from '../shared/GamificationSystem'

/**
 * ECOA — Dashboard Principal
 * Modulo de Voz & Desbloqueio do Silencio (Chakra Vishuddha)
 * Tema: teal-blue (#4A90A4), fundo escuro (#1a2a34)
 * Moeda: Ecos 🔊
 *
 * ECOA e sobre recuperar a voz — mapear onde te calas,
 * porque te calas, e progressivamente soltar verdades guardadas.
 */

const ECOA_COLOR = '#4A90A4'
const ECOA_DARK = '#1a2a34'

export default function DashboardEcoa() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Gamificacao
  const [ecos, setEcos] = useState(0)
  const [streak, setStreak] = useState(0)
  const [nivel, setNivel] = useState('')

  // Mapa de silenciamento
  const [silenciamentoMapeado, setSilenciamentoMapeado] = useState(false)
  const [zonasCount, setZonasCount] = useState(0)

  // Micro-Voz
  const [semanaMicroVoz, setSemanaMicroVoz] = useState(0)

  // Stats
  const [vozesRecuperadas, setVozesRecuperadas] = useState(0)
  const [cartasEscritas, setCartasEscritas] = useState(0)
  const [exerciciosTotal, setExerciciosTotal] = useState(0)

  // ===== Carregar dados =====
  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/ecoa/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/ecoa/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Buscar dados do cliente Ecoa
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('ecos_total, streak_dias, nivel, silenciamento_mapeado, semana_micro_voz')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData) {
        setEcos(clientData.ecos_total || 0)
        setStreak(clientData.streak_dias || 0)
        setNivel(clientData.nivel || 'Sussurro')
        setSilenciamentoMapeado(clientData.silenciamento_mapeado || false)
        setSemanaMicroVoz(clientData.semana_micro_voz || 0)
      }

      // Mapa de silenciamento — buscar zonas para mini-resumo
      if (clientData?.silenciamento_mapeado) {
        const { data: mapaData } = await supabase
          .from('ecoa_silenciamento')
          .select('zonas')
          .eq('user_id', userData.id)
          .maybeSingle()

        if (mapaData?.zonas) {
          try {
            const zonas = typeof mapaData.zonas === 'string'
              ? JSON.parse(mapaData.zonas)
              : mapaData.zonas
            setZonasCount(Array.isArray(zonas) ? zonas.length : 0)
          } catch {
            setZonasCount(0)
          }
        }
      }

      // Stats — Vozes recuperadas
      const { count: vozesCount } = await supabase
        .from('ecoa_voz_recuperada')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setVozesRecuperadas(vozesCount || 0)

      // Stats — Cartas escritas
      const { count: cartasCount } = await supabase
        .from('ecoa_cartas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setCartasEscritas(cartasCount || 0)

      // Stats — Exercicios
      const { count: exerciciosCount } = await supabase
        .from('ecoa_exercicios_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setExerciciosTotal(exerciciosCount || 0)

    } catch (error) {
      console.error('DashboardEcoa: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // ===== Saudacao contextual — tematica de voz/silencio =====
  function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return 'Bom dia. Que voz acorda contigo hoje?'
    if (hora < 18) return 'A tarde e um bom momento para falar verdade'
    return 'A noite guarda espaco para o que nao foi dito'
  }

  // ===== Loading state =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${ECOA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4" style={{ animation: 'pulse 2s ease-in-out infinite, ecoaSway 3s ease-in-out infinite' }}>
            {'\u{1F50A}'}
          </div>
          <p className="text-white/60 text-sm">A ouvir a tua voz...</p>
          <style>{`
            @keyframes ecoaSway {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // ===== Quick Actions =====
  const quickActions = [
    { label: 'Mapa', to: '/ecoa/mapa', icon: '\u{1F5FA}\uFE0F', subtitle: 'Mapa de silenciamento' },
    { label: 'Micro-Voz', to: '/ecoa/micro-voz', icon: '\u{1F5E3}\uFE0F', subtitle: 'Exercicios de voz' },
    { label: 'Biblioteca', to: '/ecoa/biblioteca', icon: '\u{1F4DA}', subtitle: 'Frases dificeis' },
    { label: 'Voz Recuperada', to: '/ecoa/voz-recuperada', icon: '\u{1F4AC}', subtitle: 'Registar momentos' },
    { label: 'Diario', to: '/ecoa/diario', icon: '\u{1F4D6}', subtitle: 'Diario de voz' },
    { label: 'Cartas', to: '/ecoa/cartas', icon: '\u{2709}\uFE0F', subtitle: 'Cartas nao enviadas' },
    { label: 'Afirmacoes', to: '/ecoa/afirmacoes', icon: '\u{2728}', subtitle: 'Afirmacoes de voz' },
    { label: 'Exercicios', to: '/ecoa/exercicios', icon: '\u{270D}\uFE0F', subtitle: 'Exercicios de expressao' },
    { label: 'Comunicacao', to: '/ecoa/comunicacao', icon: '\u{1F4CE}', subtitle: 'Comunicacao assertiva' },
    { label: 'Coach Ecoa', to: '/ecoa/chat', icon: '\u{1F4AC}', subtitle: 'Fala comigo' }
  ]

  // ===== Stats =====
  const stats = [
    { label: 'Vozes Recuperadas', value: vozesRecuperadas, icon: '\u{1F5E3}\uFE0F' },
    { label: 'Cartas Escritas', value: cartasEscritas, icon: '\u{2709}\uFE0F' },
    { label: 'Exercicios', value: exerciciosTotal, icon: '\u{270D}\uFE0F' }
  ]

  // ===== Render =====
  return (
    <ModuleDashboardShell
      eco="ecoa"
      userName={userName?.split(' ')[0]}
      greeting={getSaudacao()}
      stats={stats}
      quickActions={quickActions}
      gamification={{
        icon: ECOA_GAMIFICATION.currency.icon,
        total: ecos,
        currency: ECOA_GAMIFICATION.currency.plural,
        level: nivel || 'Sussurro',
        streak: streak
      }}
    >
      {/* Mapa de Silenciamento */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: `${ECOA_COLOR}10`,
          borderColor: `${ECOA_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Mapa de Silenciamento
        </h2>

        {!silenciamentoMapeado ? (
          <div className="text-center py-3">
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              Onde te calas? Com quem? Que verdades guardam a tua garganta?
              <br />
              O primeiro passo e mapear o silencio.
            </p>
            <Link
              to="/ecoa/mapa"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
              style={{ background: ECOA_COLOR }}
            >
              <span>{'\u{1F5FA}\uFE0F'}</span>
              <span>Mapear o meu silencio</span>
            </Link>
            <p className="text-white/30 text-xs mt-3">
              +15 Ecos ao completar
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${ECOA_COLOR}30` }}
              >
                <span className="text-lg">{'\u{2705}'}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Mapa {g('completo', 'completa')}</p>
                <p className="text-white/50 text-xs">
                  {zonasCount} {zonasCount === 1 ? 'zona' : 'zonas'} de silencio {zonasCount === 1 ? 'mapeada' : 'mapeadas'}
                </p>
              </div>
            </div>
            <Link
              to="/ecoa/mapa"
              className="block text-center text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ color: ECOA_COLOR, background: `${ECOA_COLOR}20` }}
            >
              Ver e actualizar mapa
            </Link>
          </div>
        )}
      </div>

      {/* Micro-Voz — Progresso semanal */}
      <div
        className="mt-5 rounded-2xl border p-5"
        style={{
          background: `${ECOA_COLOR}10`,
          borderColor: `${ECOA_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Micro-Voz
        </h2>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white text-sm font-medium">
              Semana {semanaMicroVoz > 0 ? semanaMicroVoz : 1} de 8
            </p>
            <p className="text-white/50 text-xs">
              {semanaMicroVoz === 0
                ? 'Ainda nao comecaste — cada voz conta'
                : semanaMicroVoz >= 8
                  ? g('Programa completo! Es um exemplo de coragem.', 'Programa completo! Es um exemplo de coragem.')
                  : `${g('Continua focado', 'Continua focada')} — a tua voz fica mais forte a cada semana`
              }
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: `${ECOA_COLOR}25`, color: ECOA_COLOR }}
          >
            {semanaMicroVoz}/8
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min((semanaMicroVoz / 8) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${ECOA_COLOR}, ${ECOA_COLOR}cc)`
            }}
          />
        </div>

        <Link
          to="/ecoa/micro-voz"
          className="block text-center text-sm px-4 py-2.5 rounded-lg transition-colors font-medium"
          style={{ color: '#fff', background: ECOA_COLOR }}
        >
          {semanaMicroVoz === 0 ? 'Comecar Micro-Voz' : 'Continuar exercicios'}
        </Link>
      </div>

      {/* Mensagem motivacional */}
      <div
        className="mt-5 rounded-2xl border p-4"
        style={{
          background: `${ECOA_COLOR}08`,
          borderColor: `${ECOA_COLOR}15`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{'\u{1F50A}'}</span>
          <div>
            <p className="text-white/80 text-sm italic leading-relaxed">
              "A tua voz nao desapareceu — ficou guardada. Cada palavra que soltas e uma parte de ti que voltas a encontrar."
            </p>
            <p className="text-white/30 text-xs mt-2">
              — O teu espaco de voz e verdade
            </p>
          </div>
        </div>
      </div>

      {/* Gamificacao completa (badge) */}
      <div className="mt-5">
        <GamificationBadge
          eco="ecoa"
          config={ECOA_GAMIFICATION}
          total={ecos}
          streak={streak}
        />
      </div>

      {/* Link para ver mais */}
      <div className="mt-5 text-center">
        <Link
          to="/ecoa/biblioteca"
          className="text-sm transition-colors"
          style={{ color: `${ECOA_COLOR}aa` }}
        >
          Explorar frases dificeis e exercicios {'\u{2192}'}
        </Link>
      </div>
    </ModuleDashboardShell>
  )
}
