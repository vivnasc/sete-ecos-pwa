import React, { useState, useEffect, useRef, useCallback } from 'react'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ===== DADOS DOS RITUAIS =====

const RITUAIS = [
  {
    id: 'carta',
    nome: 'Carta Nao-Enviada',
    descricao: 'Escreve o que precisas dizer. Depois, liberta.',
    icone: '\u2709\uFE0F',
    cor: '#8B5E3C',
    duracao: null
  },
  {
    id: 'agua',
    nome: 'Ritual de Agua',
    descricao: 'Visualiza as emocoes a dissolverem-se na agua.',
    icone: '\uD83D\uDCA7',
    cor: '#4A7C8B',
    duracao: null
  },
  {
    id: 'sacudimento',
    nome: 'Sacudimento Corporal',
    descricao: 'Sacode o corpo. Liberta a tensao acumulada.',
    icone: '\uD83E\uDD32',
    cor: '#7B6B8E',
    duracao: 180
  },
  {
    id: 'danca',
    nome: 'Danca Livre',
    descricao: 'Move-te sem julgamento. O corpo sabe o que fazer.',
    icone: '\uD83D\uDC83',
    cor: '#9B6B7A',
    duracao: 300
  },
  {
    id: 'vocalizacao',
    nome: 'Vocalizacao',
    descricao: 'Deixa sair o som que precisar sair.',
    icone: '\uD83D\uDDE3\uFE0F',
    cor: '#6B8E6B',
    duracao: null
  }
]

const CATEGORIAS_CARTA = [
  { id: 'perdao', nome: 'Perdao', icone: '\uD83D\uDD4A\uFE0F' },
  { id: 'raiva', nome: 'Raiva', icone: '\uD83D\uDD25' },
  { id: 'gratidao', nome: 'Gratidao', icone: '\uD83D\uDC9B' },
  { id: 'despedida', nome: 'Despedida', icone: '\uD83C\uDF43' },
  { id: 'verdade', nome: 'Verdade', icone: '\uD83D\uDCA1' }
]

// ===== PASSOS DO RITUAL DE AGUA =====

const PASSOS_AGUA = [
  {
    texto: 'Fecha os olhos. Respira fundo tres vezes.',
    pausa: 8
  },
  {
    texto: 'Imagina um rio calmo a tua frente. A agua e cristalina, morna.',
    pausa: 6
  },
  {
    texto: 'Pensa na emocao que queres libertar. Sente-a no corpo. Onde esta?',
    pausa: 10
  },
  {
    texto: 'Imagina essa emocao como uma cor, uma textura. Segura-a nas maos.',
    pausa: 8
  },
  {
    texto: 'Agora, pousa-a devagar na agua. Ve como a corrente a leva.',
    pausa: 10
  },
  {
    texto: 'A agua absorve tudo. A cor dissolve-se. Fica mais leve.',
    pausa: 8
  },
  {
    texto: 'Respira fundo. Solta. O rio levou o que ja nao te serve.',
    pausa: 8
  },
  {
    texto: 'Abre os olhos quando estiveres ' + g('pronto', 'pronta') + '. Estas mais leve agora.',
    pausa: 6
  }
]

// ===== PASSOS DO SACUDIMENTO =====

const PASSOS_SACUDIMENTO = [
  { texto: 'Fica de pe. Pernas ligeiramente afastadas. Respira fundo.', tempo: 10 },
  { texto: 'Comeca a sacudir as maos. Solta os dedos, os pulsos.', tempo: 20 },
  { texto: 'Sacude os bracos. Solta os ombros. Deixa tudo balancear.', tempo: 25 },
  { texto: 'Sacude os ombros com mais energia. Solta a tensao.', tempo: 25 },
  { texto: 'Agora todo o corpo. Joelhos flexionados. Sacode tudo.', tempo: 40 },
  { texto: 'Mais energia! Deixa o corpo decidir como se mover.', tempo: 30 },
  { texto: 'Sacode como se tirasses agua da roupa. Com forca!', tempo: 20 },
  { texto: 'Desacelera devagar... cada vez mais lento...', tempo: 10 }
]

