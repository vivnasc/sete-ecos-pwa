'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, CheckCircle2, AlertCircle, Mic, MicOff, Camera, Loader2 } from 'lucide-react'
import BackButton from '@/components/BackButton'
import VoiceModeOverlay from '@/components/VoiceModeOverlay'
import {
  getCoachMensagens,
  saveCoachMensagem,
  addRefeicao
} from '@/lib/storage'
import { isoDate } from '@/lib/dates'
import { executeTool } from '@/lib/coachTools'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import { construirContexto } from '@/lib/coachContext'
import { analisarFotoRefeicao } from '@/lib/fotoRefeicao'

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; ok?: boolean; toolName?: string }

type Mensagem = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

const ABERTURA_KEY = 'fenixfit:coach-abertura'

function getAberturaHoje(): { date: string; texto: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ABERTURA_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.date === isoDate() ? data : null
  } catch {
    return null
  }
}

function saveAberturaHoje(texto: string): void {
  localStorage.setItem(ABERTURA_KEY, JSON.stringify({ date: isoDate(), texto }))
}

const SUGESTOES_INICIAIS = [
  'pesei 72.4 hoje',
  'comi 3 ovos com abacate ao pequeno-almoço',
  'estou em pré com vontade de beber',
  'dormi 5h, a Cris acordou 3 vezes',
  'como estou esta semana?'
]

const TOOL_LABELS: Record<string, string> = {
  registar_peso: 'peso registado',
  registar_refeicao: 'refeição registada',
  registar_alcool: 'caderno do copo',
  registar_dia: 'dia actualizado',
  registar_jejum: 'jejum registado',
  registar_ciclo: 'ciclo registado',
  registar_agua: 'água registada',
  registar_suplemento: 'suplemento registado',
  registar_transito: 'trânsito registado',
  registar_sono_detalhe: 'sono registado',
  registar_sintoma_peri: 'sintoma registado',
  registar_steps: 'passos registados',
  registar_rhr: 'RHR registado',
  marcar_ancora: 'âncora marcada',
  definir_metas: 'metas ajustadas',
  sugerir_metas: 'a calcular sugestão',
  analisar_padroes: 'a analisar padrões',
  gerar_lista_compras: 'lista de compras',
  consultar_dados: 'a consultar dados'
}


const MAX_TOOL_TURNS = 6

