import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getFogueiraAtiva, getPromptDoDia, getPerfilPublico, contarReflexoes, contarRessonanciaRecebida, getMeusCirculos, ECOS_INFO } from '../../lib/comunidade'
import { getGhostCommunityStats, getGhostPostsForRange, GHOST_PROFILES } from '../../lib/ghost-users'

// Avatar component — iniciais com cor em vez de emoji genérico
function Avatar({ perfil, size = 40, className = '' }) {
  const color = perfil?.avatar_color
  const iniciais = perfil?.iniciais || perfil?.display_name?.slice(0, 2)?.toUpperCase() || '?'

  if (perfil?.avatar_url) {
    return <img src={perfil.avatar_url} alt="" className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color?.bg || '#8B5CF6',
        color: color?.text || '#FFF',
        fontSize: size * 0.38,
        fontFamily: 'var(--font-corpo)',
        letterSpacing: '0.02em'
      }}
    >
      {iniciais}
    </div>
  )
}

export default function HubComunidade() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [fogueira, setFogueira] = useState(null)
  const [stats, setStats] = useState({ reflexoes: 0, ressonancia: 0, circulos: 0, membros: 0 })
  const [trendingPosts, setTrendingPosts] = useState([])

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

        // Get trending ghost posts for preview
        const ghostPosts = getGhostPostsForRange(7)
        const sorted = ghostPosts.sort((a, b) => (b.ressonancia_count || 0) - (a.ressonancia_count || 0))
        setTrendingPosts(sorted.slice(0, 3))

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

  // Pick a few ghost profiles for subtle social proof (not overwhelming)
  const activeMembers = GHOST_PROFILES.slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 50%, #FDF8F3 100%)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)', boxShadow: '0 8px 32px rgba(217,119,6,0.25)' }}>
          <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>C</span>
        </div>
        <p className="mt-4 text-amber-800/50 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A preparar o espaço...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 50%, #FDF8F3 100%)' }}>

      {/* ══════ HERO — Warm, organic ══════ */}
      <div className="relative overflow-hidden pt-6 pb-4 px-5">
        {/* Decorative shapes — capulana-inspired */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute" style={{ width: 220, height: 220, top: '-15%', right: '-12%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)' }} />
          <div className="absolute" style={{ width: 160, height: 160, bottom: '-5%', left: '-8%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)' }} />
          {/* Geometric accent line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #D97706 0%, #EA580C 25%, #9333EA 50%, #059669 75%, #0891B2 100%)' }} />
        </div>

        <div className="relative z-10">
          {/* Top row: title + profile avatar */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight"
                style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
                Comunidade
              </h1>
              <p className="text-sm mt-1"
                style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
                Onde a transformação se encontra
              </p>
            </div>

            {perfil && (
              <button
                onClick={() => navigate(`/comunidade/jornada/${userId}`)}
                className="relative transition-all active:scale-90"
              >
                <Avatar perfil={perfil} size={44} />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
              </button>
            )}
          </div>

          {/* Quem está aqui — subtle social proof */}
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {activeMembers.map((ghost, i) => (
                  <div
                    key={ghost.id}
                    style={{ marginLeft: i > 0 ? '-0.4rem' : '0', zIndex: 4 - i }}
                  >
                    <Avatar perfil={ghost} size={28} className="border-2 border-white shadow-sm" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
                  Comunidade activa
                </span>
              </div>
            </div>
          </div>

          {/* Stats — clean horizontal cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { n: stats.reflexoes, label: 'Reflexões', cor: '#D97706' },
              { n: stats.ressonancia, label: 'Ressonância', cor: '#EA580C' },
              { n: stats.circulos, label: 'Círculos', cor: '#059669' }
            ].map(s => (
              <div key={s.label} className="rounded-2xl px-3 py-3 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <span className="text-2xl font-bold block" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>{s.n}</span>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: s.cor, fontFamily: 'var(--font-corpo)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ ENTRAR NO RIO — CTA principal ══════ */}
      <div className="px-5 mb-4 mt-2">
        <button
          onClick={() => navigate('/comunidade/rio')}
          className="w-full relative overflow-hidden rounded-3xl p-5 text-left transition-all active:scale-[0.98] group"
          style={{
            background: 'linear-gradient(135deg, #292524 0%, #44403C 100%)',
            boxShadow: '0 8px 32px rgba(41,37,36,0.2)'
          }}
        >
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 12px)' }} />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                  O Rio
                </h2>
                <p className="text-xs text-white/50 mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {stats.reflexoes} reflexões a fluir
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                <span className="text-2xl">🌊</span>
              </div>
            </div>

            {/* Prompt do dia preview */}
            {promptDoDia && (
              <div className="rounded-2xl p-3.5 mb-4"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-400/80 mb-1.5"
                  style={{ fontFamily: 'var(--font-corpo)' }}>
                  {promptDoDia.emoji} Prompt do dia
                </p>
                <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
                  "{promptDoDia.texto}"
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Mini preview of recent posts */}
              <div className="flex items-center -space-x-2">
                {trendingPosts.slice(0, 3).map((post) => (
                  <Avatar key={post.id} perfil={post.community_profiles} size={24} className="border-2 border-gray-700" />
                ))}
                {trendingPosts.length > 0 && (
                  <span className="text-[10px] text-white/40 ml-3" style={{ fontFamily: 'var(--font-corpo)' }}>
                    A partilhar agora
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold px-5 py-2 rounded-full text-gray-900 transition-all group-hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}>
                Mergulhar
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* ══════ FOGUEIRA BANNER ══════ */}
      {fogueira && (
        <div className="px-5 mb-4">
          <button
            onClick={() => navigate('/comunidade/fogueira')}
            className="w-full relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: '1px solid rgba(217,119,6,0.15)'
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🔥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900 truncate" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Fogueira Acesa — {fogueira.tema}
                </p>
                <p className="text-xs text-amber-700/60 mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {tempoRestante()} restantes
                </p>
              </div>
              <span className="text-xs font-bold text-amber-900 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(217,119,6,0.15)' }}>
                Entrar
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ══════ REFLEXÃO EM DESTAQUE — uma só, mais orgânica ══════ */}
      {trendingPosts.length > 0 && (
        <div className="px-5 mb-4">
          <button
            onClick={() => navigate('/comunidade/rio')}
            className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3"
              style={{ fontFamily: 'var(--font-titulos)', fontWeight: 400, fontStyle: 'italic' }}>
              "{trendingPosts[0].conteudo}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar perfil={trendingPosts[0].community_profiles} size={24} />
                <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                  {trendingPosts[0].is_anonymous ? 'Alma Anónima' : trendingPosts[0].community_profiles?.display_name}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: '#D97706' }}>
                Ver mais no Rio
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ══════ ESPAÇOS — Grid moderno ══════ */}
      <div className="px-5 mb-5">
        <h2 className="text-base font-semibold mb-3" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
          Explorar
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'circulos', emoji: '👥', titulo: 'Círculos', desc: 'Grupos de transformação', rota: '/comunidade/circulos', cor: '#059669', bgCor: '#ECFDF5' },
            { id: 'fogueira', emoji: '🔥', titulo: 'Fogueira', desc: 'Espaço efémero 24h', rota: '/comunidade/fogueira', cor: '#D97706', bgCor: '#FFFBEB' },
            { id: 'sussurros', emoji: '💜', titulo: 'Sussurros', desc: 'Mensagens privadas', rota: '/comunidade/sussurros', cor: '#9333EA', bgCor: '#FAF5FF' },
            { id: 'jornada', emoji: '🦋', titulo: 'Minha Jornada', desc: 'O teu caminho', rota: userId ? `/comunidade/jornada/${userId}` : '/comunidade/rio', cor: '#EA580C', bgCor: '#FFF7ED' }
          ].map(esp => (
            <button
              key={esp.id}
              onClick={() => navigate(esp.rota)}
              className="rounded-2xl p-4 text-left transition-all active:scale-95"
              style={{ background: esp.bgCor, border: `1px solid ${esp.cor}12` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5"
                style={{ background: `${esp.cor}15` }}>
                {esp.emoji}
              </div>
              <h3 className="text-sm font-semibold mb-0.5" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
                {esp.titulo}
              </h3>
              <p className="text-[10px]" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
                {esp.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ══════ COMO FUNCIONA ══════ */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-semibold mb-3" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
          Como Funciona
        </h2>
        <div className="space-y-2">
          {[
            { emoji: '🫧', titulo: 'Ressonância', desc: 'Cinco formas de reconhecer em vez de "likes"' },
            { emoji: '🪞', titulo: 'Espelhos', desc: 'Devoluções de presença e escuta profunda' },
            { emoji: '🦋', titulo: 'Jornada', desc: 'O teu caminho, não os teus seguidores' }
          ].map(c => (
            <div key={c.titulo} className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <span className="text-lg flex-shrink-0">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
                  {c.titulo}
                </span>
                <span className="text-xs ml-2" style={{ color: '#A8A29E', fontFamily: 'var(--font-corpo)' }}>
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

export { Avatar }
