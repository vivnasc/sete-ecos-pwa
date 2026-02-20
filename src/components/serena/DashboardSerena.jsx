import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import { SERENA_GAMIFICATION, EMOCOES } from '../../lib/serena/gamificacao'
import ModuleDashboardShell from '../shared/ModuleDashboardShell'
import { GamificationBadge } from '../shared/GamificationSystem'

/**
 * SERENA — Dashboard Principal
 * Módulo de Emoção & Fluidez (Chakra Svadhisthana)
 * Tema: azul-acinzentado (#6B8E9B), fundo escuro (#1a2e3a)
 * Moeda: Gotas, Elemento: Água
 */

const SERENA_COLOR = '#6B8E9B'
const SERENA_DARK = '#1a2e3a'

export default function DashboardSerena() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Gamificação
  const [gotas, setGotas] = useState(0)
  const [streak, setStreak] = useState(0)
  const [nivel, setNivel] = useState('')

  // Emoção do dia
  const [emocaoHoje, setEmocaoHoje] = useState(null)
  const [emocaoSelecionada, setEmocaoSelecionada] = useState(null)
  const [aGuardarEmocao, setAGuardarEmocao] = useState(false)

  // Stats semanais
  const [emocoesEstaSemana, setEmocoesEstaSemana] = useState(0)
  const [sessoesRespiracao, setSessoesRespiracao] = useState(0)

  const hoje = new Date().toISOString().split('T')[0]

  // ===== Carregar dados =====
  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/serena/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/serena/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Buscar dados do cliente Serena
      const { data: clientData } = await supabase
        .from('serena_clients')
        .select('gotas_total, streak_dias, nivel')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData) {
        setGotas(clientData.gotas_total || 0)
        setStreak(clientData.streak_dias || 0)
        setNivel(clientData.nivel || 'Nascente')
      }

      // Emoção de hoje
      const { data: emocaoHojeData } = await supabase
        .from('serena_emocoes_log')
        .select('emocao, intensidade, created_at')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (emocaoHojeData) {
        setEmocaoHoje(emocaoHojeData)
      }

      // Stats desta semana
      const inicioSemana = getInicioSemana()

      const { count: emocoesCount } = await supabase
        .from('serena_emocoes_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)

      setEmocoesEstaSemana(emocoesCount || 0)

      const { count: respiracaoCount } = await supabase
        .from('serena_respiracao_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)

      setSessoesRespiracao(respiracaoCount || 0)

    } catch (error) {
      console.error('DashboardSerena: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [navigate, hoje])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // ===== Guardar emoção rápida =====
  const guardarEmocaoRapida = async (emocaoValue) => {
    if (!userId || aGuardarEmocao) return

    setAGuardarEmocao(true)
    try {
      const emocao = EMOCOES.find(e => e.value === emocaoValue)
      if (!emocao) return

      const { error } = await supabase
        .from('serena_emocoes_log')
        .insert({
          user_id: userId,
          data: hoje,
          emocao: emocaoValue,
          intensidade: 5,
          fonte: 'dashboard_rapido'
        })

      if (!error) {
        setEmocaoHoje({ emocao: emocaoValue, intensidade: 5 })
        setEmocaoSelecionada(null)
        setEmocoesEstaSemana(prev => prev + 1)

        // Adicionar gotas pela emoção registada
        const pontosGanhos = SERENA_GAMIFICATION.actions.log_emotion || 5
        const novoTotal = gotas + pontosGanhos
        setGotas(novoTotal)

        await supabase
          .from('serena_clients')
          .update({ gotas_total: novoTotal })
          .eq('user_id', userId)
      }
    } catch (err) {
      console.error('Erro ao guardar emoção:', err)
    } finally {
      setAGuardarEmocao(false)
    }
  }

  // ===== Helpers =====
  function getInicioSemana() {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1 // Segunda como inicio
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    return monday.toISOString().split('T')[0]
  }

  function getEmocaoInfo(value) {
    return EMOCOES.find(e => e.value === value) || null
  }

  // Saudacao contextual baseada na hora
  function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return t('serena.dashboard.greeting_morning')
    if (hora < 18) return t('serena.dashboard.greeting_afternoon')
    return t('serena.dashboard.greeting_evening')
  }

  // ===== Loading state =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💧</div>
          <p className="text-white/60 text-sm">{t('serena.dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  // ===== Emoção de hoje (display) =====
  const emocaoHojeInfo = emocaoHoje ? getEmocaoInfo(emocaoHoje.emocao) : null

  // ===== Quick Actions =====
  const quickActions = [
    { label: t('serena.menu.emotional_journal'), to: '/serena/diario', icon: '\u{1F4D6}', subtitle: t('serena.menu.emotional_journal_sub') },
    { label: t('serena.menu.guided_breathing'), to: '/serena/respiracao', icon: '\u{1FAC1}', subtitle: t('serena.menu.guided_breathing_sub') },
    { label: t('serena.menu.emotional_map'), to: '/serena/mapa', icon: '\u{1F5FA}\u{FE0F}', subtitle: t('serena.menu.emotional_map_sub') },
    { label: t('serena.menu.emotional_cycle'), to: '/serena/ciclo', icon: '\u{1F300}', subtitle: t('serena.menu.emotional_cycle_sub') },
    { label: t('serena.menu.pattern_detector'), to: '/serena/padroes', icon: '\u{1F50D}', subtitle: t('serena.menu.pattern_detector_sub') },
    { label: t('serena.menu.menstrual_cycle'), to: '/serena/ciclo-menstrual', icon: '\u{1F319}', subtitle: t('serena.menu.menstrual_cycle_sub') },
    { label: t('serena.menu.emotional_sos'), to: '/serena/sos', icon: '\u{1F198}', subtitle: t('serena.menu.emotional_sos_sub') },
    { label: t('serena.menu.fluidity_practices'), to: '/serena/praticas', icon: '\u{1F4A7}', subtitle: t('serena.menu.fluidity_practices_sub') },
    { label: t('serena.menu.release_rituals'), to: '/serena/rituais', icon: '\u{1F513}', subtitle: t('serena.menu.release_rituals_sub') },
    { label: t('serena.menu.coach'), to: '/serena/chat', icon: '\u{1F4AC}', subtitle: t('serena.menu.coach_sub') }
  ]

  // ===== Stats =====
  const stats = [
    { label: t('serena.stats.emotions'), value: emocoesEstaSemana, icon: '\u{1F4D6}' },
    { label: t('serena.stats.breathing'), value: sessoesRespiracao, icon: '\u{1FAC1}' },
    { label: t('serena.stats.streak'), value: `${streak}d`, icon: '\u{1F525}' }
  ]

  // ===== Render =====
  return (
    <ModuleDashboardShell
      eco="serena"
      userName={userName?.split(' ')[0]}
      greeting={getSaudacao()}
      stats={stats}
      quickActions={quickActions}
      gamification={{
        icon: SERENA_GAMIFICATION.currency.icon,
        total: gotas,
        currency: SERENA_GAMIFICATION.currency.plural,
        level: nivel || t('serena.level.nascente'),
        streak: streak
      }}
    >
      {/* Emoção do Dia */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: `${SERENA_COLOR}10`,
          borderColor: `${SERENA_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Emoção do Dia
        </h2>

        {emocaoHojeInfo ? (
          /* Emoção já registada */
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${emocaoHojeInfo.cor}25`, border: `2px solid ${emocaoHojeInfo.cor}50` }}
            >
              {emocaoHojeInfo.icon}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-lg">{emocaoHojeInfo.label}</p>
              <p className="text-white/50 text-sm">
                {g('Registado', 'Registada')} hoje
              </p>
            </div>
            <Link
              to="/serena/diario"
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ color: SERENA_COLOR, background: `${SERENA_COLOR}20` }}
            >
              Ver mais
            </Link>
          </div>
        ) : (
          /* Seleccionar emoção rápida */
          <div>
            <p className="text-white/60 text-sm mb-4">
              Como te sentes agora? Toca numa emoção para registar.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {EMOCOES.slice(0, 8).map((emocao) => (
                <button
                  key={emocao.value}
                  onClick={() => setEmocaoSelecionada(
                    emocaoSelecionada === emocao.value ? null : emocao.value
                  )}
                  disabled={aGuardarEmocao}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                    emocaoSelecionada === emocao.value
                      ? 'scale-105 ring-2'
                      : 'hover:bg-white/10'
                  }`}
                  style={{
                    background: emocaoSelecionada === emocao.value
                      ? `${emocao.cor}25`
                      : 'transparent',
                    ringColor: emocaoSelecionada === emocao.value
                      ? emocao.cor
                      : 'transparent'
                  }}
                >
                  <span className="text-2xl">{emocao.icon}</span>
                  <span className="text-white/70 text-[10px] leading-tight">{emocao.label}</span>
                </button>
              ))}
            </div>

            {/* Expandir para ver todas */}
            <Link
              to="/serena/diario"
              className="block text-center text-white/40 text-xs mt-2 hover:text-white/60 transition-colors"
            >
              Ver todas as emoções →
            </Link>

            {/* Botão de confirmar */}
            {emocaoSelecionada && (
              <button
                onClick={() => guardarEmocaoRapida(emocaoSelecionada)}
                disabled={aGuardarEmocao}
                className="w-full mt-3 py-3 rounded-xl font-medium text-sm transition-all"
                style={{
                  background: SERENA_COLOR,
                  color: '#fff',
                  opacity: aGuardarEmocao ? 0.6 : 1
                }}
              >
                {aGuardarEmocao
                  ? 'A guardar...'
                  : `Registar ${getEmocaoInfo(emocaoSelecionada)?.icon || ''} ${getEmocaoInfo(emocaoSelecionada)?.label || ''}`
                }
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mensagem motivacional */}
      <div
        className="mt-5 rounded-2xl border p-4"
        style={{
          background: `${SERENA_COLOR}08`,
          borderColor: `${SERENA_COLOR}15`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🌊</span>
          <div>
            <p className="text-white/80 text-sm italic leading-relaxed">
              "{t('serena.dashboard.quote')}"
            </p>
            <p className="text-white/30 text-xs mt-2">
              — O teu espaço seguro para sentir
            </p>
          </div>
        </div>
      </div>

      {/* Gamificação completa (badge) */}
      <div className="mt-5">
        <GamificationBadge
          eco="serena"
          config={SERENA_GAMIFICATION}
          total={gotas}
          streak={streak}
        />
      </div>

      {/* Link para ver mais */}
      <div className="mt-5 text-center">
        <Link
          to="/serena/perfil"
          className="text-sm transition-colors"
          style={{ color: `${SERENA_COLOR}aa` }}
        >
          Ver perfil completo e conquistas →
        </Link>
      </div>
    </ModuleDashboardShell>
  )
}
