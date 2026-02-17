import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * MAPA DE SILENCIAMENTO — Componente central do ECOA
 * Onde te calas? Com quem? Que verdades guardam a tua garganta?
 *
 * Fluxo de 3 passos:
 * 1. ZONAS — Onde te calas mais? (multi-select + slider 1-10)
 * 2. PESSOAS — Com quem te calas? (multi-select + tipos de verdade)
 * 3. VERDADES — Que verdades guardas? (texto livre + destinatario + barreira)
 *
 * Ao completar: salva em ecoa_silenciamento, marca silenciamento_mapeado = true, +15 ecos
 *
 * Modo visualizacao: mapa visual com circulos, pessoas, verdades, e botao para editar
 */

const ECOA_COLOR = '#4A90A4'
const ECOA_DARK = '#1a2a34'

// Zonas de silenciamento com icones
const ZONAS_OPTIONS = [
  { id: 'casa', label: 'Casa', icon: '\u{1F3E0}' },
  { id: 'trabalho', label: 'Trabalho', icon: '\u{1F4BC}' },
  { id: 'familia', label: 'Familia', icon: '\u{1F46A}' },
  { id: 'amigos', label: 'Amigos', icon: '\u{1F46B}' },
  { id: 'relacao_amorosa', label: 'Relacao amorosa', icon: '\u{2764}\uFE0F' },
  { id: 'redes_sociais', label: 'Redes sociais', icon: '\u{1F4F1}' },
  { id: 'reunioes', label: 'Reunioes', icon: '\u{1F4CB}' },
  { id: 'espacos_publicos', label: 'Espacos publicos', icon: '\u{1F3DB}\uFE0F' }
]

// Pessoas com quem se cala
const PESSOAS_OPTIONS = [
  { id: 'parceiro', label: g('Parceiro', 'Parceira'), icon: '\u{1F491}' },
  { id: 'mae', label: 'Mae', icon: '\u{1F469}' },
  { id: 'pai', label: 'Pai', icon: '\u{1F468}' },
  { id: 'chefe', label: 'Chefe', icon: '\u{1F454}' },
  { id: 'colegas', label: 'Colegas', icon: '\u{1F465}' },
  { id: 'amigos', label: 'Amigos', icon: '\u{1F46B}' },
  { id: 'sogra_sogro', label: 'Sogra/Sogro', icon: '\u{1F9D3}' },
  { id: 'filhos', label: 'Filhos', icon: '\u{1F476}' }
]

// Tipos de verdade que nao se dizem
const TIPOS_VERDADE = [
  { id: 'desacordo', label: 'Desacordo' },
  { id: 'desejo', label: 'Desejo' },
  { id: 'limite', label: 'Limite' },
  { id: 'dor', label: 'Dor' },
  { id: 'opiniao', label: 'Opiniao' },
  { id: 'necessidade', label: 'Necessidade' }
]

