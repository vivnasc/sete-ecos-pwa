import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { AURORA_GAMIFICATION } from '../../lib/aurora/gamificacao'
import ModuleDashboardShell from '../shared/ModuleDashboardShell'
import { GamificationBadge } from '../shared/GamificationSystem'

/**
 * AURORA — Dashboard Principal
 * Modulo de Integracao Final
 * Tema: rosa (#D4A5A5), fundo escuro (#2e1a1a)
 * Moeda: Raios de Aurora, Elemento: Luz
 */

const AURORA_COLOR = '#D4A5A5'
const AURORA_DARK = '#2e1a1a'

export default function DashboardAurora() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Gamificacao
  const [raios, setRaios] = useState(0)

  // Aurora-specific
  const [graduacaoData, setGraduacaoData] = useState(null)
  const [ecosCompletados, setEcosCompletados] = useState(0)
  const [modoManutencao, setModoManutencao] = useState(false)
  const [mentora, setMentora] = useState(false)

  // ===== Carregar dados =====
  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/aurora/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/aurora/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Buscar dados do cliente Aurora
      const { data: clientData } = await supabase
        .from('aurora_clients')
        .select('raios_total, graduacao_data, ecos_completados, modo_manutencao, mentora')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData) {
        setRaios(clientData.raios_total || 0)
        setGraduacaoData(clientData.graduacao_data || null)
        setEcosCompletados(clientData.ecos_completados || 0)
        setModoManutencao(clientData.modo_manutencao || false)
        setMentora(clientData.mentora || false)
      }

    } catch (error) {
      console.error('DashboardAurora: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Saudacao contextual baseada na hora
  function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return 'Uma nova aurora comeca agora'
    if (hora < 18) return 'A tua luz continua a brilhar'
    return 'Que esta noite traga renovacao'
  }

  // Icones dos ecos completados
  const ecosIcons = [
    { eco: 'Vitalis', icon: '🌱' },
    { eco: 'Aurea', icon: '✨' },
    { eco: 'Serena', icon: '🌊' },
    { eco: 'Ignis', icon: '🔥' },
    { eco: 'Ventis', icon: '🍃' },
    { eco: 'Ecoa', icon: '🔊' },
    { eco: 'Imago', icon: '⭐' }
  ]

  // ===== Loading state =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌅</div>
          <p className="text-white/60 text-sm">A preparar a tua aurora...</p>
        </div>
      </div>
    )
  }

  // ===== Quick Actions =====
  const quickActions = [
    { label: 'Cerimonia de Graduacao', to: '/aurora/cerimonia', icon: '🌅', subtitle: 'Celebrar a tua jornada' },
    { label: 'Antes & Depois', to: '/aurora/antes-depois', icon: '\u{1F4D6}', subtitle: 'A tua historia' },
    { label: 'Resumo da Jornada', to: '/aurora/resumo', icon: '\u{1F4CA}', subtitle: 'Relatorio completo' },
    { label: 'Modo Manutencao', to: '/aurora/manutencao', icon: '\u{1F6E1}\uFE0F', subtitle: 'Check-ins mensais' },
    { label: 'Mentoria', to: '/aurora/mentoria', icon: '\u{1F31F}', subtitle: 'Partilhar sabedoria' },
    { label: 'Ritual Aurora', to: '/aurora/ritual', icon: '\u2600\uFE0F', subtitle: 'Ritual matinal' },
    { label: 'Renovacao Anual', to: '/aurora/renovacao', icon: '\u{1F504}', subtitle: 'Renovar intencoes' }
  ]

  // ===== Stats =====
  const stats = [
    { label: 'Raios', value: raios, icon: '🌅' },
    { label: 'Ecos', value: ecosCompletados, icon: '💫' },
    { label: 'Status', value: graduacaoData ? g('Graduado', 'Graduada') : 'Em curso', icon: '🎓' }
  ]

  // ===== Render =====
  return (
    <ModuleDashboardShell
      eco="aurora"
      userName={userName?.split(' ')[0]}
      greeting={getSaudacao()}
      stats={stats}
      quickActions={quickActions}
      gamification={{
        icon: AURORA_GAMIFICATION.currency.icon,
        total: raios,
        currency: AURORA_GAMIFICATION.currency.plural,
        level: 'Aurora',
        streak: 0
      }}
    >
      {/* Ecos completados */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: `${AURORA_COLOR}10`,
          borderColor: `${AURORA_COLOR}25`
        }}
      >
        <h2
          className="text-white text-lg font-semibold mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Ecos Completados
        </h2>

        <div className="flex flex-wrap gap-3">
          {ecosIcons.map((e, i) => {
            const completado = i < ecosCompletados
            return (
              <div
                key={e.eco}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  completado ? '' : 'opacity-30 grayscale'
                }`}
                style={completado ? {
                  background: `${AURORA_COLOR}25`,
                  border: `2px solid ${AURORA_COLOR}50`
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}
              >
                <span className="text-xl">{e.icon}</span>
                <span className="text-white/50 text-[8px] mt-0.5">{e.eco}</span>
              </div>
            )
          })}
        </div>

        {ecosCompletados >= 7 && (
          <p className="text-white/60 text-sm mt-3">
            Todos os ecos completados! {g('Es um verdadeiro mestre', 'Es uma verdadeira mestra')} da tua jornada.
          </p>
        )}
      </div>

      {/* Estado da graduacao */}
      {graduacaoData ? (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            background: `${AURORA_COLOR}08`,
            borderColor: `${AURORA_COLOR}15`
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl flex-shrink-0">🎓</span>
            <div>
              <p className="text-white/80 text-sm font-medium">
                Cerimonia de Graduacao {g('completado', 'completada')}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                {new Date(graduacaoData).toLocaleDateString('pt-PT')}
              </p>
            </div>
            <Link
              to="/aurora/cerimonia"
              className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: AURORA_COLOR, background: `${AURORA_COLOR}15` }}
            >
              Rever
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            background: `${AURORA_COLOR}08`,
            borderColor: `${AURORA_COLOR}15`
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🌅</span>
            <div>
              <p className="text-white/80 text-sm font-medium">
                A tua cerimonia de graduacao espera por ti
              </p>
              <p className="text-white/40 text-xs mt-1">
                Celebra tudo o que conquistaste nesta jornada
              </p>
            </div>
            <Link
              to="/aurora/cerimonia"
              className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ color: AURORA_COLOR, background: `${AURORA_COLOR}15` }}
            >
              Iniciar
            </Link>
          </div>
        </div>
      )}

      {/* Modo manutencao e mentoria */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-xl border p-3 text-center"
          style={{
            background: modoManutencao ? `${AURORA_COLOR}15` : 'rgba(255,255,255,0.05)',
            borderColor: modoManutencao ? `${AURORA_COLOR}30` : 'rgba(255,255,255,0.1)'
          }}
        >
          <span className="text-xl block mb-1">{modoManutencao ? '\u{1F6E1}\uFE0F' : '\u{1F512}'}</span>
          <p className="text-white/70 text-xs">
            {modoManutencao ? g('Activo', 'Activa') : g('Inactivo', 'Inactiva')}
          </p>
          <p className="text-white/40 text-[10px]">Manutencao</p>
        </div>
        <div
          className="rounded-xl border p-3 text-center"
          style={{
            background: mentora ? `${AURORA_COLOR}15` : 'rgba(255,255,255,0.05)',
            borderColor: mentora ? `${AURORA_COLOR}30` : 'rgba(255,255,255,0.1)'
          }}
        >
          <span className="text-xl block mb-1">{mentora ? '\u{1F31F}' : '\u{1F512}'}</span>
          <p className="text-white/70 text-xs">
            {mentora ? g('Activo', 'Activa') : g('Inactivo', 'Inactiva')}
          </p>
          <p className="text-white/40 text-[10px]">Mentoria</p>
        </div>
      </div>

      {/* Mensagem inspiracional */}
      <div
        className="mt-5 rounded-2xl border p-4"
        style={{
          background: `${AURORA_COLOR}08`,
          borderColor: `${AURORA_COLOR}15`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">☀️</span>
          <div>
            <p className="text-white/80 text-sm italic leading-relaxed">
              "Nao e o fim da jornada — e o inicio de uma vida {g('vivido', 'vivida')} com consciencia. Tu ja sabes quem es. Agora vive isso."
            </p>
            <p className="text-white/30 text-xs mt-2">
              — O teu espaco de integracao
            </p>
          </div>
        </div>
      </div>

      {/* Gamificacao completa (badge) */}
      <div className="mt-5">
        <GamificationBadge
          eco="aurora"
          config={AURORA_GAMIFICATION}
          total={raios}
          streak={0}
        />
      </div>

      {/* Links adicionais */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Link
          to="/aurora/chat"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-xl">💬</span>
          <span className="text-white/70 text-xs">Chat</span>
        </Link>
        <Link
          to="/aurora/insights"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-xl">💡</span>
          <span className="text-white/70 text-xs">Insights</span>
        </Link>
        <Link
          to="/aurora/perfil"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-xl">👤</span>
          <span className="text-white/70 text-xs">Perfil</span>
        </Link>
      </div>

      {/* Link para perfil completo */}
      <div className="mt-5 text-center">
        <Link
          to="/aurora/perfil"
          className="text-sm transition-colors"
          style={{ color: `${AURORA_COLOR}aa` }}
        >
          Ver perfil completo e conquistas →
        </Link>
      </div>
    </ModuleDashboardShell>
  )
}
