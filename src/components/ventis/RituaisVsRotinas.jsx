import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { useGamification } from '../shared/GamificationSystem'
import { VENTIS_GAMIFICATION } from '../../lib/ventis/gamificacao'

// ============================================================
// VENTIS — Rituais vs Rotinas
// Transformar rotina em ritual: do automatismo para a presença
// ============================================================

const ACCENT = '#5D9B84'
const ACCENT_DARK = '#1a2e24'
const ACCENT_LIGHT = '#7FBDA6'
const ACCENT_SUBTLE = 'rgba(93,155,132,0.12)'

// Comparação Rotina vs Ritual
const COMPARACAO = [
  { rotina: 'Automática', ritual: 'Consciente', icon: '🧠' },
  { rotina: 'Eficiente', ritual: 'Significativa', icon: '💎' },
  { rotina: 'Sem atenção', ritual: 'Com atenção plena', icon: '👁️' },
  { rotina: 'Repetitiva', ritual: 'Transformadora', icon: '🦋' }
]

// Exemplos de transformação
const EXEMPLOS = [
  {
    rotina: 'Beber café a correr',
    ritual: '5 minutos sentada, saboreando, sem telemóvel',
    icon: '☕'
  },
  {
    rotina: 'Lavar os dentes antes de dormir',
    ritual: 'Lavar os dentes como limpeza do dia — soltar o que já não preciso',
    icon: '🪥'
  },
  {
    rotina: 'Fazer a cama',
    ritual: 'Fazer a cama como acto de preparar o espaço para um novo dia',
    icon: '🛏️'
  }
]

// Templates de rituais guiados
const RITUAIS_GUIADOS = [
  {
    id: 'cafe_consciente',
    nome: 'Café Consciente',
    icon: '☕',
    descricao: 'Transforma o teu café da manhã num momento de presença e intenção.',
    passos: [
      'Prepara o teu café devagar, ouvindo a água ferver',
      'Senta-te confortavelmente, sem telemóvel nem distrações',
      'Segura a chávena com as duas mãos — sente o calor',
      'Bebe o primeiro golo com os olhos fechados — saboreia',
      'Define uma intenção para o teu dia, simples e clara'
    ]
  },
  {
    id: 'banho_limpeza',
    nome: 'Banho de Limpeza',
    icon: '🚿',
    descricao: 'O banho da noite como ritual de limpeza do dia que passou.',
    passos: [
      'Antes de entrar, inspira fundo 3 vezes',
      'Imagina que a água leva tudo o que já não precisas',
      'Lava cada parte do corpo com atenção — sem pressa',
      'Quando a água cai, mentalmente solta uma preocupação',
      'Ao sair, {g_sente_novo}: {g_limpo_limpa} por dentro e por fora'
    ]
  },
  {
    id: 'primeira_respiracao',
    nome: 'Primeira Respiração',
    icon: '🌅',
    descricao: 'O primeiro acto consciente do dia: a tua primeira respiração.',
    passos: [
      'Ao acordar, não pegues no telemóvel',
      'Mantem os olhos fechados mais 30 segundos',
      'Inspira fundo pelo nariz, contando até 4',
      'Segura o ar contando até 4',
      'Expira pela boca contando até 6 — com som se quiseres'
    ]
  },
  {
    id: 'ultimo_pensamento',
    nome: 'Ultimo Pensamento',
    icon: '🌙',
    descricao: 'Antes de dormir, um momento de gratidão e quietude.',
    passos: [
      'Deita-te e coloca uma mao no peito',
      'Pensa em 1 coisa boa que aconteceu hoje — pode ser pequena',
      'Agradece em silêncio por essa coisa',
      'Deixa o corpo relaxar, zona a zona, dos pés à cabeça',
      'O teu ultimo pensamento seja gentil — para ti'
    ]
  }
]

// ---- Decoração folha ----
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

