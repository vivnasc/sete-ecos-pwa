import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getCirculosDoEco,
  getMeusCirculos,
  entrarCirculo,
  sairCirculo,
  criarCirculo,
  ECOS_INFO
} from '../../lib/comunidade'
import { getGhostCirculos } from '../../lib/ghost-users'

export default function Circulos() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [tab, setTab] = useState('meus') // 'meus' | 'explorar'
  const [meusCirculos, setMeusCirculos] = useState([])
  const [circulosEco, setCirculosEco] = useState([])
  const [ecoSelecionado, setEcoSelecionado] = useState('vitalis')
  const [loadingEco, setLoadingEco] = useState(false)

  // Circle detail
  const [circuloAberto, setCirculoAberto] = useState(null)

  // Create modal
  const [showCriar, setShowCriar] = useState(false)
  const [criarNome, setCriarNome] = useState('')
  const [criarEco, setCriarEco] = useState('vitalis')
  const [criarIntencao, setCriarIntencao] = useState('')
  const [criarMax, setCriarMax] = useState(12)
  const [criando, setCriando] = useState(false)

  // Actions
  const [acaoEmCurso, setAcaoEmCurso] = useState({})
  const [confirmSair, setConfirmSair] = useState(null)

  const ecosDisponiveis = Object.entries(ECOS_INFO).filter(([key]) => key !== 'geral')

  // ---------- Initialisation ----------

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        if (userData) {
          setUserId(userData.id)
        } else {
          setLoading(false)
        }
      } catch (e) {
        console.error('Erro ao obter userId:', e)
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (userId) {
      carregarMeusCirculos()
    }
  }, [userId])

  useEffect(() => {
    if (userId && tab === 'explorar') {
      carregarCirculosDoEco(ecoSelecionado)
    }
  }, [tab, ecoSelecionado, userId])

  const carregarMeusCirculos = async () => {
    setLoading(true)
    try {
      const data = await getMeusCirculos(userId)
      const realCirculos = data || []
      // Include ghost circles the user has joined
      const ghostJoinKey = 'ghost_circulos_joined'
      const joinedGhostIds = JSON.parse(localStorage.getItem(ghostJoinKey) || '[]')
      if (joinedGhostIds.length > 0) {
        const allGhostCirculos = getGhostCirculos()
        const joinedGhosts = allGhostCirculos
          .filter(c => joinedGhostIds.includes(c.id))
          .map(c => ({
            ...c,
            community_circulo_membros: [
              ...(c.community_circulo_membros || []),
              { user_id: userId, role: 'membro', community_profiles: { display_name: 'Tu', avatar_emoji: '🌸' } }
            ]
          }))
        setMeusCirculos([...realCirculos, ...joinedGhosts])
      } else {
        setMeusCirculos(realCirculos)
      }
    } catch (error) {
      console.error('Erro ao carregar circulos:', error)
      setMeusCirculos([])
    }
    setLoading(false)
  }

  const carregarCirculosDoEco = async (eco) => {
    setLoadingEco(true)
    let data = []
    try {
      data = await getCirculosDoEco(eco) || []
    } catch (error) {
      console.error('Erro ao carregar circulos do eco:', error)
    }
    // Merge ghost circles filtered by eco
    const ghostCirculos = getGhostCirculos().filter(c => c.eco === eco)
    const realIds = new Set(data.map(c => c.id))
    const merged = [...data, ...ghostCirculos.filter(c => !realIds.has(c.id))]
    setCirculosEco(merged)
    setLoadingEco(false)
  }

  // ---------- Actions ----------

  const handleEntrar = async (circulo) => {
    if (acaoEmCurso[circulo.id]) return
    const membros = circulo.community_circulo_membros || []
    if (membros.length >= (circulo.max_membros || 12)) return

    setAcaoEmCurso(prev => ({ ...prev, [circulo.id]: true }))
    try {
      if (circulo._ghost) {
        // Ghost circle — add user locally to the member list
        const ghostJoinKey = 'ghost_circulos_joined'
        const joined = JSON.parse(localStorage.getItem(ghostJoinKey) || '[]')
        if (!joined.includes(circulo.id)) {
          joined.push(circulo.id)
          localStorage.setItem(ghostJoinKey, JSON.stringify(joined))
        }
        // Add to meusCirculos state
        setMeusCirculos(prev => [...prev, {
          ...circulo,
          community_circulo_membros: [
            ...membros,
            { user_id: userId, role: 'membro', community_profiles: { display_name: 'Tu', avatar_emoji: '🌸' } }
          ]
        }])
        // Also update the explore view
        if (tab === 'explorar') {
          setCirculosEco(prev => prev.map(c =>
            c.id === circulo.id
              ? { ...c, community_circulo_membros: [...membros, { user_id: userId, role: 'membro', community_profiles: { display_name: 'Tu', avatar_emoji: '🌸' } }] }
              : c
          ))
        }
      } else {
        await entrarCirculo(circulo.id, userId)
        await carregarMeusCirculos()
        if (tab === 'explorar') {
          await carregarCirculosDoEco(ecoSelecionado)
        }
      }
    } catch (error) {
      console.error('Erro ao entrar no circulo:', error)
    }
    setAcaoEmCurso(prev => ({ ...prev, [circulo.id]: false }))
  }

  const handleSair = async (circuloId) => {
    setAcaoEmCurso(prev => ({ ...prev, [circuloId]: true }))
    try {
      await sairCirculo(circuloId, userId)
      setConfirmSair(null)
      setCirculoAberto(null)
      await carregarMeusCirculos()
      if (tab === 'explorar') {
        await carregarCirculosDoEco(ecoSelecionado)
      }
    } catch (error) {
      console.error('Erro ao sair do circulo:', error)
    }
    setAcaoEmCurso(prev => ({ ...prev, [circuloId]: false }))
  }

  const handleCriar = async () => {
    if (!criarNome.trim() || criando) return
    setCriando(true)
    try {
      await criarCirculo(userId, {
        nome: criarNome.trim(),
        eco: criarEco,
        intencao: criarIntencao.trim(),
        max_membros: criarMax
      })
      setShowCriar(false)
      setCriarNome('')
      setCriarIntencao('')
      setCriarMax(12)
      await carregarMeusCirculos()
      setTab('meus')
    } catch (error) {
      console.error('Erro ao criar circulo:', error)
    }
    setCriando(false)
  }

  // ---------- Helpers ----------

  const estouNoCirculo = (circulo) => {
    const membros = circulo.community_circulo_membros || []
    return membros.some(m => m.user_id === userId)
  }

  const contarMembros = (circulo) => {
    return (circulo.community_circulo_membros || []).length
  }

  const circuloCheio = (circulo) => {
    return contarMembros(circulo) >= (circulo.max_membros || 12)
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse">
          &#9675;
        </div>
        <p className="text-gray-400 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
          A carregar círculos...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 animate-page-enter" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 p-4 pb-2">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                Círculos de Eco
              </h1>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                Pequenos círculos de transformação
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 pb-3 pt-1">
            <button
              onClick={() => setTab('meus')}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                tab === 'meus'
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={tab === 'meus' ? { backgroundColor: '#8B5CF6' } : {}}
            >
              Os Meus
            </button>
            <button
              onClick={() => setTab('explorar')}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                tab === 'explorar'
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={tab === 'explorar' ? { backgroundColor: '#8B5CF6' } : {}}
            >
              Explorar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4">

        {/* ===== TAB: OS MEUS ===== */}
        {tab === 'meus' && (
          <>
            {meusCirculos.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">&#9675;</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
                  Ainda não fazes parte de nenhum círculo
                </h3>
                <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Explora os círculos existentes ou cria o teu próprio
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setTab('explorar')}
                    className="text-sm font-medium px-5 py-2 rounded-full text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#8B5CF6' }}
                  >
                    Explorar
                  </button>
                  <button
                    onClick={() => setShowCriar(true)}
                    className="text-sm font-medium px-5 py-2 rounded-full border-2 border-dashed transition-all hover:bg-purple-50"
                    style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}
                  >
                    + Criar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {meusCirculos.map(circulo => (
                  <CirculoCard
                    key={circulo.id}
                    circulo={circulo}
                    userId={userId}
                    isMembro={true}
                    acaoEmCurso={acaoEmCurso[circulo.id]}
                    onEntrar={() => {}}
                    onSair={() => setConfirmSair(circulo.id)}
                    onAbrir={() => setCirculoAberto(circulo)}
                  />
                ))}

                {/* Create new button */}
                <button
                  onClick={() => setShowCriar(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed text-center transition-all hover:bg-purple-50"
                  style={{ borderColor: '#D8B4FE', color: '#8B5CF6' }}
                >
                  <span className="text-2xl block mb-1">+</span>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Criar novo Círculo
                  </p>
                </button>
              </div>
            )}
          </>
        )}

        {/* ===== TAB: EXPLORAR ===== */}
        {tab === 'explorar' && (
          <>
            {/* Eco filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {ecosDisponiveis.map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setEcoSelecionado(key)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                    ecoSelecionado === key
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={ecoSelecionado === key ? { backgroundColor: info.cor } : {}}
                >
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                </button>
              ))}
            </div>

            {loadingEco ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>A carregar...</p>
              </div>
            ) : circulosEco.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">{ECOS_INFO[ecoSelecionado]?.emoji || '🌸'}</span>
                <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Ainda não existem círculos de {ECOS_INFO[ecoSelecionado]?.label}
                </p>
                <p className="text-xs text-gray-400 mb-4">Sê a primeira a criar um!</p>
                <button
                  onClick={() => { setCriarEco(ecoSelecionado); setShowCriar(true) }}
                  className="text-sm font-medium px-5 py-2 rounded-full border-2 border-dashed transition-all hover:bg-purple-50"
                  style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}
                >
                  + Criar Círculo de {ECOS_INFO[ecoSelecionado]?.label}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {circulosEco.map(circulo => (
                  <CirculoCard
                    key={circulo.id}
                    circulo={circulo}
                    userId={userId}
                    isMembro={estouNoCirculo(circulo)}
                    acaoEmCurso={acaoEmCurso[circulo.id]}
                    onEntrar={() => handleEntrar(circulo)}
                    onSair={() => setConfirmSair(circulo.id)}
                    onAbrir={() => setCirculoAberto(circulo)}
                  />
                ))}

                {/* Create in this eco */}
                <button
                  onClick={() => { setCriarEco(ecoSelecionado); setShowCriar(true) }}
                  className="w-full p-4 rounded-2xl border-2 border-dashed text-center transition-all hover:bg-purple-50"
                  style={{ borderColor: '#D8B4FE', color: '#8B5CF6' }}
                >
                  <span className="text-2xl block mb-1">+</span>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-titulos)' }}>
                    Criar Círculo de {ECOS_INFO[ecoSelecionado]?.label}
                  </p>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== CIRCLE DETAIL MODAL ===== */}
      {circuloAberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCirculoAberto(null)} />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp"
            style={{ animationDuration: '0.3s' }}
          >
            {/* Detail header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-lg rounded-t-3xl border-b border-gray-100 p-4">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {circuloAberto.eco && ECOS_INFO[circuloAberto.eco] && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: ECOS_INFO[circuloAberto.eco].cor + '20' }}
                    >
                      {ECOS_INFO[circuloAberto.eco].emoji}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {circuloAberto.nome}
                    </h2>
                    <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                      {contarMembros(circuloAberto)}/{circuloAberto.max_membros || 12} membros
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCirculoAberto(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Intention */}
              {circuloAberto.intencao && (
                <div
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: (ECOS_INFO[circuloAberto.eco]?.cor || '#8B5CF6') + '10' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: ECOS_INFO[circuloAberto.eco]?.cor || '#8B5CF6' }}>
                    Intenção do Círculo
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed italic" style={{ fontFamily: 'var(--font-corpo)' }}>
                    "{circuloAberto.intencao}"
                  </p>
                </div>
              )}

              {/* Description */}
              {circuloAberto.descricao && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Descrição</p>
                  <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
                    {circuloAberto.descricao}
                  </p>
                </div>
              )}

              {/* Members */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Membros ({contarMembros(circuloAberto)})
                </p>
                <div className="space-y-2">
                  {(circuloAberto.community_circulo_membros || []).map(membro => {
                    const perfilMembro = membro.community_profiles
                    return (
                      <div
                        key={membro.user_id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}
                        >
                          {perfilMembro?.avatar_emoji || '🌸'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
                            {perfilMembro?.display_name || 'Utilizadora'}
                          </p>
                          {membro.role === 'guardia' && (
                            <span className="text-xs text-purple-500 font-medium">Guardiã</span>
                          )}
                        </div>
                        {membro.user_id !== userId && (
                          <button
                            onClick={() => navigate(`/comunidade/jornada/${membro.user_id}`)}
                            className="text-xs text-gray-400 hover:text-purple-500 transition-colors"
                          >
                            Ver jornada
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action button */}
              <div className="pt-2 pb-4">
                {estouNoCirculo(circuloAberto) ? (
                  <button
                    onClick={() => setConfirmSair(circuloAberto.id)}
                    className="w-full py-3 rounded-full text-sm font-semibold border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 active:scale-98"
                    style={{ fontFamily: 'var(--font-corpo)' }}
                  >
                    Sair do Círculo
                  </button>
                ) : (
                  <button
                    onClick={() => handleEntrar(circuloAberto)}
                    disabled={circuloCheio(circuloAberto) || acaoEmCurso[circuloAberto.id]}
                    className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-98 disabled:opacity-50"
                    style={{ backgroundColor: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}
                  >
                    {acaoEmCurso[circuloAberto.id]
                      ? 'A entrar...'
                      : circuloCheio(circuloAberto)
                        ? 'Círculo cheio'
                        : 'Entrar neste Círculo'
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM LEAVE MODAL ===== */}
      {confirmSair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmSair(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <span className="text-4xl block mb-3">🌸</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Sair do Círculo?
            </h3>
            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'var(--font-corpo)' }}>
              Podes voltar a entrar mais tarde, se houver espaço.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSair(null)}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 transition-all hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSair(confirmSair)}
                disabled={acaoEmCurso[confirmSair]}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#EF4444' }}
              >
                {acaoEmCurso[confirmSair] ? '...' : 'Sair'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE CIRCLE MODAL ===== */}
      {showCriar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCriar(false)} />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-lg rounded-t-3xl border-b border-gray-100 p-4">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
                  Criar Círculo
                </h2>
                <button
                  onClick={() => setShowCriar(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Nome do Círculo
                </label>
                <input
                  type="text"
                  value={criarNome}
                  onChange={(e) => setCriarNome(e.target.value.slice(0, 60))}
                  placeholder='Ex: "Raízes de Vitalis"'
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 focus:bg-white"
                  style={{ fontFamily: 'var(--font-corpo)' }}
                  maxLength={60}
                />
                <p className="text-xs text-gray-300 mt-1 text-right">{criarNome.length}/60</p>
              </div>

              {/* Eco selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Eco
                </label>
                <div className="flex flex-wrap gap-2">
                  {ecosDisponiveis.map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setCriarEco(key)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                        criarEco === key
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      style={criarEco === key ? { backgroundColor: info.cor } : {}}
                    >
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intention */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Intenção
                </label>
                <textarea
                  value={criarIntencao}
                  onChange={(e) => setCriarIntencao(e.target.value.slice(0, 200))}
                  placeholder="Qual é a intenção sagrada deste círculo?"
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 focus:bg-white resize-none"
                  style={{ fontFamily: 'var(--font-corpo)' }}
                  maxLength={200}
                />
                <p className="text-xs text-gray-300 mt-1 text-right">{criarIntencao.length}/200</p>
              </div>

              {/* Max members slider */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Máximo de membros: {criarMax}
                </label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={criarMax}
                  onChange={(e) => setCriarMax(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>3</span>
                  <span>15</span>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 pb-6">
                <button
                  onClick={handleCriar}
                  disabled={!criarNome.trim() || criando}
                  className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-98 disabled:opacity-50"
                  style={{ backgroundColor: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}
                >
                  {criando ? 'A criar...' : 'Criar Círculo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Sub-component: CirculoCard =====

function CirculoCard({ circulo, userId, isMembro, acaoEmCurso, onEntrar, onSair, onAbrir }) {
  const ecoInfo = circulo.eco ? ECOS_INFO[circulo.eco] : null
  const membros = circulo.community_circulo_membros || []
  const numMembros = membros.length
  const maxMembros = circulo.max_membros || 12
  const cheio = numMembros >= maxMembros

  return (
    <button
      onClick={onAbrir}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left transition-all hover:shadow-md active:scale-[0.99]"
      style={{ borderLeftWidth: '3px', borderLeftColor: ecoInfo?.cor || '#8B5CF6' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {ecoInfo && (
              <span className="text-base">{ecoInfo.emoji}</span>
            )}
            <h3 className="text-base font-bold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
              {circulo.nome}
            </h3>
          </div>
          {circulo.intencao && (
            <p className="text-xs text-gray-500 italic line-clamp-2 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
              "{circulo.intencao}"
            </p>
          )}
        </div>

        {/* Eco badge */}
        {ecoInfo && (
          <span
            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ml-2"
            style={{ backgroundColor: ecoInfo.cor + '20', color: ecoInfo.cor }}
          >
            {ecoInfo.label}
          </span>
        )}
      </div>

      {/* Bottom row: avatars + count + action */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {/* Overlapping avatars */}
          <div className="flex items-center">
            {membros.slice(0, 5).map((membro, i) => {
              const perfilMembro = membro.community_profiles
              return (
                <div
                  key={membro.user_id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)',
                    marginLeft: i > 0 ? '-0.5rem' : '0',
                    zIndex: 5 - i
                  }}
                >
                  {perfilMembro?.avatar_emoji || '🌸'}
                </div>
              )
            })}
            {numMembros > 5 && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white flex-shrink-0 bg-gray-100 text-gray-500"
                style={{ marginLeft: '-0.5rem', zIndex: 0 }}
              >
                +{numMembros - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
            {numMembros}/{maxMembros}
          </span>
        </div>

        {/* Action button */}
        <div onClick={(e) => e.stopPropagation()}>
          {isMembro ? (
            <button
              onClick={(e) => { e.stopPropagation(); onSair() }}
              className="text-xs px-3 py-1.5 rounded-full font-medium border border-gray-200 text-gray-500 transition-all hover:bg-gray-50"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Membro
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onEntrar() }}
              disabled={cheio || acaoEmCurso}
              className="text-xs px-4 py-1.5 rounded-full font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-1"
              style={{ backgroundColor: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}
            >
              {acaoEmCurso ? '...' : cheio ? 'Cheio' : 'Entrar'}
              {!cheio && !acaoEmCurso && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </button>
  )
}