// ===== PASSOS DA VOCALIZACAO =====

const PASSOS_VOCALIZACAO = [
  {
    texto: 'Encontra um espaco onde possas fazer barulho. Fecha os olhos.',
    pausa: 6
  },
  {
    texto: 'Respira fundo pelo nariz. Solta pela boca com um suspiro longo: "Ahhhhh..."',
    pausa: 8
  },
  {
    texto: 'Faz o som que o corpo pedir. Suspiro, gemido, grito, choro. Tudo e valido.',
    pausa: 10
  },
  {
    texto: 'Se vier riso, ri. Se vier choro, chora. Nao julgues. Apenas solta.',
    pausa: 10
  },
  {
    texto: 'Aumenta o volume se precisares. Baixa se quiseres. O teu corpo sabe.',
    pausa: 10
  },
  {
    texto: 'Continua... deixa sair tudo que esta preso.',
    pausa: 12
  },
  {
    texto: 'Devagar, acalma a voz. Volta ao suspiro suave.',
    pausa: 8
  },
  {
    texto: 'Silencio. Respira. Sente o espaco que criaste dentro de ti.',
    pausa: 6
  }
]

// ===== ICONES SVG =====

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.1-5.8 3.8-7.8L12 4l3.2 4.2C16.9 10.2 19 12.8 19 16c0 3.9-3.1 7-7 7z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

// ===== COMPONENTE: TIMER =====

function TimerDisplay({ totalSeconds, onComplete, isPaused }) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, onComplete])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="rgba(107,142,155,0.2)"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="#6B8E9B"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ===== COMPONENTE: PASSO A PASSO GUIADO =====

