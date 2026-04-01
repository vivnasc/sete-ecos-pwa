import { useState } from 'react'

const ECOS = [
  {
    key: 'vitalis',
    nome: 'VITALIS',
    subtitulo: 'Raiz • Terra • 256hz',
    emoji: '🌿',
    cor: '#2D6A4F',
    descricao: 'Drone de enraizamento profundo, frequência de base, pulso tribal ancestral',
  },
  {
    key: 'aurea',
    nome: 'ÁUREA',
    subtitulo: 'Valor • Ouro • 528hz',
    emoji: '✨',
    cor: '#B8860B',
    descricao: 'Drone dourado, tigela cantante, frequência de cura e ressonância',
  },
  {
    key: 'serena',
    nome: 'SERENA',
    subtitulo: 'Emoção • Água • 288hz',
    emoji: '💧',
    cor: '#1A6B9A',
    descricao: 'Drone oceânico, maré suave, frequência de libertação emocional',
  },
  {
    key: 'ignis',
    nome: 'IGNIS',
    subtitulo: 'Vontade • Fogo • 320hz',
    emoji: '🔥',
    cor: '#C0392B',
    descricao: 'Drone solar, brasa crepitante, frequência de activação e foco',
  },
  {
    key: 'ventis',
    nome: 'VENTIS',
    subtitulo: 'Energia • Ar • 341hz',
    emoji: '🍃',
    cor: '#27AE60',
    descricao: 'Drone de floresta, vento entre folhas, frequência do coração',
  },
  {
    key: 'ecoa',
    nome: 'ECOA',
    subtitulo: 'Voz • Som • 384hz',
    emoji: '🔊',
    cor: '#2980B9',
    descricao: 'Drone de tigela de cristal, ressonância vocal, frequência de expressão',
  },
  {
    key: 'imago',
    nome: 'IMAGO',
    subtitulo: 'Identidade • Coroa • 480hz',
    emoji: '⭐',
    cor: '#6C3483',
    descricao: 'Drone cósmico, OM sagrado, frequência de transcendência e clareza',
  },
]

export default function AudioEcos() {
  const [apiKey, setApiKey] = useState('')
  const [estados, setEstados] = useState({})
  const [mostrarKey, setMostrarKey] = useState(false)

  function setEstado(eco, estado) {
    setEstados(prev => ({ ...prev, [eco]: estado }))
  }

  async function gerarSom(eco) {
    if (!apiKey.trim()) {
      alert('Introduz a tua API key da ElevenLabs primeiro.')
      return
    }

    setEstado(eco.key, 'gerando')

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gerar-sons-ecos', eco: eco.key, apiKey: apiKey.trim() }),
      })

      if (!res.ok) {
        const erro = await res.json().catch(() => ({ erro: 'Erro desconhecido' }))
        setEstado(eco.key, `erro:${erro.erro || 'Erro ao gerar'}`)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${eco.key}-drone.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setEstado(eco.key, 'concluido')
    } catch (err) {
      setEstado(eco.key, `erro:${err.message}`)
    }
  }

  async function gerarTodos() {
    for (const eco of ECOS) {
      if (estados[eco.key] === 'concluido') continue
      await gerarSom(eco)
      // pequena pausa entre chamadas para não sobrecarregar a API
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  const algumGerado = ECOS.some(e => estados[e.key] === 'concluido')
  const todosGerados = ECOS.every(e => estados[e.key] === 'concluido')
  const alguemGerando = ECOS.some(e => estados[e.key] === 'gerando')

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Sons dos Ecos 🎵
          </h1>
          <p className="text-gray-400 text-sm">
            Gera sons de drone para cada Eco via ElevenLabs Sound Effects API. Cada som tem ~22 segundos.
          </p>
        </div>

        {/* API Key Input */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ElevenLabs API Key
          </label>
          <div className="flex gap-2">
            <input
              type={mostrarKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk_..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => setMostrarKey(!mostrarKey)}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
            >
              {mostrarKey ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            A key não é guardada — fica apenas nesta sessão.
          </p>
        </div>

        {/* Botão Gerar Todos */}
        <button
          onClick={gerarTodos}
          disabled={alguemGerando || !apiKey.trim() || todosGerados}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-6 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: todosGerados ? '#1a6b2a' : 'linear-gradient(135deg, #6C3483, #2980B9)' }}
        >
          {alguemGerando ? '⏳ A gerar...' : todosGerados ? '✅ Todos gerados!' : '🎵 Gerar Todos os 7 Ecos'}
        </button>

        {/* Lista de Ecos */}
        <div className="space-y-3">
          {ECOS.map(eco => {
            const estado = estados[eco.key]
            const gerando = estado === 'gerando'
            const concluido = estado === 'concluido'
            const erro = estado?.startsWith('erro:') ? estado.replace('erro:', '') : null

            return (
              <div
                key={eco.key}
                className="bg-gray-900 rounded-xl p-4 border transition-colors"
                style={{ borderColor: concluido ? '#1a6b2a' : erro ? '#7f1d1d' : '#1f2937' }}
              >
                <div className="flex items-center gap-3">
                  {/* Ícone colorido */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: eco.cor + '33', border: `2px solid ${eco.cor}66` }}
                  >
                    {eco.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: eco.cor }}>
                        {eco.nome}
                      </span>
                      <span className="text-gray-500 text-xs">{eco.subtitulo}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{eco.descricao}</p>
                    {erro && (
                      <p className="text-red-400 text-xs mt-1 truncate">⚠️ {erro}</p>
                    )}
                  </div>

                  {/* Botão individual */}
                  <button
                    onClick={() => gerarSom(eco)}
                    disabled={gerando || !apiKey.trim()}
                    className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: concluido
                        ? '#1a6b2a'
                        : gerando
                        ? '#374151'
                        : eco.cor + 'cc',
                      color: 'white',
                    }}
                  >
                    {gerando ? '⏳' : concluido ? '✅' : '⬇️'}
                  </button>
                </div>

                {/* Ficheiro gerado */}
                {concluido && (
                  <div className="mt-2 ml-13 text-xs text-green-400 pl-13">
                    💾 <span className="font-mono">{eco.key}-drone.mp3</span> descarregado
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info extra */}
        {algumGerado && (
          <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-sm text-gray-300 font-medium mb-2">Próximos passos</p>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Importa os .mp3 no GarageBand ou Audacity</li>
              <li>Ajusta o volume para ~15-20% (fundo de meditação)</li>
              <li>Exporta com fade in/out de 3 segundos</li>
              <li>Carrega em <code className="text-purple-400">public/audio/{'{eco}'}-drone.mp3</code></li>
            </ol>
          </div>
        )}

      </div>
    </div>
  )
}
