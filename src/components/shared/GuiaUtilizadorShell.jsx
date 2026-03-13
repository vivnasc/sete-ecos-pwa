import React, { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * GUIA DO UTILIZADOR SHELL — Componente genérico reutilizável para guias de qualquer eco
 *
 * Uso:
 * <GuiaUtilizadorShell
 *   eco="serena"
 *   titulo="Guia do Utilizador"
 *   subtitulo="Como usar o Serena"
 *   color="#6B8E9B"
 *   colorDark="#4A6B7A"
 *   backTo="/serena/dashboard"
 *   chatTo="/serena/chat"
 *   seccoes={[
 *     { id: 'inicio', titulo: 'Começar', icone: '🚀', conteudo: [...] }
 *   ]}
 * />
 */
export default function GuiaUtilizadorShell({
  titulo = 'Guia do Utilizador',
  subtitulo,
  color,
  colorDark,
  backTo,
  chatTo,
  seccoes = []
}) {
  const [seccaoActiva, setSeccaoActiva] = useState(seccoes[0]?.id || '')

  const seccaoAtual = seccoes.find(s => s.id === seccaoActiva)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${colorDark || color}dd)` }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {backTo && (
              <Link to={backTo} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span>←</span>
              </Link>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold">{titulo}</h1>
              {subtitulo && <p className="text-white/70 text-sm">{subtitulo}</p>}
            </div>
            <span className="text-2xl">📖</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Navegação das secções */}
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <div className="flex gap-2 min-w-max">
            {seccoes.map(seccao => (
              <button
                key={seccao.id}
                onClick={() => setSeccaoActiva(seccao.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  seccaoActiva === seccao.id
                    ? 'text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={seccaoActiva === seccao.id ? { background: color } : undefined}
              >
                <span>{seccao.icone}</span>
                <span>{seccao.titulo}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo da secção */}
        {seccaoAtual && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-gray-700">
                <span className="text-3xl">{seccaoAtual.icone}</span>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{seccaoAtual.titulo}</h2>
              </div>

              <div className="space-y-6">
                {seccaoAtual.conteudo.map((item, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2" style={{ color }}>{item.subtitulo}</h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                      {item.texto.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="text-gray-800 dark:text-gray-100">{part.slice(2, -2)}</strong>
                        }
                        return part
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navegação anterior/próximo */}
        <div className="flex justify-between mt-6">
          {(() => {
            const indexAtual = seccoes.findIndex(s => s.id === seccaoActiva)
            const anterior = indexAtual > 0 ? seccoes[indexAtual - 1] : null
            const proximo = indexAtual < seccoes.length - 1 ? seccoes[indexAtual + 1] : null

            return (
              <>
                {anterior ? (
                  <button
                    onClick={() => setSeccaoActiva(anterior.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span>←</span>
                    <span className="text-sm">{anterior.titulo}</span>
                  </button>
                ) : <div />}

                {proximo ? (
                  <button
                    onClick={() => setSeccaoActiva(proximo.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:opacity-90"
                    style={{ background: color }}
                  >
                    <span className="text-sm">{proximo.titulo}</span>
                    <span>→</span>
                  </button>
                ) : <div />}
              </>
            )
          })()}
        </div>

        {/* Ajuda adicional */}
        {chatTo && (
          <div
            className="mt-8 rounded-2xl p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${color}, ${colorDark || color}dd)` }}
          >
            <h3 className="font-bold mb-2">Ainda tens dúvidas?</h3>
            <p className="text-white/80 text-sm mb-4">
              Pergunta à Vivianne! Ela pode ajudar com questões específicas.
            </p>
            <Link
              to={chatTo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg font-medium hover:bg-gray-100"
              style={{ color }}
            >
              <span>💬</span>
              <span>Falar com Vivianne</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