function GuidedSteps({ passos, onComplete, usaPausa = true }) {
  const [passoActual, setPassoActual] = useState(0)
  const [pausaRestante, setPausaRestante] = useState(
    usaPausa ? (passos[0]?.pausa || 6) : (passos[0]?.tempo || 10)
  )
  const [autoPlay, setAutoPlay] = useState(true)
  const intervalRef = useRef(null)

  const avancar = useCallback(() => {
    if (passoActual < passos.length - 1) {
      const proximo = passoActual + 1
      setPassoActual(proximo)
      const duracao = usaPausa ? (passos[proximo]?.pausa || 6) : (passos[proximo]?.tempo || 10)
      setPausaRestante(duracao)
    } else {
      onComplete()
    }
  }, [passoActual, passos, onComplete, usaPausa])

  useEffect(() => {
    if (!autoPlay) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setPausaRestante(prev => {
        if (prev <= 1) {
          avancar()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoPlay, avancar])

  const progressoTotal = ((passoActual + 1) / passos.length) * 100

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Barra de progresso */}
      <div className="w-full max-w-md">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressoTotal}%`, backgroundColor: '#6B8E9B' }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Passo {passoActual + 1} de {passos.length}</span>
          <span>{pausaRestante}s</span>
        </div>
      </div>

      {/* Texto do passo */}
      <div
        className="text-center px-6 py-8 max-w-md"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
        key={passoActual}
      >
        <p className="text-xl text-white/90 leading-relaxed" style={{ fontFamily: 'var(--font-titulos)' }}>
          {passos[passoActual]?.texto}
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label={autoPlay ? 'Pausar' : 'Continuar'}
        >
          {autoPlay ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={avancar}
          className="px-6 py-2 rounded-full bg-[#6B8E9B]/30 hover:bg-[#6B8E9B]/50 text-white text-sm transition-colors"
        >
          {passoActual < passos.length - 1 ? 'Proximo' : 'Concluir'}
        </button>
      </div>
    </div>
  )
}

// ===== COMPONENTE: CARTA NAO-ENVIADA =====

function CartaNaoEnviada({ onComplete, onClose }) {
  const [categoria, setCategoria] = useState(null)
  const [texto, setTexto] = useState('')
  const [queimando, setQueimando] = useState(false)
  const [queimado, setQueimado] = useState(false)

  const handleQueimar = () => {
    if (!texto.trim()) return
    setQueimando(true)
    setTimeout(() => {
      setQueimado(true)
      setQueimando(false)
    }, 3000)
  }

  if (queimado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-6" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          {'\u2728'}
        </div>
        <h3
          className="text-2xl text-white/90 mb-3"
          style={{ fontFamily: 'var(--font-titulos)', animation: 'fadeInUp 1s ease-out' }}
        >
          {g('Libertado', 'Libertada')}
        </h3>
        <p className="text-white/60 mb-8 max-w-xs" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
          As palavras cumpriram o seu proposito. Ja nao precisas de carregar isto.
        </p>
        <button
          onClick={() => onComplete(texto)}
          className="px-8 py-3 rounded-full text-white font-medium transition-all"
          style={{ backgroundColor: '#6B8E9B', animation: 'fadeInUp 1.4s ease-out' }}
        >
          Escrever reflexao
        </button>
      </div>
    )
  }

  // Escolha de categoria
  if (!categoria) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-lg text-white/90 mb-2 text-center" style={{ fontFamily: 'var(--font-titulos)' }}>
          Sobre o que e esta carta?
        </h3>
        <p className="text-white/50 text-sm text-center mb-6">
          Ninguem vai ler. E so para ti.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {CATEGORIAS_CARTA.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#6B8E9B]/50 hover:bg-[#6B8E9B]/10 transition-all text-left"
            >
              <span className="text-2xl block mb-2">{cat.icone}</span>
              <span className="text-white/80 text-sm">{cat.nome}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">
          {CATEGORIAS_CARTA.find(c => c.id === categoria)?.icone}
        </span>
        <span className="text-white/60 text-sm">
          Carta de {CATEGORIAS_CARTA.find(c => c.id === categoria)?.nome}
        </span>
      </div>

      <div className={`relative ${queimando ? 'burning-container' : ''}`}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreve tudo o que precisas dizer..."
          rows={10}
          disabled={queimando}
          className={`w-full px-4 py-4 rounded-xl text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6B8E9B]/50 resize-none transition-all ${
            queimando
              ? 'burning-paper'
              : 'bg-white/5 border border-white/10'
          }`}
          style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.1rem', lineHeight: '1.8' }}
        />

        {queimando && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div className="burn-overlay" />
            <div className="ember ember-1" />
            <div className="ember ember-2" />
            <div className="ember ember-3" />
            <div className="ember ember-4" />
            <div className="ember ember-5" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-white/30 text-xs">{texto.length} caracteres</span>
        {!queimando && (
          <button
            onClick={handleQueimar}
            disabled={!texto.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all disabled:opacity-30"
            style={{
              background: texto.trim()
                ? 'linear-gradient(135deg, #C1634A, #E07A5F)'
                : 'rgba(255,255,255,0.1)',
              color: texto.trim() ? 'white' : 'rgba(255,255,255,0.3)'
            }}
          >
            <FireIcon />
            <span>Queimar carta</span>
          </button>
        )}
      </div>

      {!queimando && texto.trim() && (
        <p className="text-white/30 text-xs text-center mt-3">
          Esta carta nunca sera enviada. E so um acto de libertacao.
        </p>
      )}
    </div>
  )
}

// ===== COMPONENTE: DANCA LIVRE =====

function DancaLivre({ onComplete }) {
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)

  const mensagens = [
    'Fecha os olhos.',
    'Move-te como o corpo pedir.',
    'Sem certo ou errado.',
    'Deixa o ritmo vir de dentro.',
    'O corpo sabe.',
    'Solta. Flui. Respira.',
    'Es livre aqui.'
  ]

  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (!started || paused || done) return
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % mensagens.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [started, paused, done])

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <div className="text-6xl mb-6">{'\uD83D\uDC83'}</div>
        <h3 className="text-2xl text-white/90 mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>
          Danca Livre
        </h3>
        <p className="text-white/60 mb-2 max-w-xs">
          5 minutos so para ti. Sem coreografia. Sem julgamento.
        </p>
        <p className="text-white/40 text-sm mb-8 max-w-xs">
          Poe musica se quiseres, ou danca em silencio. O corpo sabe como se mover.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
          style={{ backgroundColor: '#6B8E9B' }}
        >
          Comecar
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <div className="text-5xl mb-6" style={{ animation: 'fadeInUp 0.8s ease-out' }}>{'\u2728'}</div>
        <h3
          className="text-2xl text-white/90 mb-3"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Lindo. {g('Obrigado', 'Obrigada')} corpo.
        </h3>
        <p className="text-white/60 mb-8">Como te sentes agora?</p>
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-full text-white font-medium"
          style={{ backgroundColor: '#6B8E9B' }}
        >
          Escrever reflexao
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <TimerDisplay
        totalSeconds={300}
        isPaused={paused}
        onComplete={() => setDone(true)}
      />
      <p
        className="text-xl text-white/70 mt-8 text-center max-w-xs"
        style={{ fontFamily: 'var(--font-titulos)', animation: 'fadeInUp 0.6s ease-out' }}
        key={msgIndex}
      >
        {mensagens[msgIndex]}
      </p>
      <button
        onClick={() => setPaused(!paused)}
        className="mt-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label={paused ? 'Continuar' : 'Pausar'}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
    </div>
  )
}

// ===== COMPONENTE: SACUDIMENTO COM TIMER =====

function SacudimentoCorporal({ onComplete }) {
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)

  const [passoIdx, setPassoIdx] = useState(0)
  const [tempoPassoRestante, setTempoPassoRestante] = useState(PASSOS_SACUDIMENTO[0].tempo)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!started || paused || done) return

    intervalRef.current = setInterval(() => {
      setTempoPassoRestante(prev => {
        if (prev <= 1) {
          setPassoIdx(current => {
            if (current < PASSOS_SACUDIMENTO.length - 1) {
              const proximo = current + 1
              setTempoPassoRestante(PASSOS_SACUDIMENTO[proximo].tempo)
              return proximo
            } else {
              setDone(true)
              return current
            }
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [started, paused, done])

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <div className="text-6xl mb-6">{'\uD83E\uDD32'}</div>
        <h3 className="text-2xl text-white/90 mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>
          Sacudimento Corporal
        </h3>
        <p className="text-white/60 mb-2 max-w-xs">
          3 minutos para sacudir toda a tensao do corpo.
        </p>
        <p className="text-white/40 text-sm mb-8 max-w-xs">
          Fica de pe num espaco comodo. Respira fundo antes de comecar.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
          style={{ backgroundColor: '#6B8E9B' }}
        >
          Comecar
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <div className="text-5xl mb-6" style={{ animation: 'fadeInUp 0.8s ease-out' }}>{'\u2728'}</div>
        <h3 className="text-2xl text-white/90 mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>
          Corpo mais leve.
        </h3>
        <p className="text-white/60 mb-8">
          Sente a diferenca. A energia flui melhor agora.
        </p>
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-full text-white font-medium"
          style={{ backgroundColor: '#6B8E9B' }}
        >
          Escrever reflexao
        </button>
      </div>
    )
  }

  const totalTime = PASSOS_SACUDIMENTO.reduce((sum, p) => sum + p.tempo, 0)
  const tempoPassado = PASSOS_SACUDIMENTO.slice(0, passoIdx).reduce((sum, p) => sum + p.tempo, 0) +
    (PASSOS_SACUDIMENTO[passoIdx].tempo - tempoPassoRestante)
  const progressoTotal = (tempoPassado / totalTime) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Progresso */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressoTotal}%`, backgroundColor: '#6B8E9B' }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Passo {passoIdx + 1} de {PASSOS_SACUDIMENTO.length}</span>
          <span>{tempoPassoRestante}s</span>
        </div>
      </div>

      {/* Instrucao */}
      <div className="text-center px-4 mb-8" key={passoIdx} style={{ animation: 'fadeInUp 0.5s ease-out' }}>
        <p className="text-xl text-white/90 leading-relaxed" style={{ fontFamily: 'var(--font-titulos)' }}>
          {PASSOS_SACUDIMENTO[passoIdx].texto}
        </p>
      </div>

      {/* Controle */}
      <button
        onClick={() => setPaused(!paused)}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label={paused ? 'Continuar' : 'Pausar'}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
    </div>
  )
}

