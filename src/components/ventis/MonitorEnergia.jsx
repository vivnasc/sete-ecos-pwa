import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ===== CONSTANTES =====

const PERIODOS = {
  manha: { label: 'Manha', icon: '\u2600\uFE0F', range: [0, 12] },
  tarde: { label: 'Tarde', icon: '\uD83C\uDF24\uFE0F', range: [12, 18] },
  noite: { label: 'Noite', icon: '\uD83C\uDF19', range: [18, 24] }
}

const HUMORES = [
  { id: 'energetic', label: 'Com energia', icon: '\u26A1' },
  { id: 'calm', label: 'Calmo', labelF: 'Calma', icon: '\uD83E\uDDD8' },
  { id: 'tired', label: 'Cansado', labelF: 'Cansada', icon: '\uD83D\uDE34' },
  { id: 'stressed', label: 'Stressado', labelF: 'Stressada', icon: '\uD83D\uDE30' },
  { id: 'happy', label: 'Feliz', icon: '\uD83D\uDE04' },
  { id: 'neutral', label: 'Neutro', labelF: 'Neutra', icon: '\uD83D\uDE10' }
]

const VENTIS_COLOR = '#5D9B84'
const VENTIS_DARK = '#1a2e24'
const FOLHAS_POR_CHECKIN = 3

// ===== HELPERS =====

function getPeriodoActual() {
  const hora = new Date().getHours()
  if (hora < 12) return 'manha'
  if (hora < 18) return 'tarde'
  return 'noite'
}

function getCorNivel(nivel) {
  if (nivel >= 70) return '#22c55e'
  if (nivel >= 40) return '#eab308'
  return '#ef4444'
}

function getCorNivelBg(nivel) {
  if (nivel >= 70) return 'bg-green-500'
  if (nivel >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getCorNivelClasse(nivel) {
  if (nivel >= 70) return 'text-green-600'
  if (nivel >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00')
  return d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric' })
}

// ===== COMPONENTE BATERIA SVG =====

function BatteryIcon({ nivel, tamanho = 48, label }) {
  const cor = getCorNivel(nivel)
  const preenchimento = nivel / 100
  const w = tamanho
  const h = tamanho * 1.6

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={w} height={h} viewBox="0 0 30 48" fill="none" aria-label={`Bateria ${nivel}%`}>
        {/* Terminal da bateria */}
        <rect x="10" y="0" width="10" height="4" rx="1.5" fill="#9ca3af" />
        {/* Corpo da bateria */}
        <rect x="3" y="4" width="24" height="40" rx="4" stroke="#9ca3af" strokeWidth="2" fill="none" />
        {/* Nivel de preenchimento */}
        {nivel > 0 && (
          <rect
            x="6"
            y={8 + 33 * (1 - preenchimento)}
            width="18"
            height={33 * preenchimento}
            rx="2"
            fill={cor}
            opacity="0.85"
          />
        )}
        {/* Percentagem no centro */}
        <text
          x="15"
          y="28"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill={nivel > 0 ? '#fff' : '#9ca3af'}
        >
          {nivel > 0 ? `${nivel}%` : '--'}
        </text>
      </svg>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  )
}

// ===== COMPONENTE SLIDER VISUAL =====

function EnergySlider({ value, onChange }) {
  const gradientStyle = {
    background: `linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)`
  }

  const thumbPosition = `${value}%`

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span className="font-semibold text-base" style={{ color: getCorNivel(value) }}>
          {value}%
        </span>
        <span>100%</span>
      </div>
      <div className="relative h-8 flex items-center">
        <div className="absolute inset-x-0 h-3 rounded-full" style={gradientStyle} />
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-3 appearance-none bg-transparent cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            '--thumb-color': getCorNivel(value)
          }}
          aria-label="Nivel de energia"
        />
      </div>
      {/* Labels visuais */}
      <div className="flex justify-between text-xs">
        <span className="text-red-500">Sem energia</span>
        <span className="text-yellow-600">Normal</span>
        <span className="text-green-600">Cheio de energia</span>
      </div>
    </div>
  )
}

// ===== COMPONENTE ESTRELAS =====

