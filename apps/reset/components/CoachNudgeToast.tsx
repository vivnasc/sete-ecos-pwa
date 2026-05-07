'use client'

// Toast proactivo · quando registas algo (peso, refeição, água, etc), a coach
// puxa uma observação curta com previsão/insight/ajuste e mostra no topo.
// Auto-dismiss 12s · debounce 90s entre toasts · não dispara quando já estás em /coach.

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, ArrowRight } from 'lucide-react'
import { construirContexto } from '@/lib/coachContext'
import { saveCoachMensagem } from '@/lib/storage'

const COOLDOWN_MS = 90 * 1000

const PROMPT_POR_AREA: Record<string, string> = {
  peso: 'Acabei de pesar-me. Olha para a tendência (média móvel, variação semanal/total) e dá-me 1 observação concreta + 1 previsão para a semana + 1 ajuste se fizer sentido. 4 frases máximo. Sem floreios.',
  refeicao: 'Acabei de registar uma refeição. Olha para os macros do dia vs alvo e o padrão da semana. Diz-me onde estou + 1 ajuste accionável para a próxima refeição. 3-4 frases.',
  agua: 'Adicionei água. Curto: olha para o ritmo de hidratação hoje vs ontem. 2 frases.',
  alcool: 'Registei algo no caderno do copo. Sê espelho · referencia o gatilho/emoção e o que vês de padrão. 3 frases.',
  jejum: 'Marquei jejum. Comenta a duração face às últimas e o que vês. 2-3 frases.',
  ancora: 'Marquei uma âncora. Comenta a constância da semana, sem julgamento. 2 frases.',
  suplemento: 'Marquei suplemento. Comenta padrão de regularidade nos últimos 14 dias. 2 frases.',
  sono: 'Registei sono. Olha para a média 7d, qualidade, vezes que acordou. 1 observação + 1 previsão de impacto na energia/humor de hoje. 3 frases.',
  ciclo: 'Registei algo do ciclo. Olha para a fase actual e o que tipicamente vês nessa fase nos meus dados. 2-3 frases.',
  sintoma_peri: 'Marquei um sintoma peri. Curto: o que correlaciona nos últimos dias (álcool, sono, fase ciclo)? 2-3 frases.',
  generico: 'Acabei de registar algo novo. Vê o que mudou e dá-me uma observação curta com previsão ou ajuste. 2-3 frases.'
}

function inferirArea(key: string | undefined): string {
  if (!key) return 'generico'
  if (key === 'peso') return 'peso'
  if (key === 'refeicoes' || key === 'foto-refeicao') return 'refeicao'
  if (key === 'alcool') return 'alcool'
  if (key === 'jejum') return 'jejum'
  if (key === 'ciclo') return 'ciclo'
  if (key === 'dias') return 'generico' // pode ser água, suplemento, sono, âncora · mais difícil distinguir
  if (key === 'coach-tool') return 'generico' // já está no chat coach, não precisa
  return 'generico'
}

