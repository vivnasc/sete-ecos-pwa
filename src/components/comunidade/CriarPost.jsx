import React, { useState, useRef } from 'react'
import { criarPost, uploadImagem, TIPOS_POST, ECOS_INFO, extrairHashtags } from '../../lib/comunidade'

export default function CriarPost({ userId, onPostCriado, onFechar }) {
  const [conteudo, setConteudo] = useState('')
  const [tipo, setTipo] = useState('progresso')
  const [eco, setEco] = useState('geral')
  const [enviando, setEnviando] = useState(false)
  const [imagem, setImagem] = useState(null)
  const [imagemPreview, setImagemPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const fileInputRef = useRef(null)

  const handleImagemSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem demasiado grande. Máximo 5MB.')
      return
    }

    setImagem(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagemPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removerImagem = () => {
    setImagem(null)
    setImagemPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!conteudo.trim() && !imagem) || enviando) return

    setEnviando(true)
    try {
      let imagemUrl = null
      if (imagem) {
        setUploadProgress(true)
        imagemUrl = await uploadImagem(userId, imagem)
        setUploadProgress(false)
      }

      const hashtags = extrairHashtags(conteudo)

      const post = await criarPost(userId, {
        tipo,
        eco: eco === 'geral' ? null : eco,
        conteudo: conteudo.trim(),
        imagem_url: imagemUrl,
        hashtags
      })
      onPostCriado?.(post)
      onFechar?.()
    } catch (error) {
      console.error('Erro ao criar post:', error)
      setUploadProgress(false)
    }
    setEnviando(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
            Cancelar
          </button>
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
            Nova Publicação
          </h3>
          <button
            onClick={handleSubmit}
            disabled={(!conteudo.trim() && !imagem) || enviando}
            className="text-sm font-bold px-4 py-1.5 rounded-full text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {uploadProgress ? 'A enviar...' : enviando ? '...' : 'Publicar'}
          </button>
        </div>

        {/* Tipo de post */}
        <div className="p-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(TIPOS_POST).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setTipo(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  tipo === key ? 'text-white shadow-sm scale-105' : 'bg-gray-100 text-gray-500'
                }`}
                style={tipo === key ? { backgroundColor: info.cor } : {}}
              >
                {info.emoji} {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Eco */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(ECOS_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setEco(key)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                  eco === key ? 'text-white shadow-sm' : 'bg-gray-50 text-gray-400'
                }`}
                style={eco === key ? { backgroundColor: info.cor } : {}}
              >
                {info.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder={
              tipo === 'progresso' ? 'Partilha o teu progresso...' :
              tipo === 'celebracao' ? 'O que estás a celebrar? 🎉' :
              tipo === 'desafio' ? 'Que desafio enfrentas?' :
              tipo === 'dica' ? 'Que dica queres partilhar?' :
              tipo === 'motivacao' ? 'Inspira a comunidade 🔥' :
              tipo === 'antes_depois' ? 'Mostra a tua transformação...' :
              'Qual é a tua pergunta?'
            }
            className="w-full min-h-[120px] text-sm text-gray-700 placeholder-gray-300 border-0 focus:ring-0 resize-none p-0"
            style={{ outline: 'none', boxShadow: 'none' }}
            maxLength={1000}
            autoFocus
          />

          {/* Dica de hashtags */}
          {conteudo.includes('#') && (
            <p className="text-xs text-purple-400 mb-2">
              Hashtags detectadas — serão pesquisáveis!
            </p>
          )}

          {/* Preview da imagem */}
          {imagemPreview && (
            <div className="relative mb-3 rounded-xl overflow-hidden">
              <img src={imagemPreview} alt="" className="w-full max-h-64 object-cover rounded-xl" />
              <button
                onClick={removerImagem}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {/* Barra de ferramentas */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {/* Adicionar imagem */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-gray-400 hover:text-purple-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-xs">Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagemSelect}
                className="hidden"
              />
            </div>

            <span className={`text-xs ${conteudo.length > 900 ? 'text-red-400' : 'text-gray-300'}`}>
              {conteudo.length}/1000
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