// ===== COMPONENTE: REFLEXAO POS-RITUAL =====

function ReflexaoFinal({ tipoRitual, onSave, saving }) {
  const [reflexao, setReflexao] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <h3 className="text-xl text-white/90 mb-2 text-center" style={{ fontFamily: 'var(--font-titulos)' }}>
        Como te sentes agora?
      </h3>
      <p className="text-white/50 text-sm text-center mb-6 max-w-xs">
        Regista o que ficou depois do ritual. Em poucas palavras ou muitas.
      </p>

      <textarea
        value={reflexao}
        onChange={(e) => setReflexao(e.target.value)}
        placeholder="O que sinto agora..."
        rows={5}
        className="w-full max-w-md px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6B8E9B]/50 resize-none"
        style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.05rem', lineHeight: '1.7' }}
      />

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => onSave('')}
          className="px-6 py-2.5 rounded-full text-white/50 bg-white/5 hover:bg-white/10 text-sm transition-colors"
        >
          Saltar
        </button>
        <button
          onClick={() => onSave(reflexao)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium transition-all disabled:opacity-50"
          style={{ backgroundColor: '#6B8E9B' }}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckIcon />
          )}
          <span>{saving ? 'A guardar...' : 'Guardar'}</span>
        </button>
      </div>
    </div>
  )
}

