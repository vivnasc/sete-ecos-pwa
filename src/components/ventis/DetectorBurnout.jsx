import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { useGamification } from '../shared/GamificationSystem'
import { VENTIS_GAMIFICATION } from '../../lib/ventis/gamificacao'

// ============================================================
// VENTIS — Detector de Burnout (Preventivo)
// Eco da Energia & Ritmo (Anahata)
// NOTA: Isto é PREVENTIVO, não diagnóstico.
// ============================================================

const ACCENT = '#5D9B84'
const ACCENT_DARK = '#1a2e24'
const ACCENT_LIGHT = '#7FBDA6'
const ACCENT_SUBTLE = 'rgba(93,155,132,0.12)'

// Limiar: energia média abaixo de 40% = dia de baixa energia
const LIMIAR_BAIXA_ENERGIA = 40
// Dias consecutivos para activar alerta
const DIAS_CONSECUTIVOS_ALERTA = 5

// Acções recomendadas quando burnout detectado
const ACCOES_RECOMENDADAS = [
  { id: 'cancelar', texto: 'Cancela 1 compromisso não-essencial hoje', icon: '📋' },
  { id: 'pausa', texto: 'Faz uma pausa de 30 minutos sem ecrã', icon: '📵' },
  { id: 'dormir', texto: 'Deita-te 1 hora mais cedo hoje', icon: '🛏️' },
  { id: 'natureza', texto: 'Vai lá fora 10 minutos', icon: '🌿' },
  { id: 'nao', texto: 'Diz não a 1 pedido hoje', icon: '🚫' }
]

// Dicas de prevenção
const DICAS_PREVENCAO = [
  { texto: 'Faz pausas regulares', icon: '⏸️' },
  { texto: 'Move o corpo pelo menos 1x/dia', icon: '🏃' },
  { texto: 'Dorme 7-8 horas', icon: '😴' },
  { texto: 'Conecta com a natureza', icon: '🌳' }
]

// ---- Ícone de folha decorativo ----
const LeafDecoration = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="w-full h-14 opacity-15"
      fill={ACCENT}
    >
      <path d="M0,80 C150,20 350,100 500,40 C650,-20 800,60 1000,30 C1100,15 1150,50 1200,40 L1200,120 L0,120 Z" />
    </svg>
  </div>
)

// ---- Barra de energia individual ----
const EnergyBar = ({ dia, media, isLow }) => {
  const dataFormatada = new Date(dia).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric' })
  const altura = Math.max(media, 5)

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <span className="text-xs font-medium" style={{ color: isLow ? '#F59E0B' : ACCENT }}>
        {Math.round(media)}%
      </span>
      <div
        className="w-full rounded-t-lg transition-all duration-500"
        style={{
          height: `${altura * 0.8}px`,
          minHeight: '4px',
          background: isLow
            ? 'linear-gradient(180deg, #F59E0B, #D97706)'
            : `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})`,
          boxShadow: isLow ? '0 0 8px rgba(245,158,11,0.3)' : `0 0 8px ${ACCENT}22`
        }}
      />
      <span className="text-[10px] text-gray-500 truncate w-full text-center">{dataFormatada}</span>
    </div>
  )
}

// ---- Badge de estado ----
const StatusBadge = ({ tipo, children }) => {
  const cores = {
    ok: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22C55E' },
    alerta: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
    critico: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' }
  }
  const cor = cores[tipo] || cores.ok

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ background: cor.bg, border: `1px solid ${cor.border}`, color: cor.text }}
    >
      {children}
    </span>
  )
}

