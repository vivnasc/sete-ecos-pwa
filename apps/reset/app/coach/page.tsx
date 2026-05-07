'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, CheckCircle2, AlertCircle, Mic, MicOff } from 'lucide-react'
import { ANCORAS } from '@/lib/data'
import BackButton from '@/components/BackButton'
import {
  getTodosDias,
  getAlcoolRegistos,
  getJejuns,
  getCiclos,
  getMedidas,
  faseActualCiclo,
  diaActualCiclo,
  nomeFase,
  pesoUltimo,
  variacaoPeso,
  streakAncoras,
  diasSemAlcool,
  sonoMedio,
  getCoachMensagens,
  saveCoachMensagem,
  getRefeicoesDoDia,
  macrosDoDia
} from '@/lib/storage'
import { isoDate } from '@/lib/dates'
import { executeTool } from '@/lib/coachTools'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import { getProfile } from '@/lib/profile'

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
  consultar_dados: 'a consultar dados'
}

function construirContexto(comAnalise = false): string {
  const dias = getTodosDias()
  const ultimos7 = dias.slice(-7)
  const linhas: string[] = []

  linhas.push(`Hoje: ${isoDate()}`)
  const profile = getProfile()
  if (profile.metas.calorias !== null || profile.metas.proteinaG !== null) {
    const m = profile.metas
    linhas.push(`Metas: ${m.calorias ?? '—'} kcal · ${m.proteinaG ?? '—'}g P · ${m.carboG ?? '—'}g C · ${m.gorduraG ?? '—'}g G`)
  } else {
    linhas.push('Metas: ainda não definidas (podes propor calcular sugestão)')
  }
  const dia = diaActualCiclo()
  const fase = faseActualCiclo()
  if (dia !== null && fase !== null) linhas.push(`Ciclo: dia ${dia}, fase ${nomeFase(fase)}`)

  const peso = pesoUltimo()
  if (peso !== null) {
    const v = variacaoPeso()
    linhas.push(`Peso actual: ${peso}kg · semana: ${v.semana ?? '?'}kg · total: ${v.total ?? '?'}kg`)
  }

  linhas.push(`Streak âncoras: ${streakAncoras()} dias`)
  linhas.push(`Dias sem álcool: ${diasSemAlcool()}`)
  const sm = sonoMedio()
  if (sm !== null) linhas.push(`Sono médio 7d: ${sm}h`)

  const m = macrosDoDia()
  linhas.push(`Refeições hoje: ${m.refeicoes}× · ${Math.round(m.proteina)}g P · ${Math.round(m.carbo)}g C · ${Math.round(m.gordura)}g G`)

  // Corpo · água, suplementos, trânsito, sono detalhe, sintomas peri
  const diaHoje = ultimos7[ultimos7.length - 1]
  if (diaHoje) {
    linhas.push(`Água hoje: ${diaHoje.aguaCopos}/8 copos`)
    if (diaHoje.suplementos.length > 0) linhas.push(`Suplementos: ${diaHoje.suplementos.join(', ')}`)
    if (diaHoje.transitoIntestinal !== null) linhas.push(`Trânsito: ${diaHoje.transitoIntestinal}`)
    if (diaHoje.horaDeitar || diaHoje.qualidadeSono !== null || diaHoje.acordouVezes !== null) {
      const partes: string[] = []
      if (diaHoje.horaDeitar) partes.push(`deitou ${diaHoje.horaDeitar}`)
      if (diaHoje.qualidadeSono !== null) partes.push(`qualidade ${diaHoje.qualidadeSono}/5`)
      if (diaHoje.acordouVezes !== null) partes.push(`acordou ${diaHoje.acordouVezes}×`)
      linhas.push(`Sono detalhe: ${partes.join(' · ')}`)
    }
    if (diaHoje.sintomasPeri.length > 0) linhas.push(`Sintomas peri hoje: ${diaHoje.sintomasPeri.join(', ')}`)
    if (diaHoje.steps !== null) linhas.push(`Passos: ${diaHoje.steps}`)
    if (diaHoje.rhr !== null) linhas.push(`RHR: ${diaHoje.rhr} bpm`)
  }

  const refHoje = getRefeicoesDoDia()
  if (refHoje.length > 0) {
    linhas.push('REFEIÇÕES HOJE:')
    refHoje.forEach(r => {
      linhas.push(`· ${r.timestamp.slice(11, 16)} ${r.tipo}: ${r.descricao.slice(0, 80)}`)
    })
  }

  if (ultimos7.length > 0) {
    linhas.push('')
    linhas.push('ÚLTIMOS 7 DIAS:')
    ultimos7.forEach(d => {
      const a = ANCORAS.filter(x => d.ancoras[x.id]).length
      const partes = [
        `${d.date}: âncoras ${a}/7`,
        d.sonoHoras !== null ? `sono ${d.sonoHoras}h` : '',
        d.energia !== null ? `energia ${d.energia}/5` : '',
        d.humor !== null ? `humor ${d.humor}/5` : ''
      ].filter(Boolean)
      linhas.push('· ' + partes.join(' · '))
      if (d.notas) linhas.push(`  notas: ${d.notas.slice(0, 150)}`)
    })
  }

  const alcool = getAlcoolRegistos().slice(0, 10)
  if (alcool.length > 0) {
    linhas.push('')
    linhas.push('ÁLCOOL · últimos 10 registos:')
    alcool.forEach(a => {
      linhas.push(`· ${a.timestamp.slice(0, 10)} ${a.timestamp.slice(11, 16)} · ${a.decidiuBeber ? `${a.unidades}u` : 'não'} · ${a.emocao}${a.gatilho ? ` · "${a.gatilho.slice(0, 80)}"` : ''}`)
    })
  }

  const jejuns = getJejuns().slice(-7)
  if (jejuns.length > 0) {
    linhas.push('')
    linhas.push('JEJUM · últimos 7 dias:')
    jejuns.forEach(j => {
      linhas.push(`· ${j.date}: ${j.duracaoHoras ? j.duracaoHoras + 'h' : 'em curso'}${j.completou ? ' ✓' : ''}`)
    })
  }

  const ciclos = getCiclos().slice(-3)
  if (ciclos.length > 0) {
    linhas.push('')
    linhas.push('CICLO · últimos 3 períodos:')
    ciclos.forEach(c => {
      linhas.push(`· ${c.dataInicio}${c.duracaoCiclo ? ` (${c.duracaoCiclo}d)` : ''} · sintomas: ${c.sintomas.join(', ') || 'nenhum'}${c.cravings.length ? ` · cravings: ${c.cravings.join(', ')}` : ''}`)
    })
  }

  const medidas = getMedidas().slice(-3)
  if (medidas.length > 0) {
    linhas.push('')
    linhas.push('MEDIDAS · últimas 3:')
    medidas.forEach(m => {
      linhas.push(`· ${m.date}: cintura ${m.cintura ?? '?'}cm${m.peso ? `, peso ${m.peso}kg` : ''}`)
    })
  }

  if (comAnalise) {
    const r = executeTool('analisar_padroes', { area: 'tudo', dias: 14 })
    if (r.ok) {
      linhas.push('')
      linhas.push('ANÁLISE 14 DIAS:')
      linhas.push(r.texto)
    }
  }

  return linhas.join('\n')
}

const MAX_TOOL_TURNS = 6

export default function CoachPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoAbertura, setCarregandoAbertura] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

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
            mensagens: conversaActual.slice(-30),
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
        <p className="label-soft">coach</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          fala · ela regista
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          diz-lhe o que comeste · pesaste · sentiste. ela escreve por ti.
        </p>
      </header>

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
