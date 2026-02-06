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
  ECOS_INFO
} from '../../lib/comunidade'
import ReflexaoCard from './ReflexaoCard'

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

  const isOwnProfile = meusId === perfilUserId

  // ---------- Initialisation ----------

  useEffect(() => {
    carregarDados()
  }, [perfilUserId])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setMeusId(userData.id)

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
    } catch (error) {
      console.error('Erro ao carregar jornada:', error)
    }
    setLoading(false)
  }

  // ---------- Actions ----------

  const handleToggleSeguir = async () => {
    if (acaoEmCurso || isOwnProfile) return
    setAcaoEmCurso(true)
    try {
      if (estouSeguindo) {
        await deixarDeSeguir(meusId, perfilUserId)
        setEstouSeguindo(false)
        setContadores(prev => ({ ...prev, seguidores: prev.seguidores - 1 }))
      } else {
        await seguirUtilizador(meusId, perfilUserId)
        setEstouSeguindo(true)
        setContadores(prev => ({ ...prev, seguidores: prev.seguidores + 1 }))
      }
    } catch (error) {
      console.error('Erro ao seguir/desseguir:', error)
    }
    setAcaoEmCurso(false)
  }

  const handleSussurrar = () => {
    navigate(`/comunidade/sussurros?para=${perfilUserId}`)
  }

  // ---------- Helpers ----------

  const formatarDataInicio = () => {
    const dataStr = perfil?.jornada_inicio || perfil?.created_at
    if (!dataStr) return null
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse">
          🌸
        </div>
        <p className="text-gray-400 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
          A carregar jornada...
        </p>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-5xl">🌸</span>
        <p className="text-gray-500 text-center" style={{ fontFamily: 'var(--font-corpo)' }}>
          Esta jornada ainda não começou.
        </p>
        <button
          onClick={() => navigate('/comunidade')}
          className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-80"
          style={{ color: '#8B5CF6' }}
        >
          Voltar à Comunidade
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
            {perfil.display_name}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* ===== PROFILE SECTION ===== */}
        <div className="p-6 text-center">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}
          >
            {perfil.avatar_emoji || '🌸'}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'var(--font-titulos)' }}>
            {perfil.display_name}
          </h2>

          {/* Bio */}
          {perfil.bio && (
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
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
              <p className="text-xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
                {numReflexoes}
              </p>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                Reflexões
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
                {numRessonancia}
              </p>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                Ressonância
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
                {contadores.seguidores}
              </p>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
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
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'text-white shadow-md hover:shadow-lg'
                }`}
                style={!estouSeguindo ? { backgroundColor: '#8B5CF6' } : {}}
              >
                {acaoEmCurso ? '...' : estouSeguindo ? 'A seguir' : 'Seguir'}
              </button>

              <button
                onClick={handleSussurrar}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 active:scale-95 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Sussurrar
              </button>
            </div>
          )}

          {/* Edit profile link (own profile) */}
          {isOwnProfile && (
            <button
              onClick={() => navigate('/comunidade/editar-perfil')}
              className="mt-5 px-5 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-500 transition-all hover:bg-gray-50"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Editar perfil
            </button>
          )}
        </div>

        {/* ===== A JORNADA SECTION ===== */}
        <div className="px-4 mb-6">
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-titulos)', color: '#8B5CF6' }}
          >
            A Jornada
          </h3>

          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              backgroundColor: '#F5F3FF',
              borderLeft: '3px solid #8B5CF6'
            }}
          >
            {/* Journey start */}
            {formatarDataInicio() && (
              <div className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">🌱</span>
                <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                  <span className="font-semibold">Início:</span> {formatarDataInicio()}
                </p>
              </div>
            )}

            {/* Reflexoes count */}
            <div className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">📝</span>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                <span className="font-semibold">{numReflexoes}</span> {numReflexoes === 1 ? 'reflexão partilhada' : 'reflexões partilhadas'}
              </p>
            </div>

            {/* Resonance received */}
            <div className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">🫧</span>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                <span className="font-semibold">{numRessonancia}</span> {numRessonancia === 1 ? 'ressonância recebida' : 'ressonâncias recebidas'}
              </p>
            </div>

            {/* Active ecos */}
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
                      <span
                        key={eco}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: info.cor + '20', color: info.cor }}
                      >
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
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ fontFamily: 'var(--font-titulos)', color: '#8B5CF6' }}
          >
            Reflexões
          </h3>

          {reflexoes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-4xl block mb-3">📝</span>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                {isOwnProfile
                  ? 'Ainda não partilhaste reflexões. Começa a tua jornada!'
                  : 'Ainda sem reflexões partilhadas.'
                }
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/comunidade')}
                  className="mt-4 text-sm font-medium px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  Partilhar reflexão
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reflexoes.map(reflexao => (
                <ReflexaoCard
                  key={reflexao.id}
                  post={reflexao}
                  userId={meusId}
                  onPerfilClick={(uid) => {
                    if (uid !== perfilUserId) {
                      navigate(`/comunidade/jornada/${uid}`)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
