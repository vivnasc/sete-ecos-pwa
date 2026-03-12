import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { AUDIO_SCRIPTS } from '../lib/audio-scripts-data'
import { supabase } from '../lib/supabase'
import { uploadAudio, ECO_FOLDER_MAP } from '../lib/shared/audioStorage'

// ─── Constantes ElevenLabs ─────────────────────────────────────
const DEFAULT_VOICE_ID = 'fnoNuVpfClX7lHKFbyZ2'
const MODEL_ID = 'eleven_v3'

// ─── Catálogo organizado por tabs ───────────────────────────────
const TABS = [
  {
    key: 'meditacoes',
    label: 'Meditações',
    grupos: [
      { eco: 'ÁUREA',   emoji: '✨', cor: '#B8860B', folder: 'AUREA' },
      { eco: 'IMAGO',   emoji: '⭐', cor: '#6C3483', folder: 'IMAGO' },
      { eco: 'SERENA',  emoji: '💧', cor: '#1A6B9A', folder: 'SERENA' },
      { eco: 'IGNIS',   emoji: '🔥', cor: '#C0392B', folder: 'IGNIS' },
      { eco: 'VENTIS',  emoji: '🍃', cor: '#27AE60', folder: 'VENTIS' },
      { eco: 'ECOA',    emoji: '🔊', cor: '#2980B9', folder: 'ECOA' },
      { eco: 'VITALIS', emoji: '🌿', cor: '#2D6A4F', folder: 'VITALIS' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    grupos: [
      { eco: 'MARKETING', emoji: '📣', cor: '#8E44AD', folder: 'MARKETING' },
    ],
  },
]

// Construir lista flat de todos os áudios com os scripts
function buildAudioList() {
  const list = []
  for (const tab of TABS) {
    for (const grupo of tab.grupos) {
      const scripts = AUDIO_SCRIPTS[grupo.folder] || []
      for (const s of scripts) {
        list.push({
          slug: s.slug,
          titulo: formatTitulo(s.slug),
          speed: s.speed,
          stability: s.stability / 100,
          script: s.script,
          eco: grupo.eco,
          folder: grupo.folder,
          emoji: grupo.emoji,
          cor: grupo.cor,
          tab: tab.key,
        })
      }
    }
  }
  return list
}

function formatTitulo(slug) {
  return slug
    .replace(/^\d+-/, '')
    .replace(/^mkt-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

const ALL_AUDIOS = buildAudioList()

// ─── Componente principal ────────────────────────────────────────
export default function AudioMeditacoes() {
  const [apiKey, setApiKey] = useState('')
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID)
  const [mostrarKey, setMostrarKey] = useState(false)
  const [tab, setTab] = useState('meditacoes')
  const [estados, setEstados] = useState({}) // slug → 'gerando' | 'concluido' | 'erro:msg'
  const [uploads, setUploads] = useState({}) // slug → 'uploading' | 'uploaded' | 'erro:msg'
  const [gerandoTodos, setGerandoTodos] = useState(false)
  const [autoUpload, setAutoUpload] = useState(true)
  const blobsRef = useRef({}) // slug → Blob (para ZIP e retry)
  const cancelRef = useRef(false)

  const audiosTab = ALL_AUDIOS.filter(a => a.tab === tab)
  const tabInfo = TABS.find(t => t.key === tab)

  // Agrupar por eco
  const grupos = []
  const seen = new Set()
  for (const a of audiosTab) {
    if (!seen.has(a.eco)) {
      seen.add(a.eco)
      grupos.push({ eco: a.eco, emoji: a.emoji, cor: a.cor, audios: audiosTab.filter(x => x.eco === a.eco) })
    }
  }

  function setEstado(slug, estado) {
    setEstados(prev => ({ ...prev, [slug]: estado }))
  }

  function setUpload(slug, estado) {
    setUploads(prev => ({ ...prev, [slug]: estado }))
  }

  async function fazerUpload(audio, blob) {
    setUpload(audio.slug, 'uploading')
    try {
      const ecoKey = ECO_FOLDER_MAP[audio.folder] || audio.folder.toLowerCase()
      await uploadAudio(supabase, ecoKey, audio.slug, blob)
      setUpload(audio.slug, 'uploaded')
      return true
    } catch (uploadErr) {
      console.warn('Upload falhou:', uploadErr.message)
      setUpload(audio.slug, `erro:${uploadErr.message}`)
      return false
    }
  }

  async function retryUpload(audio) {
    const blob = blobsRef.current[audio.slug]
    if (!blob) return
    await fazerUpload(audio, blob)
  }

  async function retryAllUploads() {
    for (const audio of audiosTab) {
      const up = uploads[audio.slug]
      const blob = blobsRef.current[audio.slug]
      if (blob && (!up || up.startsWith('erro:'))) {
        await fazerUpload(audio, blob)
      }
    }
  }

  async function gerarAudio(audio) {
    if (!apiKey.trim()) return

    setEstado(audio.slug, 'gerando')

    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId.trim()}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey.trim(),
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: audio.script,
          model_id: MODEL_ID,
          voice_settings: {
            stability: audio.stability,
            similarity_boost: 0.80,
            style: 0.15,
            use_speaker_boost: true,
            speed: audio.speed,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        setEstado(audio.slug, `erro:API ${res.status} — ${err.slice(0, 100)}`)
        return null
      }

      const blob = await res.blob()
      blobsRef.current[audio.slug] = blob

      // Upload ao Supabase Storage (se activo)
      if (autoUpload) {
        await fazerUpload(audio, blob)
      }

      // Download local como backup
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${audio.slug}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setEstado(audio.slug, 'concluido')
      return blob
    } catch (err) {
      setEstado(audio.slug, `erro:${err.message}`)
      return null
    }
  }

  async function gerarTodos() {
    if (!apiKey.trim()) return
    setGerandoTodos(true)
    cancelRef.current = false

    for (const audio of audiosTab) {
      if (cancelRef.current) break
      if (estados[audio.slug] === 'concluido') continue
      if (!audio.script) {
        setEstado(audio.slug, 'erro:Sem texto — escreve o script no .md')
        continue
      }

      await gerarAudio(audio)
      // Pausa de 3s para rate limiting
      if (!cancelRef.current) {
        await new Promise(r => setTimeout(r, 3000))
      }
    }

    setGerandoTodos(false)
  }

  function pararGeracao() {
    cancelRef.current = true
    setGerandoTodos(false)
  }

  const descarregarZip = useCallback(async () => {
    const zip = new JSZip()
    let count = 0

    for (const audio of audiosTab) {
      const blob = blobsRef.current[audio.slug]
      if (blob) {
        zip.file(`${audio.slug}.mp3`, blob)
        count++
      }
    }

    if (count === 0) return

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `sete-ecos-${tab}.zip`)
  }, [audiosTab, tab])

  const gerados = audiosTab.filter(a => estados[a.slug] === 'concluido').length
  const uploaded = audiosTab.filter(a => uploads[a.slug] === 'uploaded').length
  const uploadFailed = audiosTab.filter(a => uploads[a.slug]?.startsWith('erro:')).length
  const totalTab = audiosTab.length

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link to="/coach" className="text-xs text-gray-500 hover:text-gray-300 mb-3 inline-block">
            ← Voltar ao Coach
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Central de Áudios 🎙️
          </h1>
          <p className="text-gray-400 text-sm">
            {ALL_AUDIOS.length} áudios — gera com a tua voz ElevenLabs V3
          </p>
        </div>

        {/* API Key + Voice ID */}
        <div className="bg-gray-900 rounded-xl p-4 mb-5 border border-gray-800 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              API Key do ElevenLabs
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
            <p className="text-xs text-gray-600 mt-1">
              Não é guardada — só usada nesta sessão.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Voice ID
            </label>
            <input
              type="text"
              value={voiceId}
              onChange={e => setVoiceId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              role="switch"
              aria-checked={autoUpload}
              onClick={() => setAutoUpload(!autoUpload)}
              className="w-10 h-6 rounded-full flex items-center transition-colors"
              style={{ background: autoUpload ? '#4B0082' : '#374151', padding: '2px' }}
            >
              <div
                className="w-5 h-5 bg-white rounded-full transition-transform"
                style={{ transform: autoUpload ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </div>
            <div>
              <p className="text-sm text-gray-300">Upload automático ao Supabase</p>
              <p className="text-xs text-gray-600">
                {autoUpload ? 'Áudios ficam disponíveis nos ecos automaticamente' : 'Só download local'}
              </p>
            </div>
          </label>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-900 rounded-xl p-1">
          {TABS.map(t => {
            const count = ALL_AUDIOS.filter(a => a.tab === t.key).length
            const done = ALL_AUDIOS.filter(a => a.tab === t.key && estados[a.slug] === 'concluido').length
            const up = ALL_AUDIOS.filter(a => a.tab === t.key && uploads[a.slug] === 'uploaded').length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: tab === t.key ? '#4B0082' : 'transparent',
                  color: tab === t.key ? 'white' : '#9ca3af',
                }}
              >
                {t.label} ({up}/{count})
              </button>
            )
          })}
        </div>

        {/* Gerar todos + ZIP */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={gerandoTodos ? pararGeracao : gerarTodos}
            disabled={!apiKey.trim() || (!gerandoTodos && gerados === totalTab)}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: gerandoTodos
                ? '#C0392B'
                : gerados === totalTab
                ? '#1a6b2a'
                : 'linear-gradient(135deg, #4B0082, #8E44AD)',
              color: 'white',
            }}
          >
            {gerandoTodos
              ? `⏸ Parar (${gerados}/${totalTab})`
              : gerados === totalTab
              ? `✅ Todos gerados!`
              : `🎵 Gerar todos desta aba (${totalTab})`
            }
          </button>

          {gerados > 0 && (
            <button
              onClick={descarregarZip}
              className="px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] bg-gray-800 hover:bg-gray-700 text-white"
            >
              ⬇ ZIP ({gerados})
            </button>
          )}
        </div>

        {/* Progresso geral */}
        {(gerandoTodos || gerados > 0) && (
          <div className="mb-5 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{gerandoTodos ? 'A gerar...' : 'Gerados'}</span>
                <span>{gerados}/{totalTab}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${totalTab > 0 ? (gerados / totalTab) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #4B0082, #8E44AD)',
                  }}
                />
              </div>
            </div>
            {autoUpload && (uploaded > 0 || uploadFailed > 0) && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={uploadFailed > 0 ? 'text-red-400' : 'text-gray-400'}>
                    {uploadFailed > 0 ? `Supabase — ${uploadFailed} falharam` : 'Supabase'}
                  </span>
                  <span className={uploadFailed > 0 ? 'text-red-400' : 'text-green-400'}>
                    {uploaded}/{gerados}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${gerados > 0 ? (uploaded / gerados) * 100 : 0}%`,
                      background: uploadFailed > 0 ? '#ef4444' : '#22c55e',
                    }}
                  />
                </div>
                {uploadFailed > 0 && (
                  <button
                    onClick={retryAllUploads}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 underline transition-colors"
                  >
                    Tentar enviar {uploadFailed} falhados ao Supabase
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Grupos de áudios */}
        <div className="space-y-6">
          {grupos.map(grupo => (
            <div key={grupo.eco}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{grupo.emoji}</span>
                <h2 className="text-sm font-bold" style={{ color: grupo.cor }}>
                  {grupo.eco}
                </h2>
                <span className="text-xs text-gray-600">
                  {grupo.audios.filter(a => uploads[a.slug] === 'uploaded').length}/{grupo.audios.length}
                </span>
              </div>
              <div className="space-y-2">
                {grupo.audios.map(audio => (
                  <AudioCard
                    key={audio.slug}
                    audio={audio}
                    estado={estados[audio.slug]}
                    uploadEstado={uploads[audio.slug]}
                    onGerar={() => gerarAudio(audio)}
                    onRetryUpload={() => retryUpload(audio)}
                    apiKey={apiKey}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Link para sons de drone */}
        <div className="mt-8 text-center">
          <Link
            to="/coach/audio-ecos"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            → Sons de Drone dos Ecos
          </Link>
        </div>

      </div>
    </div>
  )
}

// ─── Card de cada áudio ──────────────────────────────────────────
function AudioCard({ audio, estado, uploadEstado, onGerar, onRetryUpload, apiKey }) {
  const [expandido, setExpandido] = useState(false)
  const gerando = estado === 'gerando'
  const concluido = estado === 'concluido'
  const erro = estado?.startsWith('erro:') ? estado.replace('erro:', '') : null
  const semTexto = !audio.script

  const uploading = uploadEstado === 'uploading'
  const uploaded = uploadEstado === 'uploaded'
  const uploadErro = uploadEstado?.startsWith('erro:') ? uploadEstado.replace('erro:', '') : null

  // Ícone principal: prioridade upload > geração
  const icone = uploaded ? '✅' : uploading ? '☁️' : uploadErro ? '⚠️' : gerando ? '⏳' : concluido ? '💾' : audio.emoji
  const borderColor = uploaded ? '#1a6b2a88' : uploadErro ? '#7f1d1d88' : erro ? '#7f1d1d88' : '#1f293744'

  return (
    <div
      className="rounded-xl p-3 sm:p-4 border transition-colors"
      style={{ background: audio.cor + '11', borderColor }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: audio.cor + '33', color: uploadErro ? '#ef4444' : audio.cor }}
        >
          {icone}
        </span>

        <div className="flex-1 min-w-0" onClick={() => setExpandido(!expandido)} style={{ cursor: 'pointer' }}>
          <p className="text-sm font-semibold text-white truncate">{audio.titulo}</p>
          <p className="text-xs text-gray-500 font-mono">{audio.slug}.mp3</p>
          {erro && <p className="text-xs text-red-400 mt-0.5 truncate">⚠️ {erro}</p>}
          {uploadErro && (
            <p className="text-xs text-red-400 mt-0.5 truncate">
              Upload falhou: {uploadErro}
            </p>
          )}
          {concluido && !uploaded && !uploading && !uploadErro && (
            <p className="text-xs text-yellow-500 mt-0.5">Gerado — não enviado ao Supabase</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Retry upload */}
          {uploadErro && (
            <button
              onClick={onRetryUpload}
              className="px-2 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 bg-red-900/50 text-red-300 hover:bg-red-900/80"
              title="Tentar upload novamente"
            >
              ↻
            </button>
          )}

          <button
            onClick={onGerar}
            disabled={gerando || uploading || !apiKey.trim() || semTexto}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: uploaded ? '#1a6b2a' : gerando ? '#374151' : audio.cor + 'cc',
              color: 'white',
            }}
          >
            {gerando ? '⏳' : uploading ? '☁️' : uploaded ? '✅' : semTexto ? '—' : 'Gerar'}
          </button>
        </div>
      </div>

      {expandido && (
        <div className="mt-3 p-3 bg-gray-900 rounded-lg text-xs text-gray-400 max-h-40 overflow-y-auto font-mono leading-relaxed">
          {audio.script || <span className="text-gray-600 italic">Sem texto — escreve o script no ficheiro .md</span>}
        </div>
      )}
    </div>
  )
}