export default function CoachNudgeToast() {
  const path = usePathname() ?? '/'
  const [texto, setTexto] = useState<string | null>(null)
  const [aCarregar, setACarregar] = useState(false)
  const [visivel, setVisivel] = useState(false)
  const ultimoToastRef = useRef<number>(0)
  const dismissTimerRef = useRef<number | null>(null)
  const ultimoFingerprintRef = useRef<{ peso: number; refeicoes: number; alcool: number; jejum: number; dias: number; ciclo: number }>({ peso: 0, refeicoes: 0, alcool: 0, jejum: 0, dias: 0, ciclo: 0 })

  // Não dispara em /coach (já vês a coach a falar lá)
  const desligado = path.startsWith('/coach') || path.startsWith('/login') || path.startsWith('/onboarding') || path.startsWith('/limpar')

  useEffect(() => {
    if (desligado) return

    // Inicializa fingerprint com o que já existe (para não disparar no mount)
    try {
      ultimoFingerprintRef.current = {
        peso: JSON.parse(localStorage.getItem('fenixfit:peso') ?? '[]').length,
        refeicoes: JSON.parse(localStorage.getItem('fenixfit:refeicoes') ?? '[]').length,
        alcool: JSON.parse(localStorage.getItem('fenixfit:alcool') ?? '[]').length,
        jejum: JSON.parse(localStorage.getItem('fenixfit:jejum') ?? '[]').length,
        dias: Object.keys(JSON.parse(localStorage.getItem('fenixfit:dias') ?? '{}')).length,
        ciclo: JSON.parse(localStorage.getItem('fenixfit:ciclo') ?? '[]').length
      }
    } catch {}

    const onStorage = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined
      const key = detail?.key
      const area = inferirArea(key)
      // Skip generic 'all' clears, profile changes, internal coach tool
      if (key === 'all' || key === 'coach-chat' || key === 'coach-tool' || key === 'profile' || key === 'insights') return

      const agora = Date.now()
      if (agora - ultimoToastRef.current < COOLDOWN_MS) return
      if (aCarregar) return

      // Verifica se houve realmente novo registo (ignora updates)
      const novo = (() => {
        try {
          const fp = {
            peso: JSON.parse(localStorage.getItem('fenixfit:peso') ?? '[]').length,
            refeicoes: JSON.parse(localStorage.getItem('fenixfit:refeicoes') ?? '[]').length,
            alcool: JSON.parse(localStorage.getItem('fenixfit:alcool') ?? '[]').length,
            jejum: JSON.parse(localStorage.getItem('fenixfit:jejum') ?? '[]').length,
            dias: Object.keys(JSON.parse(localStorage.getItem('fenixfit:dias') ?? '{}')).length,
            ciclo: JSON.parse(localStorage.getItem('fenixfit:ciclo') ?? '[]').length
          }
          const houveNovo =
            fp.peso > ultimoFingerprintRef.current.peso ||
            fp.refeicoes > ultimoFingerprintRef.current.refeicoes ||
            fp.alcool > ultimoFingerprintRef.current.alcool ||
            fp.jejum > ultimoFingerprintRef.current.jejum ||
            fp.ciclo > ultimoFingerprintRef.current.ciclo ||
            // Para 'dias', também aceita se key === 'dias' (mudança intra-dia conta)
            (key === 'dias')
          ultimoFingerprintRef.current = fp
          return houveNovo
        } catch { return false }
      })()
      if (!novo) return

      ultimoToastRef.current = agora
      setACarregar(true)
      setTexto(null)
      setVisivel(true)

      try {
        const r = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mensagens: [{ role: 'user', content: PROMPT_POR_AREA[area] ?? PROMPT_POR_AREA.generico }],
            contexto: construirContexto(),
            tools_enabled: false
          })
        })
        const json = await r.json()
        if (r.ok && json.texto) {
          setTexto(json.texto)
          saveCoachMensagem('user', `[auto] ${PROMPT_POR_AREA[area].slice(0, 60)}...`)
          saveCoachMensagem('assistant', json.texto)
          // auto-dismiss em 12s
          if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current)
          dismissTimerRef.current = window.setTimeout(() => setVisivel(false), 12000)
        } else {
          setVisivel(false)
        }
      } catch {
        setVisivel(false)
      }
      setACarregar(false)
    }

    window.addEventListener('fenixfit:storage', onStorage as EventListener)
    return () => {
      window.removeEventListener('fenixfit:storage', onStorage as EventListener)
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desligado])

  if (desligado || !visivel) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[55] px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pointer-events-none">
      <div className="container-app">
        <div className="card-feature pointer-events-auto animate-slide-down shadow-ink">
          <div className="flex items-start gap-2.5">
            <MessageCircle size={14} strokeWidth={1.4} className="text-ouro mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="label-cap text-ouro">a coach</p>
              {aCarregar ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" />
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.3s' }} />
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.6s' }} />
                </div>
              ) : (
                <p className="font-serif text-[14.5px] leading-[1.5] mt-1.5 italic">{texto}</p>
              )}
            </div>
            <button
              onClick={() => setVisivel(false)}
              aria-label="dispensar"
              className="shrink-0 p-0.5 text-faint hover:text-soft active:scale-90"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
          {!aCarregar && texto ? (
            <div className="flex items-center justify-end mt-2">
              <a href="/coach" className="text-[10.5px] text-ouro hover:underline inline-flex items-center gap-1">
                continuar conversa <ArrowRight size={11} strokeWidth={1.5} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
