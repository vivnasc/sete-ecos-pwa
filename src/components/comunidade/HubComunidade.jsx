import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getFogueiraAtiva, getPromptDoDia, getPerfilPublico, contarReflexoes, contarRessonanciaRecebida, getMeusCirculos } from '../../lib/comunidade'
import { getGhostCommunityStats } from '../../lib/ghost-users'

const ESPACOS = [
  {
    id: 'rio',
    emoji: '🌊',
    titulo: 'O Rio',
    desc: 'O rio é onde as reflexões fluem. Partilha pensamentos guiados por prompts de autoconhecimento. Não é um feed social — é um diário colectivo.',
    rota: '/comunidade/rio',
    botao: 'Entrar no Rio',
    gradient: 'from-indigo-500/10 via-purple-500/5 to-blue-500/10',
    border: 'border-indigo-200/60',
    iconBg: 'bg-gradient-to-br from-indigo-100 to-blue-100'
  },
  {
    id: 'circulos',
    emoji: '👥',
    titulo: 'Círculos de Eco',
    desc: 'Pequenos grupos de 7 a 12 pessoas que exploram o mesmo Eco. Um espaço íntimo de partilha e apoio mútuo.',
    rota: '/comunidade/circulos',
    botao: 'Explorar Círculos',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-green-500/10',
    border: 'border-emerald-200/60',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100'
  },
  {
    id: 'fogueira',
    emoji: '🔥',
    titulo: 'Fogueira',
    desc: 'Um espaço efémero que dura 24 horas. Todas se reúnem em torno de um tema. Quando o fogo se apaga, ficam apenas as cinzas da memória.',
    rota: '/comunidade/fogueira',
    botao: 'Ir à Fogueira',
    gradient: 'from-orange-500/10 via-amber-500/5 to-red-500/10',
    border: 'border-orange-200/60',
    iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100'
  },
  {
    id: 'sussurros',
    emoji: '💜',
    titulo: 'Sussurros',
    desc: 'Mensagens privadas de apoio. Não são DMs — são sussurros de encorajamento entre pessoas que caminham juntas.',
    rota: '/comunidade/sussurros',
    botao: 'Os Meus Sussurros',
    gradient: 'from-pink-500/10 via-fuchsia-500/5 to-purple-500/10',
    border: 'border-pink-200/60',
    iconBg: 'bg-gradient-to-br from-pink-100 to-fuchsia-100'
  }
]

