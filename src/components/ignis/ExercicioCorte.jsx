import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * IGNIS - Exercicio de Corte Semanal
 * Ritual de corte consciente: listar 10 coisas, cortar 3 que nao sao tuas.
 *
 * Tabela: ignis_corte_semanal (user_id, data, lista_10, cortadas, reflexao)
 * Recompensa: +15 chamas por exercicio completo
 */

// === ESTILOS CSS-IN-JS ===
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #2e1a14 0%, #3a2018 40%, #2e1a14 100%)',
    paddingBottom: '2rem'
  },
  heading: {
    fontFamily: 'var(--font-titulos)',
    color: '#C1634A'
  },
  cardBg: 'bg-white/5 border border-[#C1634A]/20 rounded-2xl',
  accentColor: '#C1634A',
  accentBg: 'bg-[#C1634A]',
  accentText: 'text-[#C1634A]',
  accentBorder: 'border-[#C1634A]/30',
  mutedText: 'text-[#C1634A]/60',
  bodyText: 'text-orange-100/90'
}

// === KEYFRAMES para animacao de fogo (inline style) ===
const fireKeyframes = `
@keyframes ignisBurn {
  0% { opacity: 1; transform: scale(1); filter: brightness(1); }
  30% { opacity: 0.8; transform: scale(1.02); filter: brightness(1.3) saturate(1.5); }
  60% { opacity: 0.5; transform: scale(0.98) translateY(-2px); filter: brightness(0.8); }
  100% { opacity: 0.15; transform: scale(0.95) translateY(-4px); filter: brightness(0.5) grayscale(0.4); }
}
@keyframes ignisEmber {
  0%, 100% { opacity: 0.4; transform: translateY(0) scale(1); }
  50% { opacity: 1; transform: translateY(-6px) scale(1.2); }
}
@keyframes ignisFinalBurn {
  0% { opacity: 1; transform: scale(1) translateY(0); }
  25% { opacity: 0.9; transform: scale(1.05) translateY(-3px); filter: brightness(1.5); }
  50% { opacity: 0.6; transform: scale(0.95) translateY(-8px); filter: brightness(1.2) hue-rotate(10deg); }
  75% { opacity: 0.3; transform: scale(0.85) translateY(-15px); filter: brightness(0.7) grayscale(0.3); }
  100% { opacity: 0; transform: scale(0.6) translateY(-25px); filter: brightness(0.3) grayscale(1); }
}
@keyframes ignisPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(193,99,74,0.3); }
  50% { box-shadow: 0 0 20px rgba(193,99,74,0.6); }
}
`

// === PASSO 1: LISTAR ===
function PassoListar({ lista, setLista, onNext }) {
  const preenchidos = lista.filter(item => item.trim().length > 0).length

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={styles.heading}>
          Lista 10 coisas que fazes esta semana
        </h2>
        <p className={styles.bodyText}>
          Compromissos, tarefas, habitos, obrigacoes... tudo o que ocupa o teu tempo.
        </p>
      </div>

      <div className="space-y-3">
        {lista.map((item, i) => (
          <div key={i} className={`${styles.cardBg} p-3`}>
            <label className={`text-xs font-medium ${styles.mutedText} mb-1 block`}>
              Coisa #{i + 1}
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const nova = [...lista]
                nova[i] = e.target.value
                setLista(nova)
              }}
              placeholder={`O que fazes #${i + 1}...`}
              className="w-full bg-transparent border-b border-[#C1634A]/20 text-orange-100 placeholder-[#C1634A]/30 py-2 focus:outline-none focus:border-[#C1634A]/60 transition-colors"
              maxLength={120}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className={`text-sm ${styles.mutedText}`}>
          {preenchidos}/10 {g('preenchidos', 'preenchidas')} (minimo 5)
        </p>
        <button
          onClick={onNext}
          disabled={preenchidos < 5}
          className={`px-6 py-3 ${styles.accentBg} text-white rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110`}
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Seguinte
        </button>
      </div>
    </div>
  )
}

