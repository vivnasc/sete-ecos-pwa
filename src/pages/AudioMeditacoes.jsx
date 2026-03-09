import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ─── Catálogo completo das 39 meditações ─────────────────────
const GRUPOS = [
  {
    eco: 'ÁUREA',
    emoji: '✨',
    cor: '#B8860B',
    fundo: '#B8860B22',
    audios: [
      { num: '01', slug: '01-valor-nao-se-ganha',    titulo: 'O Valor Não Se Ganha',           duracao: '8 min' },
      { num: '02', slug: '02-eu-sou-prioridade',      titulo: 'Eu Sou Prioridade',              duracao: '7 min' },
      { num: '03', slug: '03-culpa-nao-te-pertence',  titulo: 'A Culpa Não Te Pertence',        duracao: '9 min' },
      { num: '04', slug: '04-ritual-auto-cuidado',    titulo: 'Ritual de Auto-Cuidado',         duracao: '10 min' },
      { num: '05', slug: '05-espelho-interior',       titulo: 'O Espelho Interior',             duracao: '8 min' },
      { num: '06', slug: '06-abundancia-merecimento', titulo: 'Abundância e Merecimento',       duracao: '9 min' },
      { num: '07', slug: '07-soltar-o-dia',           titulo: 'Soltar o Dia',                   duracao: '7 min' },
      { num: '08', slug: '08-lembrete-1-minuto',      titulo: 'Lembrete de 1 Minuto',           duracao: '1 min' },
    ],
  },
  {
    eco: 'IMAGO',
    emoji: '⭐',
    cor: '#6C3483',
    fundo: '#6C348322',
    audios: [
      { num: '09', slug: '09-sem-rotulos',       titulo: 'Sem Rótulos',                duracao: '10 min' },
      { num: '10', slug: '10-eu-essencial',      titulo: 'O Eu Essencial',             duracao: '12 min' },
      { num: '11', slug: '11-integracao-7-ecos', titulo: 'Integração dos 7 Ecos',      duracao: '15 min' },
      { num: '12', slug: '12-soltar-versoes',    titulo: 'Soltar Versões Antigas',     duracao: '11 min' },
      { num: '13', slug: '13-corpo-identidade',  titulo: 'Corpo e Identidade',         duracao: '9 min' },
    ],
  },
  {
    eco: 'SERENA',
    emoji: '💧',
    cor: '#1A6B9A',
    fundo: '#1A6B9A22',
    audios: [
      { num: '14', slug: '14-respiracao-4-7-8',   titulo: 'Respiração 4-7-8',             duracao: '5 min' },
      { num: '15', slug: '15-respiracao-box',      titulo: 'Respiração Box',               duracao: '5 min' },
      { num: '16', slug: '16-respiracao-oceanica', titulo: 'Respiração Oceânica',          duracao: '6 min' },
      { num: '17', slug: '17-suspiro-fisiologico', titulo: 'Suspiro Fisiológico',          duracao: '4 min' },
      { num: '18', slug: '18-respiracao-alternada',titulo: 'Respiração Alternada',         duracao: '7 min' },
      { num: '19', slug: '19-coerencia-cardiaca',  titulo: 'Coerência Cardíaca',           duracao: '5 min' },
    ],
  },
  {
    eco: 'IGNIS',
    emoji: '🔥',
    cor: '#C0392B',
    fundo: '#C0392B22',
    audios: [
      { num: '20', slug: '20-acende-chama',    titulo: 'Acende a Chama',         duracao: '6 min' },
      { num: '21', slug: '21-corte-que-liberta',titulo: 'O Corte que Liberta',   duracao: '8 min' },
      { num: '22', slug: '22-foco-maximo',     titulo: 'Foco Máximo',            duracao: '7 min' },
      { num: '23', slug: '23-manifesto-fogo',  titulo: 'Manifesto do Fogo',      duracao: '5 min' },
      { num: '24', slug: '24-coragem-diaria',  titulo: 'Coragem Diária',         duracao: '4 min' },
    ],
  },
  {
    eco: 'VENTIS',
    emoji: '🍃',
    cor: '#27AE60',
    fundo: '#27AE6022',
    audios: [
      { num: '25', slug: '25-ritmo-natural',    titulo: 'O Ritmo Natural',        duracao: '8 min' },
      { num: '26', slug: '26-pausa-que-renova', titulo: 'A Pausa que Renova',     duracao: '6 min' },
      { num: '27', slug: '27-raizes-no-vento',  titulo: 'Raízes no Vento',        duracao: '9 min' },
      { num: '28', slug: '28-energia-equilibrio',titulo: 'Energia em Equilíbrio', duracao: '7 min' },
      { num: '29', slug: '29-guardiao-ritmo',   titulo: 'O Guardião do Ritmo',    duracao: '5 min' },
    ],
  },
  {
    eco: 'ECOA',
    emoji: '🔊',
    cor: '#2980B9',
    fundo: '#2980B922',
    audios: [
      { num: '35', slug: '35-silencio-que-guardas', titulo: 'O Silêncio que Guardas',   duracao: '9 min' },
      { num: '36', slug: '36-voz-valida',           titulo: 'A Tua Voz é Válida',       duracao: '7 min' },
      { num: '37', slug: '37-libertar-a-palavra',   titulo: 'Libertar a Palavra',       duracao: '8 min' },
      { num: '38', slug: '38-manifesto-da-voz',     titulo: 'Manifesto da Voz',         duracao: '5 min' },
      { num: '39', slug: '39-sussurros-coragem',    titulo: 'Sussurros de Coragem',     duracao: '6 min' },
    ],
  },
  {
    eco: 'VITALIS',
    emoji: '🌿',
    cor: '#2D6A4F',
    fundo: '#2D6A4F22',
    audios: [
      { num: '30', slug: '30-gratidao-corpo',  titulo: 'Gratidão ao Corpo',      duracao: '8 min' },
      { num: '31', slug: '31-relacao-comida',  titulo: 'Relação com a Comida',   duracao: '9 min' },
      { num: '32', slug: '32-enraizado-terra', titulo: 'Enraizamento na Terra',  duracao: '7 min' },
      { num: '33', slug: '33-corpo-sagrado',   titulo: 'O Corpo é Sagrado',      duracao: '8 min' },
      { num: '34', slug: '34-nutrir-amor',     titulo: 'Nutrir com Amor',        duracao: '6 min' },
    ],
  },
]

