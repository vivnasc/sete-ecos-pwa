import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getFogueiraAtiva, getPromptDoDia, getPerfilPublico, contarReflexoes, contarRessonanciaRecebida, getMeusCirculos } from '../../lib/comunidade'

export default function HubComunidade() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [fogueira, setFogueira] = useState(null)
  const [stats, setStats] = useState({ reflexoes: 0, ressonancia: 0, circulos: 0 })

  const promptDoDia = getPromptDoDia()

  useEffect(() => {
    inicializar()
  }, [])

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setUserId(userData.id)

        const [perfilData, fogueiraData, reflexoesCount, ressonanciaCount, circulosData] = await Promise.all([
          getPerfilPublico(userData.id),
          getFogueiraAtiva(),
          contarReflexoes(userData.id),
          contarRessonanciaRecebida(userData.id),
          getMeusCirculos(userData.id)
        ])

        setPerfil(perfilData)
        setFogueira(fogueiraData)
        setStats({
          reflexoes: reflexoesCount || 0,
          ressonancia: ressonanciaCount || 0,
          circulos: circulosData ? circulosData.length : 0
        })
      }
    } catch (error) {
      console.error('Erro ao carregar hub da comunidade:', error)
    }
    setLoading(false)
  }

  const temDados = stats.reflexoes > 0 || stats.ressonancia > 0 || stats.circulos > 0

  // Calcular tempo restante da fogueira
  const tempoRestanteFogueira = () => {
    if (!fogueira?.expires_at) return ''
    const agora = new Date()
    const expira = new Date(fogueira.expires_at)
    const diffMs = expira - agora
    if (diffMs <= 0) return ''
    const horas = Math.floor(diffMs / 3600000)
    const minutos = Math.floor((diffMs % 3600000) / 60000)
    if (horas > 0) return `${horas}h ${minutos}min restantes`
    return `${minutos}min restantes`
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)',
          fontFamily: 'var(--font-titulos)',
          color: '#8B5CF6'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'pulse-subtle 2s ease-in-out infinite' }}>
          🌸
        </div>
        <p style={{ fontSize: '1.125rem', fontStyle: 'italic' }}>A preparar o espaço...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)',
        paddingBottom: '6rem'
      }}
    >
      {/* ========== HEADER ========== */}
      <div
        style={{
          padding: '1.5rem 1.25rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-titulos)',
              fontSize: '2rem',
              fontWeight: 500,
              color: '#1A1A4E',
              lineHeight: 1.2,
              margin: 0
            }}
          >
            Comunidade
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-corpo)',
              fontSize: '0.875rem',
              color: '#8B5CF6',
              marginTop: '0.25rem',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}
          >
            Espaco de Autoconhecimento Colectivo
          </p>
        </div>

        {perfil && (
          <button
            onClick={() => navigate(`/comunidade/jornada/${userId}`)}
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%)',
              border: '2px solid #DDD6FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.25s ease'
            }}
          >
            {perfil.avatar_emoji || '🌸'}
          </button>
        )}
      </div>

      {/* ========== FOGUEIRA BANNER ========== */}
      {fogueira && (
        <button
          onClick={() => navigate('/comunidade/fogueira')}
          style={{
            margin: '0 1.25rem 1.25rem',
            width: 'calc(100% - 2.5rem)',
            padding: '0.875rem 1.25rem',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FECACA 50%, #FED7AA 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated fire glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite'
            }}
          />
          <span style={{ fontSize: '1.5rem', animation: 'pulse-subtle 2s ease-in-out infinite', position: 'relative', zIndex: 1 }}>
            🔥
          </span>
          <div style={{ flex: 1, textAlign: 'left', position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontFamily: 'var(--font-corpo)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#92400E',
                margin: 0,
                lineHeight: 1.3
              }}
            >
              Fogueira Acesa — {fogueira.tema}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-corpo)',
                fontSize: '0.6875rem',
                color: '#B45309',
                margin: 0,
                marginTop: '0.125rem'
              }}
            >
              {tempoRestanteFogueira()}
            </p>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-corpo)',
              fontSize: '0.75rem',
              color: '#92400E',
              fontWeight: 600,
              position: 'relative',
              zIndex: 1
            }}
          >
            Entrar →
          </span>
        </button>
      )}

      {/* ========== O QUE E ISTO? — GUIDE SECTION ========== */}
      <div style={{ padding: '0 1.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-titulos)',
              fontSize: '1.375rem',
              fontWeight: 500,
              color: '#1A1A4E',
              margin: 0,
              marginBottom: '0.25rem'
            }}
          >
            O Que e Isto?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-corpo)',
              fontSize: '0.8125rem',
              color: '#6B6B9D',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            Este nao e um espaco social comum. E um espaco de autoconhecimento colectivo. Aqui, cada conceito foi pensado para a tua transformacao interior.
          </p>
        </div>

        {/* Concept Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* O Rio */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #EDE9FE 0%, #DBEAFE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                🌊
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  O Rio
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  O rio e onde as reflexoes fluem. Partilha pensamentos guiados por prompts de autoconhecimento. Nao e um feed social — e um diario colectivo.
                </p>
                <button
                  onClick={() => navigate('/comunidade/rio')}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    borderRadius: '0.75rem',
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Entrar no Rio
                </button>
              </div>
            </div>
          </div>

          {/* Ressonancia */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                ✨
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  Ressonancia
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  Em vez de 'likes', ofereces ressonancia — cinco formas de reconhecer o que alguem partilhou: Ressoo, Luz, Forca, Espelho, Raiz.
                </p>
              </div>
            </div>
          </div>

          {/* Espelhos */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                🪞
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  Espelhos
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  Respostas reflectivas as reflexoes das outras. Nao sao comentarios — sao devolucoes de presenca e escuta.
                </p>
              </div>
            </div>
          </div>

          {/* Circulos de Eco */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                👥
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  Circulos de Eco
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  Pequenos grupos de 7 a 12 mulheres que exploram o mesmo Eco. Um espaco intimo de partilha e apoio mutuo.
                </p>
                <button
                  onClick={() => navigate('/comunidade/circulos')}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    borderRadius: '0.75rem',
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Explorar Circulos
                </button>
              </div>
            </div>
          </div>

          {/* Fogueira */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FECACA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                🔥
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  Fogueira
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  Um espaco efemero que dura 24 horas. Todas se reunem em torno de um tema. Quando o fogo se apaga, ficam apenas as cinzas da memoria.
                </p>
                <button
                  onClick={() => navigate('/comunidade/fogueira')}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    borderRadius: '0.75rem',
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Ir a Fogueira
                </button>
              </div>
            </div>
          </div>

          {/* Sussurros */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                💜
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  Sussurros
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  Mensagens privadas de apoio. Nao sao DMs — sao sussurros de encorajamento entre mulheres que caminham juntas.
                </p>
                <button
                  onClick={() => navigate('/comunidade/sussurros')}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    borderRadius: '0.75rem',
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Os Meus Sussurros
                </button>
              </div>
            </div>
          </div>

          {/* Jornada */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              border: '1px solid #EDE9FE',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                🦋
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-titulos)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1A1A4E',
                    margin: 0,
                    marginBottom: '0.375rem'
                  }}
                >
                  Jornada
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '0.8125rem',
                    color: '#6B6B9D',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  O teu perfil de transformacao. Nao e sobre seguidores — e sobre o caminho que percorres e a luz que recebes.
                </p>
                {userId && (
                  <button
                    onClick={() => navigate(`/comunidade/jornada/${userId}`)}
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 1.25rem',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      fontFamily: 'var(--font-corpo)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    A Minha Jornada
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== QUICK STATS ========== */}
      {temDados && (
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <h2
            style={{
              fontFamily: 'var(--font-titulos)',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: '#1A1A4E',
              margin: 0,
              marginBottom: '0.75rem'
            }}
          >
            O Teu Caminho
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div
              style={{
                flex: 1,
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #EDE9FE',
                padding: '1rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-titulos)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#8B5CF6',
                  margin: 0,
                  lineHeight: 1
                }}
              >
                {stats.reflexoes}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-corpo)',
                  fontSize: '0.6875rem',
                  color: '#6B6B9D',
                  margin: 0,
                  marginTop: '0.25rem'
                }}
              >
                Reflexoes
              </p>
            </div>
            <div
              style={{
                flex: 1,
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #EDE9FE',
                padding: '1rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-titulos)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#8B5CF6',
                  margin: 0,
                  lineHeight: 1
                }}
              >
                {stats.ressonancia}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-corpo)',
                  fontSize: '0.6875rem',
                  color: '#6B6B9D',
                  margin: 0,
                  marginTop: '0.25rem'
                }}
              >
                Ressonancia
              </p>
            </div>
            <div
              style={{
                flex: 1,
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #EDE9FE',
                padding: '1rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)'
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-titulos)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#8B5CF6',
                  margin: 0,
                  lineHeight: 1
                }}
              >
                {stats.circulos}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-corpo)',
                  fontSize: '0.6875rem',
                  color: '#6B6B9D',
                  margin: 0,
                  marginTop: '0.25rem'
                }}
              >
                Circulos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== PROMPT DO DIA ========== */}
      {promptDoDia && (
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              borderRadius: '1.5rem',
              border: '1px solid #DDD6FE',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: 'absolute',
                top: '-1.5rem',
                right: '-1.5rem',
                width: '6rem',
                height: '6rem',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.08)',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-2rem',
                left: '-1rem',
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.05)',
                pointerEvents: 'none'
              }}
            />

            <p
              style={{
                fontFamily: 'var(--font-corpo)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#8B5CF6',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
                marginBottom: '0.625rem',
                position: 'relative',
                zIndex: 1
              }}
            >
              {promptDoDia.emoji} Prompt do Dia
            </p>
            <p
              style={{
                fontFamily: 'var(--font-titulos)',
                fontSize: '1.25rem',
                fontWeight: 500,
                fontStyle: 'italic',
                color: '#1A1A4E',
                margin: 0,
                marginBottom: '1rem',
                lineHeight: 1.4,
                position: 'relative',
                zIndex: 1
              }}
            >
              {promptDoDia.texto}
            </p>
            <button
              onClick={() => navigate('/comunidade/rio')}
              style={{
                padding: '0.625rem 1.5rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                borderRadius: '0.75rem',
                fontFamily: 'var(--font-corpo)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                zIndex: 1
              }}
            >
              Reflectir no Rio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
