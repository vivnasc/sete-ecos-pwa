import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'

/**
 * AURORA — Cerimónia de Graduação
 *
 * Componente CORE do módulo Aurora — experiência imersiva de graduação
 * que celebra a jornada completa do utilizador pelos SETE ECOS.
 *
 * Tema: #D4A5A5 (rose/pink), Dark: #2e1a1a
 * Moeda: Raios de Aurora, Elemento: Luz
 *
 * Fluxo multi-etapa:
 * 1. Boas-vindas (sunrise gradient)
 * 2. Revisão da jornada (cada eco completado)
 * 3. Momentos-chave (seleção/escrita)
 * 4. Mensagem da Vivianne
 * 5. Certificado visual
 * 6. Conclusão (guardar + 50 Raios)
 */

const AURORA_COLOR = '#D4A5A5'
const AURORA_DARK = '#2e1a1a'

// Definição dos 7 Ecos com metadata para a cerimónia
const ECOS_CONFIG = [
  {
    key: 'vitalis',
    nome: 'Vitalis',
    icon: '🌿',
    color: '#7C8B6F',
    table: 'vitalis_clients',
    descricao: 'Corpo & Nutrição',
    aprendizagem: 'Aprendeste a honrar o teu corpo e a nutri-lo com consciência.'
  },
  {
    key: 'aurea',
    nome: 'Aurea',
    icon: '✨',
    color: '#C4A265',
    table: 'aurea_clients',
    descricao: 'Valor & Presença',
    aprendizagem: 'Descobriste o teu valor intrínseco e a força da tua presença.'
  },
  {
    key: 'serena',
    nome: 'Serena',
    icon: '💧',
    color: '#6B8E9B',
    table: 'serena_clients',
    descricao: 'Emoção & Fluidez',
    aprendizagem: 'Aprendeste a acolher as tuas emoções sem julgamento.'
  },
  {
    key: 'ignis',
    nome: 'Ignis',
    icon: '🔥',
    color: '#C1634A',
    table: 'ignis_clients',
    descricao: 'Vontade & Foco',
    aprendizagem: 'Cultivaste a direcção consciente e a força da tua vontade.'
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
    descricao: 'Expressão & Voz',
    aprendizagem: 'Libertaste a tua voz autêntica e a coragem de te expressar.'
  },
  {
    key: 'imago',
    nome: 'Imago',
    icon: '👁️',
    color: '#8B7BA5',
    table: 'imago_clients',
    descricao: 'Identidade & Visão',
    aprendizagem: 'Integraste a tua identidade e clarificaste a tua visão de futuro.'
  }
]