export default function MapaSilenciamento() {
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)

  // Modo: 'setup' (novo ou edicao) ou 'view' (ja mapeado)
  const [mode, setMode] = useState('setup')
  const [step, setStep] = useState(1)

  // Dados do mapa existente (view mode)
  const [existingData, setExistingData] = useState(null)
  const [vozesAbertasCount, setVozesAbertasCount] = useState(0)

  // Step 1 — Zonas
  const [selectedZonas, setSelectedZonas] = useState([])
  // { zonaId: nivel } — Ex: { casa: 7, trabalho: 9 }
  const [zonaNiveis, setZonaNiveis] = useState({})

  // Step 2 — Pessoas
  const [selectedPessoas, setSelectedPessoas] = useState([])
  const [customPessoa, setCustomPessoa] = useState('')
  // { pessoaId: [tipo1, tipo2, ...] }
  const [pessoaVerdades, setPessoaVerdades] = useState({})

  // Step 3 — Verdades
  const [verdades, setVerdades] = useState([])
  const [novaVerdade, setNovaVerdade] = useState('')
  const [novaVerdadeDestinatario, setNovaVerdadeDestinatario] = useState('')
  const [novaVerdadeBarreira, setNovaVerdadeBarreira] = useState('')

  // ===== Carregar dados existentes =====
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

      // Verificar se ja tem mapa
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('silenciamento_mapeado')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (clientData?.silenciamento_mapeado) {
        // Buscar dados do mapa
        const { data: mapaData } = await supabase
          .from('ecoa_silenciamento')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle()

        if (mapaData) {
          const zonas = typeof mapaData.zonas === 'string' ? JSON.parse(mapaData.zonas) : (mapaData.zonas || [])
          const pessoas = typeof mapaData.pessoas === 'string' ? JSON.parse(mapaData.pessoas) : (mapaData.pessoas || [])
          const verdadesData = typeof mapaData.verdades_nao_ditas === 'string' ? JSON.parse(mapaData.verdades_nao_ditas) : (mapaData.verdades_nao_ditas || [])

          setExistingData({ zonas, pessoas, verdades: verdadesData })
          setMode('view')

          // Preencher formulario para possivel edicao
          const zonaIds = zonas.map(z => z.id)
          setSelectedZonas(zonaIds)
          const niveis = {}
          zonas.forEach(z => { niveis[z.id] = z.nivel || 5 })
          setZonaNiveis(niveis)

          const pessoaIds = pessoas.map(p => p.id)
          setSelectedPessoas(pessoaIds)
          const pVerdades = {}
          pessoas.forEach(p => { pVerdades[p.id] = p.tipos_verdade || [] })
          setPessoaVerdades(pVerdades)

          setVerdades(verdadesData || [])
        }
      }

      // Contar zonas que ja comecaram a abrir (voz_recuperada com zona)
      const { count: vozesCount } = await supabase
        .from('ecoa_voz_recuperada')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setVozesAbertasCount(vozesCount || 0)

    } catch (error) {
      console.error('MapaSilenciamento: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ===== Step 1 handlers — Zonas =====
  function toggleZona(zonaId) {
    setSelectedZonas(prev => {
      if (prev.includes(zonaId)) {
        const newNiveis = { ...zonaNiveis }
        delete newNiveis[zonaId]
        setZonaNiveis(newNiveis)
        return prev.filter(id => id !== zonaId)
      }
      setZonaNiveis(prev2 => ({ ...prev2, [zonaId]: 5 }))
      return [...prev, zonaId]
    })
  }

  function setZonaNivel(zonaId, nivel) {
    setZonaNiveis(prev => ({ ...prev, [zonaId]: parseInt(nivel) }))
  }

  // ===== Step 2 handlers — Pessoas =====
  function togglePessoa(pessoaId) {
    setSelectedPessoas(prev => {
      if (prev.includes(pessoaId)) {
        const newVerdades = { ...pessoaVerdades }
        delete newVerdades[pessoaId]
        setPessoaVerdades(newVerdades)
        return prev.filter(id => id !== pessoaId)
      }
      setPessoaVerdades(prev2 => ({ ...prev2, [pessoaId]: [] }))
      return [...prev, pessoaId]
    })
  }

  function addCustomPessoa() {
    const nome = customPessoa.trim()
    if (!nome) return
    const id = `custom_${nome.toLowerCase().replace(/\s+/g, '_')}`
    if (!selectedPessoas.includes(id)) {
      setSelectedPessoas(prev => [...prev, id])
      setPessoaVerdades(prev => ({ ...prev, [id]: [] }))
    }
    setCustomPessoa('')
  }

  function togglePessoaVerdade(pessoaId, tipoId) {
    setPessoaVerdades(prev => {
      const current = prev[pessoaId] || []
      if (current.includes(tipoId)) {
        return { ...prev, [pessoaId]: current.filter(t => t !== tipoId) }
      }
      return { ...prev, [pessoaId]: [...current, tipoId] }
    })
  }

  // ===== Step 3 handlers — Verdades =====
  function addVerdade() {
    if (!novaVerdade.trim()) return
    setVerdades(prev => [
      ...prev,
      {
        texto: novaVerdade.trim(),
        destinatario: novaVerdadeDestinatario.trim(),
        barreira: novaVerdadeBarreira.trim()
      }
    ])
    setNovaVerdade('')
    setNovaVerdadeDestinatario('')
    setNovaVerdadeBarreira('')
  }

  function removeVerdade(index) {
    setVerdades(prev => prev.filter((_, i) => i !== index))
  }

  // ===== Salvar mapa =====
  async function saveMapa() {
    if (!userId) return
    setSaving(true)

    try {
      // Construir dados
      const zonasData = selectedZonas.map(id => ({
        id,
        label: ZONAS_OPTIONS.find(z => z.id === id)?.label || id,
        nivel: zonaNiveis[id] || 5
      }))

      const pessoasData = selectedPessoas.map(id => {
        const option = PESSOAS_OPTIONS.find(p => p.id === id)
        return {
          id,
          label: option?.label || id.replace('custom_', '').replace(/_/g, ' '),
          tipos_verdade: pessoaVerdades[id] || []
        }
      })

      const mapaPayload = {
        user_id: userId,
        zonas: zonasData,
        pessoas: pessoasData,
        verdades_nao_ditas: verdades
      }

      // Upsert no mapa de silenciamento
      const { error: mapaError } = await supabase
        .from('ecoa_silenciamento')
        .upsert(mapaPayload, { onConflict: 'user_id' })

      if (mapaError) {
        console.error('Erro ao salvar mapa:', mapaError)
        return
      }

      // Marcar silenciamento_mapeado = true e adicionar ecos
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('silenciamento_mapeado, ecos_total')
        .eq('user_id', userId)
        .maybeSingle()

      const wasAlreadyMapped = clientData?.silenciamento_mapeado || false
      const currentEcos = clientData?.ecos_total || 0

      const updatePayload = {
        silenciamento_mapeado: true
      }

      // Dar ecos so na primeira vez
      if (!wasAlreadyMapped) {
        updatePayload.ecos_total = currentEcos + 15
      }

      await supabase
        .from('ecoa_clients')
        .update(updatePayload)
        .eq('user_id', userId)

      // Actualizar estado local
      setExistingData({
        zonas: zonasData,
        pessoas: pessoasData,
        verdades: verdades
      })
      setMode('view')

    } catch (error) {
      console.error('Erro ao salvar mapa de silenciamento:', error)
    } finally {
      setSaving(false)
    }
  }

  // ===== Helpers para label de pessoa =====
  function getPessoaLabel(pessoaId) {
    const option = PESSOAS_OPTIONS.find(p => p.id === pessoaId)
    if (option) return option.label
    return pessoaId.replace('custom_', '').replace(/_/g, ' ')
  }

  // ===== Loading =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${ECOA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">{'\u{1F5FA}\uFE0F'}</div>
          <p className="text-white/60 text-sm">A preparar o mapa...</p>
        </div>
      </div>
    )
  }

  // ===== VIEW MODE — Mapa ja preenchido =====
  if (mode === 'view' && existingData) {
    const { zonas, pessoas, verdades: verdadesView } = existingData
    const zonasAbertas = vozesAbertasCount > 0
      ? Math.min(vozesAbertasCount, zonas.length)
      : 0

    return (
      <div
        className="min-h-screen pb-24"
        style={{ background: `linear-gradient(180deg, ${ECOA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <ModuleHeader
          eco="ecoa"
          title="Mapa de Silenciamento"
          subtitle="O teu mapa de onde guardas silencio"
        />

        <div className="px-5 mt-6 max-w-lg mx-auto space-y-6">

          {/* Progresso de abertura */}
          {zonas.length > 0 && (
            <div
              className="rounded-2xl border p-4"
              style={{ background: `${ECOA_COLOR}10`, borderColor: `${ECOA_COLOR}25` }}
            >
              <p className="text-white/80 text-sm text-center">
                <span style={{ color: ECOA_COLOR }} className="font-bold">{zonasAbertas}</span>
                {' '}das tuas {zonas.length} zonas de silencio ja comecaram a abrir
              </p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${zonas.length > 0 ? (zonasAbertas / zonas.length) * 100 : 0}%`,
                    background: `linear-gradient(90deg, ${ECOA_COLOR}, ${ECOA_COLOR}cc)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Zonas como circulos visuais */}
          <div>
            <h3
              className="text-white text-lg font-semibold mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Zonas de Silencio
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {zonas.map((zona) => {
                const size = 60 + (zona.nivel || 5) * 6 // Maior = mais silenciamento
                const option = ZONAS_OPTIONS.find(z => z.id === zona.id)
                return (
                  <div
                    key={zona.id}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="rounded-full flex items-center justify-center transition-all"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        background: `${ECOA_COLOR}${Math.min(20 + zona.nivel * 5, 60)}`,
                        border: `2px solid ${ECOA_COLOR}${Math.min(30 + zona.nivel * 5, 80)}`
                      }}
                    >
                      <span className="text-xl">{option?.icon || '\u{1F4CD}'}</span>
                    </div>
                    <p className="text-white/70 text-xs mt-2 text-center max-w-[80px]">
                      {zona.label}
                    </p>
                    <p className="text-white/40 text-[10px]">{zona.nivel}/10</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pessoas */}
          {pessoas && pessoas.length > 0 && (
            <div>
              <h3
                className="text-white text-lg font-semibold mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Com Quem Te Calas
              </h3>
              <div className="space-y-3">
                {pessoas.map((pessoa) => (
                  <div
                    key={pessoa.id}
                    className="rounded-xl border p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-white font-medium text-sm mb-2">
                      {PESSOAS_OPTIONS.find(p => p.id === pessoa.id)?.icon || '\u{1F464}'}{' '}
                      {pessoa.label}
                    </p>
                    {pessoa.tipos_verdade && pessoa.tipos_verdade.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {pessoa.tipos_verdade.map(tipo => (
                          <span
                            key={tipo}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${ECOA_COLOR}25`, color: ECOA_COLOR }}
                          >
                            {TIPOS_VERDADE.find(t => t.id === tipo)?.label || tipo}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verdades nao ditas */}
          {verdadesView && verdadesView.length > 0 && (
            <div>
              <h3
                className="text-white text-lg font-semibold mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Verdades Guardadas
              </h3>
              <div className="space-y-3">
                {verdadesView.map((verdade, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-white/80 text-sm italic leading-relaxed mb-2">
                      "{verdade.texto}"
                    </p>
                    {verdade.destinatario && (
                      <p className="text-white/50 text-xs">
                        <span className="text-white/30">A quem:</span> {verdade.destinatario}
                      </p>
                    )}
                    {verdade.barreira && (
                      <p className="text-white/50 text-xs mt-1">
                        <span className="text-white/30">O que impede:</span> {verdade.barreira}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botao para editar */}
          <div className="text-center pt-2 pb-8">
            <button
              onClick={() => { setMode('setup'); setStep(1) }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
              style={{ background: ECOA_COLOR }}
            >
              <span>{'\u{270F}\uFE0F'}</span>
              <span>Actualizar mapa</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== SETUP MODE — Preenchimento em 3 passos =====
  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${ECOA_DARK} 0%, #0f0f0f 100%)` }}
    >
      <ModuleHeader
        eco="ecoa"
        title="Mapa de Silenciamento"
        subtitle={`Passo ${step} de 3`}
      />

      <div className="px-5 mt-6 max-w-lg mx-auto">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                background: s <= step ? ECOA_COLOR : 'rgba(255,255,255,0.15)',
                transform: s === step ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* ===== STEP 1 — ZONAS ===== */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2
                className="text-white text-xl font-bold mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Onde te calas mais?
              </h2>
              <p className="text-white/50 text-sm">
                Selecciona os espacos onde a tua voz fica presa
              </p>
            </div>

            {/* Zonas como cards seleccionaveis */}
            <div className="grid grid-cols-2 gap-3">
              {ZONAS_OPTIONS.map(zona => {
                const isSelected = selectedZonas.includes(zona.id)
                return (
                  <button
                    key={zona.id}
                    onClick={() => toggleZona(zona.id)}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: isSelected ? `${ECOA_COLOR}20` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isSelected ? ECOA_COLOR : 'rgba(255,255,255,0.08)'}`,
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <span className="text-2xl block mb-1">{zona.icon}</span>
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {zona.label}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Sliders para cada zona seleccionada */}
            {selectedZonas.length > 0 && (
              <div className="space-y-4 mt-6">
                <p className="text-white/70 text-sm font-medium text-center">
                  Quanto te calas aqui? (1 = pouco, 10 = muito)
                </p>
                {selectedZonas.map(zonaId => {
                  const zona = ZONAS_OPTIONS.find(z => z.id === zonaId)
                  const nivel = zonaNiveis[zonaId] || 5
                  return (
                    <div
                      key={zonaId}
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">
                          {zona?.icon} {zona?.label}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: ECOA_COLOR }}
                        >
                          {nivel}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={nivel}
                        onChange={(e) => setZonaNivel(zonaId, e.target.value)}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${ECOA_COLOR} 0%, ${ECOA_COLOR} ${(nivel - 1) * 11.1}%, rgba(255,255,255,0.1) ${(nivel - 1) * 11.1}%, rgba(255,255,255,0.1) 100%)`,
                          accentColor: ECOA_COLOR
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Navegacao */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={selectedZonas.length === 0}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-30"
                style={{ background: selectedZonas.length > 0 ? ECOA_COLOR : 'rgba(255,255,255,0.1)' }}
              >
                Proximo {'\u{2192}'}
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 2 — PESSOAS ===== */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2
                className="text-white text-xl font-bold mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Com quem te calas?
              </h2>
              <p className="text-white/50 text-sm">
                Selecciona as pessoas com quem guardas silencio
              </p>
            </div>

            {/* Pessoas como cards seleccionaveis */}
            <div className="grid grid-cols-2 gap-3">
              {PESSOAS_OPTIONS.map(pessoa => {
                const isSelected = selectedPessoas.includes(pessoa.id)
                return (
                  <button
                    key={pessoa.id}
                    onClick={() => togglePessoa(pessoa.id)}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: isSelected ? `${ECOA_COLOR}20` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isSelected ? ECOA_COLOR : 'rgba(255,255,255,0.08)'}`,
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <span className="text-2xl block mb-1">{pessoa.icon}</span>
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {pessoa.label}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Adicionar pessoa custom */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customPessoa}
                onChange={(e) => setCustomPessoa(e.target.value)}
                placeholder="Outra pessoa..."
                className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onKeyDown={(e) => e.key === 'Enter' && addCustomPessoa()}
              />
              <button
                onClick={addCustomPessoa}
                className="px-4 py-3 rounded-xl text-sm text-white font-medium transition-all hover:opacity-90"
                style={{ background: ECOA_COLOR }}
              >
                +
              </button>
            </div>

            {/* Tipos de verdade para cada pessoa seleccionada */}
            {selectedPessoas.length > 0 && (
              <div className="space-y-4 mt-4">
                <p className="text-white/70 text-sm font-medium text-center">
                  Que tipo de verdades nao dizes a esta pessoa?
                </p>
                {selectedPessoas.map(pessoaId => (
                  <div
                    key={pessoaId}
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-white/80 text-sm font-medium mb-3">
                      {PESSOAS_OPTIONS.find(p => p.id === pessoaId)?.icon || '\u{1F464}'}{' '}
                      {getPessoaLabel(pessoaId)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TIPOS_VERDADE.map(tipo => {
                        const isActive = (pessoaVerdades[pessoaId] || []).includes(tipo.id)
                        return (
                          <button
                            key={tipo.id}
                            onClick={() => togglePessoaVerdade(pessoaId, tipo.id)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                            style={{
                              background: isActive ? `${ECOA_COLOR}30` : 'rgba(255,255,255,0.06)',
                              color: isActive ? ECOA_COLOR : 'rgba(255,255,255,0.5)',
                              border: `1px solid ${isActive ? ECOA_COLOR : 'rgba(255,255,255,0.1)'}`
                            }}
                          >
                            {tipo.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navegacao */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white/60 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {'\u{2190}'} Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedPessoas.length === 0}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-30"
                style={{ background: selectedPessoas.length > 0 ? ECOA_COLOR : 'rgba(255,255,255,0.1)' }}
              >
                Proximo {'\u{2192}'}
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3 — VERDADES ===== */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2
                className="text-white text-xl font-bold mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Que verdades guardam a tua garganta?
              </h2>
              <p className="text-white/50 text-sm">
                Escreve verdades que nao dizes — ninguem vai ler isto alem de ti
              </p>
            </div>

            {/* Verdades ja adicionadas */}
            {verdades.length > 0 && (
              <div className="space-y-3">
                {verdades.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4 relative"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <button
                      onClick={() => removeVerdade(i)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors text-xs"
                      aria-label="Remover verdade"
                    >
                      {'\u{2715}'}
                    </button>
                    <p className="text-white/80 text-sm italic pr-6">"{v.texto}"</p>
                    {v.destinatario && (
                      <p className="text-white/40 text-xs mt-1.5">
                        <span className="text-white/25">A quem:</span> {v.destinatario}
                      </p>
                    )}
                    {v.barreira && (
                      <p className="text-white/40 text-xs mt-1">
                        <span className="text-white/25">O que impede:</span> {v.barreira}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para nova verdade */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: `${ECOA_COLOR}08`, border: `1px solid ${ECOA_COLOR}20` }}
            >
              <textarea
                value={novaVerdade}
                onChange={(e) => setNovaVerdade(e.target.value)}
                placeholder="Escreve uma verdade que nao dizes..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <input
                type="text"
                value={novaVerdadeDestinatario}
                onChange={(e) => setNovaVerdadeDestinatario(e.target.value)}
                placeholder="A quem deverias dizer isto?"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <input
                type="text"
                value={novaVerdadeBarreira}
                onChange={(e) => setNovaVerdadeBarreira(e.target.value)}
                placeholder="O que te impede?"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={addVerdade}
                disabled={!novaVerdade.trim()}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: novaVerdade.trim() ? ECOA_COLOR : 'rgba(255,255,255,0.1)' }}
              >
                + Adicionar verdade
              </button>
            </div>

            {/* Navegacao */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white/60 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {'\u{2190}'} Voltar
              </button>
              <button
                onClick={saveMapa}
                disabled={saving || verdades.length === 0}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-30"
                style={{ background: verdades.length > 0 && !saving ? ECOA_COLOR : 'rgba(255,255,255,0.1)' }}
              >
                {saving ? 'A guardar...' : 'Completar mapa'} {'\u{1F50A}'}
              </button>
            </div>

            {/* Nota de seguranca */}
            <p className="text-white/25 text-xs text-center mt-4">
              Estas verdades sao {g('teus', 'tuas')}. So tu podes ver e editar o teu mapa.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