// ─── Componente de card de cada áudio ────────────────────────
function AudioCard({ audio, cor, fundo }) {
  const url = `/audio/${audio.slug}.mp3`
  const [status, setStatus] = useState('verificando') // verificando | existe | ausente
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    fetch(url, { method: 'HEAD' })
      .then(r => setStatus(r.ok ? 'existe' : 'ausente'))
      .catch(() => setStatus('ausente'))
  }, [url])

  function togglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
      setPlaying(true)
    }
  }

  function baixar() {
    const a = document.createElement('a')
    a.href = url
    a.download = `${audio.slug}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const existe = status === 'existe'

  return (
    <div
      className="rounded-xl p-3 sm:p-4 border transition-colors"
      style={{
        background: fundo,
        borderColor: existe ? cor + '66' : '#1f293766',
        opacity: status === 'verificando' ? 0.7 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Número */}
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: cor + '44', color: cor }}
        >
          {audio.num}
        </span>

        {/* Título + duração */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{audio.titulo}</p>
          <p className="text-xs text-gray-400">{audio.duracao}</p>
        </div>

        {/* Acções */}
        {status === 'verificando' && (
          <span className="text-xs text-gray-500">…</span>
        )}

        {existe && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-95"
              style={{ background: cor + '44', color: cor }}
              title={playing ? 'Pausar' : 'Ouvir prévia'}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <button
              onClick={baixar}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-95"
              style={{ background: cor + '44', color: cor }}
              title="Descarregar"
            >
              ⬇
            </button>
          </div>
        )}

        {status === 'ausente' && (
          <span className="text-xs text-gray-600 flex-shrink-0">⏳ aguarda</span>
        )}
      </div>

      {/* Player oculto */}
      {existe && (
        <audio
          ref={audioRef}
          src={url}
          onEnded={() => setPlaying(false)}
          preload="none"
        />
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────
export default function AudioMeditacoes() {
  const [filtro, setFiltro] = useState('TODOS')

  const grupos = filtro === 'TODOS'
    ? GRUPOS
    : GRUPOS.filter(g => g.eco === filtro)

  const total = GRUPOS.reduce((s, g) => s + g.audios.length, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link to="/coach" className="text-xs text-gray-500 hover:text-gray-300 mb-3 inline-block">
            ← Voltar ao Coach
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Meditações de Voz 🎙️
          </h1>
          <p className="text-gray-400 text-sm">
            {total} áudios gerados com a voz da Vivianne — ElevenLabs V3
          </p>
        </div>

        {/* Info como gerar */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800 text-sm text-gray-300">
          <p className="font-medium mb-2">Para gerar os ficheiros:</p>
          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside font-mono">
            <li>Adiciona <span className="text-purple-300">ELEVENLABS_API_KEY=sk_...</span> ao .env</li>
            <li>Corre <span className="text-purple-300">node scripts/gerar-audios-elevenlabs.js</span></li>
            <li>Os MP3 ficam em <span className="text-purple-300">public/audio/</span></li>
            <li>Faz deploy → os ✅ aparecem aqui</li>
          </ol>
        </div>

        {/* Filtro por Eco */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFiltro('TODOS')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
            style={{
              background: filtro === 'TODOS' ? 'white' : '#1f2937',
              color: filtro === 'TODOS' ? '#111' : '#9ca3af',
            }}
          >
            Todos ({total})
          </button>
          {GRUPOS.map(g => (
            <button
              key={g.eco}
              onClick={() => setFiltro(g.eco)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{
                background: filtro === g.eco ? g.cor : g.cor + '22',
                color: filtro === g.eco ? 'white' : g.cor,
              }}
            >
              {g.emoji} {g.eco} ({g.audios.length})
            </button>
          ))}
        </div>

        {/* Grupos */}
        <div className="space-y-6">
          {grupos.map(grupo => (
            <div key={grupo.eco}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{grupo.emoji}</span>
                <h2 className="text-sm font-bold" style={{ color: grupo.cor }}>
                  {grupo.eco}
                </h2>
                <span className="text-xs text-gray-600">
                  {grupo.audios.length} faixas
                </span>
              </div>
              <div className="space-y-2">
                {grupo.audios.map(audio => (
                  <AudioCard
                    key={audio.slug}
                    audio={audio}
                    cor={grupo.cor}
                    fundo={grupo.fundo}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Link para a outra página de áudio */}
        <div className="mt-8 text-center">
          <Link
            to="/coach/audio-ecos"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            → Sons de Drone dos Ecos (página anterior)
          </Link>
        </div>

      </div>
    </div>
  )
}
