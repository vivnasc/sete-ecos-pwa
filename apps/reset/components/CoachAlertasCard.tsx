'use client'

// Alertas proactivos da coach · ela observa os dados e propõe coisas
// sem ser pedida. Aparecem como cards no Hoje.
//
// Heurísticas locais (sem chamar API):
// - Se há um objectivo peso e estás >0.3kg atrás do alvo de hoje → alerta
// - Se já passaram 3+ dias sem registar peso e tens objectivo de peso → lembra
// - Se proteína média 7d < 70% da meta → ajuste sugerido
// - Se há sintomas peri 3+ dias seguidos → propor ver padrão
// - Se há álcool 2+ dias e objectivo de reduzir → reflectir

import { useEffect, useState } from 'react'
import { TrendingDown, TrendingUp, AlertTriangle, MessageCircle, X } from 'lucide-react'
import { getObjectivos, type Objectivo } from '@/lib/profile'
import { calcularProgresso } from '@/lib/objectivos'
import { getPesos, getTodosDias, getRefeicoes, getAlcoolRegistos } from '@/lib/storage'
import { isoDate } from '@/lib/dates'

type Alerta = {
  id: string
  prioridade: 'alta' | 'media' | 'baixa'
  texto: string
  prompt: string  // o que enviar à coach se ela tocar
  icone: 'down' | 'up' | 'warn' | 'mind'
}

function gerarAlertas(): Alerta[] {
  const alertas: Alerta[] = []
  const objectivos = getObjectivos()
  const hoje = isoDate()

  // 1. Objectivos com tracking · detectar atraso ou falta de registos
  objectivos.forEach(o => {
    if (!o.tipo || o.tipo === 'custom' || o.valorInicial === undefined || o.valorAlvo === undefined) return
    const p = calcularProgresso(o)
    if (!p) return
    if (p.status === 'atrasada' && p.valorActual !== null && p.valorAlvoHoje !== null) {
      const querDescer = p.valorAlvoFinal !== null && p.valorInicial !== null && p.valorAlvoFinal < p.valorInicial
      const diff = querDescer ? (p.valorActual - p.valorAlvoHoje) : (p.valorAlvoHoje - p.valorActual)
      alertas.push({
        id: `atraso-${o.id}`,
        prioridade: 'alta',
        texto: `${o.tipo}: estás ${Math.abs(diff).toFixed(1)}${p.unidade} atrás do alvo · ainda dá. dia ${p.diasDecorridos}/${p.diasTotais}.`,
        prompt: `Olha o objectivo "${o.texto}". Estou em ${p.valorActual?.toFixed(1)}${p.unidade}, devia estar em ${p.valorAlvoHoje?.toFixed(1)}${p.unidade}. Diz-me o que ajustar concretamente nos próximos 3-5 dias.`,
        icone: 'warn'
      })
    }
    // Sem peso registado há 3+ dias se for objectivo peso
    if (o.tipo === 'peso') {
      const pesos = getPesos()
      const ult = pesos[pesos.length - 1]
      if (ult) {
        const diasSemPesar = Math.floor((Date.now() - new Date(ult.date).getTime()) / 86400000)
        if (diasSemPesar >= 3) {
          alertas.push({
            id: `pesar-${o.id}`,
            prioridade: 'media',
            texto: `há ${diasSemPesar} dias sem pesar · não vejo onde estás vs alvo`,
            prompt: 'Há dias que não me peso. Como afecta isso o tracking do meu objectivo de peso?',
            icone: 'warn'
          })
        }
      }
    }
  })

  // 2. Proteína baixa · 7 dias média < 80% da meta
  // (heurística leve · apenas alerta, não cálculo definitivo)
  const refs7d = getRefeicoes().filter(r => {
    const d = new Date(r.timestamp)
    const diasAtras = (Date.now() - d.getTime()) / 86400000
    return diasAtras <= 7 && r.proteinaG !== null
  })
  if (refs7d.length >= 5) {
    const porDia = new Map<string, number>()
    refs7d.forEach(r => {
      const d = r.timestamp.slice(0, 10)
      porDia.set(d, (porDia.get(d) ?? 0) + (r.proteinaG ?? 0))
    })
    const ndias = porDia.size
    const totalProt = [...porDia.values()].reduce((s, v) => s + v, 0)
    const med = ndias > 0 ? totalProt / ndias : 0
    // Sem meta definida · usa heurística 80g
    if (med < 70) {
      alertas.push({
        id: 'proteina-baixa',
        prioridade: 'media',
        texto: `proteína média 7d: ${Math.round(med)}g · abaixo do mínimo recomendado.`,
        prompt: 'A minha proteína média desta semana está baixa. Onde devo ajustar nas refeições para subir sem mexer muito no resto?',
        icone: 'down'
      })
    }
  }

  // 3. Sintomas peri seguidos
  const dias14 = getTodosDias().slice(-14)
  const sintomasSeguidos = (() => {
    let max = 0, atual = 0
    for (const d of dias14) {
      if (d.sintomasPeri && d.sintomasPeri.length > 0) atual++
      else { max = Math.max(max, atual); atual = 0 }
    }
    return Math.max(max, atual)
  })()
  if (sintomasSeguidos >= 3) {
    alertas.push({
      id: 'sintomas-3d',
      prioridade: 'media',
      texto: `${sintomasSeguidos} dias seguidos com sintomas · queres ver padrão?`,
      prompt: 'Tenho sintomas peri há vários dias seguidos. Olha às correlações com sono, álcool e fase do ciclo. O que vês?',
      icone: 'mind'
    })
  }

  // 4. Álcool · 2+ vezes nos últimos 7 dias
  const al7d = getAlcoolRegistos().filter(a => {
    const d = (Date.now() - new Date(a.timestamp).getTime()) / 86400000
    return d <= 7 && a.decidiuBeber
  })
  const objectivoAlcool = objectivos.some(o => o.tipo === 'alcool' || /álcool|alcool/i.test(o.texto))
  if (al7d.length >= 2 && objectivoAlcool) {
    alertas.push({
      id: 'alcool-2x',
      prioridade: 'baixa',
      texto: `álcool ${al7d.length}× nesta semana · objectivo era reduzir`,
      prompt: 'Tive álcool várias vezes esta semana. Olha aos gatilhos que registei e diz-me o padrão.',
      icone: 'mind'
    })
  }

  // 5. Sem nenhum objectivo guardado · sugere capturar
  if (objectivos.length === 0) {
    alertas.push({
      id: 'sem-objectivos',
      prioridade: 'media',
      texto: 'sem objectivos · sem track · qual é o teu alvo nos próximos 60 dias?',
      prompt: 'Quero definir o meu plano. Pergunta-me o que importa, peso, sono, energia, álcool. Captura tudo como objectivos com números e prazos.',
      icone: 'mind'
    })
  }

  // Ordenar por prioridade
  const ordem = { alta: 0, media: 1, baixa: 2 }
  return alertas.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade]).slice(0, 3)
}

