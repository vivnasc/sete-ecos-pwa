'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Mic, MicOff, Volume2, VolumeX, MessageCircle, ArrowRight, AlertCircle, Camera, Loader2 } from 'lucide-react'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import { useTextToSpeech } from '@/lib/useTextToSpeech'
import { construirContexto } from '@/lib/coachContext'
import { executeTool } from '@/lib/coachTools'
import { saveCoachMensagem, addRefeicao } from '@/lib/storage'
import { analisarFotoRefeicao } from '@/lib/fotoRefeicao'
import { isoDate } from '@/lib/dates'

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

type Mensagem = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

const MAX_TOOL_TURNS = 6

const TOOL_LABELS: Record<string, string> = {
  registar_peso: 'peso',
  registar_refeicao: 'refeição',
  registar_alcool: 'caderno do copo',
  registar_dia: 'dia',
  registar_jejum: 'jejum',
  registar_ciclo: 'ciclo',
  registar_agua: 'água',
  registar_suplemento: 'suplemento',
  registar_transito: 'trânsito',
  registar_sono_detalhe: 'sono',
  registar_sintoma_peri: 'sintoma',
  registar_steps: 'passos',
  registar_rhr: 'RHR',
  marcar_ancora: 'âncora',
  definir_metas: 'metas',
  sugerir_metas: 'sugestão',
  analisar_padroes: 'análise',
  consultar_dados: 'consulta'
}

type Estado = 'pronto' | 'a_ouvir' | 'a_pensar' | 'a_falar'