// ---- Vista Normal (sem burnout) ----
const EstadoNormal = ({ tendencia }) => (
  <div className="space-y-6 animate-fadeIn">
    {/* Status OK */}
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
      <div
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
        style={{ background: 'rgba(34,197,94,0.15)', boxShadow: '0 0 30px rgba(34,197,94,0.1)' }}
      >
        🍃
      </div>
      <h2
        className="text-xl font-bold text-white mb-2"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        O teu ritmo está sustentável
      </h2>
      <StatusBadge tipo="ok">Energia equilibrada</StatusBadge>
      <p className="text-gray-400 text-sm mt-3">
        {g('Estas a cuidar bem de ti', 'Estas a cuidar bem de ti')}. Continua a ouvir o teu corpo.
      </p>
    </div>

    {/* Tendência últimos 7 dias */}
    {tendencia.length > 0 && (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <h3
          className="text-white font-semibold mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Tendência dos últimos 7 dias
        </h3>
        <div className="flex items-end gap-1.5 h-24">
          {tendencia.map((d) => (
            <EnergyBar
              key={d.dia}
              dia={d.dia}
              media={d.media}
              isLow={d.media < LIMIAR_BAIXA_ENERGIA}
            />
          ))}
        </div>
      </div>
    )}

    {/* Dicas de prevenção */}
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3
        className="text-white font-semibold mb-3"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Para manter o equilíbrio
      </h3>
      <div className="space-y-2.5">
        {DICAS_PREVENCAO.map((dica, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: ACCENT_SUBTLE }}
          >
            <span className="text-lg" role="img" aria-hidden="true">{dica.icon}</span>
            <span className="text-sm text-gray-300">{dica.texto}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// ---- Vista de Alerta (burnout detectado) ----
const EstadoAlerta = ({
  diasConsecutivos,
  nivelMedio,
  tendencia,
  accoesMarcadas,
  onToggleAccao,
  onAgir,
  saving
}) => {
  const tipo = diasConsecutivos >= 7 ? 'critico' : 'alerta'
  const corAlerta = tipo === 'critico' ? '#EF4444' : '#F59E0B'

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alerta principal */}
      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          background: `${corAlerta}0A`,
          borderColor: `${corAlerta}30`,
          boxShadow: `0 0 40px ${corAlerta}10`
        }}
      >
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
          style={{ background: `${corAlerta}20`, boxShadow: `0 0 30px ${corAlerta}15` }}
        >
          {tipo === 'critico' ? '🔴' : '🟡'}
        </div>
        <h2
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Há {diasConsecutivos} dias em modo esforço
        </h2>
        <StatusBadge tipo={tipo}>
          {tipo === 'critico' ? 'Alerta crítico' : 'Atenção necessária'}
        </StatusBadge>
        <p className="text-gray-300 text-sm mt-4 max-w-sm mx-auto leading-relaxed">
          Isto não é sustentável. A tua energia média está nos{' '}
          <span className="font-bold" style={{ color: corAlerta }}>{Math.round(nivelMedio)}%</span>.
        </p>
        <p
          className="text-sm mt-3 italic max-w-xs mx-auto"
          style={{ color: `${corAlerta}cc` }}
        >
          O teu corpo está a dizer-te algo. Ouve-o.
        </p>
      </div>

      {/* Visualização dos dias baixos */}
      {tendencia.length > 0 && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <h3
            className="text-white font-semibold mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Os teus últimos dias
          </h3>
          <div className="flex items-end gap-1.5 h-24">
            {tendencia.map((d) => (
              <EnergyBar
                key={d.dia}
                dia={d.dia}
                media={d.media}
                isLow={d.media < LIMIAR_BAIXA_ENERGIA}
              />
            ))}
          </div>
        </div>
      )}

      {/* Acções recomendadas */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <h3
          className="text-white font-semibold mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          O que podes fazer agora
        </h3>
        <p className="text-gray-500 text-xs mb-4">
          Marca pelo menos 1 acção para activar
        </p>
        <div className="space-y-2.5">
          {ACCOES_RECOMENDADAS.map((accao) => {
            const marcada = accoesMarcadas.includes(accao.id)
            return (
              <button
                key={accao.id}
                onClick={() => onToggleAccao(accao.id)}
                className={`
                  w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200
                  ${marcada
                    ? 'ring-1'
                    : 'hover:bg-white/5 active:scale-[0.98]'
                  }
                `}
                style={{
                  background: marcada ? `${ACCENT}15` : 'rgba(255,255,255,0.03)',
                  ringColor: marcada ? ACCENT : undefined
                }}
                aria-pressed={marcada}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                    marcada ? 'text-white' : 'border border-gray-600'
                  }`}
                  style={marcada ? { background: ACCENT } : undefined}
                >
                  {marcada && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-lg shrink-0" role="img" aria-hidden="true">{accao.icon}</span>
                <span className={`text-sm ${marcada ? 'text-white' : 'text-gray-300'}`}>
                  {accao.texto}
                </span>
              </button>
            )
          })}
        </div>

        {/* Botão de acção */}
        <button
          onClick={onAgir}
          disabled={accoesMarcadas.length === 0 || saving}
          className={`
            w-full mt-5 py-3.5 rounded-xl font-medium text-sm text-white transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:shadow-xl active:scale-[0.98]
          `}
          style={{
            background: accoesMarcadas.length > 0
              ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`
              : 'rgba(255,255,255,0.1)',
            boxShadow: accoesMarcadas.length > 0 ? `0 4px 20px ${ACCENT}33` : 'none'
          }}
        >
          {saving ? 'A guardar...' : 'Vou agir sobre isto'}
        </button>
        {accoesMarcadas.length > 0 && (
          <p className="text-center text-xs mt-2" style={{ color: ACCENT }}>
            +8 Folhas 🍃 por agires
          </p>
        )}
      </div>
    </div>
  )
}