const DISMISS_KEY = 'fenixfit:alertas-dismissed'

function getDismissed(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '{}') } catch { return {} }
}

export default function CoachAlertasCard() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [dismissed, setDismissed] = useState<Record<string, string>>({})

  useEffect(() => {
    const refresh = () => {
      setAlertas(gerarAlertas())
      setDismissed(getDismissed())
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    window.addEventListener('fenixfit:profile', refresh)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      window.removeEventListener('fenixfit:profile', refresh)
    }
  }, [])

  const hoje = isoDate()
  const visiveis = alertas.filter(a => dismissed[a.id] !== hoje)

  if (visiveis.length === 0) return null

  const dispensar = (id: string) => {
    const novo = { ...dismissed, [id]: hoje }
    localStorage.setItem(DISMISS_KEY, JSON.stringify(novo))
    setDismissed(novo)
  }

  const abrirComPrompt = (a: Alerta) => {
    sessionStorage.setItem('fenixfit:coach-prompt-pending', a.prompt)
    window.location.href = '/coach'
  }

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <span className="label-cap">a coach nota</span>
        <span className="text-faint text-[10px]">{visiveis.length} {visiveis.length === 1 ? 'sinal' : 'sinais'}</span>
      </div>
      <div className="space-y-2">
        {visiveis.map(a => (
          <div
            key={a.id}
            className={`card-solid !p-3 flex items-start gap-2.5 ${
              a.prioridade === 'alta' ? 'border-l-2 border-terracota' : a.prioridade === 'media' ? 'border-l-2 border-ouro' : 'border-l-2 border-[var(--hair-strong)]'
            }`}
          >
            <span className={`shrink-0 mt-0.5 ${a.prioridade === 'alta' ? 'text-terracota' : 'text-ouro'}`}>
              {a.icone === 'down' ? <TrendingDown size={13} strokeWidth={1.5} /> :
               a.icone === 'up' ? <TrendingUp size={13} strokeWidth={1.5} /> :
               a.icone === 'warn' ? <AlertTriangle size={13} strokeWidth={1.5} /> :
               <MessageCircle size={13} strokeWidth={1.5} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[13.5px] leading-[1.45] italic">{a.texto}</p>
              <button
                onClick={() => abrirComPrompt(a)}
                className="text-[10.5px] text-ouro hover:underline mt-1.5 inline-flex items-center gap-1"
              >
                falar com a coach →
              </button>
            </div>
            <button
              onClick={() => dispensar(a.id)}
              aria-label="dispensar"
              className="shrink-0 p-0.5 text-faint hover:text-soft active:scale-90"
            >
              <X size={11} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
