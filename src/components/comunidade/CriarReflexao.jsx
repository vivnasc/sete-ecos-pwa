import React, { useState, useRef, useEffect } from 'react'
import {
  criarReflexao,
  uploadImagem,
  extrairHashtags,
  PROMPTS_REFLEXAO,
  TEMAS_REFLEXAO,
  ECOS_INFO,
  getPromptDoDia
} from '../../lib/comunidade'

export default function CriarReflexao({ userId, onReflexaoCriada, onFechar, promptInicial = null }) {
  // --- Estado do prompt ---
  const [promptAtual, setPromptAtual] = useState(promptInicial || getPromptDoDia())
  const [reflexaoLivre, setReflexaoLivre] = useState(false)

  // --- Estado do conteudo ---
  const [conteudo, setConteudo] = useState('')
  const [eco, setEco] = useState(promptInicial?.eco || null)
  const [tema, setTema] = useState(promptInicial?.tema || promptAtual?.tema || 'livre')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // --- Imagem ---
  const [imagem, setImagem] = useState(null)
  const [imagemPreview, setImagemPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const fileInputRef = useRef(null)

  // --- Envio ---
  const [enviando, setEnviando] = useState(false)

  // Sincronizar eco e tema quando o prompt muda
  useEffect(() => {
    if (!reflexaoLivre && promptAtual) {
      if (promptAtual.eco && promptAtual.eco !== 'geral') {
        setEco(promptAtual.eco)
      }
      if (promptAtual.tema) {
        setTema(promptAtual.tema)
      }
    }
  }, [promptAtual, reflexaoLivre])

  // --- Handlers ---

  const shufflePrompt = () => {
    const filtrados = eco
      ? PROMPTS_REFLEXAO.filter(p => p.eco === eco || p.eco === 'geral')
      : PROMPTS_REFLEXAO
    const aleatorio = filtrados[Math.floor(Math.random() * filtrados.length)]
    setPromptAtual(aleatorio)
  }

  const toggleReflexaoLivre = () => {
    setReflexaoLivre(prev => !prev)
    if (!reflexaoLivre) {
      setTema('livre')
    } else if (promptAtual?.tema) {
      setTema(promptAtual.tema)
    }
  }

  const handleImagemSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

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

  const handleSubmit = async () => {
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

      const reflexao = await criarReflexao(userId, {
        tema: tema || 'livre',
        eco: eco || null,
        conteudo: conteudo.trim(),
        prompt_id: reflexaoLivre ? null : promptAtual?.id || null,
        is_anonymous: isAnonymous,
        imagem_url: imagemUrl,
        hashtags
      })

      onReflexaoCriada?.(reflexao)
      onFechar?.()
    } catch (error) {
      console.error('Erro ao criar reflexao:', error)
      setUploadProgress(false)
    }
    setEnviando(false)
  }

  const podePublicar = (conteudo.trim().length > 0 || imagem) && !enviando

  // Placeholder dinamico baseado no prompt
  const getPlaceholder = () => {
    if (reflexaoLivre) return 'Escreve livremente o que sentes, pensas ou descobriste...'
    if (promptAtual) return `Reflecte sobre: \u201C${promptAtual.texto}\u201D...`
    return 'Partilha a tua reflex\u00E3o...'
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">

        {/* ===== Header ===== */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            Cancelar
          </button>
          <h3
            className="font-semibold text-gray-800"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Nova Reflex&#xe3;o
          </h3>
          <button
            onClick={handleSubmit}
            disabled={!podePublicar}
            className="text-sm font-bold px-4 py-1.5 rounded-full text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: '#8B5CF6', fontFamily: 'var(--font-corpo)' }}
          >
            {uploadProgress ? 'A enviar...' : enviando ? '...' : 'Publicar'}
          </button>
        </div>

        {/* ===== Prompt Section ===== */}
        <div className="p-4 pb-2">
          {!reflexaoLivre ? (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-1.5"
                    style={{ fontFamily: 'var(--font-corpo)' }}
                  >
                    {promptInicial ? 'Prompt escolhido' : 'Prompt do dia'}
                  </p>
                  <p
                    className="text-gray-800 font-medium leading-snug"
                    style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.05rem' }}
                  >
                    {promptAtual?.emoji} {promptAtual?.texto}
                  </p>
                </div>
                <button
                  onClick={shufflePrompt}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-purple-500 hover:bg-white hover:scale-110 transition-all shadow-sm"
                  title="Novo prompt"
                >
                  <span className="text-lg">{'\uD83D\uDD04'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <p
                className="text-gray-600 text-sm italic text-center"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                {'\uD83C\uDF38'} Reflex&#xe3;o livre &#x2014; sem prompt, s&#xf3; tu e os teus pensamentos
              </p>
            </div>
          )}

          {/* Toggle reflexao livre */}
          <button
            onClick={toggleReflexaoLivre}
            className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              reflexaoLivre
                ? 'bg-purple-100 text-purple-600'
                : 'bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            {reflexaoLivre ? '\u2728 Voltar ao prompt' : '\uD83C\uDF38 Reflex\u00E3o livre'}
          </button>
        </div>

        {/* ===== Textarea ===== */}
        <div className="px-4 pb-2">
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value.slice(0, 800))}
            placeholder={getPlaceholder()}
            className="w-full min-h-[140px] text-sm text-gray-700 placeholder-gray-300 border-0 focus:ring-0 resize-none p-0"
            style={{
              outline: 'none',
              boxShadow: 'none',
              fontFamily: 'var(--font-corpo)',
              lineHeight: '1.7'
            }}
            maxLength={800}
            autoFocus
          />

          {/* Hashtag hint */}
          {conteudo.includes('#') && (
            <p className="text-xs text-purple-400 mb-1" style={{ fontFamily: 'var(--font-corpo)' }}>
              Hashtags detectadas &#x2014; ser&#xe3;o pesquis&#xe1;veis!
            </p>
          )}
        </div>

        {/* ===== Image preview ===== */}
        {imagemPreview && (
          <div className="px-4 pb-3">
            <div className="relative rounded-xl overflow-hidden">
              <img src={imagemPreview} alt="" className="w-full max-h-64 object-cover rounded-xl" />
              <button
                onClick={removerImagem}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
              >
                &#x2715;
              </button>
            </div>
          </div>
        )}

        {/* ===== Configuracao ===== */}
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-300 font-semibold mb-2.5"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            Configura&#xe7;&#xe3;o
          </p>

          {/* Eco selector */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1.5" style={{ fontFamily: 'var(--font-corpo)' }}>Eco</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ECOS_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setEco(eco === key ? null : key)}
                  className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-all ${
                    eco === key ? 'text-white shadow-sm scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                  style={eco === key ? { backgroundColor: info.cor } : {}}
                  title={info.label}
                >
                  {info.emoji} {eco === key ? info.label : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Tema selector */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1.5" style={{ fontFamily: 'var(--font-corpo)' }}>Tema</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TEMAS_REFLEXAO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setTema(key)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                    tema === key
                      ? 'text-white shadow-sm'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                  style={tema === key ? { backgroundColor: info.cor } : {}}
                >
                  {info.emoji} {info.label}
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous toggle */}
          <button
            onClick={() => setIsAnonymous(prev => !prev)}
            className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-full transition-all ${
              isAnonymous
                ? 'bg-purple-50 border border-purple-200'
                : 'bg-gray-100 border border-transparent'
            }`}
          >
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${
                isAnonymous ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  isAnonymous ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span
              className={`text-sm font-medium ${isAnonymous ? 'text-purple-700' : 'text-gray-500'}`}
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Partilhar como Alma An&#xf3;nima {'\uD83C\uDF19'}
            </span>
          </button>
        </div>

        {/* ===== Bottom bar ===== */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Foto button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-gray-400 hover:text-purple-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span className="text-xs" style={{ fontFamily: 'var(--font-corpo)' }}>Foto</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImagemSelect}
              className="hidden"
            />

            {/* Prompt shuffle button */}
            {!reflexaoLivre && (
              <button
                onClick={shufflePrompt}
                className="flex items-center gap-1.5 text-gray-400 hover:text-purple-500 transition-colors"
              >
                <span className="text-base">{'\uD83D\uDD04'}</span>
                <span className="text-xs" style={{ fontFamily: 'var(--font-corpo)' }}>Prompt</span>
              </button>
            )}
          </div>

          <span
            className={`text-xs ${conteudo.length > 720 ? 'text-red-400' : 'text-gray-300'}`}
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            {conteudo.length}/800
          </span>
        </div>
      </div>
    </div>
  )
}
