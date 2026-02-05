import React, { useState } from 'react'
import { criarPost, TIPOS_POST, ECOS_INFO } from '../../lib/comunidade'

export default function CriarPost({ userId, onPostCriado, onFechar }) {
  const [conteudo, setConteudo] = useState('')
  const [tipo, setTipo] = useState('progresso')
  const [eco, setEco] = useState('geral')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!conteudo.trim() || enviando) return

    setEnviando(true)
    try {
      const post = await criarPost(userId, {
        tipo,
        eco: eco === 'geral' ? null : eco,
        conteudo: conteudo.trim()
      })
      onPostCriado?.(post)
      setConteudo('')
      setTipo('progresso')
      setEco('geral')
      onFechar?.()
    } catch (error) {
      console.error('Erro ao criar post:', error)
    }
    setEnviando(false)
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
            Nova Partilha
          </h3>
          <button
            onClick={handleSubmit}
            disabled={!conteudo.trim() || enviando}
            className="text-sm font-bold px-4 py-1.5 rounded-full text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {enviando ? '...' : 'Publicar'}
          </button>
        </div>

        {/* Tipo de post */}
        <div className="p-4 pb-2">
          <p className="text-xs text-gray-400 mb-2 font-medium">TIPO DE PARTILHA</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TIPOS_POST).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setTipo(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  tipo === key
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={tipo === key ? { backgroundColor: info.cor } : {}}
              >
                {info.emoji} {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Eco relacionado */}
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2 font-medium">RELACIONADO COM</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ECOS_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setEco(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  eco === key
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={eco === key ? { backgroundColor: info.cor } : {}}
              >
                {info.emoji} {info.label}
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
              tipo === 'progresso' ? 'Partilha o teu progresso com a comunidade...' :
              tipo === 'celebracao' ? 'O que estás a celebrar hoje? 🎉' :
              tipo === 'desafio' ? 'Qual é o desafio que estás a enfrentar?' :
              tipo === 'dica' ? 'Que dica queres partilhar?' :
              'Qual é a tua pergunta?'
            }
            className="w-full min-h-[150px] text-sm text-gray-700 placeholder-gray-300 border-0 focus:ring-0 resize-none p-0"
            style={{ outline: 'none', boxShadow: 'none' }}
            maxLength={1000}
            autoFocus
          />
          <div className="flex justify-end">
            <span className={`text-xs ${conteudo.length > 900 ? 'text-red-400' : 'text-gray-300'}`}>
              {conteudo.length}/1000
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