// ---- Secção educativa: Rotina vs Ritual ----
const SeccaoEducacao = () => {
  const [mostrar, setMostrar] = useState(true)

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setMostrar(!mostrar)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h3
          className="text-white font-semibold"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Rotina vs Ritual
        </h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${mostrar ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {mostrar && (
        <div className="px-5 pb-5 space-y-5 animate-fadeIn">
          {/* Comparação lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rotina</span>
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>Ritual</span>
            </div>
          </div>

          {COMPARACAO.map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 items-center">
              <div
                className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-gray-400"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-base shrink-0" role="img" aria-hidden="true">{item.icon}</span>
                {item.rotina}
              </div>
              <div
                className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-white"
                style={{ background: ACCENT_SUBTLE }}
              >
                <span className="text-base shrink-0" role="img" aria-hidden="true">{item.icon}</span>
                {item.ritual}
              </div>
            </div>
          ))}

          {/* Exemplos */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Exemplos</p>
            <div className="space-y-3">
              {EXEMPLOS.map((ex, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" role="img" aria-hidden="true">{ex.icon}</span>
                    <span className="text-sm text-gray-400 line-through">{ex.rotina}</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-white">{ex.ritual}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Ferramenta de transformação ----
const FerramentaTransformacao = ({ rotinas, onTransformar, saving }) => {
  const [rotinaSeleccionada, setRotinaSeleccionada] = useState(null)
  const [descricaoRitual, setDescricaoRitual] = useState('')

  const handleTransformar = async () => {
    if (!rotinaSeleccionada || !descricaoRitual.trim()) return
    await onTransformar(rotinaSeleccionada.id, descricaoRitual.trim())
    setRotinaSeleccionada(null)
    setDescricaoRitual('')
  }

  if (rotinas.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
        <div className="text-3xl mb-3" role="img" aria-hidden="true">✨</div>
        <h3
          className="text-white font-semibold mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Todas as rotinas transformadas!
        </h3>
        <p className="text-gray-500 text-sm">
          Não tens rotinas pendentes. Todas já são rituais ou precisas de adicionar novas no dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3
        className="text-white font-semibold mb-1"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Escolhe uma rotina para transformar
      </h3>
      <p className="text-gray-500 text-xs mb-4">
        Transforma o automático em consciente. +10 Folhas 🍃 por transformação
      </p>

      {/* Lista de rotinas */}
      <div className="space-y-2 mb-4">
        {rotinas.map((rotina) => {
          const seleccionada = rotinaSeleccionada?.id === rotina.id
          return (
            <button
              key={rotina.id}
              onClick={() => {
                setRotinaSeleccionada(seleccionada ? null : rotina)
                setDescricaoRitual('')
              }}
              className={`
                w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200
                ${seleccionada ? 'ring-1' : 'hover:bg-white/5 active:scale-[0.98]'}
              `}
              style={{
                background: seleccionada ? `${ACCENT}15` : 'rgba(255,255,255,0.03)',
                ringColor: seleccionada ? ACCENT : undefined
              }}
              aria-pressed={seleccionada}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: seleccionada ? `${ACCENT}25` : 'rgba(255,255,255,0.06)' }}
              >
                {rotina.icon || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block ${seleccionada ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {rotina.nome}
                </span>
                {rotina.descricao && (
                  <span className="text-xs text-gray-500 block truncate">{rotina.descricao}</span>
                )}
              </div>
              <svg
                className={`w-5 h-5 shrink-0 transition-colors duration-200 ${seleccionada ? 'text-white' : 'text-gray-600'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={seleccionada ? { color: ACCENT } : undefined}
                aria-hidden="true"
              >
                {seleccionada
                  ? <polyline points="20 6 9 17 4 12" />
                  : <circle cx="12" cy="12" r="10" />
                }
              </svg>
            </button>
          )
        })}
      </div>

      {/* Area de transformacao */}
      {rotinaSeleccionada && (
        <div className="space-y-3 animate-fadeIn pt-2 border-t border-white/5">
          <p className="text-sm text-gray-300 mt-3">
            Como podes tornar <strong className="text-white">"{rotinaSeleccionada.nome}"</strong> consciente?
          </p>
          <div className="relative">
            <textarea
              value={descricaoRitual}
              onChange={(e) => setDescricaoRitual(e.target.value)}
              placeholder="Exemplo: Em vez de fazer automaticamente, vou parar 1 minuto antes, respirar, e fazer com intenção..."
              rows={3}
              maxLength={500}
              className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'transparent'
              }}
              aria-label="Descreve como tornar esta rotina num ritual"
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-600">
              {descricaoRitual.length}/500
            </span>
          </div>
          <button
            onClick={handleTransformar}
            disabled={!descricaoRitual.trim() || saving}
            className={`
              w-full py-3 rounded-xl font-medium text-sm text-white transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:shadow-xl active:scale-[0.98]
            `}
            style={{
              background: descricaoRitual.trim()
                ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`
                : 'rgba(255,255,255,0.1)',
              boxShadow: descricaoRitual.trim() ? `0 4px 20px ${ACCENT}33` : 'none'
            }}
          >
            {saving ? 'A transformar...' : 'Transformar em ritual ✨'}
          </button>
        </div>
      )}
    </div>
  )
}

// ---- Os meus rituais (com checklist diário) ----
const MeusRituais = ({ rituais, onPraticar, saving }) => {
  if (rituais.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
        <div className="text-3xl mb-3" role="img" aria-hidden="true">🌱</div>
        <h3
          className="text-white font-semibold mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Ainda sem rituais
        </h3>
        <p className="text-gray-500 text-sm">
          Transforma uma rotina acima para criares o teu primeiro ritual.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3
        className="text-white font-semibold mb-1"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Os meus rituais
      </h3>
      <p className="text-gray-500 text-xs mb-4">
        Praticaste este ritual hoje?
      </p>
      <div className="space-y-2.5">
        {rituais.map((ritual) => {
          const praticadoHoje = ritual.praticado_hoje
          return (
            <div
              key={ritual.id}
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: praticadoHoje ? `${ACCENT}12` : 'rgba(255,255,255,0.03)' }}
            >
              <button
                onClick={() => !praticadoHoje && onPraticar(ritual.id)}
                disabled={praticadoHoje || saving}
                className={`
                  w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                  ${praticadoHoje ? 'text-white' : 'border border-gray-600 hover:border-gray-400'}
                  disabled:cursor-default
                `}
                style={praticadoHoje ? { background: ACCENT } : undefined}
                aria-label={`Marcar ${ritual.nome} como praticado`}
                aria-pressed={praticadoHoje}
              >
                {praticadoHoje && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block ${praticadoHoje ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {ritual.nome}
                </span>
                {ritual.descricao_ritual && (
                  <span className="text-xs text-gray-500 block truncate">{ritual.descricao_ritual}</span>
                )}
              </div>
              {ritual.streak > 0 && (
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold" style={{ color: ACCENT }}>{ritual.streak}</span>
                  <span className="text-[10px] text-gray-500 block">dias</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Rituais guiados (templates) ----
const RituaisGuiados = () => {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3
        className="text-white font-semibold mb-1"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Rituais guiados
      </h3>
      <p className="text-gray-500 text-xs mb-4">
        Templates prontos para inspiração
      </p>
      <div className="space-y-2.5">
        {RITUAIS_GUIADOS.map((ritual) => {
          const isExpanded = expanded === ritual.id
          return (
            <div key={ritual.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : ritual.id)}
                className={`
                  w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200
                  ${isExpanded ? 'ring-1' : 'hover:bg-white/5'}
                `}
                style={{
                  background: isExpanded ? `${ACCENT}10` : 'rgba(255,255,255,0.03)',
                  ringColor: isExpanded ? `${ACCENT}50` : undefined
                }}
                aria-expanded={isExpanded}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${ACCENT}20` }}
                >
                  {ritual.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white block">{ritual.nome}</span>
                  <span className="text-xs text-gray-500 block truncate">{ritual.descricao}</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-4 pl-4 border-l-2 space-y-2.5 animate-fadeIn pb-1" style={{ borderColor: `${ACCENT}40` }}>
                  {ritual.passos.map((passo, i) => {
                    // Processar texto genero-adaptado inline
                    let textoProcessado = passo
                    textoProcessado = textoProcessado.replace('{g_sente_novo}', g('sente-te novo', 'sente-te nova'))
                    textoProcessado = textoProcessado.replace('{g_limpo_limpa}', g('limpo', 'limpa'))

                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                          style={{ background: `${ACCENT}25`, color: ACCENT }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{textoProcessado}</p>
                      </div>
                    )
                  })}
                </div>
              )}
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
export default function RituaisVsRotinas() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const { addPoints } = useGamification('ventis', userId, VENTIS_GAMIFICATION)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rotinas, setRotinas] = useState([]) // rotinas nao-rituais
  const [rituais, setRituais] = useState([]) // rotinas marcadas como ritual
  const [showSuccess, setShowSuccess] = useState(null) // null ou texto de sucesso

  // Carregar rotinas e rituais
  const carregarDados = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('ventis_rotinas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const hoje = new Date().toISOString().split('T')[0]
      const todasRotinas = data || []

      // Separar rotinas de rituais
      const rotinasList = todasRotinas.filter((r) => !r.e_ritual)
      const rituaisList = todasRotinas
        .filter((r) => r.e_ritual)
        .map((r) => ({
          ...r,
          praticado_hoje: r.ultimo_praticado === hoje,
          streak: r.streak_dias || 0
        }))

      setRotinas(rotinasList)
      setRituais(rituaisList)
    } catch (err) {
      console.error('Erro ao carregar rotinas:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Transformar rotina em ritual
  const handleTransformar = useCallback(async (rotinaId, descricaoRitual) => {
    if (!userId) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ventis_rotinas')
        .update({
          e_ritual: true,
          descricao_ritual: descricaoRitual
        })
        .eq('id', rotinaId)
        .eq('user_id', userId)

      if (error) throw error

      // Premiar com 10 folhas
      await addPoints('ritual_criado', 10)

      setShowSuccess('Rotina transformada em ritual! +10 Folhas 🍃')
      setTimeout(() => setShowSuccess(null), 3000)

      // Recarregar dados
      await carregarDados()
    } catch (err) {
      console.error('Erro ao transformar rotina:', err)
      alert('Não foi possível transformar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, addPoints, carregarDados])

  // Marcar ritual como praticado hoje
  const handlePraticar = useCallback(async (ritualId) => {
    if (!userId) return
    setSaving(true)

    try {
      const hoje = new Date().toISOString().split('T')[0]

      // Buscar dados actuais do ritual
      const ritual = rituais.find((r) => r.id === ritualId)
      if (!ritual) return

      // Calcular streak
      const ontem = new Date()
      ontem.setDate(ontem.getDate() - 1)
      const ontemStr = ontem.toISOString().split('T')[0]

      const novoStreak = ritual.ultimo_praticado === ontemStr
        ? (ritual.streak || 0) + 1
        : 1

      const { error } = await supabase
        .from('ventis_rotinas')
        .update({
          ultimo_praticado: hoje,
          streak_dias: novoStreak
        })
        .eq('id', ritualId)
        .eq('user_id', userId)

      if (error) throw error

      // Actualizar UI localmente
      setRituais((prev) =>
        prev.map((r) =>
          r.id === ritualId
            ? { ...r, praticado_hoje: true, ultimo_praticado: hoje, streak: novoStreak }
            : r
        )
      )
    } catch (err) {
      console.error('Erro ao marcar ritual:', err)
    } finally {
      setSaving(false)
    }
  }, [userId, rituais])

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ventis"
        title="Rituais vs Rotinas"
        subtitle="Do automatismo para a presença"
      />

      <LeafDecoration className="-mt-1" />

      <div
        className="max-w-lg mx-auto px-4 pb-24"
        role="main"
        aria-label="Rituais vs Rotinas"
      >
        {/* Notificação de sucesso */}
        {showSuccess && (
          <div
            className="mb-4 p-3.5 rounded-xl text-center text-sm text-white font-medium animate-fadeIn"
            style={{ background: `${ACCENT}30`, border: `1px solid ${ACCENT}50` }}
            role="status"
          >
            {showSuccess}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Secção educativa */}
            <SeccaoEducacao />

            {/* Ferramenta de transformação */}
            <FerramentaTransformacao
              rotinas={rotinas}
              onTransformar={handleTransformar}
              saving={saving}
            />

            {/* Os meus rituais */}
            <MeusRituais
              rituais={rituais}
              onPraticar={handlePraticar}
              saving={saving}
            />

            {/* Rituais guiados */}
            <RituaisGuiados />
          </div>
        )}

        {/* Nota filosófica */}
        <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(93,155,132,0.08)' }}>
          <p className="text-xs text-gray-500 italic leading-relaxed text-center">
            A diferença entre rotina e ritual está na presença.
            Quando fazes algo com atenção, até lavar a louça se torna sagrado.
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
