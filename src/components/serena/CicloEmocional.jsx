import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { EMOCOES } from '../../lib/serena/gamificacao'
import ModuleHeader from '../shared/ModuleHeader'

/**
 * SERENA — Ciclo Emocional
 * Rastreio do ciclo emocional (independente do menstrual).
 * Fases: Acumulacao → Pico → Libertacao → Calma
 * Integra com dados do diario emocional.
 */

const SERENA_COLOR = '#6B8E9B'
const SERENA_DARK = '#1a2e3a'

const FASES_CICLO = [
  {
    id: 'acumulacao',
    nome: 'Acumulacao',
    icon: '🌑',
    cor: '#C4A265',
    descricao: 'As emocoes estao a acumular. Podes sentir tensao, inquietacao ou irritabilidade crescente.',
    conselho: 'Nao ignores os sinais. Permite-te sentir sem reagir. Escreve, respira, observa.'
  },
  {
    id: 'pico',
    nome: 'Pico',
    icon: '🌕',
    cor: '#E57373',
    descricao: 'Intensidade maxima. As emocoes pedem expressao — choro, raiva, euforia, ou uma mistura.',
    conselho: 'Este e o momento de expressao. Usa os rituais de libertacao, chora se precisares, escreve sem filtro.'
  },
  {
    id: 'libertacao',
    nome: 'Libertacao',
    icon: '🌊',
    cor: '#6B8E9B',
    descricao: 'As emocoes estao a ser processadas e libertadas. Ha alivio, talvez cansaco, talvez clareza.',
    conselho: 'Descansa. Bebe agua. Solta. Nao tentes entender tudo agora — apenas deixa fluir.'
  },
  {
    id: 'calma',
    nome: 'Calma',
    icon: '🫧',
    cor: '#5D9B84',
    descricao: 'Serenidade. O sistema emocional esta em repouso. Ha espaco para reflexao e integracao.',
    conselho: 'Aproveita esta clareza. Reflecte sobre o que sentiste. O que aprendeste sobre ti?'
  }
]