// ---- Histórico de alertas ----
const HistoricoAlertas = ({ alertas }) => {
  if (alertas.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
        <div className="text-3xl mb-3" role="img" aria-hidden="true">🍃</div>
        <h3
          className="text-white font-semibold mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Sem alertas recentes
        </h3>
        <p className="text-gray-500 text-sm">
          Nenhum alerta de burnout nos últimos 3 meses. Bom sinal!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3
        className="text-white font-semibold mb-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Alertas nos últimos 3 meses
      </h3>
      <div className="space-y-3">
        {alertas.map((alerta, i) => {
          const dataStr = new Date(alerta.data).toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })

          return (
            <div
              key={alerta.id || i}
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)' }}
              >
                {alerta.accao_tomada ? '✅' : '⚠️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {alerta.dias_consecutivos} dias em modo esforço
                  </span>
                  <span className="text-xs text-gray-500">{dataStr}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Energia média: {Math.round(alerta.nivel_medio)}%
                </p>
                {alerta.accao_tomada && (
                  <p className="text-xs mt-1" style={{ color: ACCENT }}>
                    {g('Agiste sobre este alerta', 'Agiste sobre este alerta')}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function DetectorBurnout() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const { addPoints } = useGamification('ventis', userId, VENTIS_GAMIFICATION)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tendencia, setTendencia] = useState([])
  const [diasConsecutivosBaixos, setDiasConsecutivosBaixos] = useState(0)
  const [nivelMedio, setNivelMedio] = useState(0)
  const [accoesMarcadas, setAccoesMarcadas] = useState([])
  const [alertasHistorico, setAlertasHistorico] = useState([])
  const [view, setView] = useState('actual') // 'actual' | 'historico'
  const [showSuccess, setShowSuccess] = useState(false)

  // Calcular tendência e detectar burnout
  const analisarEnergia = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      // Buscar últimos 14 dias de logs de energia
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - 14)

      const { data: logs, error } = await supabase
        .from('ventis_energia_log')
        .select('data, nivel')
        .eq('user_id', userId)
        .gte('data', dataLimite.toISOString().split('T')[0])
        .order('data', { ascending: true })

      if (error) throw error

      // Agrupar por dia e calcular média
      const porDia = {}
      ;(logs || []).forEach((log) => {
        const dia = log.data
        if (!porDia[dia]) porDia[dia] = []
        porDia[dia].push(log.nivel)
      })

      const mediasDiarias = Object.entries(porDia).map(([dia, niveis]) => ({
        dia,
        media: niveis.reduce((a, b) => a + b, 0) / niveis.length
      }))

      // Ordenar por data
      mediasDiarias.sort((a, b) => a.dia.localeCompare(b.dia))

      // Detectar dias consecutivos de baixa energia (a partir do fim)
      let consecutivos = 0
      let somaConsecutivos = 0
      for (let i = mediasDiarias.length - 1; i >= 0; i--) {
        if (mediasDiarias[i].media < LIMIAR_BAIXA_ENERGIA) {
          consecutivos++
          somaConsecutivos += mediasDiarias[i].media
        } else {
          break
        }
      }

      const mediaBaixa = consecutivos > 0 ? somaConsecutivos / consecutivos : 0

      // Últimos 7 dias para o gráfico
      const ultimos7 = mediasDiarias.slice(-7)

      setTendencia(ultimos7)
      setDiasConsecutivosBaixos(consecutivos)
      setNivelMedio(mediaBaixa)

      // Buscar histórico de alertas (últimos 3 meses)
      const data3Meses = new Date()
      data3Meses.setMonth(data3Meses.getMonth() - 3)

      const { data: alertas, error: alertErr } = await supabase
        .from('ventis_burnout_alertas')
        .select('*')
        .eq('user_id', userId)
        .gte('data', data3Meses.toISOString().split('T')[0])
        .order('data', { ascending: false })

      if (!alertErr) {
        setAlertasHistorico(alertas || [])
      }
    } catch (err) {
      console.error('Erro ao analisar energia:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    analisarEnergia()
  }, [analisarEnergia])

  // Toggle acção marcada
  const toggleAccao = useCallback((accaoId) => {
    setAccoesMarcadas((prev) =>
      prev.includes(accaoId)
        ? prev.filter((id) => id !== accaoId)
        : [...prev, accaoId]
    )
  }, [])

  // Guardar acção de burnout
  const handleAgir = useCallback(async () => {
    if (!userId || accoesMarcadas.length === 0) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ventis_burnout_alertas')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          dias_consecutivos: diasConsecutivosBaixos,
          nivel_medio: Math.round(nivelMedio),
          accao_tomada: true
        })

      if (error) throw error

      // Premiar com 8 folhas
      await addPoints('burnout_accao', 8)

      setShowSuccess(true)
      setAccoesMarcadas([])

      // Refresh depois de 3 segundos
      setTimeout(() => {
        setShowSuccess(false)
        analisarEnergia()
      }, 3000)
    } catch (err) {
      console.error('Erro ao guardar acção:', err)
      alert('Não foi possível guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, accoesMarcadas, diasConsecutivosBaixos, nivelMedio, addPoints, analisarEnergia])

  const burnoutDetectado = diasConsecutivosBaixos >= DIAS_CONSECUTIVOS_ALERTA

  // Vista de sucesso (pós-acção)
  if (showSuccess) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader
          eco="ventis"
          title="Detector de Burnout"
          subtitle="Prevenção e consciência"
        />
        <LeafDecoration className="-mt-1" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fadeIn">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6"
            style={{ background: `${ACCENT}20`, boxShadow: `0 0 40px ${ACCENT}15` }}
          >
            🍃
          </div>
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {g('Corajoso', 'Corajosa')} por agires
          </h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Ouvir o corpo é o primeiro passo. +8 Folhas 🍃 adicionadas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ventis"
        title="Detector de Burnout"
        subtitle="Prevencao e consciencia"
      />

      <LeafDecoration className="-mt-1" />

      <div
        className="max-w-lg mx-auto px-4 pb-24"
        role="main"
        aria-label="Detector de Burnout"
      >
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setView('actual')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'actual' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'actual' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'actual'}
          >
            Estado Actual
          </button>
          <button
            onClick={() => setView('historico')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'historico'}
          >
            Histórico
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
            />
          </div>
        ) : view === 'historico' ? (
          <HistoricoAlertas alertas={alertasHistorico} />
        ) : burnoutDetectado ? (
          <EstadoAlerta
            diasConsecutivos={diasConsecutivosBaixos}
            nivelMedio={nivelMedio}
            tendencia={tendencia}
            accoesMarcadas={accoesMarcadas}
            onToggleAccao={toggleAccao}
            onAgir={handleAgir}
            saving={saving}
          />
        ) : (
          <EstadoNormal tendencia={tendencia} />
        )}

        {/* Nota preventiva */}
        <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(93,155,132,0.08)' }}>
          <p className="text-xs text-gray-500 italic leading-relaxed text-center">
            Este detector é preventivo, não diagnóstico. Se sentes que precisas de ajuda profissional,
            procura um médico ou psicólogo. Cuidar de ti é um acto de força.
          </p>
        </div>

        <LeafDecoration className="mt-8 rotate-180" />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
