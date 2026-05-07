'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
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
  sonoMedio
} from '@/lib/storage'
import { isoDate } from '@/lib/dates'

type Mensagem = { role: 'user' | 'assistant'; content: string }

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
  'Como estou esta semana?',
  'Porque acho que estou cansada?',
  'Devo treinar hoje?',
  'O que os meus padrões dizem sobre o álcool?',
  'Como me preparo para a fase lútea?'
]

function construirContexto(): string {
  const dias = getTodosDias()
  const ultimos7 = dias.slice(-7)
  const linhas: string[] = []

  linhas.push(`Hoje: ${isoDate()}`)
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

  return linhas.join('\n')
}

export default function CoachPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoAbertura, setCarregandoAbertura] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando])

  // Gerar abertura automática se ainda não houver para hoje
  useEffect(() => {
    const abertura = getAberturaHoje()
    if (abertura) {
      setMensagens([{ role: 'assistant', content: abertura.texto }])
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
            contexto: construirContexto()
          })
        })
        if (!cancelado && r.ok) {
          const json = await r.json()
          if (json.texto) {
            saveAberturaHoje(json.texto)
            setMensagens([{ role: 'assistant', content: json.texto }])
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
    const novasMsgs: Mensagem[] = [...mensagens, { role: 'user', content: texto.trim() }]
    setMensagens(novasMsgs)
    setInput('')
    setCarregando(true)

    try {
      const r = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mensagens: novasMsgs,
          contexto: construirContexto()
        })
      })
      const json = await r.json()
      if (!r.ok) {
        setErro(json.error ?? 'erro')
      } else {
        setMensagens(m => [...m, { role: 'assistant', content: json.texto }])
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
          fala com os teus dados
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          a coach lê tudo o que registaste · responde com base no que vê.
        </p>
      </header>

      {/* Abertura a carregar */}
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
            <span className="label-cap">começa por aqui</span>
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

      {/* Conversa */}
      <section className="space-y-3">
        {mensagens.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-tinta px-4 py-2.5 text-[14px] text-creme dark:bg-ouro dark:text-tinta'
                  : 'max-w-[85%] card-solid !p-4 font-serif text-[15px] leading-[1.55] tracking-editorial'
              }
            >
              {m.content}
            </div>
          </div>
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

      {/* Input */}
      <section className="sticky bottom-24 space-y-2">
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
            placeholder="responde · ou pergunta"
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[14px] focus:outline-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={() => enviar(input)}
            disabled={!input.trim() || carregando}
            aria-label="Enviar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tinta text-creme transition-elegant active:scale-95 disabled:opacity-30 dark:bg-ouro dark:text-tinta"
          >
            <Send size={14} strokeWidth={1.6} />
          </button>
        </div>
      </section>

      <p className="text-faint text-center text-[10px]">
        a coach vê os teus dados · pergunta-te · só nesta sessão
      </p>
    </div>
  )
}
