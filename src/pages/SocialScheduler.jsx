import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { publicarAgora, agendarPublicacao, getAgendadas, cancelarPublicacao } from '../lib/instagram-api'
import { publicarFacebook } from '../lib/facebook-api'

// ============================================================
// SOCIAL SCHEDULER — Dashboard de agendamento multi-plataforma
// Instagram (photo, carousel, story, reel) + Facebook (post, photo, video, link)
// ============================================================

const PLATFORMS = {
  instagram: { label: 'Instagram', icon: '📸', cor: 'from-purple-600 to-pink-500' },
  facebook: { label: 'Facebook', icon: '📘', cor: 'from-blue-600 to-blue-400' }
}

const TYPES_INSTAGRAM = [
  { value: 'photo', label: 'Foto', icon: '🖼', desc: 'Imagem no feed' },
  { value: 'carousel', label: 'Carrossel', icon: '🎠', desc: '2-10 imagens' },
  { value: 'story', label: 'Story', icon: '📱', desc: 'Story 24h' },
  { value: 'reel', label: 'Reel', icon: '🎬', desc: 'Video ate 90s' },
]

const TYPES_FACEBOOK = [
  { value: 'post', label: 'Post', icon: '📝', desc: 'Texto no feed' },
  { value: 'photo', label: 'Foto', icon: '🖼', desc: 'Imagem com legenda' },
  { value: 'video', label: 'Video', icon: '🎥', desc: 'Video na pagina' },
  { value: 'link', label: 'Link', icon: '🔗', desc: 'Partilhar URL' },
]

