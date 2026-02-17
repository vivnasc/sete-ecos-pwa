import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * DIARIO DE CONQUISTAS — Ignis
 *
 * "Hoje consegui..." — registo diário de 3 conquistas alinhadas.
 * Não é sobre completar tarefas, mas sobre vitórias intencionais.
 *
 * Tabela: ignis_conquistas_log (user_id, data, conquista_1/2/3, alinhada_com_valor, reflexão)
 * Gamificação: +5 chamas por entrada
 *
 * Tema: #C1634A (fogo), fundo escuro #2e1a14
 */

const IGNIS_COLOR = '#C1634A'
const IGNIS_DARK = '#2e1a14'

// ===== SVG Icons inline =====

const FireIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.037 1.952-5.252 3.26-6.62.488-.512 1.74-.527 1.74.48 0 .618.616 1.07 1.134.734C12.88 9.43 14 7.5 14 5c0-1.57-.644-2.763-1.264-3.627-.318-.444.103-1.06.613-.856C17.194 2.186 20 5.952 20 10c0 1.894-.525 3.565-1.385 4.96a.736.736 0 0 0 .15.908c.367.317.425.88.098 1.232A6.98 6.98 0 0 1 12 23z"/>
  </svg>
)

const TrophyIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
)

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>
  </svg>
)

const ChartIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 3v18h18"/>
    <path d="M7 16l4-8 4 4 4-10"/>
  </svg>
)

const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

// ===== Tab navigation =====
const TABS = [
  { id: 'hoje', label: 'Hoje', icon: FireIcon },
  { id: 'biblioteca', label: 'Vitorias', icon: TrophyIcon },
  { id: 'stats', label: 'Estatísticas', icon: ChartIcon }
]

