import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import { IGNIS_GAMIFICATION } from '../../lib/ignis/gamificacao'
import ModuleDashboardShell from '../shared/ModuleDashboardShell'
import { GamificationBadge } from '../shared/GamificationSystem'
import PodcastPlayer from '../shared/PodcastPlayer'

/**
 * IGNIS — Dashboard Principal
 * Modulo de Vontade & Direccao Consciente (Chakra Manipura)
 * Tema: laranja-fogo (#C1634A), fundo escuro (#2e1a14)
 * Moeda: Chamas, Elemento: Fogo
 *
 * IGNIS nao e sobre produtividade — e sobre escolha consciente,
 * cortar o que dispersa e alinhar com valores.
 */

const IGNIS_COLOR = '#C1634A'
const IGNIS_DARK = '#2e1a14'

export default function DashboardIgnis() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Gamificacao
  const [chamas, setChamas] = useState(0)
  const [streak, setStreak] = useState(0)
  const [nivel, setNivel] = useState('')

  // Escolha do dia
  const [escolhasHoje, setEscolhasHoje] = useState(null)

  // Stats
  const [escolhasTotal, setEscolhasTotal] = useState(0)
  const [focoSemana, setFocoSemana] = useState(0)
  const [dispersoesCortadas, setDispersoesCortadas] = useState(0)

  const hoje = new Date().toISOString().split('T')[0]

  // ===== Carregar dados =====
  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/ignis/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/ignis/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Buscar dados do cliente Ignis
      const { data: clientData } = await supabase
        .from('ignis_clients')
        .select('chamas_total, streak_dias, nivel')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData) {
        setChamas(clientData.chamas_total || 0)
        setStreak(clientData.streak_dias || 0)
        setNivel(clientData.nivel || 'Faisca')
      }

      // Escolhas de hoje
      const { data: escolhasHojeData } = await supabase
        .from('ignis_escolhas')
        .select('id, escolha, concluida, created_at')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .order('created_at', { ascending: true })

      if (escolhasHojeData && escolhasHojeData.length > 0) {
        setEscolhasHoje(escolhasHojeData)
      }

      // Stats: total de escolhas conscientes
      const { count: escolhasCount } = await supabase
        .from('ignis_escolhas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setEscolhasTotal(escolhasCount || 0)

      // Stats: sessoes de foco esta semana
      const inicioSemana = getInicioSemana()

      const { count: focoCount } = await supabase
        .from('ignis_foco_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)

      setFocoSemana(focoCount || 0)

      // Stats: dispersoes cortadas (onde disse sim mas queria nao)
      const { count: dispersoesCount } = await supabase
        .from('ignis_dispersao_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .eq('disse_sim_queria_nao', true)

      setDispersoesCortadas(dispersoesCount || 0)

    } catch (error) {
      console.error('DashboardIgnis: Erro ao carregar:', error)
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

  // Saudacao contextual baseada na hora — tematica de fogo
  function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return 'O fogo da manha acende-se cedo'
    if (hora < 18) return 'A tarde e para manter a brasa'
    return 'A noite e para aquecer e reflectir'
  }

  // ===== Loading state =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${IGNIS_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">{'\u{1F525}'}</div>
          <p className="text-white/60 text-sm">{t('ignis.dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  // ===== Quick Actions =====
  const quickActions = [
    { label: t('ignis.menu.choices'), to: '/ignis/escolhas', icon: '\u{1F3AF}', subtitle: t('ignis.menu.choices_sub') },
    { label: t('ignis.menu.focus'), to: '/ignis/foco', icon: '\u{1F9E0}', subtitle: t('ignis.menu.focus_sub') },
    { label: t('ignis.menu.dispersion'), to: '/ignis/dispersao', icon: '\u{1F32A}\uFE0F', subtitle: t('ignis.menu.dispersion_sub') },
    { label: t('ignis.menu.cut'), to: '/ignis/corte', icon: '\u{1F5E1}\uFE0F', subtitle: t('ignis.menu.cut_sub') },
    { label: t('ignis.menu.compass'), to: '/ignis/bussola', icon: '\u{1F9ED}', subtitle: t('ignis.menu.compass_sub') },
    { label: t('ignis.menu.achievements'), to: '/ignis/conquistas', icon: '\u{1F3C6}', subtitle: t('ignis.menu.achievements_sub') },
    { label: t('ignis.menu.challenges'), to: '/ignis/desafios', icon: '\u{1F981}', subtitle: t('ignis.menu.challenges_sub') },
    { label: t('ignis.menu.coach'), to: '/ignis/chat', icon: '\u{1F4AC}', subtitle: t('ignis.menu.coach_sub') }
  ]

  // ===== Stats =====
  const stats = [
    { label: t('ignis.stats.choices'), value: escolhasTotal, icon: '\u{1F3AF}' },
    { label: t('ignis.stats.focus'), value: focoSemana, icon: '\u{1F9E0}' },
    { label: t('ignis.stats.cut'), value: dispersoesCortadas, icon: '\u{2702}\uFE0F' }
  ]

  // ===== Render =====
  return (
    <ModuleDashboardShell
      eco="ignis"
      userName={userName?.split(' ')[0]}
      greeting={getSaudacao()}
      stats={stats}
      quickActions={quickActions}
      gamification={{
        icon: IGNIS_GAMIFICATION.currency.icon,
        total: chamas,
        currency: IGNIS_GAMIFICATION.currency.plural,
        level: nivel || t('ignis.level.faisca'),
        streak: streak
      }}
    >
      {/* Escolha do Dia */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: `${IGNIS_COLOR}10`,
          borderColor: `${IGNIS_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Escolha do Dia
        </h2>

        {escolhasHoje ? (
          /* Escolhas ja registadas */
          <div className="space-y-2">
            {escolhasHoje.map((escolha) => (
              <div
                key={escolha.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: escolha.concluida ? `${IGNIS_COLOR}20` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${escolha.concluida ? `${IGNIS_COLOR}40` : 'rgba(255,255,255,0.1)'}`
                }}
              >
                <span className="text-lg flex-shrink-0">
                  {escolha.concluida ? '\u{2705}' : '\u{1F7E0}'}
                </span>
                <p className={`text-sm flex-1 ${escolha.concluida ? 'text-white/80' : 'text-white/60'}`}>
                  {escolha.escolha}
                </p>
              </div>
            ))}
            <Link
              to="/ignis/escolhas"
              className="block text-center text-sm mt-2 px-4 py-2 rounded-lg transition-colors"
              style={{ color: IGNIS_COLOR, background: `${IGNIS_COLOR}20` }}
            >
              Ver todas as escolhas
            </Link>
          </div>
        ) : (
          /* Sem escolhas hoje — prompt */
          <div className="text-center py-4">
            <p className="text-white/60 text-sm mb-4">
              Ainda nao definiste as tuas escolhas conscientes para hoje.
            </p>
            <Link
              to="/ignis/escolhas"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
              style={{ background: IGNIS_COLOR }}
            >
              <span>{'\u{1F525}'}</span>
              <span>Definir escolhas de hoje</span>
            </Link>
            <p className="text-white/30 text-xs mt-3">
              {g('Ser intencional', 'Ser intencional')} e o primeiro passo para {g('estar alinhado', 'estar alinhada')}.
            </p>
          </div>
        )}
      </div>

      {/* Mensagem motivacional */}
      <div
        className="mt-5 rounded-2xl border p-4"
        style={{
          background: `${IGNIS_COLOR}08`,
          borderColor: `${IGNIS_COLOR}15`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{'\u{1F525}'}</span>
          <div>
            <p className="text-white/80 text-sm italic leading-relaxed">
              "A vontade nao e forca bruta. E a clareza de saber o que e teu — e a coragem de soltar o que nao e."
            </p>
            <p className="text-white/30 text-xs mt-2">
              — O teu espaco de direccao consciente
            </p>
          </div>
        </div>
      </div>

      {/* Gamificacao completa (badge) */}
      <div className="mt-5">
        <GamificationBadge
          eco="ignis"
          config={IGNIS_GAMIFICATION}
          total={chamas}
          streak={streak}
        />
      </div>

      {/* Vivianne Explica */}
      <div className="px-4 sm:px-6 mb-6">
        <PodcastPlayer eco="ignis" compact />
      </div>

      {/* Link para ver mais */}
      <div className="mt-5 text-center">
        <Link
          to="/ignis/conquistas"
          className="text-sm transition-colors"
          style={{ color: `${IGNIS_COLOR}aa` }}
        >
          {t('ignis.dashboard.see_achievements')} {'\u{2192}'}
        </Link>
      </div>
    </ModuleDashboardShell>
  )
}