export default function VoiceModeOverlay({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [estado, setEstado] = useState<Estado>('pronto')
  const [transcrito, setTranscrito] = useState('')
  const [resposta, setResposta] = useState<string | null>(null)
  const [chips, setChips] = useState<string[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [silencioso, setSilencioso] = useState(false)
  const [analisandoFoto, setAnalisandoFoto] = useState(false)
  const transcritoFinalRef = useRef('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tts = useTextToSpeech()
  const voz = useSpeechRecognition({
    lang: 'pt-PT',
    onFim: (texto) => {
      transcritoFinalRef.current = texto
      // Auto-submit quando o reconhecimento termina (silêncio ou stop)
      if (texto.trim().length > 0 && estado === 'a_ouvir') {
        enviar(texto)
      }
    }
  })

  // Auto-iniciar a ouvir quando abre
  useEffect(() => {
    if (aberto && estado === 'pronto' && voz.suportado) {
      iniciarEscuta()
    }
    if (!aberto) {
      voz.parar()
      tts.parar()
      setEstado('pronto')
      setTranscrito('')
      setResposta(null)
      setChips([])
      setErro(null)
      transcritoFinalRef.current = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  // Sincroniza estado com voz/tts
  useEffect(() => {
    if (voz.ouvir) setEstado('a_ouvir')
    if (voz.erro) setErro(voz.erro)
  }, [voz.ouvir, voz.erro])

  useEffect(() => {
    if (tts.aFalar) setEstado('a_falar')
    else if (estado === 'a_falar') setEstado('pronto')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts.aFalar])

  useEffect(() => {
    if (voz.transcricao || voz.parcial) {
      setTranscrito((voz.transcricao + ' ' + voz.parcial).trim())
    }
  }, [voz.transcricao, voz.parcial])

  const onFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setAnalisandoFoto(true)
    setErro(null)
    setEstado('a_pensar')
    voz.parar()
    tts.parar()
    try {
      const r = await analisarFotoRefeicao(file)
      addRefeicao({
        tipo: r.tipo,
        descricao: r.descricao,
        timestamp: new Date().toISOString(),
        proteinaG: r.proteinaG,
        carboG: r.carboG,
        gorduraG: r.gorduraG,
        calorias: r.calorias,
        contexto: 'foto',
        sentir: r.observacao
      })
      const tipoLeg = { pa: 'pequeno-almoço', almoco: 'almoço', snack: 'snack', jantar: 'jantar' }[r.tipo]
      const macroParts: string[] = []
      if (r.proteinaG !== null) macroParts.push(`${Math.round(r.proteinaG)}g proteína`)
      if (r.carboG !== null) macroParts.push(`${Math.round(r.carboG)}g carbo`)
      if (r.gorduraG !== null) macroParts.push(`${Math.round(r.gorduraG)}g gordura`)
      if (r.calorias !== null) macroParts.push(`${r.calorias} kcal`)
      const respostaTxt = `${tipoLeg} registado · ${r.descricao}. estimei ${macroParts.join(', ')}.${r.observacao ? ' ' + r.observacao : ''}`
      saveCoachMensagem('user', '[foto da refeição]')
      saveCoachMensagem('assistant', respostaTxt)
      setChips([`✓ refeição (foto)`])
      setResposta(respostaTxt)
      window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key: 'foto-refeicao' } }))
      if (!silencioso) {
        setEstado('a_falar')
        tts.falar(respostaTxt)
      } else {
        setEstado('pronto')
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'erro a analisar foto')
      setEstado('pronto')
    }
    setAnalisandoFoto(false)
  }

  const iniciarEscuta = () => {
    setErro(null)
    setResposta(null)
    setChips([])
    setTranscrito('')
    transcritoFinalRef.current = ''
    voz.reset()
    tts.parar()
    voz.iniciar()
  }

  const pararEscuta = () => {
    voz.parar()
    const texto = transcritoFinalRef.current || transcrito
    if (texto.trim()) enviar(texto)
  }

  const enviar = async (texto: string) => {
    if (!texto.trim()) return
    setEstado('a_pensar')
    setErro(null)
    saveCoachMensagem('user', texto.trim())
    const conv: Mensagem[] = [{ role: 'user', content: texto.trim() }]
    try {
      let turnos = 0
      let respostaFinal = ''
      const chipsAcumulados: string[] = []
      while (turnos < MAX_TOOL_TURNS) {
        turnos++
        const r = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mensagens: conv,
            contexto: construirContexto(),
            tools_enabled: true
          })
        })
        const json = await r.json()
        if (!r.ok) {
          setErro(json.error ?? 'erro')
          setEstado('pronto')
          return
        }
        const content: ContentBlock[] = json.content ?? []
        const stopReason: string = json.stop_reason ?? 'end_turn'

        conv.push({ role: 'assistant', content })

        if (stopReason !== 'tool_use') {
          respostaFinal = content
            .filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
            .map(b => b.text)
            .join(' ')
            .trim()
          break
        }

        // Executa tools
        const toolUses = content.filter((b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use')
        const toolResults: ContentBlock[] = toolUses.map(tu => {
          const res = executeTool(tu.name, tu.input)
          if (TOOL_LABELS[tu.name] && tu.name !== 'consultar_dados' && tu.name !== 'analisar_padroes' && tu.name !== 'sugerir_metas') {
            chipsAcumulados.push(`✓ ${TOOL_LABELS[tu.name]}`)
            setChips([...chipsAcumulados])
          }
          return {
            type: 'tool_result',
            tool_use_id: tu.id,
            content: res.ok ? res.texto : `erro: ${res.erro}`
          }
        })
        conv.push({ role: 'user', content: toolResults })
        window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key: 'coach-tool' } }))
      }

      if (respostaFinal) {
        saveCoachMensagem('assistant', respostaFinal)
        setResposta(respostaFinal)
        if (!silencioso) {
          setEstado('a_falar')
          tts.falar(respostaFinal)
        } else {
          setEstado('pronto')
        }
      } else {
        setEstado('pronto')
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro de rede')
      setEstado('pronto')
    }
  }

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--bg)]/98 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-serif text-[14px] tracking-editorial italic text-ouro">coach</span>
          <span className="label-soft">{estadoLegivel(estado)}</span>
        </div>
        <button
          onClick={() => setSilencioso(s => !s)}
          aria-label={silencioso ? 'activar voz' : 'silenciar resposta'}
          className="rounded-full p-2 transition-elegant hover:bg-[var(--surface-soft)] active:scale-95"
        >
          {silencioso ? <VolumeX size={16} strokeWidth={1.4} className="text-faint" /> : <Volume2 size={16} strokeWidth={1.4} className="text-ouro" />}
        </button>
        <button
          onClick={onFechar}
          aria-label="fechar"
          className="rounded-full p-2 transition-elegant hover:bg-[var(--surface-soft)] active:scale-95"
        >
          <X size={18} strokeWidth={1.4} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Círculo central */}
        <button
          onClick={() => {
            if (estado === 'a_ouvir') pararEscuta()
            else if (estado === 'a_falar') tts.parar()
            else iniciarEscuta()
          }}
          className={`relative flex h-44 w-44 items-center justify-center rounded-full transition-elegant active:scale-95 ${
            estado === 'a_ouvir'
              ? 'bg-ouro shadow-ink'
              : estado === 'a_pensar'
                ? 'bg-tinta dark:bg-ouro shadow-ink animate-breathe'
                : estado === 'a_falar'
                  ? 'bg-ouro shadow-ink animate-breathe'
                  : 'bg-[var(--surface-soft)] shadow-hair-strong'
          }`}
          aria-label={estadoLegivel(estado)}
        >
          {/* Pulse anel */}
          {estado === 'a_ouvir' ? (
            <span className="absolute inset-0 rounded-full border-2 border-ouro animate-ping opacity-40" />
          ) : null}
          {estado === 'a_ouvir' || estado === 'pronto' ? (
            <Mic size={48} strokeWidth={1.3} className={estado === 'a_ouvir' ? 'text-creme dark:text-tinta' : 'text-soft'} />
          ) : estado === 'a_pensar' ? (
            <span className="flex gap-1.5">
              <span className="h-2 w-2 animate-breathe rounded-full bg-creme dark:bg-tinta" />
              <span className="h-2 w-2 animate-breathe rounded-full bg-creme dark:bg-tinta" style={{ animationDelay: '0.3s' }} />
              <span className="h-2 w-2 animate-breathe rounded-full bg-creme dark:bg-tinta" style={{ animationDelay: '0.6s' }} />
            </span>
          ) : (
            <Volume2 size={48} strokeWidth={1.3} className="text-creme dark:text-tinta" />
          )}
        </button>

        {/* Estado + dica */}
        <p className="mt-5 text-soft text-[12.5px] tracking-cap uppercase">{estadoLegivel(estado)}</p>
        {estado === 'pronto' && !resposta ? (
          <p className="text-faint mt-2 text-[12px] text-center max-w-xs leading-relaxed">
            toca para falar · pergunta resumos, regista refeições, peso, sono.
          </p>
        ) : null}

        {/* Transcrição em curso */}
        {transcrito && estado !== 'a_falar' ? (
          <div className="mt-6 max-h-32 max-w-md overflow-y-auto px-2 text-center">
            <p className="text-tinta dark:text-creme text-[16px] leading-relaxed font-serif italic">
              {transcrito}
              {voz.parcial ? <span className="ml-1 inline-block h-3 w-px animate-pulse bg-ouro align-middle" /> : null}
            </p>
          </div>
        ) : null}

        {/* Chips de tools registadas */}
        {chips.length > 0 && estado !== 'a_pensar' ? (
          <div className="mt-5 flex flex-wrap justify-center gap-1.5 max-w-md">
            {chips.map((c, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-ouro/10 px-2.5 py-1 text-[10.5px] text-ouro">
                {c}
              </span>
            ))}
          </div>
        ) : null}

        {/* Resposta da coach */}
        {resposta ? (
          <div className="mt-6 max-w-md max-h-48 overflow-y-auto px-3">
            <p className="font-serif text-[15.5px] leading-[1.55] tracking-editorial text-tinta dark:text-creme">
              {resposta}
            </p>
          </div>
        ) : null}

        {/* Erros */}
        {erro ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracota/10 px-3 py-1.5 text-[11.5px] text-terracota">
            <AlertCircle size={12} strokeWidth={1.5} />
            {erro}
          </div>
        ) : null}
      </div>

      {/* Footer · acções */}
      <footer className="flex items-center justify-between gap-3 border-t border-[var(--hair)] px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="flex items-center gap-3">
          <a
            href="/coach"
            onClick={onFechar}
            className="inline-flex items-center gap-1.5 text-faint text-[11.5px] hover:text-ouro"
          >
            <MessageCircle size={13} strokeWidth={1.4} />
            chat
          </a>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analisandoFoto || estado === 'a_pensar'}
            aria-label="foto da refeição"
            className="inline-flex items-center gap-1.5 text-faint text-[11.5px] hover:text-ouro disabled:opacity-40"
          >
            {analisandoFoto ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} strokeWidth={1.4} />}
            foto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFoto}
            className="hidden"
          />
        </div>
        {estado === 'a_ouvir' ? (
          <button
            onClick={pararEscuta}
            className="btn-primary px-5 py-2 text-[12px]"
          >
            enviar
            <ArrowRight size={13} strokeWidth={1.5} />
          </button>
        ) : estado === 'a_falar' ? (
          <button
            onClick={() => tts.parar()}
            className="btn-ghost px-4 py-2 text-[12px]"
          >
            <MicOff size={13} strokeWidth={1.5} /> parar
          </button>
        ) : (
          <button
            onClick={iniciarEscuta}
            className="btn-primary px-5 py-2 text-[12px]"
          >
            <Mic size={13} strokeWidth={1.5} /> falar
          </button>
        )}
      </footer>
    </div>
  )
}

function estadoLegivel(e: Estado): string {
  if (e === 'a_ouvir') return 'a ouvir...'
  if (e === 'a_pensar') return 'a pensar...'
  if (e === 'a_falar') return 'a falar'
  return 'pronto'
}