// ===== COMPONENTE PRINCIPAL =====

export default function RituaisLibertacao() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)
  const [ritualActivo, setRitualActivo] = useState(null)
  const [fase, setFase] = useState('escolha') // escolha | ritual | reflexao | completo
  const [saving, setSaving] = useState(false)
  const [historico, setHistorico] = useState([])
  const [loadingHist, setLoadingHist] = useState(true)

  // Buscar userId e historico
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle()

        if (userData) {
          setUserId(userData.id)

          // Carregar historico recente
          const { data: hist } = await supabase
            .from('serena_rituais_log')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false })
            .limit(10)

          setHistorico(hist || [])
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoadingHist(false)
      }
    }

    loadData()
  }, [user])

  // Guardar no Supabase
  const handleSaveReflexao = async (reflexao) => {
    if (!userId || !ritualActivo) return

    setSaving(true)
    try {
      await supabase.from('serena_rituais_log').insert({
        user_id: userId,
        tipo_ritual: ritualActivo.id,
        reflexao: reflexao || null,
        created_at: new Date().toISOString()
      })

      // Actualizar historico local
      setHistorico(prev => [{
        tipo_ritual: ritualActivo.id,
        reflexao: reflexao || null,
        created_at: new Date().toISOString()
      }, ...prev])

      setFase('completo')
    } catch (err) {
      console.error('Erro ao guardar ritual:', err)
    } finally {
      setSaving(false)
    }
  }

  // Iniciar um ritual
  const iniciarRitual = (ritual) => {
    setRitualActivo(ritual)
    setFase('ritual')
  }

  // Callback quando o ritual termina
  const handleRitualComplete = useCallback(() => {
    setFase('reflexao')
  }, [])

  // Voltar ao inicio
  const voltarAoInicio = () => {
    setRitualActivo(null)
    setFase('escolha')
  }

  // ===== RENDER: ECRA DE RITUAL ACTIVO =====

  const renderRitual = () => {
    if (!ritualActivo) return null

    switch (ritualActivo.id) {
      case 'carta':
        return (
          <CartaNaoEnviada
            onComplete={(texto) => setFase('reflexao')}
            onClose={voltarAoInicio}
          />
        )

      case 'agua':
        return (
          <GuidedSteps
            passos={PASSOS_AGUA}
            onComplete={handleRitualComplete}
            usaPausa={true}
          />
        )

      case 'sacudimento':
        return (
          <SacudimentoCorporal onComplete={handleRitualComplete} />
        )

      case 'danca':
        return (
          <DancaLivre onComplete={handleRitualComplete} />
        )

      case 'vocalizacao':
        return (
          <GuidedSteps
            passos={PASSOS_VOCALIZACAO}
            onComplete={handleRitualComplete}
            usaPausa={true}
          />
        )

      default:
        return null
    }
  }

  // ===== RENDER: ECRA DE CONCLUSAO =====

  if (fase === 'completo') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #243d4d 50%, #1a2e3a 100%)' }}>
        <ModuleHeader
          eco="serena"
          title="Rituais de Libertacao"
          compact
        />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="text-6xl mb-6" style={{ animation: 'fadeInUp 0.8s ease-out' }}>{'\uD83C\uDF3F'}</div>
          <h2
            className="text-2xl text-white/90 mb-3"
            style={{ fontFamily: 'var(--font-titulos)', animation: 'fadeInUp 1s ease-out' }}
          >
            Ritual concluido
          </h2>
          <p className="text-white/60 mb-8 max-w-xs" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
            Cada vez que libertas, abres espaco para algo novo.
          </p>
          <button
            onClick={voltarAoInicio}
            className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
            style={{ backgroundColor: '#6B8E9B', animation: 'fadeInUp 1.4s ease-out' }}
          >
            Voltar aos rituais
          </button>
        </div>
        <RituaisStyles />
      </div>
    )
  }

  // ===== RENDER: REFLEXAO =====

  if (fase === 'reflexao') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #243d4d 50%, #1a2e3a 100%)' }}>
        <ModuleHeader
          eco="serena"
          title="Reflexao"
          compact
          backTo="#"
          showHomeButton={false}
          rightAction={
            <button
              onClick={voltarAoInicio}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
              aria-label="Fechar"
            >
              <CloseIcon />
            </button>
          }
        />
        <ReflexaoFinal
          tipoRitual={ritualActivo?.id}
          onSave={handleSaveReflexao}
          saving={saving}
        />
        <RituaisStyles />
      </div>
    )
  }

  // ===== RENDER: RITUAL ACTIVO =====

  if (fase === 'ritual' && ritualActivo) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #243d4d 50%, #1a2e3a 100%)' }}>
        <ModuleHeader
          eco="serena"
          title={ritualActivo.nome}
          compact
          backTo="#"
          showHomeButton={false}
          rightAction={
            <button
              onClick={voltarAoInicio}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
              aria-label="Fechar ritual"
            >
              <CloseIcon />
            </button>
          }
        />
        <div className="pt-6">
          {renderRitual()}
        </div>
        <RituaisStyles />
      </div>
    )
  }

  // ===== RENDER: GRELHA DE ESCOLHA DE RITUAIS =====

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #243d4d 50%, #1a2e3a 100%)' }}>
      <ModuleHeader
        eco="serena"
        title="Rituais de Libertacao"
        subtitle={g('Escolhe o que precisas soltar hoje', 'Escolhe o que precisas soltar hoje')}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Grelha de rituais */}
        <div className="grid grid-cols-2 gap-3">
          {RITUAIS.map((ritual) => {
            const vezesFeito = historico.filter(h => h.tipo_ritual === ritual.id).length

            return (
              <button
                key={ritual.id}
                onClick={() => iniciarRitual(ritual)}
                className="relative p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${ritual.cor}22, ${ritual.cor}11)`,
                  border: `1px solid ${ritual.cor}33`
                }}
              >
                <span className="text-3xl block mb-3">{ritual.icone}</span>
                <h3 className="text-white/90 font-medium text-sm mb-1">
                  {ritual.nome}
                </h3>
                <p className="text-white/45 text-xs leading-relaxed">
                  {ritual.descricao}
                </p>
                {ritual.duracao && (
                  <span className="inline-block mt-2 text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                    {Math.floor(ritual.duracao / 60)} min
                  </span>
                )}
                {vezesFeito > 0 && (
                  <span
                    className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${ritual.cor}44`, color: `${ritual.cor}` }}
                  >
                    {vezesFeito}x
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Historico recente */}
        {!loadingHist && historico.length > 0 && (
          <div className="mt-8">
            <h3 className="text-white/60 text-sm font-medium mb-3">Recentes</h3>
            <div className="space-y-2">
              {historico.slice(0, 5).map((item, idx) => {
                const ritual = RITUAIS.find(r => r.id === item.tipo_ritual)
                const data = new Date(item.created_at)

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-xl">{ritual?.icone || '\uD83D\uDD2E'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-white/70 text-sm block">
                        {ritual?.nome || item.tipo_ritual}
                      </span>
                      {item.reflexao && (
                        <p className="text-white/40 text-xs truncate">{item.reflexao}</p>
                      )}
                    </div>
                    <span className="text-white/30 text-xs whitespace-nowrap">
                      {data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mensagem vazia */}
        {!loadingHist && historico.length === 0 && (
          <div className="mt-8 text-center py-6">
            <p className="text-white/30 text-sm">
              Ainda nao fizeste nenhum ritual. Escolhe um acima para comecar.
            </p>
          </div>
        )}

        {/* Loading */}
        {loadingHist && (
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#6B8E9B] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>

      <RituaisStyles />
    </div>
  )
}

// ===== ESTILOS CSS (KEYFRAMES) =====

function RituaisStyles() {
  return (
    <style>{`
      /* Animacao de entrada */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ===== BURN EFFECT - CARTA NAO-ENVIADA ===== */

      .burning-paper {
        animation: burnPaper 3s ease-in forwards;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
      }

      @keyframes burnPaper {
        0% {
          opacity: 1;
          transform: scale(1);
          filter: brightness(1);
          border-color: rgba(255,255,255,0.1);
        }
        15% {
          opacity: 1;
          transform: scale(1.01);
          filter: brightness(1.3) sepia(0.3);
          border-color: rgba(227, 120, 51, 0.4);
          box-shadow: 0 0 20px rgba(227, 120, 51, 0.2);
        }
        30% {
          opacity: 0.95;
          transform: scale(1);
          filter: brightness(1.1) sepia(0.5);
          border-color: rgba(227, 120, 51, 0.6);
          box-shadow: 0 0 40px rgba(227, 120, 51, 0.3);
        }
        50% {
          opacity: 0.7;
          transform: scale(0.98);
          filter: brightness(0.8) sepia(0.8);
          border-color: rgba(194, 65, 12, 0.5);
          box-shadow: 0 0 30px rgba(194, 65, 12, 0.3);
        }
        70% {
          opacity: 0.4;
          transform: scale(0.94);
          filter: brightness(0.5) sepia(1);
          border-color: rgba(120, 53, 15, 0.4);
          box-shadow: 0 0 15px rgba(120, 53, 15, 0.2);
        }
        85% {
          opacity: 0.15;
          transform: scale(0.88);
          filter: brightness(0.3) grayscale(0.5);
          color: transparent;
        }
        100% {
          opacity: 0;
          transform: scale(0.8) translateY(10px);
          filter: brightness(0) grayscale(1);
          color: transparent;
        }
      }

      /* Overlay de cinzas */
      .burn-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(194, 65, 12, 0.4) 0%,
          rgba(227, 120, 51, 0.2) 30%,
          transparent 60%
        );
        animation: burnOverlay 3s ease-in forwards;
        border-radius: 0.75rem;
      }

      @keyframes burnOverlay {
        0% { opacity: 0; }
        20% { opacity: 1; }
        60% { opacity: 0.8; }
        100% { opacity: 0; }
      }

      /* Brasas / faiscas */
      .ember {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #E37833;
        animation: emberFloat 2.5s ease-out forwards;
      }

      .ember-1 { bottom: 20%; left: 15%; animation-delay: 0.3s; }
      .ember-2 { bottom: 30%; left: 45%; animation-delay: 0.6s; }
      .ember-3 { bottom: 15%; left: 70%; animation-delay: 0.9s; }
      .ember-4 { bottom: 40%; left: 25%; animation-delay: 1.2s; }
      .ember-5 { bottom: 25%; left: 60%; animation-delay: 1.5s; }

      @keyframes emberFloat {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        50% {
          opacity: 0.8;
          transform: translateY(-30px) scale(1.5);
          background: #F4A261;
        }
        100% {
          opacity: 0;
          transform: translateY(-80px) scale(0.5);
          background: #888;
        }
      }
    `}</style>
  )
}
