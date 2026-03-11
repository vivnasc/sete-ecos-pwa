import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { AUDIO_SCRIPTS } from '../lib/audio-scripts-data'

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
  const [gerandoTodos, setGerandoTodos] = useState(false)
  const blobsRef = useRef({}) // slug → Blob (para ZIP)
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

      // Download automático
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
  const totalTab = audiosTab.length
  const alguemGerando = audiosTab.some(a => estados[a.slug] === 'gerando')

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
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-900 rounded-xl p-1">
          {TABS.map(t => {
            const count = ALL_AUDIOS.filter(a => a.tab === t.key).length
            const done = ALL_AUDIOS.filter(a => a.tab === t.key && estados[a.slug] === 'concluido').length
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
                {t.label} ({done}/{count})
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
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{gerandoTodos ? 'A gerar...' : 'Progresso'}</span>
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
                  {grupo.audios.filter(a => estados[a.slug] === 'concluido').length}/{grupo.audios.length}
                </span>
              </div>
              <div className="space-y-2">
                {grupo.audios.map(audio => (
                  <AudioCard
                    key={audio.slug}
                    audio={audio}
                    estado={estados[audio.slug]}
                    onGerar={() => gerarAudio(audio)}
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
function AudioCard({ audio, estado, onGerar, apiKey }) {
  const [expandido, setExpandido] = useState(false)
  const gerando = estado === 'gerando'
  const concluido = estado === 'concluido'
  const erro = estado?.startsWith('erro:') ? estado.replace('erro:', '') : null
  const semTexto = !audio.script

  return (
    <div
      className="rounded-xl p-3 sm:p-4 border transition-colors"
      style={{
        background: audio.cor + '11',
        borderColor: concluido ? '#1a6b2a88' : erro ? '#7f1d1d88' : '#1f293744',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Slug/número */}
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: audio.cor + '33', color: audio.cor }}
        >
          {concluido ? '✅' : gerando ? '⏳' : audio.emoji}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0" onClick={() => setExpandido(!expandido)} style={{ cursor: 'pointer' }}>
          <p className="text-sm font-semibold text-white truncate">{audio.titulo}</p>
          <p className="text-xs text-gray-500 font-mono">{audio.slug}.mp3</p>
          {erro && <p className="text-xs text-red-400 mt-0.5 truncate">⚠️ {erro}</p>}
        </div>

        {/* Botão gerar */}
        <button
          onClick={onGerar}
          disabled={gerando || !apiKey.trim() || semTexto}
          className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: concluido ? '#1a6b2a' : gerando ? '#374151' : audio.cor + 'cc',
            color: 'white',
          }}
        >
          {gerando ? '⏳' : concluido ? '✅' : semTexto ? '—' : 'Gerar'}
        </button>
      </div>

      {/* Script expandido */}
      {expandido && (
        <div className="mt-3 p-3 bg-gray-900 rounded-lg text-xs text-gray-400 max-h-40 overflow-y-auto font-mono leading-relaxed">
          {audio.script || <span className="text-gray-600 italic">Sem texto — escreve o script no ficheiro .md</span>}
        </div>
      )}
    </div>
  )
}
