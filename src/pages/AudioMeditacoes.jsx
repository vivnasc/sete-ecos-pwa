import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// ─── Catálogo completo das 39 meditações ─────────────────────
const MEDITACOES = [
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

// ─── Áudios de Marketing ───────────────────────────────────────
const MARKETING = [
  {
    eco: 'TEASERS ESPELHO',
    emoji: '🪞',
    cor: '#8E44AD',
    fundo: '#8E44AD22',
    descricao: 'Para anúncios Instagram/TikTok — parágrafo emocionalmente urgente por espelho (~30s)',
    audios: [
      { num: 'T1', slug: 'mkt-teaser-vitalis',  titulo: 'Teaser Espelho VITALIS — O teu corpo está a gritar e tu continuas a ignorar', duracao: '~30s' },
      { num: 'T2', slug: 'mkt-teaser-aurea',    titulo: 'Teaser Espelho ÁUREA — Gastas a tua energia em quem nunca te deu valor',     duracao: '~30s' },
      { num: 'T3', slug: 'mkt-teaser-serena',   titulo: 'Teaser Espelho SERENA — Há uma emoção presa no teu peito há anos',           duracao: '~30s' },
      { num: 'T4', slug: 'mkt-teaser-ignis',    titulo: 'Teaser Espelho IGNIS — Sabes o que queres, mas não tens coragem de cortar',   duracao: '~30s' },
      { num: 'T5', slug: 'mkt-teaser-ventis',   titulo: 'Teaser Espelho VENTIS — Vives tão ocupado que esqueceste como é respirar',    duracao: '~30s' },
      { num: 'T6', slug: 'mkt-teaser-ecoa',     titulo: 'Teaser Espelho ECOA — Calaste a tua voz para não incomodar',                 duracao: '~30s' },
      { num: 'T7', slug: 'mkt-teaser-imago',    titulo: 'Teaser Espelho IMAGO — Quem és tu quando ninguém está a ver?',               duracao: '~30s' },
    ],
  },
  {
    eco: 'TRAILER',
    emoji: '🎬',
    cor: '#E74C3C',
    fundo: '#E74C3C22',
    descricao: 'Apresenta os 7 ecos como um caminho completo — para o topo do site ou anúncio maior (~60s)',
    audios: [
      { num: 'TR', slug: 'mkt-trailer-7-ecos', titulo: 'Trailer Sete Ecos — O caminho completo de transmutação', duracao: '~60s' },
    ],
  },
  {
    eco: 'CLIPS STORIES',
    emoji: '📱',
    cor: '#E67E22',
    fundo: '#E67E2222',
    descricao: 'Ultra-curtos para stories/reels — uma frase de impacto por eco (10-15s)',
    audios: [
      { num: 'S1', slug: 'mkt-story-vitalis',  titulo: 'Story VITALIS — O teu corpo não mente',           duracao: '~15s' },
      { num: 'S2', slug: 'mkt-story-aurea',    titulo: 'Story ÁUREA — Tu mereces mais do que sobras',      duracao: '~15s' },
      { num: 'S3', slug: 'mkt-story-serena',   titulo: 'Story SERENA — Sentir não é fraqueza',             duracao: '~15s' },
      { num: 'S4', slug: 'mkt-story-ignis',    titulo: 'Story IGNIS — A disciplina é um acto de amor',     duracao: '~15s' },
      { num: 'S5', slug: 'mkt-story-ventis',   titulo: 'Story VENTIS — Pára. Respira. Recomeça.',          duracao: '~15s' },
      { num: 'S6', slug: 'mkt-story-ecoa',     titulo: 'Story ECOA — A tua voz tem peso',                  duracao: '~15s' },
      { num: 'S7', slug: 'mkt-story-imago',    titulo: 'Story IMAGO — Tu não és os teus rótulos',          duracao: '~15s' },
    ],
  },
  {
    eco: 'TEASERS ECOS',
    emoji: '🔮',
    cor: '#16A085',
    fundo: '#16A08522',
    descricao: 'Mini-apresentação de cada eco — para carrosséis e reels explicativos (~30s)',
    audios: [
      { num: 'E1', slug: 'mkt-eco-vitalis',  titulo: 'Teaser Eco VITALIS — Nutrição consciente e corpo presente',    duracao: '~30s' },
      { num: 'E2', slug: 'mkt-eco-aurea',    titulo: 'Teaser Eco ÁUREA — Valor próprio e presença',                  duracao: '~30s' },
      { num: 'E3', slug: 'mkt-eco-serena',   titulo: 'Teaser Eco SERENA — Emoções em fluidez',                       duracao: '~30s' },
      { num: 'E4', slug: 'mkt-eco-ignis',    titulo: 'Teaser Eco IGNIS — Foco, corte e vontade',                     duracao: '~30s' },
      { num: 'E5', slug: 'mkt-eco-ventis',   titulo: 'Teaser Eco VENTIS — Energia, ritmo e natureza',                duracao: '~30s' },
      { num: 'E6', slug: 'mkt-eco-ecoa',     titulo: 'Teaser Eco ECOA — Voz recuperada e expressão',                 duracao: '~30s' },
      { num: 'E7', slug: 'mkt-eco-imago',    titulo: 'Teaser Eco IMAGO — Identidade e essência',                     duracao: '~30s' },
    ],
  },
  {
    eco: 'CHAMADAS À ACÇÃO',
    emoji: '📣',
    cor: '#D4AC0D',
    fundo: '#D4AC0D22',
    descricao: 'Para o fim de anúncios — 3 variações de CTA com tom da Vivianne',
    audios: [
      { num: 'C1', slug: 'mkt-cta-comeca-agora',   titulo: 'CTA — Começa agora, o primeiro passo é grátis',         duracao: '~15s' },
      { num: 'C2', slug: 'mkt-cta-diagnostico',     titulo: 'CTA — Faz o teu diagnóstico gratuito no Lumina',       duracao: '~15s' },
      { num: 'C3', slug: 'mkt-cta-transforma',      titulo: 'CTA — A tua transformação começa com uma decisão',     duracao: '~15s' },
    ],
  },
]

// Todos os grupos combinados
const TODOS_GRUPOS = [...MEDITACOES, ...MARKETING]

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

  async function baixar() {
    try {
      const resp = await fetch(url)
      const blob = await resp.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${audio.slug}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback: abrir directamente
      window.open(url, '_blank')
    }
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
  const [downloading, setDownloading] = useState(false)
  const [progresso, setProgresso] = useState({ atual: 0, total: 0, ficheiro: '' })
  const [tab, setTab] = useState('meditacoes') // meditacoes | marketing | tudo

  const gruposActivos = tab === 'meditacoes' ? MEDITACOES
    : tab === 'marketing' ? MARKETING
    : TODOS_GRUPOS

  const grupos = filtro === 'TODOS'
    ? gruposActivos
    : gruposActivos.filter(g => g.eco === filtro)

  const totalMeditacoes = MEDITACOES.reduce((s, g) => s + g.audios.length, 0)
  const totalMarketing = MARKETING.reduce((s, g) => s + g.audios.length, 0)
  const totalActivo = gruposActivos.reduce((s, g) => s + g.audios.length, 0)

  // Reset filtro quando muda de tab
  useEffect(() => { setFiltro('TODOS') }, [tab])

  const descarregarTudo = useCallback(async () => {
    setDownloading(true)
    const zip = new JSZip()
    const todosAudios = []

    // Recolher todos os áudios dos grupos visíveis
    for (const grupo of grupos) {
      for (const audio of grupo.audios) {
        todosAudios.push({ ...audio, eco: grupo.eco })
      }
    }

    setProgresso({ atual: 0, total: todosAudios.length, ficheiro: '' })

    let adicionados = 0
    let falhados = 0

    for (let i = 0; i < todosAudios.length; i++) {
      const audio = todosAudios[i]
      const url = `/audio/${audio.slug}.mp3`
      setProgresso({ atual: i + 1, total: todosAudios.length, ficheiro: audio.titulo })

      try {
        const resp = await fetch(url)
        if (resp.ok) {
          const blob = await resp.blob()
          const pasta = audio.eco.replace(/\s+/g, '-')
          zip.file(`${pasta}/${audio.slug}.mp3`, blob)
          adicionados++
        } else {
          falhados++
        }
      } catch {
        falhados++
      }
    }

    if (adicionados === 0) {
      setDownloading(false)
      setProgresso({ atual: 0, total: 0, ficheiro: '' })
      return
    }

    setProgresso({ atual: todosAudios.length, total: todosAudios.length, ficheiro: 'A criar ZIP...' })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const nomeZip = tab === 'marketing' ? 'sete-ecos-marketing-audios.zip'
      : tab === 'meditacoes' ? 'sete-ecos-meditacoes.zip'
      : 'sete-ecos-todos-audios.zip'
    saveAs(zipBlob, nomeZip)

    setDownloading(false)
    setProgresso({ atual: 0, total: 0, ficheiro: falhados > 0 ? `${falhados} ficheiros ainda não disponíveis` : '' })
  }, [grupos, tab])

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
            {totalMeditacoes} meditações + {totalMarketing} clips de marketing — ElevenLabs V3
          </p>
        </div>

        {/* Tabs: Meditações / Marketing / Tudo */}
        <div className="flex gap-1 mb-5 bg-gray-900 rounded-xl p-1">
          {[
            { key: 'meditacoes', label: `Meditações (${totalMeditacoes})` },
            { key: 'marketing', label: `Marketing (${totalMarketing})` },
            { key: 'tudo', label: `Tudo (${totalMeditacoes + totalMarketing})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95"
              style={{
                background: tab === t.key ? '#4B0082' : 'transparent',
                color: tab === t.key ? 'white' : '#9ca3af',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Botão descarregar tudo */}
        <button
          onClick={descarregarTudo}
          disabled={downloading}
          className="w-full mb-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            background: downloading ? '#1f2937' : 'linear-gradient(135deg, #4B0082, #8E44AD)',
            color: 'white',
          }}
        >
          {downloading
            ? `A descarregar ${progresso.atual}/${progresso.total}...`
            : `⬇ Descarregar ${filtro === 'TODOS' ? 'Tudo' : filtro} em ZIP (${
                filtro === 'TODOS'
                  ? totalActivo
                  : grupos.reduce((s, g) => s + g.audios.length, 0)
              } ficheiros)`
          }
        </button>

        {/* Progresso */}
        {downloading && (
          <div className="mb-5 bg-gray-900 rounded-xl p-3 border border-gray-800">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{progresso.ficheiro}</span>
              <span>{progresso.atual}/{progresso.total}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progresso.total > 0 ? (progresso.atual / progresso.total) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #4B0082, #8E44AD)',
                }}
              />
            </div>
          </div>
        )}

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

        {/* Filtro por Eco/Categoria */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFiltro('TODOS')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
            style={{
              background: filtro === 'TODOS' ? 'white' : '#1f2937',
              color: filtro === 'TODOS' ? '#111' : '#9ca3af',
            }}
          >
            Todos ({totalActivo})
          </button>
          {gruposActivos.map(g => (
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{grupo.emoji}</span>
                <h2 className="text-sm font-bold" style={{ color: grupo.cor }}>
                  {grupo.eco}
                </h2>
                <span className="text-xs text-gray-600">
                  {grupo.audios.length} faixas
                </span>
              </div>
              {grupo.descricao && (
                <p className="text-xs text-gray-500 mb-3 ml-7">{grupo.descricao}</p>
              )}
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