const CONCEITOS = [
  {
    emoji: '✨',
    titulo: 'Ressonância',
    desc: 'Em vez de "likes", ofereces ressonância — cinco formas de reconhecer: Ressoo, Luz, Força, Espelho, Raiz.',
    tipos: ['🫧', '💡', '💪', '🪞', '🌿']
  },
  {
    emoji: '🪞',
    titulo: 'Espelhos',
    desc: 'Respostas reflectivas às reflexões das outras. Não são comentários — são devoluções de presença e escuta.'
  },
  {
    emoji: '🦋',
    titulo: 'Jornada',
    desc: 'O teu perfil de transformação. Não é sobre seguidores — é sobre o caminho que percorres e a luz que recebes.'
  }
]

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
      if (!user) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setUserId(userData.id)

        // Ghost stats are always applied, even if Supabase queries fail
        const ghostStats = getGhostCommunityStats()

        let perfilData = null, fogueiraData = null
        let reflexoesCount = 0, ressonanciaCount = 0, circulosData = null
        try {
          const results = await Promise.all([
            getPerfilPublico(userData.id),
            getFogueiraAtiva(),
            contarReflexoes(userData.id),
            contarRessonanciaRecebida(userData.id),
            getMeusCirculos(userData.id)
          ])
          perfilData = results[0]
          fogueiraData = results[1]
          reflexoesCount = results[2]
          ressonanciaCount = results[3]
          circulosData = results[4]
        } catch (e) {
          console.warn('Supabase queries failed, showing ghost stats only:', e)
        }

        setPerfil(perfilData)
        setFogueira(fogueiraData)
        setStats({
          reflexoes: (reflexoesCount || 0) + ghostStats.totalReflexoes,
          ressonancia: (ressonanciaCount || 0) + ghostStats.totalRessonancia,
          circulos: (circulosData ? circulosData.length : 0) + ghostStats.circulosActivos
        })
      }
    } catch (error) {
      console.error('Erro ao carregar hub da comunidade:', error)
    }
    setLoading(false)
  }

  const tempoRestante = () => {
    if (!fogueira?.expires_at) return ''
    const diff = new Date(fogueira.expires_at) - new Date()
    if (diff <= 0) return ''
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}min` : `${m}min`
  }

  const temDados = true // Ghost stats garantem que há sempre dados visíveis

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 40%, #FDF4FF 100%)' }}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center text-3xl animate-pulse shadow-lg shadow-purple-200/50">
          🌸
        </div>
        <p className="mt-4 text-purple-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A preparar o espaço...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 30%, #FDF4FF 70%, #F5F3FF 100%)' }}>

      {/* ══════ HERO HEADER ══════ */}
      <div className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 px-5 pt-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}>
                Espaço Colectivo
              </p>
              <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                Comunidade
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-[260px] leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
                Onde mulheres partilham reflexões e caminham juntas na transformação.
              </p>
            </div>

            {perfil && (
              <button
                onClick={() => navigate(`/comunidade/jornada/${userId}`)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-200/40 border-2 border-white/80 transition-transform active:scale-95 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%)' }}
              >
                {perfil.avatar_emoji || '🌸'}
              </button>
            )}
          </div>

          {/* Quick stats inline */}
          {temDados && (
            <div className="flex gap-2">
              {[
                { n: stats.reflexoes, label: 'Reflexões', icon: '🌊' },
                { n: stats.ressonancia, label: 'Ressonância', icon: '✨' },
                { n: stats.circulos, label: 'Círculos', icon: '👥' }
              ].map(s => (
                <div key={s.label} className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-white/80 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-lg font-bold" style={{ color: '#8B5CF6', fontFamily: 'var(--font-titulos)' }}>{s.n}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-medium" style={{ fontFamily: 'var(--font-corpo)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════ FOGUEIRA BANNER ══════ */}
      {fogueira && (
        <div className="px-5 mb-5">
          <button
            onClick={() => navigate('/comunidade/fogueira')}
            className="w-full relative overflow-hidden rounded-2xl p-4 border border-orange-200/60 text-left transition-all active:scale-[0.98] hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 50%, #FECACA 100%)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            <div className="relative flex items-center gap-3">
              <span className="text-2xl animate-pulse">🔥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900 truncate" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Fogueira Acesa — {fogueira.tema}
                </p>
                <p className="text-xs text-amber-700/70 mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {tempoRestante()} restantes
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-200/50 px-3 py-1.5 rounded-full">Entrar →</span>
            </div>
          </button>
        </div>
      )}

      {/* ══════ PROMPT DO DIA ══════ */}
      {promptDoDia && (
        <div className="px-5 mb-6">
          <div className="relative overflow-hidden rounded-3xl p-5 border border-purple-200/50 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.06) 100%)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-300/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-300/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{promptDoDia.emoji}</span>
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}>
                  Prompt do Dia
                </span>
              </div>
              <p className="text-base leading-relaxed mb-4" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E', fontStyle: 'italic', fontWeight: 500 }}>
                "{promptDoDia.texto}"
              </p>
              <button
                onClick={() => navigate('/comunidade/rio')}
                className="text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:shadow-lg hover:shadow-purple-300/30 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
              >
                Reflectir no Rio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ ESPAÇOS PARA EXPLORAR ══════ */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
          Espaços para Explorar
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ESPACOS.map(esp => (
            <button
              key={esp.id}
              onClick={() => navigate(esp.rota)}
              className={`relative overflow-hidden rounded-3xl p-4 pb-5 border ${esp.border} bg-gradient-to-br ${esp.gradient} backdrop-blur-sm text-left transition-all active:scale-[0.97] hover:shadow-lg hover:-translate-y-0.5 group`}
            >
              <div className={`w-12 h-12 rounded-2xl ${esp.iconBg} flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                {esp.emoji}
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                {esp.titulo}
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3" style={{ fontFamily: 'var(--font-corpo)' }}>
                {esp.desc}
              </p>
              <span className="inline-block mt-3 text-[10px] font-bold tracking-wide uppercase" style={{ color: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}>
                {esp.botao} →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════ COMO FUNCIONA ══════ */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
          Como Funciona
        </h2>
        <div className="space-y-3">
          {CONCEITOS.map(c => (
            <div
              key={c.titulo}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-xl flex-shrink-0 border border-purple-100/50">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                    {c.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
                    {c.desc}
                  </p>
                  {c.tipos && (
                    <div className="flex gap-2 mt-2">
                      {c.tipos.map((t, i) => (
                        <span key={i} className="text-base">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Jornada link */}
        {userId && (
          <button
            onClick={() => navigate(`/comunidade/jornada/${userId}`)}
            className="w-full mt-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-sm text-left transition-all active:scale-[0.98] hover:shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-fuchsia-50 flex items-center justify-center text-xl flex-shrink-0 border border-pink-100/50 group-hover:scale-110 transition-transform">
                🦋
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                  A Minha Jornada
                </h3>
                <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-corpo)' }}>
                  O teu perfil de transformação e o caminho que percorres.
                </p>
              </div>
              <span className="text-purple-400 text-lg">→</span>
            </div>
          </button>
        )}
      </div>

      {/* ══════ CTA FINAL ══════ */}
      <div className="px-5">
        <button
          onClick={() => navigate('/comunidade/rio')}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm tracking-wide transition-all hover:shadow-xl hover:shadow-purple-300/30 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)', fontFamily: 'var(--font-corpo)' }}
        >
          Começar a Reflectir no Rio 🌊
        </button>
      </div>
    </div>
  )
}
