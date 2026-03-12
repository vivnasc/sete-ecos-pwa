import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import { IMAGO_GAMIFICATION } from '../../lib/imago/gamificacao'
import ModuleDashboardShell from '../shared/ModuleDashboardShell'
import { GamificationBadge } from '../shared/GamificationSystem'
import PodcastPlayer from '../shared/PodcastPlayer'

/**
 * IMAGO — Dashboard Principal
 * Modulo de Identidade & Espelho (Chakra Sahasrara — Coroa)
 * Tema: roxo (#8B7BA5), fundo escuro (#1a1a2e)
 * Moeda: Estrelas, Elemento: Consciência
 */

const IMAGO_COLOR = '#8B7BA5'
const IMAGO_DARK = '#1a1a2e'

export default function DashboardImago() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Gamificacao
  const [estrelas, setEstrelas] = useState(0)
  const [streak, setStreak] = useState(0)
  const [nivel, setNivel] = useState('')

  // Reflexao do dia
  const [reflexaoHoje, setReflexaoHoje] = useState(null)

  // Stats semanais
  const [reflexoesEstaSemana, setReflexoesEstaSemana] = useState(0)
  const [meditacoesEstaSemana, setMeditacoesEstaSemana] = useState(0)

  // Estado do espelho e nomeacao
  const [espelhoCompletado, setEspelhoCompletado] = useState(false)
  const [nomeacaoActual, setNomeacaoActual] = useState('')

  const hoje = new Date().toISOString().split('T')[0]

  // ===== Carregar dados =====
  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/imago/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/imago/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Buscar dados do cliente Imago
      const { data: clientData } = await supabase
        .from('imago_clients')
        .select('estrelas_total, streak_dias, nivel, espelho_completado, nomeacao_actual')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData) {
        setEstrelas(clientData.estrelas_total || 0)
        setStreak(clientData.streak_dias || 0)
        setNivel(clientData.nivel || 'Reflexo')
        setEspelhoCompletado(clientData.espelho_completado || false)
        setNomeacaoActual(clientData.nomeacao_actual || '')
      }

      // Verificar se o espelho triplo tem essencia preenchida
      const { data: espelhoData } = await supabase
        .from('imago_espelho_triplo')
        .select('essencia')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (espelhoData?.essencia) {
        setReflexaoHoje(espelhoData.essencia)
      }

      // Stats desta semana
      const inicioSemana = getInicioSemana()

      const { count: reflexoesCount } = await supabase
        .from('imago_espelho_triplo')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('created_at', inicioSemana)

      setReflexoesEstaSemana(reflexoesCount || 0)

      const { count: meditacoesCount } = await supabase
        .from('imago_meditacoes_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('created_at', inicioSemana)

      setMeditacoesEstaSemana(meditacoesCount || 0)

    } catch (error) {
      console.error('DashboardImago: Erro ao carregar:', error)
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

  // Saudacao contextual baseada na hora
  function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return t('imago.dashboard.greeting_morning')
    if (hora < 18) return 'O que te define nesta tarde?'
    return 'O que descobriste sobre ti hoje?'
  }

  // ===== Loading state =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${IMAGO_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⭐</div>
          <p className="text-white/60 text-sm">{t('imago.dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  // ===== Quick Actions =====
  const quickActions = [
    { label: t('imago.menu.triple_mirror'), to: '/imago/espelho', icon: '\u{1FA9E}', subtitle: t('imago.menu.triple_mirror_sub') },
    { label: t('imago.menu.archaeology'), to: '/imago/arqueologia', icon: '\u26CF\uFE0F', subtitle: t('imago.menu.archaeology_sub') },
    { label: t('imago.menu.naming'), to: '/imago/nomeacao', icon: '\u{1F4DC}', subtitle: t('imago.menu.naming_sub') },
    { label: t('imago.menu.identity_map'), to: '/imago/mapa', icon: '\u{1F5FA}\uFE0F', subtitle: t('imago.menu.identity_map_sub') },
    { label: t('imago.menu.core_values'), to: '/imago/valores', icon: '\u{1F4A0}', subtitle: t('imago.menu.core_values_sub') },
    { label: t('imago.menu.clothing'), to: '/imago/roupa', icon: '\u{1F457}', subtitle: t('imago.menu.clothing_sub') },
    { label: t('imago.menu.meditations'), to: '/imago/meditacoes', icon: '\u{1F9D8}', subtitle: t('imago.menu.meditations_sub') },
    { label: t('imago.menu.future_vision'), to: '/imago/visao', icon: '\u{1F52E}', subtitle: t('imago.menu.future_vision_sub') },
    { label: t('imago.menu.timeline'), to: '/imago/timeline', icon: '\u{1F4CA}', subtitle: t('imago.menu.timeline_sub') },
    { label: t('imago.menu.integration'), to: '/imago/integracao', icon: '\u{1F300}', subtitle: t('imago.menu.integration_sub') }
  ]

  // ===== Stats =====
  const stats = [
    { label: t('imago.stats.reflections'), value: reflexoesEstaSemana, icon: '\u{1FA9E}' },
    { label: t('imago.stats.meditations'), value: meditacoesEstaSemana, icon: '\u{1F9D8}' },
    { label: t('imago.stats.streak'), value: `${streak}d`, icon: '\u{1F525}' }
  ]

  // ===== Render =====
  return (
    <ModuleDashboardShell
      eco="imago"
      userName={userName?.split(' ')[0]}
      greeting={getSaudacao()}
      stats={stats}
      quickActions={quickActions}
      gamification={{
        icon: IMAGO_GAMIFICATION.currency.icon,
        total: estrelas,
        currency: IMAGO_GAMIFICATION.currency.plural,
        level: nivel || t('imago.level.reflexo'),
        streak: streak
      }}
    >
      {/* Quem es tu hoje? — Reflexao rapida */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: `${IMAGO_COLOR}10`,
          borderColor: `${IMAGO_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Quem és tu hoje?
        </h2>

        {reflexaoHoje ? (
          /* Reflexao ja registada */
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${IMAGO_COLOR}25`, border: `2px solid ${IMAGO_COLOR}50` }}
            >
              ⭐
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm leading-relaxed line-clamp-2">
                {reflexaoHoje}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {g('Registado', 'Registada')} no Espelho Triplo
              </p>
            </div>
            <Link
              to="/imago/espelho"
              className="text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0"
              style={{ color: IMAGO_COLOR, background: `${IMAGO_COLOR}20` }}
            >
              Ver mais
            </Link>
          </div>
        ) : (
          /* Sem reflexao ainda */
          <div>
            <p className="text-white/60 text-sm mb-4">
              Pensa um momento: o que define quem és neste instante?
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/imago/espelho"
                className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: `${IMAGO_COLOR}20`, border: `1px solid ${IMAGO_COLOR}30` }}
              >
                <span className="text-2xl">🪞</span>
                <div>
                  <p className="text-white font-medium text-sm">Abrir Espelho Triplo</p>
                  <p className="text-white/40 text-xs">Explorar essência, máscara e aspiração</p>
                </div>
              </Link>

              {nomeacaoActual && (
                <div
                  className="px-4 py-3 rounded-xl"
                  style={{ background: `${IMAGO_COLOR}10`, border: `1px solid ${IMAGO_COLOR}15` }}
                >
                  <p className="text-white/40 text-xs mb-1">A tua nomeação actual:</p>
                  <p className="text-white font-medium text-sm italic">
                    "{nomeacaoActual}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Estado do espelho */}
      {espelhoCompletado && (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            background: `${IMAGO_COLOR}08`,
            borderColor: `${IMAGO_COLOR}15`
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl flex-shrink-0">🪞</span>
            <div>
              <p className="text-white/80 text-sm font-medium">
                Espelho Triplo {g('completado', 'completada')}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                Já exploraste quem és, quem mostras e quem queres ser
              </p>
            </div>
            <Link
              to="/imago/espelho"
              className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: IMAGO_COLOR, background: `${IMAGO_COLOR}15` }}
            >
              Rever
            </Link>
          </div>
        </div>
      )}

      {/* Mensagem inspiracional */}
      <div
        className="mt-5 rounded-2xl border p-4"
        style={{
          background: `${IMAGO_COLOR}08`,
          borderColor: `${IMAGO_COLOR}15`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">👑</span>
          <div>
            <p className="text-white/80 text-sm italic leading-relaxed">
              "Não te tornas quem és por acaso. Descobres-te camada a camada, até chegar ao centro — e aí percebes que sempre estiveste {g('inteiro', 'inteira')}."
            </p>
            <p className="text-white/30 text-xs mt-2">
              — O teu espaço de identidade
            </p>
          </div>
        </div>
      </div>

      {/* Gamificacao completa (badge) */}
      <div className="mt-5">
        <GamificationBadge
          eco="imago"
          config={IMAGO_GAMIFICATION}
          total={estrelas}
          streak={streak}
        />
      </div>

      {/* Links adicionais */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Link
          to="/imago/chat"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-xl">💬</span>
          <span className="text-white/70 text-xs">Chat</span>
        </Link>
        <Link
          to="/imago/insights"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-xl">💡</span>
          <span className="text-white/70 text-xs">Insights</span>
        </Link>
        <Link
          to="/imago/perfil"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-xl">👤</span>
          <span className="text-white/70 text-xs">Perfil</span>
        </Link>
      </div>

      {/* Vivianne Explica */}
      <div className="px-4 sm:px-6 mb-6">
        <PodcastPlayer eco="imago" compact />
      </div>

      {/* Link para perfil completo */}
      <div className="mt-5 text-center">
        <Link
          to="/imago/perfil"
          className="text-sm transition-colors"
          style={{ color: `${IMAGO_COLOR}aa` }}
        >
          Ver perfil completo e conquistas →
        </Link>
      </div>
    </ModuleDashboardShell>
  )
}
