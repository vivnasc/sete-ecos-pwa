import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'

/**
 * AURORA — Cerimonia de Graduacao
 *
 * Componente CORE do modulo Aurora — experiencia imersiva de graduacao
 * que celebra a jornada completa do utilizador pelos SETE ECOS.
 *
 * Tema: #D4A5A5 (rose/pink), Dark: #2e1a1a
 * Moeda: Raios de Aurora, Elemento: Luz
 *
 * Fluxo multi-etapa:
 * 1. Boas-vindas (sunrise gradient)
 * 2. Revisao da jornada (cada eco completado)
 * 3. Momentos-chave (selecao/escrita)
 * 4. Mensagem da Vivianne
 * 5. Certificado visual
 * 6. Conclusao (guardar + 50 Raios)
 */

const AURORA_COLOR = '#D4A5A5'
const AURORA_DARK = '#2e1a1a'

// Definicao dos 7 Ecos com metadata para a cerimonia
const ECOS_CONFIG = [
  {
    key: 'vitalis',
    nome: 'Vitalis',
    icon: '🌿',
    color: '#7C8B6F',
    table: 'vitalis_clients',
    descricao: 'Corpo & Nutricao',
    aprendizagem: 'Aprendeste a honrar o teu corpo e a nutri-lo com consciencia.'
  },
  {
    key: 'aurea',
    nome: 'Aurea',
    icon: '✨',
    color: '#C4A265',
    table: 'aurea_clients',
    descricao: 'Valor & Presenca',
    aprendizagem: 'Descobriste o teu valor intrinseco e a forca da tua presenca.'
  },
  {
    key: 'serena',
    nome: 'Serena',
    icon: '💧',
    color: '#6B8E9B',
    table: 'serena_clients',
    descricao: 'Emocao & Fluidez',
    aprendizagem: 'Aprendeste a acolher as tuas emocoes sem julgamento.'
  },
  {
    key: 'ignis',
    nome: 'Ignis',
    icon: '🔥',
    color: '#C1634A',
    table: 'ignis_clients',
    descricao: 'Vontade & Foco',
    aprendizagem: 'Cultivaste a direccao consciente e a forca da tua vontade.'
  },
  {
    key: 'ventis',
    nome: 'Ventis',
    icon: '🍃',
    color: '#5D9B84',
    table: 'ventis_clients',
    descricao: 'Energia & Ritmo',
    aprendizagem: 'Encontraste o teu ritmo natural e aprendeste a fluir com a energia.'
  },
  {
    key: 'ecoa',
    nome: 'Ecoa',
    icon: '🗣️',
    color: '#4A90A4',
    table: 'ecoa_clients',
    descricao: 'Expressao & Voz',
    aprendizagem: 'Libertaste a tua voz autentica e a coragem de te expressar.'
  },
  {
    key: 'imago',
    nome: 'Imago',
    icon: '👁️',
    color: '#8B7BA5',
    table: 'imago_clients',
    descricao: 'Identidade & Visao',
    aprendizagem: 'Integraste a tua identidade e clarificaste a tua visao de futuro.'
  }
]

