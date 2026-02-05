import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getNotificacoes, marcarNotificacoesLidas, tempoRelativo } from '../../lib/comunidade'

export default function Notificacoes() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [notificacoes, setNotificacoes] = useState([])

  useEffect(() => {
    inicializar()
  }, [])

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setUserId(userData.id)

        const [dados] = await Promise.all([
          getNotificacoes(userData.id),
          marcarNotificacoesLidas(userData.id)
        ])

        setNotificacoes(dados)
      }
    } catch (error) {
      console.error('Erro ao carregar notificacoes:', error)
    }
    setLoading(false)
  }

  const agruparPorData = (lista) => {
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())

    const grupos = {
      hoje: [],
      semana: [],
      antes: []
    }

    lista.forEach(notif => {
      const dataCriacao = new Date(notif.created_at)
      if (dataCriacao >= hoje) {
        grupos.hoje.push(notif)
      } else if (dataCriacao >= inicioSemana) {
        grupos.semana.push(notif)
      } else {
        grupos.antes.push(notif)
      }
    })

    return grupos
  }

  const getTextoNotificacao = (notif) => {
    switch (notif.tipo) {
      case 'like':
        return 'gostou da tua publicacao'
      case 'comment':
        return notif.conteudo
          ? `comentou: ${notif.conteudo.length > 50 ? notif.conteudo.slice(0, 50) + '...' : notif.conteudo}`
          : 'comentou na tua publicacao'
      case 'follow':
        return 'comecou a seguir-te'
      case 'mention':
        return 'mencionou-te numa publicacao'
      default:
        return 'interagiu contigo'
    }
  }

  const handleClick = (notif) => {
    if (notif.tipo === 'follow') {
      navigate(`/comunidade/perfil/${notif.actor_id}`)
    } else if (notif.post_id) {
      navigate(`/comunidade/post/${notif.post_id}`)
    } else {
      navigate(`/comunidade/perfil/${notif.actor_id}`)
    }
  }

  const renderGrupo = (titulo, lista) => {
    if (lista.length === 0) return null
    return (
      <div className="mb-2">
        <h3
          className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          {titulo}
        </h3>
        <div>
          {lista.map(notif => {
            const actorProfile = notif.actor_profile
            const nome = actorProfile?.display_name || 'Alguem'
            const avatar = actorProfile?.avatar_emoji || '🌸'
            const avatarUrl = actorProfile?.avatar_url

            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                style={!notif.lida ? { backgroundColor: 'rgba(139, 92, 246, 0.04)' } : {}}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={nome}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                      style={{ background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)' }}
                    >
                      {avatar}
                    </div>
                  )}
                  {!notif.lida && (
                    <div
                      className="w-2 h-2 rounded-full -mt-1 ml-auto mr-0.5"
                      style={{ backgroundColor: '#8B5CF6' }}
                    />
                  )}
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-semibold text-gray-900">{nome}</span>{' '}
                    {getTextoNotificacao(notif)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tempoRelativo(notif.created_at)}
                  </p>
                </div>

                {/* Thumbnail do post (se existir) */}
                {notif.post_id && notif.tipo !== 'follow' && (
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
                  >
                    <svg className="w-4 h-4" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse-subtle">
          🔔
        </div>
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A carregar notificacoes...
        </p>
      </div>
    )
  }

  const grupos = agruparPorData(notificacoes)
  const semNotificacoes = notificacoes.length === 0

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1
            className="text-lg font-semibold text-gray-800"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Notificacoes
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {semNotificacoes ? (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5"
              style={{ background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)' }}
            >
              🔔
            </div>
            <h2
              className="text-lg font-semibold text-gray-700 mb-2"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Sem notificacoes
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Quando alguem interagir com as tuas publicacoes ou comecar a seguir-te, vais ver aqui.
            </p>
            <button
              onClick={() => navigate('/comunidade')}
              className="mt-6 text-sm font-medium px-5 py-2.5 rounded-full text-white transition-all hover:shadow-lg active:scale-95"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              Explorar comunidade
            </button>
          </div>
        ) : (
          /* Lista de notificacoes agrupadas */
          <div className="pt-2">
            {renderGrupo('Hoje', grupos.hoje)}
            {renderGrupo('Esta semana', grupos.semana)}
            {renderGrupo('Antes', grupos.antes)}
          </div>
        )}
      </div>
    </div>
  )
}
