import React, { useState } from 'react'
import { upsertPerfilPublico, ECOS_INFO } from '../../lib/comunidade'

// ============================================================
// EditarJornada — Configurar a tua Jornada
// Modal de edicao de perfil focado na transformacao interior
// ============================================================

const AVATAR_OPTIONS = [
  '🌸', '🌺', '🌻', '🌷', '🌹', '💐',
  '🦋', '🐝', '🌿', '🍀', '🌙', '⭐',
  '🔮', '💎', '🪷', '🌊', '🔥', '🌈',
  '👑', '💜', '🧘‍♀️', '🫶', '✨', '🕊️'
]

export default function EditarJornada({ userId, perfil, onPerfilAtualizado, onFechar }) {
  const [displayName, setDisplayName] = useState(perfil?.display_name || '')
  const [bio, setBio] = useState(perfil?.bio || '')
  const [avatarEmoji, setAvatarEmoji] = useState(perfil?.avatar_emoji || '🌸')
  const [ecosActivos, setEcosActivos] = useState(perfil?.ecos_activos || [])
  const [partilhaAnonima, setPartilhaAnonima] = useState(perfil?.is_anonymous_default || false)
  const [guardando, setGuardando] = useState(false)

  const toggleEco = (eco) => {
    setEcosActivos(prev =>
      prev.includes(eco)
        ? prev.filter(e => e !== eco)
        : [...prev, eco]
    )
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!displayName.trim() || guardando) return

    setGuardando(true)
    try {
      const novoPerfil = await upsertPerfilPublico(userId, {
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_emoji: avatarEmoji,
        ecos_activos: ecosActivos,
        is_anonymous_default: partilhaAnonima
      })
      onPerfilAtualizado?.(novoPerfil)
      onFechar?.()
    } catch (error) {
      console.error('Erro ao guardar jornada:', error)
    }
    setGuardando(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 rounded-t-3xl">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Cancelar
            </button>
            <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
              A Tua Jornada
            </h3>
            <button
              onClick={handleSubmit}
              disabled={!displayName.trim() || guardando}
              className="text-sm font-bold px-4 py-1.5 rounded-full text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              {guardando ? '...' : 'Guardar'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-7">
          {/* Avatar */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl mx-auto mb-4 shadow-sm">
              {avatarEmoji}
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-purple-100 ring-2 ring-purple-400 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nome na comunidade */}
          <div>
            <label
              className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1.5"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Nome na comunidade
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                if (e.target.value.length <= 30) setDisplayName(e.target.value)
              }}
              placeholder="Como queres ser conhecida neste caminho?"
              maxLength={30}
              className="w-full text-sm py-3 px-4 rounded-xl border border-gray-200 focus:border-purple-300 outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              style={{ fontFamily: 'var(--font-corpo)' }}
            />
          </div>

          {/* Intencao (bio) */}
          <div>
            <label
              className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1.5"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              A tua intenção
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= 150) setBio(e.target.value)
              }}
              placeholder="Uma frase sobre o teu caminho de transformação..."
              maxLength={150}
              rows={3}
              className="w-full text-sm py-3 px-4 rounded-xl border border-gray-200 focus:border-purple-300 outline-none focus:ring-2 focus:ring-purple-100 resize-none transition-all"
              style={{ fontFamily: 'var(--font-corpo)' }}
            />
            <span className="text-xs text-gray-300 float-right mt-1" style={{ fontFamily: 'var(--font-corpo)' }}>
              {bio.length}/150
            </span>
          </div>

          {/* Ecos que esta a explorar */}
          <div className="clear-both">
            <label
              className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-2.5"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Ecos que estás a explorar
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ECOS_INFO)
                .filter(([key]) => key !== 'geral')
                .map(([key, info]) => {
                  const isActive = ecosActivos.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleEco(key)}
                      className={`text-sm px-3.5 py-2 rounded-full font-medium transition-all border ${
                        isActive
                          ? 'text-white shadow-sm border-transparent'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: info.cor, borderColor: info.cor }
                          : { borderColor: info.cor + '40', color: info.cor }
                      }
                    >
                      {info.emoji} {info.label}
                    </button>
                  )
                })}
            </div>
          </div>

          {/* Partilha anonima por padrao */}
          <div className="flex items-center justify-between bg-purple-50/60 rounded-2xl p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">✨</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'var(--font-titulos)' }}>
                  Partilha anónima por padrão
                </p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                  As tuas reflexões serão anónimas por padrão
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPartilhaAnonima(prev => !prev)}
              className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200 ${
                partilhaAnonima ? '' : 'bg-gray-200'
              }`}
              style={partilhaAnonima ? { backgroundColor: '#8B5CF6' } : {}}
              role="switch"
              aria-checked={partilhaAnonima}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  partilhaAnonima ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Spacer para bottom safe area em mobile */}
          <div className="h-4" />
        </form>
      </div>
    </div>
  )
}