export default function DiarioConquistas() {
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState(null)
  const [activeTab, setActiveTab] = useState('hoje')

  // Formulário de hoje
  const [conquista1, setConquista1] = useState('')
  const [conquista2, setConquista2] = useState('')
  const [conquista3, setConquista3] = useState('')
  const [alinhadaCom, setAlinhadaCom] = useState('')
  const [reflexao, setReflexao] = useState('')

  // Entrada de hoje (se já existe)
  const [entradaHoje, setEntradaHoje] = useState(null)

  // Valores do utilizador (para o dropdown)
  const [valores, setValores] = useState([])

  // Histórico
  const [historico, setHistorico] = useState([])

  // Stats
  const [totalConquistas, setTotalConquistas] = useState(0)
  const [streakDias, setStreakDias] = useState(0)
  const [valorMaisAlinhado, setValorMaisAlinhado] = useState(null)

  // Motivação aleatória
  const [conquistaAleatoria, setConquistaAleatoria] = useState(null)

  const hoje = new Date().toISOString().split('T')[0]

  // ===== Carregar dados =====
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) return
      setUserId(userData.id)

      // Buscar entrada de hoje
      const { data: hojeData } = await supabase
        .from('ignis_conquistas_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .maybeSingle()

      if (hojeData) {
        setEntradaHoje(hojeData)
      }

      // Buscar valores do utilizador
      const { data: valoresData } = await supabase
        .from('ignis_valores')
        .select('valores')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (valoresData?.valores) {
        // valores e um JSONB array
        const parsed = typeof valoresData.valores === 'string'
          ? JSON.parse(valoresData.valores)
          : valoresData.valores
        setValores(Array.isArray(parsed) ? parsed : [])
      }

      // Buscar histórico (últimas 60 entradas)
      const { data: historicoData } = await supabase
        .from('ignis_conquistas_log')
        .select('*')
        .eq('user_id', userData.id)
        .order('data', { ascending: false })
        .limit(60)

      setHistorico(historicoData || [])

      // Stats: total de conquistas (cada entrada tem 3 conquistas)
      const { count: totalEntradas } = await supabase
        .from('ignis_conquistas_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setTotalConquistas((totalEntradas || 0) * 3)

      // Calcular streak
      calcularStreak(userData.id, historicoData || [])

      // Valor mais alinhado
      calcularValorMaisAlinhado(historicoData || [])

      // Conquista aleatória para motivação
      if (historicoData && historicoData.length > 1) {
        // Excluir hoje
        const passadas = historicoData.filter(e => e.data !== hoje)
        if (passadas.length > 0) {
          const random = passadas[Math.floor(Math.random() * passadas.length)]
          const conquistas = [random.conquista_1, random.conquista_2, random.conquista_3].filter(Boolean)
          if (conquistas.length > 0) {
            setConquistaAleatoria({
              texto: conquistas[Math.floor(Math.random() * conquistas.length)],
              data: random.data
            })
          }
        }
      }

    } catch (error) {
      console.error('DiarioConquistas: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [hoje])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ===== Calcular streak =====
  function calcularStreak(uid, entradas) {
    if (!entradas || entradas.length === 0) {
      setStreakDias(0)
      return
    }

    // Entradas ordenadas por data desc
    const datasUnicas = [...new Set(entradas.map(e => e.data))].sort().reverse()
    let count = 0

    for (let i = 0; i < 60; i++) {
      const data = new Date()
      data.setDate(data.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]

      if (datasUnicas.includes(dataStr)) {
        count++
      } else if (i > 0) {
        // Se nao e hoje e nao tem entrada, quebra o streak
        break
      }
    }

    setStreakDias(count)
  }

  // ===== Calcular valor mais alinhado =====
  function calcularValorMaisAlinhado(entradas) {
    const contagem = {}
    entradas.forEach(e => {
      if (e.alinhada_com_valor) {
        contagem[e.alinhada_com_valor] = (contagem[e.alinhada_com_valor] || 0) + 1
      }
    })

    const sorted = Object.entries(contagem).sort(([, a], [, b]) => b - a)
    if (sorted.length > 0) {
      setValorMaisAlinhado({ nome: sorted[0][0], vezes: sorted[0][1] })
    }
  }

  // ===== Guardar conquistas =====
  const guardarConquistas = async () => {
    if (!userId) return
    if (!conquista1.trim() && !conquista2.trim() && !conquista3.trim()) return

    setSaving(true)
    try {
      // Inserir na tabela ignis_conquistas_log
      const { error: insertError } = await supabase
        .from('ignis_conquistas_log')
        .insert({
          user_id: userId,
          data: hoje,
          conquista_1: conquista1.trim() || null,
          conquista_2: conquista2.trim() || null,
          conquista_3: conquista3.trim() || null,
          alinhada_com_valor: alinhadaCom || null,
          reflexao: reflexao.trim() || null
        })

      if (insertError) {
        console.error('Erro ao guardar conquistas:', insertError)
        return
      }

      // Premiar +5 chamas
      const { data: clientData } = await supabase
        .from('ignis_clients')
        .select('chamas_total')
        .eq('user_id', userId)
        .maybeSingle()

      if (clientData) {
        await supabase
          .from('ignis_clients')
          .update({
            chamas_total: (clientData.chamas_total || 0) + 5,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }

      setSaved(true)
      // Recarregar dados
      await loadData()

    } catch (error) {
      console.error('DiarioConquistas: Erro ao guardar:', error)
    } finally {
      setSaving(false)
    }
  }

  // ===== Agrupar historico por semana =====
  const historicoAgrupado = useMemo(() => {
    if (!historico || historico.length === 0) return []

    const semanas = {}
    historico.forEach(entrada => {
      const data = new Date(entrada.data)
      // Inicio da semana (segunda)
      const day = data.getDay()
      const diff = day === 0 ? 6 : day - 1
      const monday = new Date(data)
      monday.setDate(data.getDate() - diff)
      const chave = monday.toISOString().split('T')[0]

      if (!semanas[chave]) {
        semanas[chave] = {
          inicio: chave,
          entradas: []
        }
      }
      semanas[chave].entradas.push(entrada)
    })

    return Object.values(semanas).sort((a, b) => b.inicio.localeCompare(a.inicio))
  }, [historico])

  // ===== Formatar data =====
  function formatarData(dataStr) {
    const data = new Date(dataStr + 'T12:00:00')
    return data.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  function formatarSemana(inicioStr) {
    const inicio = new Date(inicioStr + 'T12:00:00')
    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)
    return `${inicio.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })} — ${fim.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}`
  }

  // ===== Loading =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${IGNIS_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">{'\u{1F525}'}</div>
          <p className="text-white/60 text-sm">A carregar as tuas conquistas...</p>
        </div>
      </div>
    )
  }

  // ===== Render =====
  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${IGNIS_DARK} 0%, #1a0e0a 50%, #0f0f0f 100%)` }}
    >
      {/* Header */}
      <ModuleHeader
        eco="ignis"
        title="Diário de Conquistas"
        subtitle={g('O que conquistaste hoje com intenção?', 'O que conquistaste hoje com intenção?')}
      />

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          role="tablist"
          aria-label="Secções do diário"
        >
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-white/40 hover:text-white/60'
                }`}
                style={isActive ? { background: IGNIS_COLOR } : {}}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-5">

        {/* ========== TAB: HOJE ========== */}
        {activeTab === 'hoje' && (
          <div className="space-y-5">

            {/* Conquista aleatória como motivação */}
            {conquistaAleatoria && !entradaHoje && (
              <div
                className="rounded-2xl border p-4"
                style={{ background: `${IGNIS_COLOR}08`, borderColor: `${IGNIS_COLOR}20` }}
              >
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 flex-shrink-0" style={{ color: IGNIS_COLOR }} />
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Relembra as tuas vitórias
                    </p>
                    <p className="text-white/80 text-sm italic leading-relaxed">
                      "{conquistaAleatoria.texto}"
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {formatarData(conquistaAleatoria.data)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {entradaHoje ? (
              /* ===== Já registou hoje — mostrar com celebração ===== */
              <div className="space-y-4">
                {/* Celebração header */}
                <div className="text-center py-6">
                  <div className="text-5xl mb-3 animate-bounce">{'\u{1F525}'}</div>
                  <h2
                    className="text-2xl font-bold text-white mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {g('Conquistas registadas', 'Conquistas registadas')}!
                  </h2>
                  <p className="text-white/50 text-sm">
                    +5 chamas {g('adicionado', 'adicionada')}s ao teu fogo
                  </p>
                </div>

                {/* As 3 conquistas */}
                <div className="space-y-3">
                  {[entradaHoje.conquista_1, entradaHoje.conquista_2, entradaHoje.conquista_3]
                    .filter(Boolean)
                    .map((conquista, i) => (
                      <div
                        key={i}
                        className="rounded-xl border p-4 flex items-start gap-3"
                        style={{
                          background: `${IGNIS_COLOR}15`,
                          borderColor: `${IGNIS_COLOR}30`
                        }}
                      >
                        <span className="text-lg flex-shrink-0" style={{ color: IGNIS_COLOR }}>
                          {'\u{1F525}'}
                        </span>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Conquista {i + 1}</p>
                          <p className="text-white/90 text-sm leading-relaxed">{conquista}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>

                {/* Valor e reflexão */}
                {(entradaHoje.alinhada_com_valor || entradaHoje.reflexao) && (
                  <div
                    className="rounded-xl border p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    {entradaHoje.alinhada_com_valor && (
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: `${IGNIS_COLOR}25`, color: IGNIS_COLOR }}
                        >
                          {entradaHoje.alinhada_com_valor}
                        </span>
                        <span className="text-white/30 text-xs">valor alinhado</span>
                      </div>
                    )}
                    {entradaHoje.reflexao && (
                      <p className="text-white/60 text-sm italic leading-relaxed">
                        "{entradaHoje.reflexao}"
                      </p>
                    )}
                  </div>
                )}

                {/* Dica para amanha */}
                <div
                  className="rounded-xl border p-4 text-center"
                  style={{ background: `${IGNIS_COLOR}05`, borderColor: `${IGNIS_COLOR}10` }}
                >
                  <p className="text-white/40 text-xs">
                    Amanhã podes voltar e registar mais 3 conquistas.{' '}
                    {g('Mantém o fogo aceso', 'Mantém o fogo aceso')}!
                  </p>
                </div>
              </div>
            ) : (
              /* ===== Formulário de registo ===== */
              <div className="space-y-4">
                {/* Título */}
                <div className="text-center mb-2">
                  <h2
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Hoje consegui...
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    Não tarefas, mas vitórias {g('alinhado', 'alinhada')}s com quem queres ser
                  </p>
                </div>

                {/* Conquista 1 */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">
                    Conquista 1
                  </label>
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: `${IGNIS_COLOR}30` }}
                  >
                    <div
                      className="px-3 py-1.5 text-xs"
                      style={{ background: `${IGNIS_COLOR}15`, color: `${IGNIS_COLOR}` }}
                    >
                      Hoje consegui...
                    </div>
                    <input
                      type="text"
                      value={conquista1}
                      onChange={(e) => setConquista1(e.target.value)}
                      className="w-full bg-transparent text-white/90 text-sm px-3 py-3 placeholder:text-white/20 focus:outline-none"
                      placeholder={`Ex: Dizer não a algo que não me serve`}
                      maxLength={300}
                    />
                  </div>
                </div>

                {/* Conquista 2 */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">
                    Conquista 2
                  </label>
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: `${IGNIS_COLOR}30` }}
                  >
                    <div
                      className="px-3 py-1.5 text-xs"
                      style={{ background: `${IGNIS_COLOR}15`, color: `${IGNIS_COLOR}` }}
                    >
                      Hoje consegui...
                    </div>
                    <input
                      type="text"
                      value={conquista2}
                      onChange={(e) => setConquista2(e.target.value)}
                      className="w-full bg-transparent text-white/90 text-sm px-3 py-3 placeholder:text-white/20 focus:outline-none"
                      placeholder={`Ex: Dedicar 30 min ao que realmente importa`}
                      maxLength={300}
                    />
                  </div>
                </div>

                {/* Conquista 3 */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">
                    Conquista 3
                  </label>
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: `${IGNIS_COLOR}30` }}
                  >
                    <div
                      className="px-3 py-1.5 text-xs"
                      style={{ background: `${IGNIS_COLOR}15`, color: `${IGNIS_COLOR}` }}
                    >
                      Hoje consegui...
                    </div>
                    <input
                      type="text"
                      value={conquista3}
                      onChange={(e) => setConquista3(e.target.value)}
                      className="w-full bg-transparent text-white/90 text-sm px-3 py-3 placeholder:text-white/20 focus:outline-none"
                      placeholder={`Ex: Manter a calma num momento difícil`}
                      maxLength={300}
                    />
                  </div>
                </div>

                {/* Alinhamento com valor (opcional) */}
                {valores.length > 0 && (
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">
                      Com que valor está alinhada? (opcional)
                    </label>
                    <select
                      value={alinhadaCom}
                      onChange={(e) => setAlinhadaCom(e.target.value)}
                      className="w-full rounded-xl border px-3 py-3 text-sm focus:outline-none appearance-none"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderColor: `${IGNIS_COLOR}20`,
                        color: alinhadaCom ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'
                      }}
                    >
                      <option value="" style={{ background: IGNIS_DARK, color: 'rgba(255,255,255,0.5)' }}>
                        Seleccionar valor...
                      </option>
                      {valores.map((valor, i) => (
                        <option
                          key={i}
                          value={typeof valor === 'string' ? valor : valor.nome || valor.label || valor}
                          style={{ background: IGNIS_DARK, color: 'white' }}
                        >
                          {typeof valor === 'string' ? valor : valor.nome || valor.label || valor}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reflexão (opcional) */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">
                    O que senti ao conquistar isto? (opcional)
                  </label>
                  <textarea
                    value={reflexao}
                    onChange={(e) => setReflexao(e.target.value)}
                    className="w-full rounded-xl border px-3 py-3 text-sm focus:outline-none resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: `${IGNIS_COLOR}20`,
                      color: 'rgba(255,255,255,0.9)',
                      minHeight: '80px'
                    }}
                    placeholder={g('Descreve o que sentiste...', 'Descreve o que sentiste...')}
                    maxLength={500}
                  />
                </div>

                {/* Botão guardar */}
                <button
                  onClick={guardarConquistas}
                  disabled={saving || (!conquista1.trim() && !conquista2.trim() && !conquista3.trim())}
                  className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed group"
                  style={{
                    background: (!conquista1.trim() && !conquista2.trim() && !conquista3.trim())
                      ? 'rgba(255,255,255,0.1)'
                      : IGNIS_COLOR
                  }}
                >
                  {/* Animação de fogo no hover */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                    style={{
                      background: `radial-gradient(ellipse at bottom, #ff6b35 0%, transparent 70%)`
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <span className="animate-spin">{'\u{1F525}'}</span>
                        <span>A guardar...</span>
                      </>
                    ) : saved ? (
                      <>
                        <span>{'\u{2728}'}</span>
                        <span>{g('Guardado', 'Guardado')}!</span>
                      </>
                    ) : (
                      <>
                        <FireIcon className="w-5 h-5" />
                        <span>Guardar conquistas (+5 chamas)</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Info: chamas */}
                <p className="text-center text-white/25 text-xs">
                  Cada registo no diário acrescenta 5 chamas ao teu fogo
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== TAB: BIBLIOTECA DE VITÓRIAS ========== */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-5">

            {/* Contador total */}
            <div className="text-center py-4">
              <div className="text-4xl mb-2">{'\u{1F3C6}'}</div>
              <p
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {totalConquistas}
              </p>
              <p className="text-white/40 text-sm">
                {totalConquistas === 1 ? 'conquista registada' : 'conquistas registadas'}
              </p>
            </div>

            {/* Conquista aleatória motivacional */}
            {conquistaAleatoria && (
              <div
                className="rounded-2xl border p-4"
                style={{ background: `${IGNIS_COLOR}08`, borderColor: `${IGNIS_COLOR}20` }}
              >
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 flex-shrink-0" style={{ color: IGNIS_COLOR }} />
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Relembra as tuas vitórias
                    </p>
                    <p className="text-white/80 text-sm italic leading-relaxed">
                      "{conquistaAleatoria.texto}"
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {formatarData(conquistaAleatoria.data)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico agrupado por semana */}
            {historicoAgrupado.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-40">{'\u{1F4D6}'}</div>
                <p className="text-white/40 text-sm">
                  Ainda não tens conquistas registadas.
                </p>
                <p className="text-white/25 text-xs mt-1">
                  Começa hoje a registar as tuas vitórias!
                </p>
                <button
                  onClick={() => setActiveTab('hoje')}
                  className="mt-4 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ background: IGNIS_COLOR }}
                >
                  Registar primeira conquista
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {historicoAgrupado.map((semana) => (
                  <div key={semana.inicio}>
                    {/* Cabeçalho da semana */}
                    <div className="flex items-center gap-3 mb-3">
                      <CalendarIcon className="w-4 h-4 text-white/30" />
                      <h3 className="text-white/50 text-xs uppercase tracking-wider font-medium">
                        Semana de {formatarSemana(semana.inicio)}
                      </h3>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                      <span className="text-white/20 text-xs">{semana.entradas.length} {semana.entradas.length === 1 ? 'dia' : 'dias'}</span>
                    </div>

                    {/* Entradas da semana */}
                    <div className="space-y-3">
                      {semana.entradas.map((entrada) => (
                        <div
                          key={entrada.id}
                          className="rounded-xl border p-4"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderColor: 'rgba(255,255,255,0.06)'
                          }}
                        >
                          {/* Data */}
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-white/50 text-xs font-medium">
                              {formatarData(entrada.data)}
                            </p>
                            {entrada.alinhada_com_valor && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${IGNIS_COLOR}20`, color: IGNIS_COLOR }}
                              >
                                {entrada.alinhada_com_valor}
                              </span>
                            )}
                          </div>

                          {/* Conquistas */}
                          <div className="space-y-2">
                            {[entrada.conquista_1, entrada.conquista_2, entrada.conquista_3]
                              .filter(Boolean)
                              .map((c, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-xs mt-0.5" style={{ color: IGNIS_COLOR }}>
                                    {'\u{1F525}'}
                                  </span>
                                  <p className="text-white/70 text-sm leading-relaxed">{c}</p>
                                </div>
                              ))
                            }
                          </div>

                          {/* Reflexão */}
                          {entrada.reflexao && (
                            <p className="text-white/40 text-xs italic mt-2 pl-5">
                              "{entrada.reflexao}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== TAB: ESTATÍSTICAS ========== */}
        {activeTab === 'stats' && (
          <div className="space-y-5">

            {/* Título */}
            <h2
              className="text-xl font-bold text-white text-center"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              As tuas estatísticas
            </h2>

            {/* Cards de stats */}
            <div className="grid grid-cols-3 gap-3">
              {/* Total conquistas */}
              <div
                className="rounded-xl border p-4 text-center"
                style={{ background: `${IGNIS_COLOR}10`, borderColor: `${IGNIS_COLOR}20` }}
              >
                <div className="text-2xl mb-1">{'\u{1F525}'}</div>
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {totalConquistas}
                </p>
                <p className="text-white/40 text-xs mt-1">Total</p>
              </div>

              {/* Streak */}
              <div
                className="rounded-xl border p-4 text-center"
                style={{ background: `${IGNIS_COLOR}10`, borderColor: `${IGNIS_COLOR}20` }}
              >
                <div className="text-2xl mb-1">{'\u{26A1}'}</div>
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {streakDias}
                </p>
                <p className="text-white/40 text-xs mt-1">{streakDias === 1 ? 'dia' : 'dias'} seguidos</p>
              </div>

              {/* Entradas */}
              <div
                className="rounded-xl border p-4 text-center"
                style={{ background: `${IGNIS_COLOR}10`, borderColor: `${IGNIS_COLOR}20` }}
              >
                <div className="text-2xl mb-1">{'\u{1F4D6}'}</div>
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {historico.length}
                </p>
                <p className="text-white/40 text-xs mt-1">{historico.length === 1 ? 'entrada' : 'entradas'}</p>
              </div>
            </div>

            {/* Valor mais alinhado */}
            {valorMaisAlinhado && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: `${IGNIS_COLOR}08`, borderColor: `${IGNIS_COLOR}20` }}
              >
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                  Valor mais alinhado
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm px-3 py-1.5 rounded-full font-medium"
                    style={{ background: `${IGNIS_COLOR}25`, color: IGNIS_COLOR }}
                  >
                    {valorMaisAlinhado.nome}
                  </span>
                  <span className="text-white/30 text-sm">
                    {valorMaisAlinhado.vezes} {valorMaisAlinhado.vezes === 1 ? 'vez' : 'vezes'}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-3">
                  Este é o valor que mais aparece nas tuas conquistas.{' '}
                  {g('Estás alinhado', 'Estás alinhada')} com o que importa.
                </p>
              </div>
            )}

            {/* Streak visual */}
            {streakDias > 0 && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                  Streak actual
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: Math.min(streakDias, 30) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-sm flex items-center justify-center text-xs transition-all"
                      style={{
                        background: `${IGNIS_COLOR}${Math.min(20 + i * 3, 90).toString(16)}`,
                        opacity: 0.5 + (i / Math.min(streakDias, 30)) * 0.5
                      }}
                    >
                      {'\u{1F525}'}
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-xs mt-2">
                  {streakDias} {streakDias === 1 ? 'dia consecutivo' : 'dias consecutivos'} de conquistas
                </p>
              </div>
            )}

            {/* Mensagem motivacional */}

            <div
              className="rounded-xl border p-4 text-center"
              style={{ background: `${IGNIS_COLOR}05`, borderColor: `${IGNIS_COLOR}10` }}
            >
              <p className="text-white/50 text-sm italic">
                {totalConquistas === 0
                  ? 'A primeira chama está à espera de ser acesa. Começa hoje.'
                  : totalConquistas < 30
                    ? `Já registaste ${totalConquistas} conquistas. O fogo está a crescer.`
                    : `${totalConquistas} conquistas! O teu fogo interno é ${g('forte', 'forte')}.`
                }
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