const STATUS_BADGE = {
  pending: { label: 'Pendente', cls: 'bg-amber-100 text-amber-700' },
  processing: { label: 'A publicar...', cls: 'bg-blue-100 text-blue-700' },
  published: { label: 'Publicado', cls: 'bg-green-100 text-green-700' },
  failed: { label: 'Falhou', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-500' },
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SocialScheduler() {
  const [tab, setTab] = useState('agendar') // agendar | agendados | historico
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  // Form state
  const [platform, setPlatform] = useState('instagram')
  const [type, setType] = useState('photo')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrls, setImageUrls] = useState(['', ''])
  const [videoUrl, setVideoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [shareToFeed, setShareToFeed] = useState(true)
  const [isReel, setIsReel] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [publishNow, setPublishNow] = useState(false)

  const types = platform === 'instagram' ? TYPES_INSTAGRAM : TYPES_FACEBOOK

  // Reset type when platform changes
  useEffect(() => {
    setType(platform === 'instagram' ? 'photo' : 'post')
  }, [platform])

  // Load scheduled posts
  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAgendadas()
      setPosts(data)
    } catch (e) {
      console.error('Erro ao carregar posts:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const showMsg = (text, isError) => {
    setMsg({ text, isError })
    setTimeout(() => setMsg(null), 5000)
  }

  const resetForm = () => {
    setCaption('')
    setImageUrl('')
    setImageUrls(['', ''])
    setVideoUrl('')
    setCoverUrl('')
    setLinkUrl('')
    setShareToFeed(true)
    setIsReel(false)
    setScheduledAt('')
    setPublishNow(false)
  }

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (publishNow) {
        // Publicar agora
        if (platform === 'instagram') {
          await publicarAgora({
            type,
            imageUrl: type === 'carousel' ? imageUrls.filter(u => u.trim()) : imageUrl,
            videoUrl: type === 'reel' ? videoUrl : undefined,
            caption,
            coverUrl: coverUrl || undefined,
            shareToFeed,
          })
        } else {
          await publicarFacebook({
            type,
            message: caption,
            imageUrl: type === 'photo' ? imageUrl : undefined,
            videoUrl: type === 'video' ? videoUrl : undefined,
            linkUrl: type === 'link' ? linkUrl : undefined,
            isReel,
          })
        }
        showMsg(`Publicado no ${PLATFORMS[platform].label} com sucesso!`)
      } else {
        // Agendar
        if (!scheduledAt) {
          showMsg('Selecciona uma data e hora para agendar', true)
          setLoading(false)
          return
        }
        await agendarPublicacao({
          type,
          imageUrl: type === 'carousel' ? imageUrls.filter(u => u.trim()) : imageUrl,
          videoUrl: (type === 'reel' || type === 'video') ? videoUrl : undefined,
          caption,
          coverUrl: coverUrl || undefined,
          shareToFeed,
          scheduledAt: new Date(scheduledAt).toISOString(),
          platform,
        })
        showMsg(`Agendado no ${PLATFORMS[platform].label} para ${formatDate(scheduledAt)}`)
      }
      resetForm()
      loadPosts()
    } catch (err) {
      showMsg(err.message, true)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await cancelarPublicacao(id)
      showMsg('Post cancelado')
      loadPosts()
    } catch (e) {
      showMsg(e.message, true)
    }
  }

  const pendingPosts = posts.filter(p => p.status === 'pending' || p.status === 'processing')
  const historyPosts = posts.filter(p => p.status === 'published' || p.status === 'failed' || p.status === 'cancelled')

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A4035] to-[#6B5B4E] text-white px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <Link to="/coach/marketing" className="text-white/70 hover:text-white text-sm">&larr; Marketing</Link>
        </div>
        <h1 className="text-xl font-bold">Social Scheduler</h1>
        <p className="text-white/70 text-sm mt-1">Agendar e publicar no Instagram e Facebook</p>

        {/* Stats */}
        <div className="flex gap-3 mt-3">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold">{pendingPosts.length}</div>
            <div className="text-[10px] text-white/60">Agendados</div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold">{historyPosts.filter(p => p.status === 'published').length}</div>
            <div className="text-[10px] text-white/60">Publicados</div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold">{historyPosts.filter(p => p.status === 'failed').length}</div>
            <div className="text-[10px] text-white/60">Falhados</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E2D9] bg-white sticky top-0 z-10">
        {[
          { id: 'agendar', label: 'Novo Post' },
          { id: 'agendados', label: `Agendados (${pendingPosts.length})` },
          { id: 'historico', label: 'Historico' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'text-[#C1634A] border-b-2 border-[#C1634A]'
                : 'text-[#8B7E74] hover:text-[#4A4035]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {msg && (
        <div className={`mx-4 mt-3 p-3 rounded-xl text-sm font-medium ${
          msg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* ============ TAB: NOVO POST ============ */}
        {tab === 'agendar' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Plataforma */}
            <div className="flex gap-2">
              {Object.entries(PLATFORMS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPlatform(key)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                    platform === key
                      ? `bg-gradient-to-r ${p.cor} text-white shadow-md`
                      : 'bg-white border border-[#E8E2D9] text-[#8B7E74]'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Tipo de post */}
            <div>
              <label className="block text-xs font-medium text-[#8B7E74] mb-2">Tipo de conteudo</label>
              <div className="grid grid-cols-2 gap-2">
                {types.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      type === t.value
                        ? 'bg-[#C1634A] text-white shadow-md'
                        : 'bg-white border border-[#E8E2D9] text-[#4A4035] hover:border-[#C1634A]'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <div className="font-medium text-sm mt-1">{t.label}</div>
                    <div className={`text-[10px] ${type === t.value ? 'text-white/70' : 'text-[#8B7E74]'}`}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Caption / Message */}
            <div>
              <label className="block text-xs font-medium text-[#8B7E74] mb-1">
                {platform === 'facebook' && type === 'post' ? 'Texto do post' : 'Legenda'}
              </label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={4}
                placeholder="Escreve a legenda ou texto do post..."
                className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none resize-none"
              />
              <div className="text-right text-[10px] text-[#8B7E74]">{caption.length} caracteres</div>
            </div>

            {/* Image URL — for photo/story */}
            {((platform === 'instagram' && (type === 'photo' || type === 'story')) ||
              (platform === 'facebook' && type === 'photo')) && (
              <div>
                <label className="block text-xs font-medium text-[#8B7E74] mb-1">URL da imagem</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none"
                />
              </div>
            )}

            {/* Carousel URLs */}
            {platform === 'instagram' && type === 'carousel' && (
              <div>
                <label className="block text-xs font-medium text-[#8B7E74] mb-1">URLs das imagens (2-10)</label>
                {imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={e => {
                        const newUrls = [...imageUrls]
                        newUrls[i] = e.target.value
                        setImageUrls(newUrls)
                      }}
                      placeholder={`Imagem ${i + 1}`}
                      className="flex-1 bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none"
                    />
                    {imageUrls.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 px-2"
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
                {imageUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setImageUrls([...imageUrls, ''])}
                    className="text-[#C1634A] text-sm font-medium hover:underline"
                  >
                    + Adicionar imagem
                  </button>
                )}
              </div>
            )}

            {/* Video URL — for reels/videos */}
            {((platform === 'instagram' && type === 'reel') ||
              (platform === 'facebook' && type === 'video')) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#8B7E74] mb-1">URL do video</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://exemplo.com/video.mp4"
                    required
                    className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none"
                  />
                </div>
                {platform === 'instagram' && type === 'reel' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#8B7E74] mb-1">Thumbnail do reel (opcional)</label>
                      <input
                        type="url"
                        value={coverUrl}
                        onChange={e => setCoverUrl(e.target.value)}
                        placeholder="https://exemplo.com/cover.jpg"
                        className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[#4A4035]">
                      <input
                        type="checkbox"
                        checked={shareToFeed}
                        onChange={e => setShareToFeed(e.target.checked)}
                        className="rounded border-[#E8E2D9] text-[#C1634A] focus:ring-[#C1634A]"
                      />
                      Partilhar reel no feed
                    </label>
                  </>
                )}
                {platform === 'facebook' && type === 'video' && (
                  <label className="flex items-center gap-2 text-sm text-[#4A4035]">
                    <input
                      type="checkbox"
                      checked={isReel}
                      onChange={e => setIsReel(e.target.checked)}
                      className="rounded border-[#E8E2D9] text-[#C1634A] focus:ring-[#C1634A]"
                    />
                    Publicar como Reel do Facebook
                  </label>
                )}
              </>
            )}

            {/* Link URL — for Facebook link */}
            {platform === 'facebook' && type === 'link' && (
              <div>
                <label className="block text-xs font-medium text-[#8B7E74] mb-1">URL para partilhar</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://app.seteecos.com/vitalis"
                  required
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none"
                />
              </div>
            )}

            {/* Quando publicar */}
            <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 space-y-3">
              <label className="block text-xs font-medium text-[#8B7E74]">Quando publicar?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPublishNow(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    !publishNow ? 'bg-[#C1634A] text-white' : 'bg-[#F5F0EB] text-[#8B7E74]'
                  }`}
                >
                  Agendar
                </button>
                <button
                  type="button"
                  onClick={() => setPublishNow(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    publishNow ? 'bg-[#C1634A] text-white' : 'bg-[#F5F0EB] text-[#8B7E74]'
                  }`}
                >
                  Agora
                </button>
              </div>
              {!publishNow && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#C1634A] focus:ring-1 focus:ring-[#C1634A] outline-none"
                />
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C1634A] to-[#A54E38] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'A processar...' : publishNow ? `Publicar agora no ${PLATFORMS[platform].label}` : 'Agendar publicacao'}
            </button>
          </form>
        )}

        {/* ============ TAB: AGENDADOS ============ */}
        {tab === 'agendados' && (
          <>
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12 text-[#8B7E74]">
                <div className="text-4xl mb-3">📅</div>
                <p className="font-medium">Nenhum post agendado</p>
                <p className="text-sm mt-1">Cria um post no separador "Novo Post"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map(post => {
                  const plat = PLATFORMS[post.platform || 'instagram']
                  const status = STATUS_BADGE[post.status] || STATUS_BADGE.pending
                  return (
                    <div key={post.id} className="bg-white rounded-xl border border-[#E8E2D9] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{plat?.icon || '📸'}</span>
                          <span className="text-xs font-bold text-[#8B7E74] uppercase">{post.type}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                        {post.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(post.id)}
                            className="text-red-400 hover:text-red-600 text-xs font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                      {post.caption && (
                        <p className="text-sm text-[#4A4035] line-clamp-2 mb-2">{post.caption}</p>
                      )}
                      <div className="text-[10px] text-[#8B7E74]">
                        Agendado: {formatDate(post.scheduled_at)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ============ TAB: HISTORICO ============ */}
        {tab === 'historico' && (
          <>
            {historyPosts.length === 0 ? (
              <div className="text-center py-12 text-[#8B7E74]">
                <div className="text-4xl mb-3">📊</div>
                <p className="font-medium">Nenhum historico ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyPosts.slice(0, 50).map(post => {
                  const plat = PLATFORMS[post.platform || 'instagram']
                  const status = STATUS_BADGE[post.status] || STATUS_BADGE.pending
                  return (
                    <div key={post.id} className="bg-white rounded-xl border border-[#E8E2D9] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{plat?.icon || '📸'}</span>
                        <span className="text-xs font-bold text-[#8B7E74] uppercase">{post.type}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                      {post.caption && (
                        <p className="text-sm text-[#4A4035] line-clamp-2 mb-2">{post.caption}</p>
                      )}
                      {post.error_message && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700 mb-2">
                          {post.error_message}
                        </div>
                      )}
                      <div className="flex gap-4 text-[10px] text-[#8B7E74]">
                        <span>Agendado: {formatDate(post.scheduled_at)}</span>
                        {post.published_at && <span>Publicado: {formatDate(post.published_at)}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