export default function CoachPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoAbertura, setCarregandoAbertura] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [vozAberta, setVozAberta] = useState(false)
  const [analisandoFoto, setAnalisandoFoto] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const voz = useSpeechRecognition({
    lang: 'pt-PT',
    onFim: (texto) => setInput(prev => (prev ? prev + ' ' : '') + texto)
  })

  // Enquanto está a ouvir, mostra parcial no input
  useEffect(() => {
    if (voz.ouvir && voz.parcial) {
      // não escreve directamente para não interferir com o que o utilizador já tem
      // o parcial é mostrado abaixo do input em separado
    }
  }, [voz.parcial, voz.ouvir])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando])

  useEffect(() => {
    const historico = getCoachMensagens(100).map(m => ({ role: m.role, content: m.content as string | ContentBlock[] }))
    if (historico.length > 0) {
      setMensagens(historico)
    }

    const abertura = getAberturaHoje()
    if (abertura && historico.length > 0) {
      setCarregandoAbertura(false)
      return
    }
    if (abertura && historico.length === 0) {
      const m = { role: 'assistant' as const, content: abertura.texto }
      setMensagens([m])
      saveCoachMensagem('assistant', abertura.texto)
      setCarregandoAbertura(false)
      return
    }

    let cancelado = false
    const gerarAbertura = async () => {
      try {
        const r = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            abertura: true,
            contexto: construirContexto(true),
            historico: historico.slice(-20).map(m => ({
              role: m.role,
              content: typeof m.content === 'string' ? m.content : extractText(m.content)
            }))
          })
        })
        if (!cancelado && r.ok) {
          const json = await r.json()
          if (json.texto) {
            saveAberturaHoje(json.texto)
            saveCoachMensagem('assistant', json.texto)
            setMensagens(prev => [...prev, { role: 'assistant', content: json.texto }])
          }
        }
      } catch {}
      if (!cancelado) setCarregandoAbertura(false)
    }
    gerarAbertura()
    return () => { cancelado = true }
  }, [])

  const onFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setErro(null)
    setAnalisandoFoto(true)
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
      if (r.proteinaG !== null) macroParts.push(`${Math.round(r.proteinaG)}g P`)
      if (r.carboG !== null) macroParts.push(`${Math.round(r.carboG)}g C`)
      if (r.gorduraG !== null) macroParts.push(`${Math.round(r.gorduraG)}g G`)
      if (r.calorias !== null) macroParts.push(`${r.calorias} kcal`)
      const userTxt = `[foto] ${r.descricao}`
      const respTxt = `${tipoLeg} registado · ${r.descricao}. estimei ${macroParts.join(' · ')}.${r.observacao ? ' ' + r.observacao : ''}`
      saveCoachMensagem('user', userTxt)
      saveCoachMensagem('assistant', respTxt)
      setMensagens(prev => [...prev, { role: 'user', content: userTxt }, { role: 'assistant', content: respTxt }])
      window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key: 'foto-refeicao' } }))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'erro a analisar foto')
    }
    setAnalisandoFoto(false)
  }

  const enviar = async (texto: string) => {
    if (!texto.trim() || carregando) return
    setErro(null)
    const userMsg = texto.trim()
    saveCoachMensagem('user', userMsg)

    // Conversa local · começa com toda a história + nova mensagem do utilizador
    const conv: Mensagem[] = [...mensagens, { role: 'user', content: userMsg }]
    setMensagens(conv)
    setInput('')
    setCarregando(true)

    try {
      const conversaActual = [...conv]
      let turnos = 0
      while (turnos < MAX_TOOL_TURNS) {
        turnos++
        const r = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mensagens: sanitizarMensagens(conversaActual.slice(-30)),
            contexto: construirContexto(),
            tools_enabled: true
          })
        })
        const json = await r.json()
        if (!r.ok) {
          setErro(json.error ?? 'erro')
          break
        }
        const content: ContentBlock[] = json.content ?? []
        const stopReason: string = json.stop_reason ?? 'end_turn'

        // Adiciona resposta da coach (com possíveis tool_use)
        conversaActual.push({ role: 'assistant', content })
        setMensagens([...conversaActual])

        if (stopReason !== 'tool_use') {
          // Conversa terminou · guarda texto final no histórico persistente
          const finalText = extractText(content)
          if (finalText) saveCoachMensagem('assistant', finalText)
          break
        }

        // Executa tools no cliente
        const toolUses = content.filter((b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use')
        const toolResults: ContentBlock[] = toolUses.map(tu => {
          const res = executeTool(tu.name, tu.input)
          return {
            type: 'tool_result',
            tool_use_id: tu.id,
            content: res.ok ? res.texto : `erro: ${res.erro}`,
            ok: res.ok,
            toolName: tu.name
          }
        })
        conversaActual.push({ role: 'user', content: toolResults })
        setMensagens([...conversaActual])
        // Notifica outras vistas para recarregarem (pesos, jejuns, etc)
        window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key: 'coach-tool' } }))
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro de rede')
    }
    setCarregando(false)
  }

  const semMensagens = mensagens.length === 0 && !carregandoAbertura

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <p className="label-soft">coach</p>
          <button
            onClick={() => setVozAberta(true)}
            aria-label="modo voz"
            className="inline-flex items-center gap-1.5 rounded-full bg-ouro/10 px-3 py-1.5 text-[11px] text-ouro transition-elegant active:scale-95"
          >
            <Mic size={12} strokeWidth={1.6} />
            modo voz
          </button>
        </div>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          fala · ela regista
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          diz-lhe o que comeste · pesaste · sentiste. ela escreve por ti.
        </p>
      </header>
      <VoiceModeOverlay aberto={vozAberta} onFechar={() => setVozAberta(false)} />

      {carregandoAbertura ? (
        <div className="card-feature flex items-center justify-center gap-2 py-6">
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" />
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.3s' }} />
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.6s' }} />
          <span className="ml-3 label-soft">a coach está a olhar para os teus dados</span>
        </div>
      ) : null}

      {semMensagens ? (
        <section className="card-feature space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.4} className="text-ouro" />
            <span className="label-cap">tenta dizer</span>
          </div>
          <ul className="space-y-2">
            {SUGESTOES_INICIAIS.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => enviar(s)}
                  disabled={carregando}
                  className="w-full rounded-md p-3 text-left text-[13.5px] leading-relaxed transition-elegant hover:bg-[var(--surface-soft)] shadow-hair"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        {mensagens.map((m, i) => (
          <MensagemBubble key={i} mensagem={m} />
        ))}
        {carregando ? (
          <div className="flex justify-start">
            <div className="card-solid !p-4 flex gap-1">
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" />
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.3s' }} />
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        ) : null}
        <div ref={fimRef} />
      </section>

      {erro ? <div className="rounded-lg bg-terracota/10 p-3 text-[12px] text-terracota">{erro}</div> : null}

      <section className="sticky bottom-24 space-y-2">
        {voz.ouvir && voz.parcial ? (
          <div className="card-solid !p-2.5 text-[12.5px] italic text-soft">
            {voz.parcial}
            <span className="ml-1 inline-block h-3 w-px animate-pulse bg-ouro align-middle" />
          </div>
        ) : null}
        {voz.erro ? (
          <p className="text-faint text-center text-[10.5px] text-terracota">{voz.erro}</p>
        ) : null}
        <div className="card-solid flex items-end gap-2 !p-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar(input)
              }
            }}
            placeholder={voz.ouvir ? 'a ouvir...' : 'o que comeste · pesaste · sentiste'}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[14px] focus:outline-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={() => fotoInputRef.current?.click()}
            disabled={carregando || analisandoFoto}
            aria-label="Foto da refeição"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-soft transition-elegant active:scale-95 hover:text-ouro disabled:opacity-30"
          >
            {analisandoFoto ? <Loader2 size={14} strokeWidth={1.6} className="animate-spin" /> : <Camera size={14} strokeWidth={1.6} />}
          </button>
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFoto}
            className="hidden"
          />
          {voz.suportado ? (
            <button
              onClick={() => voz.ouvir ? voz.parar() : voz.iniciar()}
              disabled={carregando}
              aria-label={voz.ouvir ? 'Parar voz' : 'Falar'}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-elegant active:scale-95 disabled:opacity-30 ${
                voz.ouvir
                  ? 'bg-ouro text-creme animate-pulse dark:text-tinta'
                  : 'bg-[var(--surface-soft)] text-soft hover:text-tinta dark:hover:text-creme'
              }`}
            >
              {voz.ouvir ? <MicOff size={14} strokeWidth={1.6} /> : <Mic size={14} strokeWidth={1.6} />}
            </button>
          ) : null}
          <button
            onClick={() => { if (voz.ouvir) voz.parar(); enviar(input) }}
            disabled={!input.trim() || carregando}
            aria-label="Enviar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tinta text-creme transition-elegant active:scale-95 disabled:opacity-30 dark:bg-ouro dark:text-tinta"
          >
            <Send size={14} strokeWidth={1.6} />
          </button>
        </div>
      </section>

      <p className="text-faint text-center text-[10px]">
        a coach vê os teus dados · regista por ti · só nesta sessão
      </p>
    </div>
  )
}

function MensagemBubble({ mensagem }: { mensagem: Mensagem }) {
  const { role, content } = mensagem

  // Mensagem do utilizador (texto puro)
  if (role === 'user' && typeof content === 'string') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-tinta px-4 py-2.5 text-[14px] text-creme dark:bg-ouro dark:text-tinta">
          {content}
        </div>
      </div>
    )
  }

  // Mensagem do utilizador com tool_results (esconde · só mostra chips de confirmação)
  if (role === 'user' && Array.isArray(content)) {
    const results = content.filter((b): b is Extract<ContentBlock, { type: 'tool_result' }> => b.type === 'tool_result')
    if (results.length === 0) return null
    return (
      <div className="flex flex-wrap justify-start gap-1.5 pl-1">
        {results.map((r, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${
              r.ok === false
                ? 'bg-terracota/10 text-terracota'
                : 'bg-ouro/10 text-ouro'
            }`}
          >
            {r.ok === false ? <AlertCircle size={11} strokeWidth={1.6} /> : <CheckCircle2 size={11} strokeWidth={1.6} />}
            {r.toolName ? TOOL_LABELS[r.toolName] ?? r.toolName : 'registado'}
          </span>
        ))}
      </div>
    )
  }

  // Mensagem do assistant
  if (role === 'assistant') {
    if (typeof content === 'string') {
      if (!content.trim()) return null
      return (
        <div className="flex justify-start">
          <div className="max-w-[85%] card-solid !p-4 font-serif text-[15px] leading-[1.55] tracking-editorial">
            {content}
          </div>
        </div>
      )
    }
    // Array · tem text e/ou tool_use
    const textBlocks = content.filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text' && b.text.trim().length > 0)
    const toolUses = content.filter((b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use')
    return (
      <div className="space-y-1.5">
        {textBlocks.map((b, i) => (
          <div key={'t' + i} className="flex justify-start">
            <div className="max-w-[85%] card-solid !p-4 font-serif text-[15px] leading-[1.55] tracking-editorial">
              {b.text}
            </div>
          </div>
        ))}
        {toolUses.length > 0 ? (
          <div className="flex flex-wrap justify-start gap-1.5 pl-1">
            {toolUses.map(tu => (
              <span key={tu.id} className="inline-flex items-center gap-1 rounded-full bg-ouro/5 px-2.5 py-1 text-[11px] text-soft">
                <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" />
                {TOOL_LABELS[tu.name] ?? tu.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
  return null
}

function extractText(content: string | ContentBlock[]): string {
  if (typeof content === 'string') return content
  return content
    .filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()
}

// Remove campos UI-only (ok, toolName) dos tool_results antes de enviar à API.
// A API Anthropic rejeita campos extra com 400 invalid_request_error.
function sanitizarMensagens(mensagens: Mensagem[]): Mensagem[] {
  return mensagens.map(m => {
    if (typeof m.content === 'string') return m
    const limpos = m.content.map(b => {
      if (b.type === 'tool_result') {
        return { type: 'tool_result' as const, tool_use_id: b.tool_use_id, content: b.content }
      }
      if (b.type === 'tool_use') {
        return { type: 'tool_use' as const, id: b.id, name: b.name, input: b.input }
      }
      return { type: 'text' as const, text: b.text }
    })
    return { role: m.role, content: limpos }
  })
}