export default function CerimoniaGraduacao() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useI18n()

  // Estado da cerimónia
  const [etapa, setEtapa] = useState('boas-vindas') // boas-vindas, revisão, momentos, mensagem, certificado, conclusão
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

  // Graduação já feita
  const [jaGraduou, setJaGraduou] = useState(false)

  // Animação do sunrise
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

      // Verificar se já graduou
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
          // Tabela pode não existir — ignorar silenciosamente
          console.debug(`Eco ${eco.key}: sem dados ou tabela`, err?.message)
        }
      }

      if (!gradData) {
        setEcosCompletados(ecosData)
      }
    } catch (err) {
      console.error('Erro ao carregar cerimónia:', err)
      setError(t('aurora.ceremony.load_error'))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Animação do sunrise na boas-vindas
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

  // ===== Guardar graduação =====
  const guardarGraduacao = async () => {
    if (!userId) return
    setSaving(true)
    setError(null)

    try {
      const ecosIncluidos = ecosCompletados.map(e => e.key)

      // Inserir/actualizar registo de graduação
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

      // Actualizar aurora_clients com data de graduação e raios
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
        // Não bloquear — a graduação principal já foi guardada
      }

      setJaGraduou(true)
      setEtapa('conclusao')
    } catch (err) {
      console.error('Erro ao guardar graduação:', err)
      setError('Ocorreu um erro ao guardar a graduação. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ===== Eco actual na revisão =====
  const ecoActual = ecosCompletados[ecoRevisaoIndex] || null
  const totalEcos = ecosCompletados.length

  // ===== Formatar data =====
  const formatarData = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
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
          <p className="text-white/60">{t('aurora.ceremony.preparing')}</p>
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

        {/* Conteúdo */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div
            className="max-w-lg w-full text-center transition-all duration-1000"
            style={{ opacity: sunriseVisible ? 1 : 0, transform: sunriseVisible ? 'translateY(0)' : 'translateY(30px)' }}
          >
            {/* Ícone sunrise */}
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
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {t('aurora.ceremony.title')}
            </h1>

            <p className="text-white/80 text-lg mb-2">
              {t('aurora.ceremony.welcome', { name: userName || g('querido', 'querida') })}
            </p>

            <p className="text-white/60 mb-8 px-4">
              {t('aurora.ceremony.special_moment')}
            </p>

            {/* Info sobre ecos completados */}
            <div
              className="rounded-2xl p-4 mb-8 border"
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-white/90 text-sm">
                {totalEcos > 0
                  ? t('aurora.ceremony.ecos_in_journey', { count: totalEcos })
                  : t('aurora.ceremony.celebrated_here')
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
                {jaGraduou ? t('aurora.ceremony.relive') : t('aurora.ceremony.begin')} →
              </button>

              <button
                onClick={() => navigate('/aurora/dashboard')}
                className="w-full py-3 text-white/50 hover:text-white/80 transition-colors"
              >
                {t('aurora.ceremony.back_dashboard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: REVISÃO DA JORNADA =====
  if (etapa === 'revisao' && ecoActual) {
    return (
      <div className="min-h-screen" style={{ background: AURORA_DARK }}>
        <ModuleHeader
          eco="aurora"
          title={t('aurora.ceremony.title')}
          subtitle={t('aurora.ceremony.celebrate_journey')}
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
            {/* Ícone */}
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
              style={{ fontFamily: 'var(--font-titulos)' }}
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

          {/* Navegação */}
          <div className="flex gap-4">
            {ecoRevisaoIndex > 0 && (
              <button
                onClick={() => setEcoRevisaoIndex(prev => prev - 1)}
                className="flex-1 py-4 rounded-2xl font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {t('aurora.ceremony.previous')}
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
              {ecoRevisaoIndex < totalEcos - 1 ? t('aurora.ceremony.next_eco') : t('aurora.ceremony.continue')}
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
          title={t('aurora.ceremony.title')}
          subtitle={t('aurora.ceremony.celebrate_journey')}
          showHomeButton={false}
        />

        <div className="max-w-lg mx-auto p-6">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block" role="img" aria-label="Estrela">
              ⭐
            </span>
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {t('aurora.ceremony.transformative_moments')}
            </h2>
            <p className="text-white/60">
              {t('aurora.ceremony.moments_desc')}
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
                placeholder={t('aurora.ceremony.describe_moment')}
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
                  {t('aurora.ceremony.add')}
                </button>
              </div>
            </div>
          )}

          {/* Sugestoes */}
          {momentosChave.length === 0 && (
            <div className="mb-8 space-y-2">
              <p className="text-white/40 text-xs mb-3">{t('aurora.ceremony.suggestions')}</p>
              {[
                t('aurora.ceremony.suggestion_1'),
                t('aurora.ceremony.suggestion_2'),
                t('aurora.ceremony.suggestion_3')
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

          {/* Navegação */}
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
              {t('aurora.ceremony.previous')}
            </button>
            <button
              onClick={() => setEtapa('mensagem')}
              className="flex-1 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: AURORA_COLOR }}
            >
              {t('aurora.ceremony.continue')}
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
          title={t('aurora.ceremony.title')}
          subtitle={t('aurora.ceremony.celebrate_journey')}
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

            <p className="text-white/50 text-sm mb-4">{t('aurora.ceremony.vivianne_message')}</p>

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
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                "{t('aurora.ceremony.vivianne_quote')}"
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
                <span>—</span>
                <span>Vivianne dos Santos</span>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex gap-4">
              <button
                onClick={() => setEtapa('momentos')}
                className="flex-1 py-4 rounded-2xl font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {t('aurora.ceremony.previous')}
              </button>
              <button
                onClick={() => setEtapa('certificado')}
                className="flex-1 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: AURORA_COLOR }}
              >
                {t('aurora.ceremony.view_certificate')}
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
          title={t('aurora.ceremony.title')}
          subtitle={t('aurora.ceremony.celebrate_journey')}
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
              {/* Decoração cantos */}
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

              {/* Conteúdo do certificado */}
              <div className="relative z-10">
                <p
                  className="text-sm tracking-[0.3em] uppercase mb-4"
                  style={{ color: `${AURORA_COLOR}cc` }}
                >
                  {t('aurora.ceremony.certificate_label')}
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
                    fontFamily: 'var(--font-titulos)',
                    color: AURORA_DARK
                  }}
                >
                  {t('aurora.ceremony.seven_ecos')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#8a7a6a' }}>
                  {t('aurora.ceremony.transmutation_system')}
                </p>

                <p className="text-sm mb-1" style={{ color: '#8a7a6a' }}>
                  {t('aurora.ceremony.awarded_to')}
                </p>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    color: AURORA_DARK
                  }}
                >
                  {userName || t('aurora.ceremony.graduate')}
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
                  {t('aurora.ceremony.ecos_completed', { count: totalEcos })}
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
                  "{t('aurora.ceremony.eco_reflection_quote')}"
                </p>
              </div>
            </div>

            {/* Acções */}
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
                  {saving ? t('aurora.antes_depois.saving') : t('aurora.ceremony.complete_ceremony')}
                </button>
              ) : (
                <button
                  onClick={() => setEtapa('conclusao')}
                  className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: AURORA_COLOR }}
                >
                  {t('aurora.ceremony.continue')}
                </button>
              )}

              <button
                onClick={() => setEtapa('mensagem')}
                className="w-full py-3 text-white/50 hover:text-white/80 transition-colors"
              >
                {t('aurora.ceremony.previous')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== ETAPA: CONCLUSÃO =====
  if (etapa === 'conclusao') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #3d1f2a 40%, ${AURORA_COLOR}40 70%, #f0c8a040 100%)`
        }}
      >
        <div className="max-w-lg w-full text-center">
          {/* Animação celebração */}
          <div className="mb-6">
            <div
              className="w-28 h-28 mx-auto rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${AURORA_COLOR}50, #f0c8a050)` }}
            >
              <span className="text-6xl" role="img" aria-label="Celebração">
                🌅
              </span>
            </div>
          </div>

          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            {t('aurora.ceremony.graduated')}
          </h2>

          <p className="text-white/80 text-lg mb-2">
            {t('aurora.ceremony.ceremony_complete')}
          </p>
          <p className="text-white/60 mb-8">
            {t('aurora.ceremony.rays_earned')}
          </p>

          {/* Resumo */}
          <div
            className="rounded-2xl p-6 mb-8 border text-left"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: `${AURORA_COLOR}25` }}
          >
            <h3 className="text-white font-semibold mb-3 text-center">{t('aurora.ceremony.your_journey')}</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalEcos}</p>
                <p className="text-white/50 text-sm">{totalEcos === 1 ? t('aurora.ceremony.eco_singular') : t('aurora.ceremony.eco_plural')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{momentosChave.length}</p>
                <p className="text-white/50 text-sm">{momentosChave.length === 1 ? t('aurora.ceremony.moment_singular') : t('aurora.ceremony.moment_plural')}</p>
              </div>
            </div>

            {momentosChave.length > 0 && (
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-white/40 text-xs mb-2">{t('aurora.ceremony.your_moments')}</p>
                {momentosChave.map((momento, i) => (
                  <p key={i} className="text-white/70 text-sm mb-1">
                    • {momento}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Acções finais */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/aurora/dashboard')}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: AURORA_COLOR }}
            >
              {t('aurora.ceremony.back_aurora')}
            </button>

            <button
              onClick={() => setEtapa('boas-vindas')}
              className="w-full py-3 text-white/50 hover:text-white/80 transition-colors"
            >
              {t('aurora.ceremony.relive')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback — não deveria acontecer
  return null
}
