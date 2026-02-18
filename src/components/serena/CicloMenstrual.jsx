import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { EMOCOES } from '../../lib/serena/gamificacao'
import ModuleHeader from '../shared/ModuleHeader'

/**
 * SERENA — Ciclo Menstrual
 * Correlacao opcional entre emocoes e fase do ciclo menstrual.
 * "Fase lutea — irritabilidade e esperada"
 * Ajustar expectativas de regulacao emocional.
 */

const SERENA_COLOR = '#6B8E9B'
const SERENA_DARK = '#1a2e3a'

const FASES_MENSTRUAIS = [
  {
    id: 'menstrual',
    nome: 'Menstrual',
    dias: '1-5',
    icon: '🌑',
    cor: '#E57373',
    descricao: 'Fase de recolhimento e descanso. A energia esta baixa e o corpo pede quietude.',
    emocoes_esperadas: ['cansaco', 'calma', 'tristeza', 'vazio'],
    conselho: 'Honra a necessidade de descanso. Come alimentos nutritivos, evita decisoes grandes. E natural sentir-te mais recolhida.',
    elemento: 'Inverno interior'
  },
  {
    id: 'folicular',
    nome: 'Folicular',
    dias: '6-13',
    icon: '🌒',
    cor: '#81C784',
    descricao: 'A energia começa a subir. Abertura, criatividade e optimismo crescem.',
    emocoes_esperadas: ['motivacao', 'esperanca', 'alegria'],
    conselho: 'Aproveitá para iniciar projectos, planear e criar. A energia esta a teu favor. E um bom momento para experimentar coisas novas.',
    elemento: 'Primavera interior'
  },
  {
    id: 'ovulacao',
    nome: 'Ovulacao',
    dias: '14-16',
    icon: '🌕',
    cor: '#FFD700',
    descricao: 'Pico de energia, confianca e clareza. Fase mais social e expressiva.',
    emocoes_esperadas: ['alegria', 'motivacao', 'amor', 'gratidao'],
    conselho: 'Momento ideal para comunicar, liderar, tomar decisoes. A tua presenca esta no maximo. Usa essa energia com intencao.',
    elemento: 'Verao interior'
  },
  {
    id: 'lutea',
    nome: 'Lutea',
    dias: '17-28',
    icon: '🌘',
    cor: '#B39DDB',
    descricao: 'A energia desce. Irritabilidade, sensibilidade e necessidade de limites sao normais.',
    emocoes_esperadas: ['ansiedade', 'raiva', 'cansaco', 'confusao'],
    conselho: 'Irritabilidade NAO e fraqueza — e o corpo a pedir limites. Nao te forces a ser produtiva. Come bem, descansa, diz nao sem culpa.',
    elemento: 'Outono interior'
  }
]