// === PASSO 2: CORTAR ===
function PassoCortar({ lista, cortadas, setCortadas, razoes, setRazoes, onNext, onBack }) {
  const itensPreenchidos = lista
    .map((item, i) => ({ texto: item, index: i }))
    .filter(x => x.texto.trim().length > 0)

  const toggleCorte = (index) => {
    if (cortadas.includes(index)) {
      setCortadas(cortadas.filter(i => i !== index))
      const novasRazoes = { ...razoes }
      delete novasRazoes[index]
      setRazoes(novasRazoes)
    } else if (cortadas.length < 3) {
      setCortadas([...cortadas, index])
    }
  }

  const todasRazoesPreenchidas = cortadas.every(idx => razoes[idx]?.trim().length > 0)

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={styles.heading}>
          Risca 3 que nao sao tuas
        </h2>
        <p className={styles.bodyText}>
          Quais destas coisas fazes por obrigacao, por medo ou por habito — e nao por ti?
        </p>
        <p className={`text-sm mt-2 ${styles.mutedText}`}>
          {cortadas.length}/3 {g('seleccionados', 'seleccionadas')}
        </p>
      </div>

      <div className="space-y-3">
        {itensPreenchidos.map(({ texto, index }) => {
          const isCut = cortadas.includes(index)
          return (
            <div key={index}>
              <button
                onClick={() => toggleCorte(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-500 ${
                  isCut
                    ? 'border-[#C1634A]/60 bg-[#C1634A]/15'
                    : 'border-[#C1634A]/20 bg-white/5 hover:bg-white/8'
                } ${cortadas.length >= 3 && !isCut ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={cortadas.length >= 3 && !isCut}
                style={isCut ? { animation: 'ignisBurn 0.8s ease-out forwards' } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    isCut
                      ? 'bg-[#C1634A] text-white'
                      : 'bg-white/10 text-[#C1634A]/60'
                  }`}>
                    {isCut ? '~' : (index + 1)}
                  </div>
                  <span className={`flex-1 transition-all duration-500 ${
                    isCut
                      ? 'line-through text-[#C1634A]/50'
                      : 'text-orange-100'
                  }`}>
                    {texto}
                  </span>
                  {isCut && (
                    <span className="text-lg" style={{ animation: 'ignisEmber 1.5s ease-in-out infinite' }}>
                      ~
                    </span>
                  )}
                </div>
              </button>

              {/* Razao do corte */}
              {isCut && (
                <div className="mt-2 ml-11 mr-2 animate-[fadeIn_0.3s_ease-out]">
                  <label className={`text-xs ${styles.mutedText} mb-1 block`}>
                    Qual foi a primeira vez que disseste sim a isto?
                  </label>
                  <input
                    type="text"
                    value={razoes[index] || ''}
                    onChange={(e) => setRazoes({ ...razoes, [index]: e.target.value })}
                    placeholder="Quando comecou..."
                    className="w-full bg-white/5 border border-[#C1634A]/20 rounded-lg px-3 py-2 text-orange-100 placeholder-[#C1634A]/30 text-sm focus:outline-none focus:border-[#C1634A]/50"
                    maxLength={200}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className={`px-5 py-2.5 border ${styles.accentBorder} ${styles.accentText} rounded-xl text-sm hover:bg-[#C1634A]/10 transition-colors`}
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={cortadas.length !== 3 || !todasRazoesPreenchidas}
          className={`px-6 py-3 ${styles.accentBg} text-white rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110`}
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Ritual de Corte
        </button>
      </div>
    </div>
  )
}

// === PASSO 3: REFLEXAO ===
function PassoReflexao({ lista, cortadas, razoes, reflexao, setReflexao, onSave, saving, onBack }) {
  const itensCortados = cortadas.map(idx => ({
    texto: lista[idx],
    razao: razoes[idx] || ''
  }))

  const [burned, setBurned] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setBurned(true), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2" style={styles.heading}>
          Ritual de Corte
        </h2>
        <p className={styles.bodyText}>
          O fogo transforma. Observa o que solta.
        </p>
      </div>

      {/* Itens a queimar */}
      <div className="space-y-3">
        {itensCortados.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl border border-[#C1634A]/30 p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(193,99,74,0.15) 0%, rgba(193,99,74,0.05) 100%)',
              animation: `ignisFinalBurn 3.5s ${i * 0.5}s ease-out forwards`
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5" style={{ animation: 'ignisEmber 1s ease-in-out infinite' }}>~</span>
              <div>
                <p className="text-orange-100 line-through opacity-70">{item.texto}</p>
                {item.razao && (
                  <p className={`text-xs mt-1 ${styles.mutedText} italic`}>
                    &ldquo;{item.razao}&rdquo;
                  </p>
                )}
              </div>
            </div>
            {/* Overlay de fogo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(0deg, rgba(193,99,74,0.3) 0%, transparent 60%)',
                animation: `ignisEmber 2s ${i * 0.3}s ease-in-out infinite`
              }}
            />
          </div>
        ))}
      </div>

      {/* Mensagem motivacional */}
      {burned && (
        <div
          className="text-center py-4 animate-[fadeIn_1s_ease-out]"
          style={{ animation: 'ignisPulse 3s ease-in-out infinite' }}
        >
          <p className="text-lg italic" style={{ ...styles.heading, fontSize: '1.15rem' }}>
            &ldquo;O fogo queima o que nao e teu para libertar espaco ao que e.&rdquo;
          </p>
        </div>
      )}

      {/* Reflexao */}
      <div className={`${styles.cardBg} p-4`}>
        <label className={`text-sm font-medium ${styles.accentText} mb-2 block`}>
          O que sentes ao soltar isto?
        </label>
        <textarea
          value={reflexao}
          onChange={(e) => setReflexao(e.target.value)}
          placeholder={g('Escreve o que sentes, sem filtro...', 'Escreve o que sentes, sem filtro...')}
          rows={5}
          className="w-full bg-transparent border border-[#C1634A]/20 rounded-xl px-4 py-3 text-orange-100 placeholder-[#C1634A]/30 focus:outline-none focus:border-[#C1634A]/50 resize-none"
          maxLength={1000}
        />
        <p className={`text-xs mt-1 ${styles.mutedText} text-right`}>
          {reflexao.length}/1000
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className={`px-5 py-2.5 border ${styles.accentBorder} ${styles.accentText} rounded-xl text-sm hover:bg-[#C1634A]/10 transition-colors`}
        >
          Voltar
        </button>
        <button
          onClick={onSave}
          disabled={!reflexao.trim() || saving}
          className={`px-8 py-3 ${styles.accentBg} text-white rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110`}
          style={{ fontFamily: 'var(--font-titulos)', animation: reflexao.trim() ? 'ignisPulse 2s ease-in-out infinite' : 'none' }}
        >
          {saving ? 'A guardar...' : 'Guardar Ritual'}
        </button>
      </div>
    </div>
  )
}

// === HISTORICO ===
function HistoricoCortes({ historico, totalCortados, padroes }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (historico.length === 0) return null

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-bold" style={styles.heading}>
        Historico de Cortes
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${styles.cardBg} p-4 text-center`}>
          <p className="text-2xl font-bold text-[#C1634A]">{historico.length}</p>
          <p className={`text-xs ${styles.mutedText}`}>Rituais {g('completos', 'completas')}</p>
        </div>
        <div className={`${styles.cardBg} p-4 text-center`}>
          <p className="text-2xl font-bold text-[#C1634A]">{totalCortados}</p>
          <p className={`text-xs ${styles.mutedText}`}>Items {g('cortados', 'cortadas')}</p>
        </div>
      </div>

      {/* Padroes */}
      {padroes.length > 0 && (
        <div className={`${styles.cardBg} p-4`}>
          <h4 className={`text-sm font-semibold ${styles.accentText} mb-3`}>
            Items que cortaste mais vezes
          </h4>
          <div className="space-y-2">
            {padroes.slice(0, 5).map((padrao, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`text-xs font-mono ${styles.mutedText}`}>{padrao.count}x</span>
                <span className="text-orange-100/80 text-sm flex-1 truncate">{padrao.texto}</span>
                <div
                  className="h-1.5 rounded-full bg-[#C1634A]/40"
                  style={{ width: `${Math.min((padrao.count / padroes[0].count) * 60, 60)}px` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de rituais passados */}
      <div className="space-y-3">
        {historico.map((ritual, i) => {
          const cortadasData = ritual.cortadas || []
          return (
            <details key={ritual.id || i} className={`${styles.cardBg} p-4 group`}>
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <span className="text-[#C1634A]">~</span>
                  <span className="text-orange-100/80 text-sm">{formatDate(ritual.data)}</span>
                </div>
                <span className={`text-xs ${styles.mutedText}`}>
                  {cortadasData.length} {g('cortados', 'cortadas')}
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-[#C1634A]/10 space-y-2">
                {cortadasData.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-[#C1634A]/50">~</span>
                    <div>
                      <p className="text-orange-100/60 line-through">{item.texto}</p>
                      {item.razao && (
                        <p className={`text-xs ${styles.mutedText} italic mt-0.5`}>
                          &ldquo;{item.razao}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {ritual.reflexao && (
                  <div className="mt-2 pt-2 border-t border-[#C1634A]/10">
                    <p className={`text-xs ${styles.mutedText} mb-1`}>Reflexao:</p>
                    <p className="text-orange-100/70 text-sm italic">{ritual.reflexao}</p>
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}

// === COMPONENTE PRINCIPAL ===
export default function ExercicioCorte() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id

  // Estado do fluxo
  const [passo, setPasso] = useState(0) // 0=inicio, 1=listar, 2=cortar, 3=reflexao
  const [lista, setLista] = useState(Array(10).fill(''))
  const [cortadas, setCortadas] = useState([]) // indices cortados
  const [razoes, setRazoes] = useState({}) // { index: razao }
  const [reflexao, setReflexao] = useState('')

  // Estado geral
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historico, setHistorico] = useState([])
  const [exercicioSemana, setExercicioSemana] = useState(null)
  const [erro, setErro] = useState(null)

  // Carregar dados
  useEffect(() => {
    if (userId) loadData()
  }, [userId])

  const getInicioSemana = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now)
    monday.setDate(diff)
    return monday.toISOString().split('T')[0]
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const semanaActual = getInicioSemana()

      // Verificar exercicio desta semana
      const { data: exercicio } = await supabase
        .from('ignis_corte_semanal')
        .select('*')
        .eq('user_id', userId)
        .eq('data', semanaActual)
        .maybeSingle()

      if (exercicio) {
        setExercicioSemana(exercicio)
      }

      // Carregar historico
      const { data: hist } = await supabase
        .from('ignis_corte_semanal')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(52)

      setHistorico(hist || [])
    } catch (err) {
      console.error('Erro ao carregar exercicio de corte:', err)
      setErro('Erro ao carregar dados. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Calcular padroes (items cortados mais vezes)
  const calcularPadroes = () => {
    const contagem = {}
    historico.forEach(ritual => {
      const cortadasData = ritual.cortadas || []
      cortadasData.forEach(item => {
        const key = item.texto?.toLowerCase().trim()
        if (key) {
          contagem[key] = contagem[key] || { texto: item.texto, count: 0 }
          contagem[key].count++
        }
      })
    })
    return Object.values(contagem)
      .sort((a, b) => b.count - a.count)
      .filter(p => p.count > 1)
  }

  const totalCortados = historico.reduce((sum, r) => sum + (r.cortadas?.length || 0), 0)
  const padroes = calcularPadroes()

  // Guardar exercicio
  const handleSave = async () => {
    if (!userId || saving) return

    try {
      setSaving(true)
      setErro(null)

      const semanaActual = getInicioSemana()

      // Preparar dados das cortadas
      const cortadasData = cortadas.map(idx => ({
        texto: lista[idx],
        razao: razoes[idx] || ''
      }))

      // Guardar exercicio
      await supabase.from('ignis_corte_semanal').upsert({
        user_id: userId,
        data: semanaActual,
        lista_10: lista.filter(item => item.trim().length > 0),
        cortadas: cortadasData,
        reflexao: reflexao.trim(),
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,data' })

      // Premiar chamas (+15)
      if (!exercicioSemana) {
        const { data: client } = await supabase
          .from('ignis_clients')
          .select('chamas_total')
          .eq('user_id', userId)
          .maybeSingle()

        if (client) {
          await supabase
            .from('ignis_clients')
            .update({ chamas_total: (client.chamas_total || 0) + 15 })
            .eq('user_id', userId)
        }
      }

      setSaved(true)
      await loadData()
    } catch (err) {
      console.error('Erro ao guardar exercicio:', err)
      setErro('Erro ao guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  // Reset para novo exercicio
  const handleNovo = () => {
    setLista(Array(10).fill(''))
    setCortadas([])
    setRazoes({})
    setReflexao('')
    setPasso(1)
    setSaved(false)
  }

  // === RENDERS ===

  if (loading) {
    return (
      <div style={styles.page} className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4" style={{ animation: 'ignisEmber 1.5s ease-in-out infinite' }}>~</div>
          <p className={styles.mutedText}>A carregar...</p>
        </div>
      </div>
    )
  }

  // Tela de sucesso
  if (saved) {
    return (
      <div style={styles.page}>
        <style>{fireKeyframes}</style>
        <ModuleHeader eco="ignis" title="Exercicio de Corte" subtitle="Ritual semanal" />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div
              className="text-6xl mx-auto"
              style={{ animation: 'ignisEmber 2s ease-in-out infinite' }}
            >
              ~
            </div>
            <h2 className="text-2xl font-bold" style={styles.heading}>
              Ritual {g('completo', 'completa')}
            </h2>
            <p className={styles.bodyText}>
              Soltaste 3 coisas que nao te pertencem.
              O espaco que criaste e teu agora.
            </p>
            {!exercicioSemana && (
              <div className={`${styles.cardBg} p-4 inline-flex items-center gap-3`}>
                <span className="text-2xl">~</span>
                <div className="text-left">
                  <p className="text-[#C1634A] font-bold">+15 chamas</p>
                  <p className={`text-xs ${styles.mutedText}`}>Ritual de corte semanal</p>
                </div>
              </div>
            )}
            <div className="pt-4">
              <button
                onClick={() => { setSaved(false); setPasso(0) }}
                className={`px-6 py-3 border ${styles.accentBorder} ${styles.accentText} rounded-xl hover:bg-[#C1634A]/10 transition-colors`}
              >
                Ver historico
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <style>{fireKeyframes}</style>
      <ModuleHeader eco="ignis" title="Exercicio de Corte" subtitle="Ritual semanal" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Erro */}
        {erro && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {erro}
          </div>
        )}

        {/* Passo 0: Inicio / Historico */}
        {passo === 0 && (
          <div className="space-y-6">
            {/* CTA principal */}
            <div className={`${styles.cardBg} p-6 text-center`}>
              {exercicioSemana ? (
                <>
                  <div className="text-3xl mb-3">~</div>
                  <h2 className="text-xl font-bold mb-2" style={styles.heading}>
                    Ritual desta semana {g('completo', 'completa')}
                  </h2>
                  <p className={`text-sm ${styles.mutedText} mb-4`}>
                    Ja fizeste o exercicio de corte esta semana. Volta na proxima segunda-feira.
                  </p>
                  <button
                    onClick={handleNovo}
                    className={`px-5 py-2.5 border ${styles.accentBorder} ${styles.accentText} rounded-xl text-sm hover:bg-[#C1634A]/10 transition-colors`}
                  >
                    Refazer exercicio
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="text-4xl mb-4 mx-auto"
                    style={{ animation: 'ignisPulse 3s ease-in-out infinite' }}
                  >
                    ~
                  </div>
                  <h2 className="text-xl font-bold mb-2" style={styles.heading}>
                    Exercicio de Corte Semanal
                  </h2>
                  <p className={`text-sm ${styles.bodyText} mb-4`}>
                    Lista 10 coisas que fazes esta semana. Depois, corta 3 que nao sao tuas.
                    Um ritual de fogo para libertar espaco.
                  </p>
                  <button
                    onClick={() => setPasso(1)}
                    className={`px-8 py-3 ${styles.accentBg} text-white rounded-xl font-semibold transition-all hover:brightness-110`}
                    style={{ fontFamily: 'var(--font-titulos)', animation: 'ignisPulse 2s ease-in-out infinite' }}
                  >
                    Comecar Ritual
                  </button>
                </>
              )}
            </div>

            {/* Progresso dos passos */}
            {passo === 0 && historico.length > 0 && (
              <HistoricoCortes
                historico={historico}
                totalCortados={totalCortados}
                padroes={padroes}
              />
            )}
          </div>
        )}

        {/* Indicador de passo */}
        {passo >= 1 && passo <= 3 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(p => (
              <div
                key={p}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  p === passo
                    ? 'w-8 bg-[#C1634A]'
                    : p < passo
                      ? 'w-4 bg-[#C1634A]/50'
                      : 'w-4 bg-[#C1634A]/20'
                }`}
              />
            ))}
          </div>
        )}

        {/* Passo 1: Listar */}
        {passo === 1 && (
          <PassoListar
            lista={lista}
            setLista={setLista}
            onNext={() => setPasso(2)}
          />
        )}

        {/* Passo 2: Cortar */}
        {passo === 2 && (
          <PassoCortar
            lista={lista}
            cortadas={cortadas}
            setCortadas={setCortadas}
            razoes={razoes}
            setRazoes={setRazoes}
            onNext={() => setPasso(3)}
            onBack={() => setPasso(1)}
          />
        )}

        {/* Passo 3: Reflexao */}
        {passo === 3 && (
          <PassoReflexao
            lista={lista}
            cortadas={cortadas}
            razoes={razoes}
            reflexao={reflexao}
            setReflexao={setReflexao}
            onSave={handleSave}
            saving={saving}
            onBack={() => setPasso(2)}
          />
        )}
      </main>
    </div>
  )
}