export default function CerimoniaGraduacao() {
  const navigate = useNavigate()
  const { session } = useAuth()

  // Estado da cerimonia
  const [etapa, setEtapa] = useState('boas-vindas') // boas-vindas, revisao, momentos, mensagem, certificado, conclusao
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Dados do utilizador
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Dados da jornada
  const [ecosCompletados, setEcosCompletados] = useState([])
  const [ecoRevisaoIndex, setEcoRevisaoIndex] = useState(0)

  // Momentos-chave
  const [momentosChave, setMomentosChave] = useState([])
  const [novoMomento, setNovoMomento] = useState('')

  // Graduacao ja feita
  const [jaGraduou, setJaGraduou] = useState(false)

  // Animacao do sunrise
  const [sunriseVisible, setSunriseVisible] = useState(false)

  // ===== Carregar dados iniciais =====
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) {
        navigate('/login')
        return
      }

      setUserId(userData.id)
      setUserName(userData.nome || user.email?.split('@')[0] || '')

      // Verificar se ja graduou
      const { data: gradData } = await supabase
        .from('aurora_graduacao')
        .select('id, data, ecos_incluidos, momentos_chave')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (gradData) {
        setJaGraduou(true)
        setEcosCompletados(
          ECOS_CONFIG.filter(eco =>
            gradData.ecos_incluidos?.includes(eco.key)
          ).map(eco => ({ ...eco, completado: true }))
        )
        setMomentosChave(gradData.momentos_chave || [])
      }

      // Buscar dados de cada eco
      const ecosData = []

      for (const eco of ECOS_CONFIG) {
        try {
          const { data: clientData } = await supabase
            .from(eco.table)
            .select('status, created_at, nivel, streak_dias')
            .eq('user_id', userData.id)
            .maybeSingle()

          if (clientData && clientData.status === 'activo') {
            const diasActivo = clientData.created_at
              ? Math.floor((new Date() - new Date(clientData.created_at)) / (24 * 60 * 60 * 1000))
              : 0

            ecosData.push({
              ...eco,
              completado: true,
              diasActivo,
              nivel: clientData.nivel || null,
              streak: clientData.streak_dias || 0
            })
          }
        } catch (err) {
          // Tabela pode nao existir — ignorar silenciosamente
          console.debug(`Eco ${eco.key}: sem dados ou tabela`, err?.message)
        }
      }

      if (!gradData) {
        setEcosCompletados(ecosData)
      }
    } catch (err) {
      console.error('Erro ao carregar cerimonia:', err)
      setError('Ocorreu um erro ao carregar os dados. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Animacao do sunrise na boas-vindas
  useEffect(() => {
    if (etapa === 'boas-vindas') {
      const timer = setTimeout(() => setSunriseVisible(true), 300)
      return () => clearTimeout(timer)
    }
  }, [etapa])

  // ===== Adicionar momento-chave =====
  const adicionarMomento = () => {
    const texto = novoMomento.trim()
    if (!texto) return
    if (momentosChave.length >= 7) return // maximo 7 (um por eco)
    setMomentosChave(prev => [...prev, texto])
    setNovoMomento('')
  }

  const removerMomento = (index) => {
    setMomentosChave(prev => prev.filter((_, i) => i !== index))
  }

  // ===== Guardar graduacao =====
  const guardarGraduacao = async () => {
    if (!userId) return
    setSaving(true)
    setError(null)

    try {
      const ecosIncluidos = ecosCompletados.map(e => e.key)

      // Inserir/actualizar registo de graduacao
      const { error: insertError } = await supabase
        .from('aurora_graduacao')
        .upsert({
          user_id: userId,
          data: new Date().toISOString(),
          ecos_incluidos: ecosIncluidos,
          mensagem_pessoal: 'Chegaste aqui porque escolheste.',
          momentos_chave: momentosChave
        }, { onConflict: 'user_id' })

      if (insertError) throw insertError

      // Actualizar aurora_clients com data de graduacao e raios
      try {
        // Buscar raios actuais
        const { data: clientData } = await supabase
          .from('aurora_clients')
          .select('raios_total')
          .eq('user_id', userId)
          .maybeSingle()

        const raiosActuais = clientData?.raios_total || 0

        await supabase
          .from('aurora_clients')
          .upsert({
            user_id: userId,
            graduacao_data: new Date().toISOString(),
            raios_total: raiosActuais + 50
          }, { onConflict: 'user_id' })
      } catch (err) {
        console.error('Erro ao actualizar aurora_clients:', err)
        // Nao bloquear — a graduacao principal ja foi guardada
      }

      setJaGraduou(true)
      setEtapa('conclusao')
    } catch (err) {
      console.error('Erro ao guardar graduacao:', err)
      setError('Ocorreu um erro ao guardar a graduacao. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ===== Eco actual na revisao =====
  const ecoActual = ecosCompletados[ecoRevisaoIndex] || null
  const totalEcos = ecosCompletados.length

  // ===== Formatar data =====
  const formatarData = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    const d = new Date()
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
  }

  // ===== Loading =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: AURORA_DARK }}>
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse"
            style={{ background: `${AURORA_COLOR}40` }}
          />
          <p className="text-white/60">A preparar a cerimonia...</p>
        </div>
      </div>
    )
  }

  // ===== ETAPA: BOAS-VINDAS =====
  if (etapa === 'boas-vindas') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: AURORA_DARK }}>
        {/* Sunrise gradient background */}
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{
            opacity: sunriseVisible ? 1 : 0,
            background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #4a2028 30%, #8b4050 50%, ${AURORA_COLOR} 70%, #f0c8a0 90%, #f5deb3 100%)`
          }}
        />

        {/* Conteudo */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div
            className="max-w-lg w-full text-center transition-all duration-1000"
            style={{ opacity: sunriseVisible ? 1 : 0, transform: sunriseVisible ? 'translateY(0)' : 'translateY(30px)' }}
          >
            {/* Icone sunrise */}
            <div className="mb-8">
              <div
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${AURORA_COLOR}60, #f0c8a080)` }}
              >
                <span className="text-6xl" role="img" aria-label="Aurora">
                  🌅
                </span>
              </div>
            </div>

            <h1
              className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Cerimonia de Graduacao
            </h1>

            <p className="text-white/80 text-lg mb-2">
              {g('Bem-vindo', 'Bem-vinda')} a esta celebracao, {userName || g('querido', 'querida')}.
            </p>

            <p className="text-white/60 mb-8 px-4">
              Este e um momento especial. Vamos percorrer {g('juntos', 'juntas')} cada passo da tua
              jornada pelos Sete Ecos e celebrar tudo o que conquistaste.
            </p>

            {/* Info sobre ecos completados */}
            <div
              className="rounded-2xl p-4 mb-8 border"
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-white/90 text-sm">
                {totalEcos > 0
                  ? `${totalEcos} ${totalEcos === 1 ? 'eco percorrido' : 'ecos percorridos'} na tua jornada`
                  : 'A tua jornada sera celebrada aqui'
                }
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (totalEcos > 0) {
                    setEcoRevisaoIndex(0)
                    setEtapa('revisao')
                  } else {
                    setEtapa('momentos')
                  }
                }}
                className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${AURORA_COLOR}, ${AURORA_COLOR}cc)` }}
              >
                {jaGraduou ? 'Reviver a cerimonia' : 'Iniciar cerimonia'} →
              </button>

              <button
                onClick={() => navigate('/aurora/dashboard')}
                className="w-full py-3 text-white/50 hover:text-white/80 transition-colors"
              >
                ← Voltar ao dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: REVISAO DA JORNADA =====
  if (etapa === 'revisao' && ecoActual) {
    return (
      <div className="min-h-screen" style={{ background: AURORA_DARK }}>
        <ModuleHeader
          eco="aurora"
          title="Cerimonia de Graduacao"
          subtitle="Celebra a tua jornada"
          backTo={ecoRevisaoIndex === 0 ? undefined : 'history'}
          showHomeButton={false}
          rightAction={
            <span className="text-white/60 text-sm">
              {ecoRevisaoIndex + 1}/{totalEcos}
            </span>
          }
        />

        <div className="max-w-lg mx-auto p-6">
          {/* Progresso dos ecos */}
          <div className="flex justify-center gap-2 mb-8">
            {ecosCompletados.map((eco, i) => (
              <div
                key={eco.key}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  background: i <= ecoRevisaoIndex ? eco.color : 'rgba(255,255,255,0.2)',
                  transform: i === ecoRevisaoIndex ? 'scale(1.5)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          {/* Card do eco */}
          <div
            className="rounded-3xl p-8 text-center mb-8 border transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${ecoActual.color}30, ${ecoActual.color}15)`,
              borderColor: `${ecoActual.color}40`
            }}
          >
            {/* Icone */}
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ background: `${ecoActual.color}30` }}
            >
              <span className="text-5xl" role="img" aria-label={ecoActual.nome}>
                {ecoActual.icon}
              </span>
            </div>

            {/* Nome do eco */}
            <h2
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {ecoActual.nome}
            </h2>
            <p className="text-white/60 text-sm mb-6">{ecoActual.descricao}</p>

            {/* Conquistas */}
            <div className="space-y-3 mb-6">
              {ecoActual.diasActivo > 0 && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: `${ecoActual.color}25` }}
                >
                  <span className="text-white/90 text-sm">
                    {ecoActual.diasActivo} {ecoActual.diasActivo === 1 ? 'dia' : 'dias'} {g('activo', 'activa')}
                  </span>
                </div>
              )}
              {ecoActual.nivel && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full ml-2"
                  style={{ background: `${ecoActual.color}25` }}
                >
                  <span className="text-white/90 text-sm">
                    Nivel: {ecoActual.nivel}
                  </span>
                </div>
              )}
              {ecoActual.streak > 0 && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full ml-2"
                  style={{ background: `${ecoActual.color}25` }}
                >
                  <span className="text-white/90 text-sm">
                    {ecoActual.streak} dias de streak
                  </span>
                </div>
              )}
            </div>

            {/* Aprendizagem */}
            <p className="text-white/80 text-lg italic px-4">
              "{ecoActual.aprendizagem}"
            </p>
          </div>

          {/* Navegacao */}
          <div className="flex gap-4">
            {ecoRevisaoIndex > 0 && (
              <button
                onClick={() => setEcoRevisaoIndex(prev => prev - 1)}
                className="flex-1 py-4 rounded-2xl font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={() => {
                if (ecoRevisaoIndex < totalEcos - 1) {
                  setEcoRevisaoIndex(prev => prev + 1)
                } else {
                  setEtapa('momentos')
                }
              }}
              className="flex-1 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: AURORA_COLOR }}
            >
              {ecoRevisaoIndex < totalEcos - 1 ? 'Proximo eco →' : 'Continuar →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: MOMENTOS-CHAVE =====
  if (etapa === 'momentos') {
    return (
      <div className="min-h-screen" style={{ background: AURORA_DARK }}>
        <ModuleHeader
          eco="aurora"
          title="Cerimonia de Graduacao"
          subtitle="Celebra a tua jornada"
          showHomeButton={false}
        />

        <div className="max-w-lg mx-auto p-6">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block" role="img" aria-label="Estrela">
              ⭐
            </span>
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Momentos Transformadores
            </h2>
            <p className="text-white/60">
              Quais foram os momentos mais marcantes da tua jornada?
              Escreve ate 7 — um por cada eco.
            </p>
          </div>

          {/* Momentos adicionados */}
          {momentosChave.length > 0 && (
            <div className="space-y-3 mb-6">
              {momentosChave.map((momento, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${AURORA_COLOR}30` }}
                >
                  <span
                    className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: `${AURORA_COLOR}50` }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-white/90 text-sm flex-1">{momento}</p>
                  <button
                    onClick={() => removerMomento(index)}
                    className="text-white/30 hover:text-red-400 transition-colors text-lg flex-shrink-0"
                    aria-label={`Remover momento ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar momento */}
          {momentosChave.length < 7 && (
            <div className="mb-8">
              <textarea
                value={novoMomento}
                onChange={(e) => setNovoMomento(e.target.value)}
                placeholder="Descreve um momento que te transformou..."
                rows={3}
                maxLength={300}
                className="w-full p-4 rounded-xl border text-white placeholder-white/30 focus:outline-none resize-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: `${AURORA_COLOR}30`,
                  caretColor: AURORA_COLOR
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/30 text-xs">
                  {novoMomento.length}/300
                </span>
                <button
                  onClick={adicionarMomento}
                  disabled={!novoMomento.trim()}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-30"
                  style={{ background: novoMomento.trim() ? AURORA_COLOR : 'rgba(255,255,255,0.1)' }}
                >
                  + Adicionar
                </button>
              </div>
            </div>
          )}

          {/* Sugestoes */}
          {momentosChave.length === 0 && (
            <div className="mb-8 space-y-2">
              <p className="text-white/40 text-xs mb-3">Sugestoes para te inspirar:</p>
              {[
                'O dia em que percebi que merecia cuidar de mim',
                'Quando senti orgulho de mim pela primeira vez',
                'O momento em que escolhi diferente'
              ].map((sugestao, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMomentosChave(prev => [...prev, sugestao])
                  }}
                  className="block w-full text-left p-3 rounded-xl border text-white/50 hover:text-white/80 text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  "{sugestao}"
                </button>
              ))}
            </div>
          )}

          {/* Navegacao */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (totalEcos > 0) {
                  setEcoRevisaoIndex(totalEcos - 1)
                  setEtapa('revisao')
                } else {
                  setEtapa('boas-vindas')
                }
              }}
              className="flex-1 py-4 rounded-2xl font-semibold text-white/70 transition-all"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              ← Voltar
            </button>
            <button
              onClick={() => setEtapa('mensagem')}
              className="flex-1 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: AURORA_COLOR }}
            >
              Continuar →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: MENSAGEM DA VIVIANNE =====
  if (etapa === 'mensagem') {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #3d1f2a 50%, ${AURORA_DARK} 100%)`
        }}
      >
        <ModuleHeader
          eco="aurora"
          title="Cerimonia de Graduacao"
          subtitle="Celebra a tua jornada"
          showHomeButton={false}
          compact
        />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            {/* Avatar/Logo Vivianne */}
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ background: `linear-gradient(135deg, ${AURORA_COLOR}60, ${AURORA_COLOR}30)` }}
            >
              <span className="text-3xl" role="img" aria-label="Coracao">
                💜
              </span>
            </div>

            <p className="text-white/50 text-sm mb-4">Uma mensagem da Vivianne</p>

            {/* Mensagem */}
            <div
              className="rounded-3xl p-8 mb-8 border"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: `${AURORA_COLOR}25`
              }}
            >
              <p
                className="text-white text-xl leading-relaxed italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                "Chegaste aqui porque escolheste. Cada passo foi teu.
                Cada eco, cada reflexao, cada momento de coragem — {g('foste tu', 'foste tu')}.
                {' '}{g('Celebra-te', 'Celebra-te')}. Mereces."
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
                <span>—</span>
                <span>Vivianne dos Santos</span>
              </div>
            </div>

            {/* Navegacao */}
            <div className="flex gap-4">
              <button
                onClick={() => setEtapa('momentos')}
                className="flex-1 py-4 rounded-2xl font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                ← Voltar
              </button>
              <button
                onClick={() => setEtapa('certificado')}
                className="flex-1 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: AURORA_COLOR }}
              >
                Ver certificado →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: CERTIFICADO =====
  if (etapa === 'certificado') {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: AURORA_DARK }}
      >
        <ModuleHeader
          eco="aurora"
          title="Cerimonia de Graduacao"
          subtitle="Celebra a tua jornada"
          showHomeButton={false}
          compact
        />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            {/* Certificado */}
            <div
              className="rounded-3xl p-8 text-center border-2 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #faf5ef 0%, #f5ebe0 50%, #faf5ef 100%)`,
                borderColor: AURORA_COLOR
              }}
            >
              {/* Decoracao cantos */}
              <div
                className="absolute top-0 left-0 w-20 h-20 opacity-20"
                style={{
                  background: `radial-gradient(circle at top left, ${AURORA_COLOR}, transparent)`
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-20 h-20 opacity-20"
                style={{
                  background: `radial-gradient(circle at bottom right, ${AURORA_COLOR}, transparent)`
                }}
              />

              {/* Conteudo do certificado */}
              <div className="relative z-10">
                <p
                  className="text-sm tracking-[0.3em] uppercase mb-4"
                  style={{ color: `${AURORA_COLOR}cc` }}
                >
                  Certificado de Conclusao
                </p>

                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${AURORA_COLOR}20` }}
                >
                  <span className="text-3xl" role="img" aria-label="Aurora">
                    🌅
                  </span>
                </div>

                <h2
                  className="text-3xl font-bold mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: AURORA_DARK
                  }}
                >
                  Sete Ecos
                </h2>
                <p className="text-sm mb-6" style={{ color: '#8a7a6a' }}>
                  Sistema de Transmutacao
                </p>

                <p className="text-sm mb-1" style={{ color: '#8a7a6a' }}>
                  Este certificado e {g('atribuido', 'atribuida')} a
                </p>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: AURORA_DARK
                  }}
                >
                  {userName || g('Graduado', 'Graduada')}
                </h3>

                {/* Ecos completados como icones */}
                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                  {ecosCompletados.map(eco => (
                    <div
                      key={eco.key}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${eco.color}25` }}
                      title={eco.nome}
                    >
                      <span className="text-lg">{eco.icon}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm mb-1" style={{ color: '#8a7a6a' }}>
                  {totalEcos} {totalEcos === 1 ? 'eco completado' : 'ecos completados'}
                </p>

                <div
                  className="w-24 mx-auto my-4 border-t"
                  style={{ borderColor: `${AURORA_COLOR}50` }}
                />

                <p className="text-sm" style={{ color: '#8a7a6a' }}>
                  {formatarData()}
                </p>

                <p
                  className="text-xs mt-4 italic"
                  style={{ color: `${AURORA_COLOR}aa` }}
                >
                  "Cada eco e um reflexo de quem es."
                </p>
              </div>
            </div>

            {/* Accoes */}
            <div className="mt-8 space-y-3">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {!jaGraduou ? (
                <button
                  onClick={guardarGraduacao}
                  disabled={saving}
                  className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: AURORA_COLOR }}
                >
                  {saving ? 'A guardar...' : `Concluir cerimonia (+50 Raios 🌅)`}
                </button>
              ) : (
                <button
                  onClick={() => setEtapa('conclusao')}
                  className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: AURORA_COLOR }}
                >
                  Continuar →
                </button>
              )}

              <button
                onClick={() => setEtapa('mensagem')}
                className="w-full py-3 text-white/50 hover:text-white/80 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: CONCLUSAO =====
  if (etapa === 'conclusao') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #3d1f2a 40%, ${AURORA_COLOR}40 70%, #f0c8a040 100%)`
        }}
      >
        <div className="max-w-lg w-full text-center">
          {/* Animacao celebracao */}
          <div className="mb-6">
            <div
              className="w-28 h-28 mx-auto rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${AURORA_COLOR}50, #f0c8a050)` }}
            >
              <span className="text-6xl" role="img" aria-label="Celebracao">
                🌅
              </span>
            </div>
          </div>

          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {g('Graduado', 'Graduada')}!
          </h2>

          <p className="text-white/80 text-lg mb-2">
            A cerimonia esta completa.
          </p>
          <p className="text-white/60 mb-8">
            Recebeste <strong className="text-white">+50 Raios de Aurora</strong> 🌅
            pela tua dedicacao.
          </p>

          {/* Resumo */}
          <div
            className="rounded-2xl p-6 mb-8 border text-left"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: `${AURORA_COLOR}25` }}
          >
            <h3 className="text-white font-semibold mb-3 text-center">A tua jornada</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalEcos}</p>
                <p className="text-white/50 text-sm">{totalEcos === 1 ? 'Eco' : 'Ecos'}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{momentosChave.length}</p>
                <p className="text-white/50 text-sm">{momentosChave.length === 1 ? 'Momento' : 'Momentos'}</p>
              </div>
            </div>

            {momentosChave.length > 0 && (
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-white/40 text-xs mb-2">Os teus momentos:</p>
                {momentosChave.map((momento, i) => (
                  <p key={i} className="text-white/70 text-sm mb-1">
                    • {momento}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Accoes finais */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/aurora/dashboard')}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: AURORA_COLOR }}
            >
              Voltar ao Aurora →
            </button>

            <button
              onClick={() => setEtapa('boas-vindas')}
              className="w-full py-3 text-white/50 hover:text-white/80 transition-colors"
            >
              Reviver a cerimonia
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback — nao deveria acontecer
  return null
}