export default function CicloMenstrual() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [view, setView] = useState('registar') // 'registar' ou 'historico'
  const [faseActual, setFaseActual] = useState(null)
  const [registoHoje, setRegistoHoje] = useState(null)
  const [historico, setHistorico] = useState([])
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Correlacao com emocoes
  const [emocoesRecentes, setEmocoesRecentes] = useState([])

  const hoje = new Date().toISOString().split('T')[0]

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

      // Registo de hoje
      const { data: registoHojeData } = await supabase
        .from('serena_ciclo_menstrual')
        .select('fase_ciclo, emocao_correlacao, notas, created_at')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .maybeSingle()

      if (registoHojeData) {
        setRegistoHoje(registoHojeData)
        setFaseActual(registoHojeData.fase_ciclo)
      }

      // Historico ultimos 60 dias
      const sesentaDiasAtras = new Date()
      sesentaDiasAtras.setDate(sesentaDiasAtras.getDate() - 60)

      const { data: historicoData } = await supabase
        .from('serena_ciclo_menstrual')
        .select('data, fase_ciclo, emocao_correlacao, notas')
        .eq('user_id', userData.id)
        .gte('data', sesentaDiasAtras.toISOString().split('T')[0])
        .order('data', { ascending: false })

      setHistorico(historicoData || [])

      // Emocoes recentes (ultimos 7 dias) para correlacao
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

      const { data: emocoesData } = await supabase
        .from('serena_emocoes_log')
        .select('data, emocao, intensidade')
        .eq('user_id', userData.id)
        .gte('data', seteDiasAtras.toISOString().split('T')[0])
        .order('created_at', { ascending: false })

      setEmocoesRecentes(emocoesData || [])
    } catch (error) {
      console.error('CicloMenstrual: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [hoje])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Registar fase
  async function registarFaseCiclo(faseId) {
    if (!userId || saving) return
    setSaving(true)

    try {
      // Correlacao automatica: emocao dominante de hoje
      const emocoesHoje = emocoesRecentes.filter(e => e.data === hoje)
      let emocaoCorrelacao = null
      if (emocoesHoje.length > 0) {
        const contagem = {}
        emocoesHoje.forEach(e => { contagem[e.emocao] = (contagem[e.emocao] || 0) + 1 })
        emocaoCorrelacao = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      }

      const { error } = await supabase
        .from('serena_ciclo_menstrual')
        .upsert({
          user_id: userId,
          data: hoje,
          fase_ciclo: faseId,
          emocao_correlacao: emocaoCorrelacao
        }, { onConflict: 'user_id,data' })

      if (!error) {
        setFaseActual(faseId)
        setRegistoHoje({ fase_ciclo: faseId, emocao_correlacao: emocaoCorrelacao })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)

        // Actualizar historico
        const jaExiste = historico.find(h => h.data === hoje)
        if (jaExiste) {
          setHistorico(prev => prev.map(h => h.data === hoje ? { ...h, fase_ciclo: faseId, emocao_correlacao: emocaoCorrelacao } : h))
        } else {
          setHistorico(prev => [{
            data: hoje,
            fase_ciclo: faseId,
            emocao_correlacao: emocaoCorrelacao
          }, ...prev])
        }
      }
    } catch (err) {
      console.error('Erro ao registar fase do ciclo:', err)
    } finally {
      setSaving(false)
    }
  }

  // Analise de correlacao
  const correlacao = useMemo(() => {
    if (historico.length < 5 || emocoesRecentes.length < 3) return null

    // Agrupar emocoes por fase do ciclo
    const emocoesPorFase = {}
    historico.forEach(h => {
      if (h.emocao_correlacao) {
        if (!emocoesPorFase[h.fase_ciclo]) emocoesPorFase[h.fase_ciclo] = []
        emocoesPorFase[h.fase_ciclo].push(h.emocao_correlacao)
      }
    })

    const resultados = []
    FASES_MENSTRUAIS.forEach(fase => {
      const emocoes = emocoesPorFase[fase.id]
      if (!emocoes || emocoes.length < 2) return

      const contagem = {}
      emocoes.forEach(e => { contagem[e] = (contagem[e] || 0) + 1 })

      const sorted = Object.entries(contagem).sort((a, b) => b[1] - a[1])
      const topEmocao = sorted[0]
      if (topEmocao) {
        const emocaoInfo = EMOCOES.find(e => e.value === topEmocao[0])
        const esperada = fase.emocoes_esperadas.includes(topEmocao[0])
        resultados.push({
          fase: fase,
          emocao: emocaoInfo,
          count: topEmocao[1],
          total: emocoes.length,
          esperada
        })
      }
    })

    return resultados.length > 0 ? resultados : null
  }, [historico, emocoesRecentes])

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌙</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  const faseInfo = faseActual ? FASES_MENSTRUAIS.find(f => f.id === faseActual) : null

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
    >
      <ModuleHeader
        eco="serena"
        title="Ciclo Menstrual"
        subtitle="Correlaciona emocoes com o teu ciclo"
        backTo="/serena/dashboard"
      />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Aviso opcional */}
        <div
          className="rounded-2xl border p-4 mb-6"
          style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🔒</span>
            <div>
              <p className="text-white/60 text-sm leading-relaxed">
                Esta funcionalidade e <strong className="text-white/80">totalmente opcional</strong>.
                Correlacionar emocoes com o ciclo ajuda a entender que certas emocoes sao hormonais — nao pessoais.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'registar', label: 'Registar Fase' },
            { id: 'historico', label: 'Historico' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                view === tab.id ? 'text-white' : 'text-white/40'
              }`}
              style={{
                background: view === tab.id ? `${SERENA_COLOR}30` : 'transparent',
                border: `1px solid ${view === tab.id ? `${SERENA_COLOR}40` : 'rgba(255,255,255,0.08)'}`
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === 'registar' ? (
          <>
            {/* Success */}
            {showSuccess && (
              <div
                className="mb-4 p-3 rounded-xl text-center text-sm"
                style={{ background: `${SERENA_COLOR}30`, color: '#fff' }}
              >
                ✓ Fase {g('registado', 'registada')}
              </div>
            )}

            {/* Seleccao de fase */}
            <div
              className="rounded-2xl border p-5 mb-6"
              style={{ background: `${SERENA_COLOR}10`, borderColor: `${SERENA_COLOR}25` }}
            >
              <h2
                className="text-white text-lg font-semibold mb-1"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Em que fase estas hoje?
              </h2>
              <p className="text-white/40 text-xs mb-4">
                Selecciona a fase do teu ciclo menstrual
              </p>

              <div className="space-y-3">
                {FASES_MENSTRUAIS.map(fase => {
                  const isActiva = faseActual === fase.id
                  return (
                    <button
                      key={fase.id}
                      onClick={() => registarFaseCiclo(fase.id)}
                      disabled={saving}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-start gap-4 ${
                        isActiva ? 'ring-2 scale-[1.01]' : 'hover:bg-white/5'
                      }`}
                      style={{
                        background: isActiva ? `${fase.cor}20` : `${fase.cor}05`,
                        ringColor: isActiva ? fase.cor : 'transparent',
                        border: `1px solid ${isActiva ? `${fase.cor}50` : `${fase.cor}10`}`
                      }}
                      aria-pressed={isActiva}
                    >
                      <div className="text-2xl mt-0.5">{fase.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{fase.nome}</span>
                          <span className="text-white/30 text-xs">(dias {fase.dias})</span>
                        </div>
                        <p className="text-white/40 text-xs">{fase.elemento}</p>
                        <p className="text-white/50 text-xs mt-1 leading-relaxed">{fase.descricao}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detalhe da fase actual */}
            {faseInfo && (
              <div
                className="rounded-2xl border p-5 mb-6 animate-fadeIn"
                style={{ background: `${faseInfo.cor}12`, borderColor: `${faseInfo.cor}30` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{faseInfo.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold">{faseInfo.nome}</h3>
                    <p className="text-white/40 text-xs">{faseInfo.elemento}</p>
                  </div>
                </div>

                {/* Emocoes esperadas */}
                <div className="mb-4">
                  <p className="text-white/50 text-xs font-medium mb-2">Emocoes esperadas nesta fase:</p>
                  <div className="flex flex-wrap gap-2">
                    {faseInfo.emocoes_esperadas.map(emocaoId => {
                      const emocao = EMOCOES.find(e => e.value === emocaoId)
                      if (!emocao) return null
                      return (
                        <span
                          key={emocaoId}
                          className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
                          style={{ background: `${emocao.cor}20`, color: emocao.cor }}
                        >
                          {emocao.icon} {emocao.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Conselho */}
                <div
                  className="p-3 rounded-xl"
                  style={{ background: `${faseInfo.cor}15` }}
                >
                  <p className="text-white/50 text-xs font-medium mb-1">💡 Conselho para esta fase</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {faseInfo.conselho}
                  </p>
                </div>
              </div>
            )}

            {/* Correlacao detectada */}
            {correlacao && correlacao.length > 0 && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
              >
                <h3
                  className="text-white text-lg font-semibold mb-4"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  Correlacoes Detectadas
                </h3>

                <div className="space-y-3">
                  {correlacao.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: `${c.fase.cor}10` }}
                    >
                      <span className="text-xl">{c.fase.icon}</span>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm">
                          <strong>{c.fase.nome}</strong>: {c.emocao?.label || 'N/A'}
                          {' '}({c.count}/{c.total})
                        </p>
                        {c.esperada ? (
                          <p className="text-green-400/60 text-xs mt-0.5">
                            ✓ Emocao esperada nesta fase — e normal
                          </p>
                        ) : (
                          <p className="text-amber-400/60 text-xs mt-0.5">
                            ⚡ Emocao inesperada — vale a pena observar
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Historico */
          <div>
            {historico.length === 0 ? (
              <div
                className="rounded-2xl border p-8 text-center"
                style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
              >
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-white text-lg font-medium mb-2">
                  Sem registos ainda
                </h3>
                <p className="text-white/50 text-sm">
                  Comeca a registar a tua fase para ver o historico.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {historico.map((h, idx) => {
                  const fase = FASES_MENSTRUAIS.find(f => f.id === h.fase_ciclo)
                  if (!fase) return null
                  const emocao = h.emocao_correlacao ? EMOCOES.find(e => e.value === h.emocao_correlacao) : null
                  const data = new Date(h.data + 'T12:00:00')

                  return (
                    <div
                      key={h.data}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: `${fase.cor}08`, border: `1px solid ${fase.cor}15` }}
                    >
                      <span className="text-xl">{fase.icon}</span>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm font-medium">{fase.nome}</p>
                        <p className="text-white/30 text-xs">
                          {data.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {emocao && (
                        <span
                          className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                          style={{ background: `${emocao.cor}20` }}
                        >
                          {emocao.icon} {emocao.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
