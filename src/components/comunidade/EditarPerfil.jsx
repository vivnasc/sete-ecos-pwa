import React, { useState } from 'react'
import { upsertPerfilPublico, ECOS_INFO } from '../../lib/comunidade'

const AVATAR_OPTIONS = [
  '🌸', '🌺', '🌻', '🌷', '🌹', '💐',
  '🦋', '🐝', '🌿', '🍀', '🌙', '⭐',
  '🔮', '💎', '🪷', '🌊', '🔥', '🌈',
  '👑', '💜', '🧘‍♀️', '🫶', '✨', '🕊️'
]

export default function EditarPerfil({ userId, perfil, onPerfilAtualizado, onFechar }) {
  const [displayName, setDisplayName] = useState(perfil?.display_name || '')
  const [bio, setBio] = useState(perfil?.bio || '')
  const [avatarEmoji, setAvatarEmoji] = useState(perfil?.avatar_emoji || '🌸')
  const [ecosActivos, setEcosActivos] = useState(perfil?.ecos_activos || [])
  const [guardando, setGuardando] = useState(false)

  const toggleEco = (eco) => {
    setEcosActivos(prev =>
      prev.includes(eco)
        ? prev.filter(e => e !== eco)
        : [...prev, eco]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!displayName.trim() || guardando) return

    setGuardando(true)
    try {
      const novoPerfil = await upsertPerfilPublico(userId, {
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_emoji: avatarEmoji,
        ecos_activos: ecosActivos
      })
      onPerfilAtualizado?.(novoPerfil)
      onFechar?.()
    } catch (error) {
      console.error('Erro ao guardar perfil:', error)
    }
    setGuardando(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
          >
            Cancelar
          </button>
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
            O Teu Perfil
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

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Avatar */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl mx-auto mb-3">
              {avatarEmoji}
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
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

          {/* Nome */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1">
              Nome na comunidade
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como queres ser conhecida?"
              maxLength={30}
              className="w-full text-sm py-3 px-4 rounded-xl border border-gray-200 focus:border-purple-300"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1">
              Sobre ti
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Uma frase sobre o teu caminho de transformação..."
              maxLength={150}
              rows={2}
              className="w-full text-sm py-3 px-4 rounded-xl border border-gray-200 focus:border-purple-300 resize-none"
            />
            <span className="text-xs text-gray-300 float-right">{bio.length}/150</span>
          </div>

          {/* Ecos activos */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-2">
              Ecos que estás a explorar
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ECOS_INFO).filter(([key]) => key !== 'geral').map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleEco(key)}
                  className={`text-sm px-3 py-2 rounded-full font-medium transition-all ${
                    ecosActivos.includes(key)
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={ecosActivos.includes(key) ? { backgroundColor: info.cor } : {}}
                >
                  {info.emoji} {info.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