function StarRating({ value, onChange, max = 5, label }) {
  return (
    <div>
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`text-2xl transition-transform hover:scale-125 ${
              i < value ? 'opacity-100' : 'opacity-30'
            }`}
            aria-label={`${i + 1} de ${max}`}
          >
            {'\u2B50'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ===== COMPONENTE PRINCIPAL =====

export default function MonitorEnergia() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id

  // Estados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [registosHoje, setRegistosHoje] = useState([])
  const [registosSemana, setRegistosSemana] = useState([])
  const [folhasTotal, setFolhasTotal] = useState(0)

  // Formulario de check-in
  const [nivel, setNivel] = useState(50)
  const [sonoQualidade, setSonoQualidade] = useState(0)
  const [alimentacaoQualidade, setAlimentacaoQualidade] = useState(0)
  const [actividadeFisica, setActividadeFisica] = useState(false)
  const [humor, setHumor] = useState('')
  const [notas, setNotas] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  const periodoActual = getPeriodoActual()
  const hoje = new Date().toISOString().split('T')[0]

  // Verificar se o periodo actual ja foi registado
  const periodoJaRegistado = useMemo(() => {
    return registosHoje.find(r => r.periodo === periodoActual)
  }, [registosHoje, periodoActual])

  // ===== CARREGAR DADOS =====

  const carregarDados = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      // Registos de hoje
      const { data: hojeData, error: hojeErr } = await supabase
        .from('ventis_energia_log')
        .select('*')
        .eq('user_id', userId)
        .eq('data', hoje)
        .order('created_at', { ascending: true })

      if (hojeErr) throw hojeErr
      setRegistosHoje(hojeData || [])

      // Registos dos ultimos 7 dias
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - 7)
      const dataLimiteStr = dataLimite.toISOString().split('T')[0]

      const { data: semanaData, error: semanaErr } = await supabase
        .from('ventis_energia_log')
        .select('*')
        .eq('user_id', userId)
        .gte('data', dataLimiteStr)
        .order('data', { ascending: true })

      if (semanaErr) throw semanaErr
      setRegistosSemana(semanaData || [])

      // Folhas total
      const { data: clientData } = await supabase
        .from('ventis_clients')
        .select('folhas_total')
        .eq('user_id', userId)
        .maybeSingle()

      setFolhasTotal(clientData?.folhas_total || 0)
    } catch (err) {
      console.error('Erro ao carregar dados de energia:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, hoje])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // ===== GUARDAR CHECK-IN =====

  const guardarCheckin = async () => {
    if (!userId) return
    setSaving(true)
    setMensagemSucesso('')

    try {
      // Inserir registo de energia
      const registo = {
        user_id: userId,
        data: hoje,
        periodo: periodoActual,
        nivel,
        humor: humor || null,
        notas: notas.trim() || null,
        actividade_fisica: actividadeFisica
      }

      // Campos condicionais por periodo
      if (periodoActual === 'manha' && sonoQualidade > 0) {
        registo.sono_qualidade = sonoQualidade
      }
      if (periodoActual === 'tarde' && alimentacaoQualidade > 0) {
        registo.alimentacao_qualidade = alimentacaoQualidade
      }

      const { error: insertErr } = await supabase
        .from('ventis_energia_log')
        .insert(registo)

      if (insertErr) throw insertErr

      // Incrementar folhas no perfil do cliente
      const { error: folhasErr } = await supabase.rpc('increment_field', {
        table_name: 'ventis_clients',
        field_name: 'folhas_total',
        increment_by: FOLHAS_POR_CHECKIN,
        user_id_value: userId
      })

      // Se a funcao RPC nao existe, tentar update directo
      if (folhasErr) {
        const { data: clientAtual } = await supabase
          .from('ventis_clients')
          .select('folhas_total')
          .eq('user_id', userId)
          .maybeSingle()

        if (clientAtual) {
          await supabase
            .from('ventis_clients')
            .update({ folhas_total: (clientAtual.folhas_total || 0) + FOLHAS_POR_CHECKIN })
            .eq('user_id', userId)
        }
      }

      setFolhasTotal(prev => prev + FOLHAS_POR_CHECKIN)
      setMensagemSucesso(`Check-in ${g('guardado', 'guardada')}! +${FOLHAS_POR_CHECKIN} folhas`)

      // Reset form
      setNivel(50)
      setSonoQualidade(0)
      setAlimentacaoQualidade(0)
      setActividadeFisica(false)
      setHumor('')
      setNotas('')

      // Recarregar dados
      await carregarDados()

      // Limpar mensagem apos 3s
      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (err) {
      console.error('Erro ao guardar check-in:', err)
      setMensagemSucesso('Erro ao guardar. Tenta novamente.')
      setTimeout(() => setMensagemSucesso(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  // ===== DADOS PARA O GRAFICO SEMANAL =====

  const dadosSemana = useMemo(() => {
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dataStr = d.toISOString().split('T')[0]
      const registosDia = registosSemana.filter(r => r.data === dataStr)
      const media = registosDia.length > 0
        ? Math.round(registosDia.reduce((sum, r) => sum + r.nivel, 0) / registosDia.length)
        : null

      dias.push({
        data: dataStr,
        label: formatarData(dataStr),
        media,
        registos: registosDia.length
      })
    }
    return dias
  }, [registosSemana])

  // ===== CORRELACOES =====

  const correlacoes = useMemo(() => {
    if (registosSemana.length < 7) return null

    const comSono = registosSemana.filter(r => r.sono_qualidade && r.sono_qualidade >= 4)
    const semSono = registosSemana.filter(r => r.sono_qualidade && r.sono_qualidade < 4)
    const comActividade = registosSemana.filter(r => r.actividade_fisica === true)
    const semActividade = registosSemana.filter(r => r.actividade_fisica === false)

    const result = []

    if (comSono.length > 0 && semSono.length > 0) {
      const mediaBomSono = Math.round(comSono.reduce((s, r) => s + r.nivel, 0) / comSono.length)
      const mediaMauSono = Math.round(semSono.reduce((s, r) => s + r.nivel, 0) / semSono.length)
      const diff = mediaBomSono - mediaMauSono
      if (diff > 0) {
        result.push({
          texto: `Quando dormes bem, a tua energia e ${diff}% maior`,
          icone: '\uD83D\uDCA4',
          positivo: true
        })
      }
    }

    if (comActividade.length > 0 && semActividade.length > 0) {
      const mediaComAct = Math.round(comActividade.reduce((s, r) => s + r.nivel, 0) / comActividade.length)
      const mediaSemAct = Math.round(semActividade.reduce((s, r) => s + r.nivel, 0) / semActividade.length)
      const diff = mediaComAct - mediaSemAct
      if (diff > 0) {
        result.push({
          texto: `Nos dias com actividade fisica, energia sobe ${diff}%`,
          icone: '\uD83C\uDFC3',
          positivo: true
        })
      }
    }

    return result.length > 0 ? result : null
  }, [registosSemana])

  // ===== LOADING =====

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${VENTIS_DARK} 0%, #0f1f18 100%)` }}>
        <ModuleHeader eco="ventis" title="Monitor de Energia" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-pulse">{'\uD83C\uDF3F'}</div>
            <p className="text-[#5D9B84]/80">A carregar...</p>
          </div>
        </div>
      </div>
    )
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(180deg, ${VENTIS_DARK} 0%, #0f1f18 100%)` }}>
      <ModuleHeader
        eco="ventis"
        title="Monitor de Energia"
        subtitle={`${g('Acompanha o teu ritmo', 'Acompanha o teu ritmo')} - 3x por dia`}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Folhas badge */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-[#5D9B84]/70">{'\uD83C\uDF43'} {folhasTotal} folhas</span>
        </div>

        {/* Mensagem de sucesso */}
        {mensagemSucesso && (
          <div className={`p-3 rounded-xl text-center text-sm font-medium animate-fadeIn ${
            mensagemSucesso.includes('Erro')
              ? 'bg-red-500/20 text-red-300'
              : 'bg-[#5D9B84]/20 text-[#5D9B84]'
          }`}>
            {mensagemSucesso}
          </div>
        )}

        {/* ===== SECAO 1: TIMELINE DE HOJE ===== */}
        <section className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-[#5D9B84]/20">
          <h2
            className="text-lg font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Energia de Hoje
          </h2>

          <div className="flex items-center justify-around">
            {Object.entries(PERIODOS).map(([key, periodo], idx) => {
              const registo = registosHoje.find(r => r.periodo === key)
              const isActual = key === periodoActual

              return (
                <React.Fragment key={key}>
                  {idx > 0 && (
                    <div className="flex-1 mx-2">
                      <div
                        className="h-0.5 rounded"
                        style={{
                          background: registo || registosHoje.find(r => r.periodo === Object.keys(PERIODOS)[idx - 1])
                            ? `linear-gradient(to right, ${getCorNivel(registosHoje.find(r => r.periodo === Object.keys(PERIODOS)[idx - 1])?.nivel || 0)}, ${registo ? getCorNivel(registo.nivel) : '#374151'})`
                            : '#374151'
                        }}
                      />
                    </div>
                  )}
                  <div className={`flex flex-col items-center ${isActual ? 'scale-110' : ''} transition-transform`}>
                    <span className="text-lg mb-1">{periodo.icon}</span>
                    <BatteryIcon
                      nivel={registo?.nivel || 0}
                      tamanho={isActual ? 40 : 32}
                      label={periodo.label}
                    />
                    {isActual && !registo && (
                      <span className="text-[10px] text-[#5D9B84] mt-1 font-medium">AGORA</span>
                    )}
                    {registo && (
                      <span className="text-xs mt-1" style={{ color: getCorNivel(registo.nivel) }}>
                        {registo.nivel}%
                      </span>
                    )}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </section>

        {/* ===== SECAO 2: CHECK-IN ACTUAL ===== */}
        {!periodoJaRegistado ? (
          <section className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-[#5D9B84]/30">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{PERIODOS[periodoActual].icon}</span>
              <div>
                <h2
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Check-in da {PERIODOS[periodoActual].label}
                </h2>
                <p className="text-sm text-gray-400">
                  Como {g('estas', 'estas')} a sentir-te agora?
                </p>
              </div>
            </div>

            {/* Nivel de Energia — Slider */}
            <div className="mb-6">
              <label className="text-sm text-gray-300 mb-2 block">Nivel de energia</label>
              <div className="bg-white/10 rounded-xl p-4">
                <EnergySlider value={nivel} onChange={setNivel} />
              </div>
            </div>

            {/* Qualidade do Sono — so de manha */}
            {periodoActual === 'manha' && (
              <div className="mb-5">
                <StarRating
                  value={sonoQualidade}
                  onChange={setSonoQualidade}
                  label="Como dormiste?"
                />
              </div>
            )}

            {/* Qualidade da Alimentacao — so de tarde */}
            {periodoActual === 'tarde' && (
              <div className="mb-5">
                <StarRating
                  value={alimentacaoQualidade}
                  onChange={setAlimentacaoQualidade}
                  label="Como foi a alimentacao hoje?"
                />
              </div>
            )}

            {/* Actividade Fisica — tarde e noite */}
            {(periodoActual === 'tarde' || periodoActual === 'noite') && (
              <div className="mb-5">
                <p className="text-sm text-gray-300 mb-2">Fizeste actividade fisica hoje?</p>
                <button
                  type="button"
                  onClick={() => setActividadeFisica(!actividadeFisica)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
                    actividadeFisica
                      ? 'bg-[#5D9B84]/30 border-[#5D9B84] text-[#5D9B84]'
                      : 'bg-white/5 border-gray-600 text-gray-400'
                  } border`}
                  aria-pressed={actividadeFisica}
                >
                  <div className={`w-10 h-6 rounded-full flex items-center transition-all ${
                    actividadeFisica ? 'bg-[#5D9B84] justify-end' : 'bg-gray-600 justify-start'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-white m-0.5 shadow" />
                  </div>
                  <span className="text-sm">
                    {actividadeFisica ? 'Sim, fiz exercicio!' : 'Nao, hoje nao'}
                  </span>
                </button>
              </div>
            )}

            {/* Humor */}
            <div className="mb-5">
              <p className="text-sm text-gray-300 mb-2">Estado de espirito</p>
              <div className="grid grid-cols-3 gap-2">
                {HUMORES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHumor(h.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      humor === h.id
                        ? 'bg-[#5D9B84]/30 border-[#5D9B84] scale-105'
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    } border`}
                  >
                    <span className="text-xl">{h.icon}</span>
                    <span className="text-xs text-gray-300">
                      {h.labelF ? g(h.label, h.labelF) : h.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="mb-6">
              <label className="text-sm text-gray-300 mb-2 block">
                Notas (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Como te sentes? O que influenciou a tua energia?"
                className="w-full bg-white/5 border border-gray-600 rounded-xl p-3 text-white text-sm placeholder-gray-500 focus:border-[#5D9B84] focus:outline-none focus:ring-1 focus:ring-[#5D9B84] resize-none"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Botao Guardar */}
            <button
              onClick={guardarCheckin}
              disabled={saving}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${VENTIS_COLOR} 0%, #4a8a73 100%)` }}
            >
              {saving ? 'A guardar...' : `Registar energia (+${FOLHAS_POR_CHECKIN} folhas)`}
            </button>
          </section>
        ) : (
          /* Periodo ja registado — mostrar leitura */
          <section className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-[#5D9B84]/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{PERIODOS[periodoActual].icon}</span>
              <div>
                <h2
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Check-in da {PERIODOS[periodoActual].label}
                </h2>
                <p className="text-sm text-[#5D9B84]">
                  {g('Registado', 'Registada')} {'\u2714\uFE0F'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <BatteryIcon nivel={periodoJaRegistado.nivel} tamanho={56} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Energia:</span>
                  <span className="font-bold text-lg" style={{ color: getCorNivel(periodoJaRegistado.nivel) }}>
                    {periodoJaRegistado.nivel}%
                  </span>
                </div>
                {periodoJaRegistado.humor && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Humor:</span>
                    <span className="text-sm text-gray-200">
                      {HUMORES.find(h => h.id === periodoJaRegistado.humor)?.icon}{' '}
                      {(() => {
                        const h = HUMORES.find(h => h.id === periodoJaRegistado.humor)
                        return h?.labelF ? g(h.label, h.labelF) : h?.label
                      })()}
                    </span>
                  </div>
                )}
                {periodoJaRegistado.sono_qualidade && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sono:</span>
                    <span className="text-sm text-yellow-400">
                      {'\u2B50'.repeat(periodoJaRegistado.sono_qualidade)}
                    </span>
                  </div>
                )}
                {periodoJaRegistado.alimentacao_qualidade && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Alimentacao:</span>
                    <span className="text-sm text-yellow-400">
                      {'\u2B50'.repeat(periodoJaRegistado.alimentacao_qualidade)}
                    </span>
                  </div>
                )}
                {periodoJaRegistado.actividade_fisica && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Actividade:</span>
                    <span className="text-sm text-green-400">Sim {'\uD83C\uDFC3'}</span>
                  </div>
                )}
                {periodoJaRegistado.notas && (
                  <p className="text-xs text-gray-400 italic mt-2">
                    &ldquo;{periodoJaRegistado.notas}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== SECAO 3: GRAFICO SEMANAL ===== */}
        <section className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-[#5D9B84]/20">
          <h2
            className="text-lg font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Energia Semanal
          </h2>

          {dadosSemana.some(d => d.media !== null) ? (
            <div className="space-y-3">
              {/* Barras do grafico */}
              <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
                {dadosSemana.map((dia, idx) => {
                  const alturaMax = 140
                  const altura = dia.media !== null ? (dia.media / 100) * alturaMax : 0
                  const isHoje = dia.data === hoje

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      {/* Valor no topo */}
                      {dia.media !== null && (
                        <span className="text-xs font-medium" style={{ color: getCorNivel(dia.media) }}>
                          {dia.media}%
                        </span>
                      )}
                      {/* Barra */}
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${Math.max(altura, 4)}px`,
                          background: dia.media !== null
                            ? `linear-gradient(180deg, ${getCorNivel(dia.media)} 0%, ${getCorNivel(dia.media)}66 100%)`
                            : '#374151',
                          opacity: dia.media !== null ? 1 : 0.3
                        }}
                      />
                      {/* Label do dia */}
                      <span className={`text-xs ${isHoje ? 'text-[#5D9B84] font-bold' : 'text-gray-500'}`}>
                        {dia.label.split(',')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Media semanal */}
              {(() => {
                const diasComDados = dadosSemana.filter(d => d.media !== null)
                if (diasComDados.length === 0) return null
                const mediaSemana = Math.round(
                  diasComDados.reduce((s, d) => s + d.media, 0) / diasComDados.length
                )
                return (
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400">Media semanal:</span>
                    <span className="font-bold" style={{ color: getCorNivel(mediaSemana) }}>
                      {mediaSemana}%
                    </span>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-3xl block mb-2">{'\uD83D\uDCC8'}</span>
              <p className="text-sm">Sem dados ainda. Faz o teu primeiro check-in!</p>
            </div>
          )}
        </section>

        {/* ===== SECAO 4: CORRELACOES ===== */}
        {correlacoes && (
          <section className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-[#5D9B84]/20">
            <h2
              className="text-lg font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {g('O que influencia a tua energia', 'O que influencia a tua energia')}
            </h2>

            <div className="space-y-3">
              {correlacoes.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#5D9B84]/10 border border-[#5D9B84]/20"
                >
                  <span className="text-2xl">{c.icone}</span>
                  <p className="text-sm text-gray-200">{c.texto}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Baseado nos teus registos dos ultimos 7 dias
            </p>
          </section>
        )}

        {/* Dica quando poucos dados */}
        {registosSemana.length < 7 && registosSemana.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">
              {'\uD83D\uDCA1'} Faz check-ins durante 7+ dias para ver correlacoes entre sono, actividade e energia
            </p>
          </div>
        )}

      </main>

      {/* CSS para o slider thumb */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${VENTIS_COLOR};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${VENTIS_COLOR};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