export default function CicloEmocional() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [faseActual, setFaseActual] = useState(null)
  const [historico, setHistorico] = useState([])
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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

      // Fase de hoje
      const { data: faseHoje } = await supabase
        .from('serena_ciclo_emocional')
        .select('fase, reflexao, created_at')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .maybeSingle()

      if (faseHoje) {
        setFaseActual(faseHoje.fase)
      }

      // Historico ultimos 30 dias
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

      const { data: historicoData } = await supabase
        .from('serena_ciclo_emocional')
        .select('data, fase, reflexao, created_at')
        .eq('user_id', userData.id)
        .gte('data', trintaDiasAtras.toISOString().split('T')[0])
        .order('data', { ascending: false })

      setHistorico(historicoData || [])
    } catch (error) {
      console.error('CicloEmocional: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [hoje])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Registar fase
  async function registarFase(faseId) {
    if (!userId || saving) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('serena_ciclo_emocional')
        .upsert({
          user_id: userId,
          data: hoje,
          fase: faseId
        }, { onConflict: 'user_id,data' })

      if (!error) {
        setFaseActual(faseId)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)

        // Actualizar historico
        const jaExiste = historico.find(h => h.data === hoje)
        if (jaExiste) {
          setHistorico(prev => prev.map(h => h.data === hoje ? { ...h, fase: faseId } : h))
        } else {
          setHistorico(prev => [{ data: hoje, fase: faseId, created_at: new Date().toISOString() }, ...prev])
        }
      }
    } catch (err) {
      console.error('Erro ao registar fase:', err)
    } finally {
      setSaving(false)
    }
  }

  // Detectar padrao do ciclo
  const padraoCiclo = useMemo(() => {
    if (historico.length < 7) return null

    const fases = historico.slice(0, 14).map(h => h.fase)
    const fasesOrdem = ['acumulacao', 'pico', 'libertacao', 'calma']

    // Contar fases
    const contagem = {}
    fases.forEach(f => { contagem[f] = (contagem[f] || 0) + 1 })

    const dominante = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]

    // Verificar se ha padrao ciclico
    let transicoes = 0
    for (let i = 1; i < fases.length; i++) {
      if (fases[i] !== fases[i - 1]) transicoes++
    }

    return {
      dominante: dominante ? { fase: dominante[0], count: dominante[1] } : null,
      transicoes,
      ciclico: transicoes >= 3
    }
  }, [historico])

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌙</div>
          <p className="text-white/60 text-sm">A carregar o teu ciclo...</p>
        </div>
      </div>
    )
  }

  const faseInfo = faseActual ? FASES_CICLO.find(f => f.id === faseActual) : null

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
    >
      <ModuleHeader
        eco="serena"
        title="Ciclo Emocional"
        subtitle="Mapeia as tuas fases emocionais"
        backTo="/serena/dashboard"
      />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Explicacao */}
        <div
          className="rounded-2xl border p-4 mb-6"
          style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🌊</span>
            <p className="text-white/60 text-sm leading-relaxed">
              As emocoes movem-se em ciclos: acumulam, atingem um pico, libertam-se e acalmam.
              Reconhecer em que fase estas ajuda a nao resistir ao que e natural.
            </p>
          </div>
        </div>

        {/* Fase actual / Seleccao */}
        <div
          className="rounded-2xl border p-5 mb-6"
          style={{ background: `${SERENA_COLOR}10`, borderColor: `${SERENA_COLOR}25` }}
        >
          <h2
            className="text-white text-lg font-semibold mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Como te sentes hoje?
          </h2>
          <p className="text-white/40 text-xs mb-4">
            Em que fase do ciclo emocional estas?
          </p>

          {/* Success feedback */}
          {showSuccess && (
            <div
              className="mb-4 p-3 rounded-xl text-center text-sm"
              style={{ background: `${SERENA_COLOR}30`, color: '#fff' }}
            >
              ✓ {g('Registado', 'Registada')} com sucesso
            </div>
          )}

          {/* Fases grid */}
          <div className="grid grid-cols-2 gap-3">
            {FASES_CICLO.map(fase => {
              const isActiva = faseActual === fase.id
              return (
                <button
                  key={fase.id}
                  onClick={() => registarFase(fase.id)}
                  disabled={saving}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isActiva ? 'ring-2 scale-[1.02]' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: isActiva ? `${fase.cor}25` : `${fase.cor}08`,
                    borderColor: fase.cor,
                    ringColor: isActiva ? fase.cor : 'transparent',
                    border: `1px solid ${isActiva ? `${fase.cor}60` : `${fase.cor}15`}`
                  }}
                  aria-pressed={isActiva}
                >
                  <div className="text-2xl mb-2">{fase.icon}</div>
                  <p className="text-white font-medium text-sm">{fase.nome}</p>
                  <p className="text-white/40 text-[10px] mt-1 leading-tight line-clamp-2">
                    {fase.descricao.substring(0, 60)}...
                  </p>
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
                <p className="text-white/40 text-xs">Fase actual</p>
              </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed mb-3">
              {faseInfo.descricao}
            </p>

            <div
              className="p-3 rounded-xl"
              style={{ background: `${faseInfo.cor}15` }}
            >
              <p className="text-white/50 text-xs font-medium mb-1">💡 Conselho</p>
              <p className="text-white/80 text-sm leading-relaxed">
                {faseInfo.conselho}
              </p>
            </div>
          </div>
        )}

        {/* Visualizacao do ciclo (ultimos 14 dias) */}
        {historico.length > 0 && (
          <div
            className="rounded-2xl border p-5 mb-6"
            style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
          >
            <h3
              className="text-white text-lg font-semibold mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Ultimos 14 dias
            </h3>

            <div className="flex gap-1 items-end justify-center">
              {historico.slice(0, 14).reverse().map((h, idx) => {
                const fase = FASES_CICLO.find(f => f.id === h.fase)
                if (!fase) return null

                const alturas = { calma: 20, acumulacao: 40, libertacao: 60, pico: 80 }
                const altura = alturas[h.fase] || 30
                const dia = new Date(h.data).getDate()

                return (
                  <div key={h.data} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${altura}px`,
                        background: fase.cor,
                        opacity: 0.7,
                        minWidth: '12px'
                      }}
                      title={`${dia}: ${fase.nome}`}
                    />
                    <span className="text-white/30 text-[8px]">{dia}</span>
                  </div>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {FASES_CICLO.map(fase => (
                <div key={fase.id} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: fase.cor }} />
                  <span className="text-white/40 text-[10px]">{fase.nome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Padrao detectado */}
        {padraoCiclo && (
          <div
            className="rounded-2xl border p-5"
            style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
          >
            <h3
              className="text-white text-lg font-semibold mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Padrao Detectado
            </h3>

            {padraoCiclo.dominante && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {FASES_CICLO.find(f => f.id === padraoCiclo.dominante.fase)?.icon || '🔵'}
                </span>
                <div>
                  <p className="text-white/80 text-sm">
                    Fase mais frequente: <strong>{padraoCiclo.dominante.fase}</strong>
                  </p>
                  <p className="text-white/40 text-xs">
                    {padraoCiclo.dominante.count} dias nos ultimos 14
                  </p>
                </div>
              </div>
            )}

            {padraoCiclo.ciclico ? (
              <p className="text-white/60 text-sm">
                🔄 O teu ciclo emocional esta activo — ha movimento entre fases.
                Isso e saudavel e natural.
              </p>
            ) : (
              <p className="text-white/60 text-sm">
                📌 Tens {g('estado', 'estado')} mais tempo numa fase.
                Observa se ha algo a pedir atencao.
              </p>
            )}
          </div>
        )}

        {/* Estado vazio */}
        {historico.length === 0 && !faseActual && (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
          >
            <div className="text-5xl mb-4">🌙</div>
            <h3 className="text-white text-lg font-medium mb-2">
              Comeca a mapear o teu ciclo
            </h3>
            <p className="text-white/50 text-sm">
              Selecciona a fase em que te sentes hoje. Com o tempo, vais reconhecer
              os teus padroes emocionais.
            </p>
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
