import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getFogueiraAtiva, getPromptDoDia, getPerfilPublico, contarReflexoes, contarRessonanciaRecebida, getMeusCirculos } from '../../lib/comunidade'
import { getGhostCommunityStats, GHOST_PROFILES } from '../../lib/ghost-users'

export default function HubComunidade() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [fogueira, setFogueira] = useState(null)
  const [stats, setStats] = useState({ reflexoes: 0, ressonancia: 0, circulos: 0, membros: 0 })

  const promptDoDia = getPromptDoDia()

  useEffect(() => { inicializar() }, [])

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
          circulos: (circulosData ? circulosData.length : 0) + ghostStats.circulosActivos,
          membros: ghostStats.membrosActivos
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

  // Pick a few ghost avatars for the "who's here" section
  const activeAvatars = GHOST_PROFILES.slice(0, 6).map(p => p.avatar_emoji)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F5F3FF 100%)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}>
          🌸
        </div>
        <p className="mt-4 text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A preparar o espaço...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F5F3FF 100%)' }}>

      {/* ══════ HERO ══════ */}
      <div className="relative overflow-hidden pt-8 pb-6 px-5">
        {/* Soft decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full"
            style={{ width: 200, height: 200, top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
          <div className="absolute rounded-full"
            style={{ width: 150, height: 150, bottom: '0%', left: '-5%', background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          {/* Top row: title + avatar */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
                style={{ color: '#A78BFA', fontFamily: 'var(--font-corpo)' }}>
                Espaço Colectivo
              </p>
              <h1 className="text-3xl font-semibold tracking-tight"
                style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>
                Comunidade
              </h1>
            </div>

            {perfil && (
              <button
                onClick={() => navigate(`/comunidade/jornada/${userId}`)}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all active:scale-90 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)', border: '2px solid white' }}
              >
                {perfil.avatar_emoji || '🌸'}
              </button>
            )}
          </div>

          {/* Who's online indicator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center">
              {activeAvatars.map((emoji, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white flex-shrink-0 shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)',
                    marginLeft: i > 0 ? '-0.4rem' : '0',
                    zIndex: 6 - i
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                {stats.membros} activas agora
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2">
            {[
              { n: stats.reflexoes, label: 'Reflexões', icon: '🌊', rota: '/comunidade/rio' },
              { n: stats.ressonancia, label: 'Ressonância', icon: '✨', rota: userId ? `/comunidade/jornada/${userId}` : '/comunidade/rio' },
              { n: stats.circulos, label: 'Círculos', icon: '👥', rota: '/comunidade/circulos' }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => navigate(s.rota)}
                className="flex-1 rounded-2xl px-3 py-3 text-left transition-all active:scale-95 bg-white shadow-sm hover:shadow-md"
                style={{ border: '1px solid rgba(139,92,246,0.08)' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>{s.n}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ HERO CTA — Mergulhar no Rio ══════ */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate('/comunidade/rio')}
          className="w-full relative overflow-hidden rounded-3xl p-6 text-left transition-all active:scale-[0.98] hover:shadow-lg group bg-white shadow-sm"
          style={{ border: '1px solid rgba(139,92,246,0.12)' }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-3xl opacity-40"
            style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 50%, #FEF3C7 100%)' }} />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}>
                🌊
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>
                  O Rio
                </h2>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Reflexões que fluem entre nós
                </p>
              </div>
            </div>

            {/* Prompt preview */}
            {promptDoDia && (
              <div className="rounded-2xl p-4 mb-4 bg-white/80"
                style={{ border: '1px solid rgba(139,92,246,0.08)' }}>
                <p className="text-xs text-purple-400 mb-1.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {promptDoDia.emoji} Prompt do Dia
                </p>
                <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
                  "{promptDoDia.texto}"
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                {stats.reflexoes} reflexões a fluir
              </span>
              <span className="text-sm font-semibold px-5 py-2 rounded-full text-white transition-all group-hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }}>
                Mergulhar
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* ══════ FOGUEIRA BANNER ══════ */}
      {fogueira && (
        <div className="px-5 mb-5">
          <button
            onClick={() => navigate('/comunidade/fogueira')}
            className="w-full relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-[0.98] bg-white shadow-sm"
            style={{ border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-30"
              style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)' }} />
            <div className="relative flex items-center gap-3">
              <span className="text-2xl animate-pulse">🔥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-700 truncate" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Fogueira Acesa — {fogueira.tema}
                </p>
                <p className="text-xs text-amber-500/70 mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {tempoRestante()} restantes
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.12)' }}>
                Entrar
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ══════ ESPAÇOS — Horizontal scroll cards ══════ */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-3 px-5" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>
          Explorar
        </h2>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
          {[
            {
              id: 'circulos', emoji: '👥', titulo: 'Círculos',
              desc: 'Grupos íntimos de transformação',
              rota: '/comunidade/circulos',
              cor: '#10B981'
            },
            {
              id: 'fogueira', emoji: '🔥', titulo: 'Fogueira',
              desc: 'Espaço efémero de 24h',
              rota: '/comunidade/fogueira',
              cor: '#F97316'
            },
            {
              id: 'sussurros', emoji: '💜', titulo: 'Sussurros',
              desc: 'Mensagens de encorajamento',
              rota: '/comunidade/sussurros',
              cor: '#EC4899'
            },
            {
              id: 'jornada', emoji: '🦋', titulo: 'Jornada',
              desc: 'O teu perfil de transformação',
              rota: userId ? `/comunidade/jornada/${userId}` : '/comunidade/rio',
              cor: '#8B5CF6'
            }
          ].map(esp => (
            <button
              key={esp.id}
              onClick={() => navigate(esp.rota)}
              className="flex-shrink-0 w-36 rounded-2xl p-4 text-left transition-all active:scale-95 bg-white shadow-sm hover:shadow-md"
              style={{ border: `1px solid ${esp.cor}15` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: `${esp.cor}10` }}>
                {esp.emoji}
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>
                {esp.titulo}
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
                {esp.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ══════ COMO FUNCIONA — Compact ══════ */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-semibold mb-3" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>
          Como Funciona
        </h2>
        <div className="space-y-2">
          {[
            { emoji: '✨', titulo: 'Ressonância', desc: 'Cinco formas de reconhecer: 🫧 💡 💪 🪞 🌿' },
            { emoji: '🪞', titulo: 'Espelhos', desc: 'Devoluções de presença e escuta profunda' },
            { emoji: '🦋', titulo: 'Jornada', desc: 'O teu caminho, não os teus seguidores' }
          ].map(c => (
            <div
              key={c.titulo}
              className="rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm"
              style={{ border: '1px solid rgba(139,92,246,0.06)' }}
            >
              <span className="text-lg flex-shrink-0">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>
                  {c.titulo}
                </span>
                <span className="text-xs text-gray-400 ml-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {c.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
