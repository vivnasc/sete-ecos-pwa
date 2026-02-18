import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getPerfilPublico,
  getReflexoesDoUtilizador,
  contarSeguidoresESeguindo,
  verificarSeguindo,
  seguirUtilizador,
  deixarDeSeguir,
  contarReflexoes,
  contarRessonanciaRecebida,
  ECOS_INFO,
  TEMAS_REFLEXAO,
  tempoRelativo
} from '../../lib/comunidade'
import {
  isGhostUser,
  getGhostProfile,
  getGhostUserReflexoes
} from '../../lib/ghost-users'
import { Avatar } from './HubComunidade'

export default function Jornada() {
  const { userId: perfilUserId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [meusId, setMeusId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [reflexoes, setReflexoes] = useState([])
  const [contadores, setContadores] = useState({ seguidores: 0, seguindo: 0 })
  const [numReflexoes, setNumReflexoes] = useState(0)
  const [numRessonancia, setNumRessonancia] = useState(0)
  const [estouSeguindo, setEstouSeguindo] = useState(false)
  const [acaoEmCurso, setAcaoEmCurso] = useState(false)

  const isGhost = isGhostUser(perfilUserId)
  const isOwnProfile = meusId === perfilUserId

  useEffect(() => {
    carregarDados()
  }, [perfilUserId])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setMeusId(userData.id)

        if (isGhost) {
          // Ghost profile — tudo local
          const ghostPerfil = getGhostProfile(perfilUserId)
          const ghostReflexoes = getGhostUserReflexoes(perfilUserId)

          setPerfil(ghostPerfil)
          setReflexoes(ghostReflexoes)
          setNumReflexoes(ghostReflexoes.length)
          setNumRessonancia(ghostReflexoes.reduce((sum, r) => sum + (r.ressonancia_count || 0), 0))
          setContadores({
            seguidores: ghostPerfil?.seguidores || 0,
            seguindo: ghostPerfil?.seguindo || 0
          })

          // Check if user follows this ghost
          const followKey = 'ghost_follows'
          const follows = JSON.parse(localStorage.getItem(followKey) || '[]')
          setEstouSeguindo(follows.includes(perfilUserId))
        } else {
          // Real profile
          const [
            perfilData,
            reflexoesData,
            contadoresData,
            seguindoData,
            reflexoesCount,
            ressonanciaCount
          ] = await Promise.all([
            getPerfilPublico(perfilUserId),
            getReflexoesDoUtilizador(perfilUserId, 0, 50),
            contarSeguidoresESeguindo(perfilUserId),
            verificarSeguindo(userData.id, perfilUserId),
            contarReflexoes(perfilUserId),
            contarRessonanciaRecebida(perfilUserId)
          ])

          setPerfil(perfilData)
          setReflexoes(reflexoesData)
          setContadores(contadoresData)
          setEstouSeguindo(seguindoData)
          setNumReflexoes(reflexoesCount)
          setNumRessonancia(ressonanciaCount)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar jornada:', error)
    }
    setLoading(false)
  }

  const handleToggleSeguir = async () => {
    if (acaoEmCurso || isOwnProfile) return
    setAcaoEmCurso(true)
    try {
      if (isGhost) {
        // Ghost follow — localStorage
        const followKey = 'ghost_follows'
        const follows = JSON.parse(localStorage.getItem(followKey) || '[]')
        if (estouSeguindo) {
          localStorage.setItem(followKey, JSON.stringify(follows.filter(id => id !== perfilUserId)))
          setEstouSeguindo(false)
          setContadores(prev => ({ ...prev, seguidores: prev.seguidores - 1 }))
        } else {
          follows.push(perfilUserId)
          localStorage.setItem(followKey, JSON.stringify(follows))
          setEstouSeguindo(true)
          setContadores(prev => ({ ...prev, seguidores: prev.seguidores + 1 }))
        }
      } else {
        if (estouSeguindo) {
          await deixarDeSeguir(meusId, perfilUserId)
          setEstouSeguindo(false)
          setContadores(prev => ({ ...prev, seguidores: prev.seguidores - 1 }))
        } else {
          await seguirUtilizador(meusId, perfilUserId)
          setEstouSeguindo(true)
          setContadores(prev => ({ ...prev, seguidores: prev.seguidores + 1 }))
        }
      }
    } catch (error) {
      console.error('Erro ao seguir/desseguir:', error)
    }
    setAcaoEmCurso(false)
  }

  const handleSussurrar = () => {
    navigate(`/comunidade/sussurros?para=${perfilUserId}`)
  }

  const formatarDataInicio = () => {
    const dataStr = perfil?.membro_desde || perfil?.jornada_inicio || perfil?.created_at
    if (!dataStr) return null
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 100%)' }}>
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
          <span className="text-2xl">🦋</span>
        </div>
        <p className="text-amber-800/40 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
          A carregar jornada...
        </p>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 100%)' }}>
        <span className="text-5xl">🌱</span>
        <p className="text-gray-500 text-center" style={{ fontFamily: 'var(--font-corpo)' }}>
          Esta jornada ainda não começou.
        </p>
        <button
          onClick={() => navigate('/comunidade')}
          className="text-sm font-medium px-4 py-2 rounded-full transition-all"
          style={{ color: '#D97706' }}
        >
          Voltar à Comunidade
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 animate-page-enter" style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 100%)' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg border-b border-amber-100/50"
        style={{ background: 'rgba(253,248,243,0.85)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
            {perfil.display_name}
          </h1>
          {perfil.cidade && (
            <span className="text-xs text-gray-400 ml-auto flex-shrink-0" style={{ fontFamily: 'var(--font-corpo)' }}>
              📍 {perfil.cidade}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* ===== PROFILE SECTION ===== */}
        <div className="p-6 text-center">
          {/* Avatar — grande, com cor */}
          <div className="relative inline-block mb-4">
            <Avatar perfil={perfil} size={96} className="shadow-lg" />
            {isGhost && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-3 border-white" />
            )}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
            {perfil.display_name}
          </h2>

          {/* Location */}
          {perfil.cidade && (
            <p className="text-xs mb-1" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
              📍 {perfil.cidade}
            </p>
          )}

          {/* Bio */}
          {perfil.bio && (
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
              {perfil.bio}
            </p>
          )}

          {/* Eco badges */}
          {perfil.ecos_activos?.length > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              {perfil.ecos_activos.map(eco => {
                const info = ECOS_INFO[eco]
                return info ? (
                  <span
                    key={eco}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: info.cor + '20', color: info.cor }}
                  >
                    {info.emoji} {info.label}
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* ===== STATS ROW ===== */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
                {numReflexoes}
              </p>
              <p className="text-xs" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
                Reflexões
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
                {numRessonancia}
              </p>
              <p className="text-xs" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
                Ressonância
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
                {contadores.seguidores}
              </p>
              <p className="text-xs" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
                Conexões
              </p>
            </div>
          </div>

          {/* ===== ACTION BUTTONS ===== */}
          {!isOwnProfile && (
            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={handleToggleSeguir}
                disabled={acaoEmCurso}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  estouSeguindo
                    ? 'bg-gray-100 text-gray-600'
                    : 'text-white shadow-md'
                }`}
                style={!estouSeguindo ? { background: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)' } : {}}
              >
                {acaoEmCurso ? '...' : estouSeguindo ? 'A seguir' : 'Seguir'}
              </button>

              {!isGhost && (
                <button
                  onClick={handleSussurrar}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Sussurrar
                </button>
              )}
            </div>
          )}

          {/* Edit profile link (own profile) */}
          {isOwnProfile && (
            <button
              onClick={() => navigate('/comunidade/editar-perfil')}
              className="mt-5 px-5 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-500 transition-all"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Editar perfil
            </button>
          )}
        </div>

        {/* ===== A JORNADA SECTION ===== */}
        <div className="px-4 mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-titulos)', color: '#D97706' }}>
            A Jornada
          </h3>

          <div className="rounded-2xl p-5 space-y-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderLeft: '3px solid #D97706', border: '1px solid rgba(217,119,6,0.1)', borderLeftWidth: '3px' }}>
            {formatarDataInicio() && (
              <div className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">🌱</span>
                <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                  <span className="font-semibold">Início:</span> {formatarDataInicio()}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">📝</span>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                <span className="font-semibold">{numReflexoes}</span> {numReflexoes === 1 ? 'reflexão partilhada' : 'reflexões partilhadas'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">🫧</span>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                <span className="font-semibold">{numRessonancia}</span> {numRessonancia === 1 ? 'ressonância recebida' : 'ressonâncias recebidas'}
              </p>
            </div>

            {perfil.ecos_activos?.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">🌿</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                    Ecos activos:
                  </span>
                  {perfil.ecos_activos.map(eco => {
                    const info = ECOS_INFO[eco]
                    return info ? (
                      <span key={eco} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: info.cor + '20', color: info.cor }}>
                        {info.emoji} {info.label}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== REFLEXOES SECTION ===== */}
        <div className="px-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ fontFamily: 'var(--font-titulos)', color: '#D97706' }}>
            Reflexões
          </h3>

          {reflexoes.length === 0 ? (
            <div className="text-center py-12 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <span className="text-4xl block mb-3">📝</span>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                {isOwnProfile
                  ? 'Ainda não partilhaste reflexões. Começa a tua jornada!'
                  : 'Ainda sem reflexões partilhadas.'
                }
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/comunidade/rio')}
                  className="mt-4 text-sm font-medium px-4 py-2 rounded-full text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)' }}
                >
                  Partilhar reflexão
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {reflexoes.map(reflexao => {
                const temaInfo = TEMAS_REFLEXAO[reflexao.tipo] || TEMAS_REFLEXAO.livre
                const ecoInfo = reflexao.eco ? ECOS_INFO[reflexao.eco] : null
                return (
                  <div key={reflexao.id} className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      {ecoInfo && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: `${ecoInfo.cor}15`, color: ecoInfo.cor }}>
                          {ecoInfo.emoji} {ecoInfo.label}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: `${temaInfo.cor}10`, color: temaInfo.cor }}>
                        {temaInfo.emoji} {temaInfo.label}
                      </span>
                      <span className="text-[10px] text-gray-300 ml-auto">{tempoRelativo(reflexao.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-titulos)', fontWeight: 400 }}>
                      {reflexao.conteudo}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400">🫧 {reflexao.ressonancia_count || 0}</span>
                      <span className="text-xs text-gray-400">🪞 {reflexao.comments_count || 0}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
