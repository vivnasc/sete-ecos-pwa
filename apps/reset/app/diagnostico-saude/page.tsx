'use client'

// Diagnóstico da sincronização automática · mostra os últimos payloads
// recebidos do Auto Health Export, métricas detectadas, e o que ficou
// no Supabase. Útil para a Vivianne perceber o que está a vir vs faltar.

import { useEffect, useState } from 'react'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import BackButton from '@/components/BackButton'
import { getSupabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

type LogEntry = {
  id: string
  recebido_em: string
  total_entradas: number
  detalhe: { passos: number; sono: number; rhr: number; treinos: number }
  resumo: Array<{ date: string; steps?: number; sonoHoras?: number; rhr?: number; treino?: boolean; treinoTipo?: string }>
  metricas_brutas: Array<{ nome: string; n: number }>
}

export default function DiagnosticoSaudePage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const refresh = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const sb = getSupabase()
      if (!sb) { setErro('sem ligação Supabase'); setCarregando(false); return }
      const user = await getUser()
      if (!user) { setErro('sessão expirou · faz login'); setCarregando(false); return }
      const { data, error } = await sb
        .from('fenixfit_saude_log')
        .select('*')
        .eq('user_id', user.id)
        .order('recebido_em', { ascending: false })
        .limit(10)
      if (error) { setErro(error.message); setCarregando(false); return }
      setLogs(data ?? [])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro')
    }
    setCarregando(false)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">diagnóstico</p>
        <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-editorial sm:text-[42px]">
          sincronização saúde
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          últimos envios recebidos do Auto Health Export · 10 mais recentes
        </p>
      </header>

      <button
        onClick={refresh}
        disabled={carregando}
        className="btn-outline w-full inline-flex items-center justify-center gap-2"
      >
        <RefreshCw size={13} strokeWidth={1.5} className={carregando ? 'animate-spin' : ''} />
        refrescar
      </button>

      {erro ? (
        <div className="card !bg-terracota/10 !p-3 text-[12px] text-terracota flex items-start gap-2">
          <AlertCircle size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <span>{erro}</span>
        </div>
      ) : null}

      {logs.length === 0 && !carregando && !erro ? (
        <div className="card-solid text-center text-soft text-[13px] py-8">
          ainda sem envios automáticos · configura Auto Health Export
        </div>
      ) : null}

      <ul className="space-y-3">
        {logs.map(log => (
          <li key={log.id} className="card-solid space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-[14px] tnum">
                {new Date(log.recebido_em).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-faint text-[11px] tnum">{log.total_entradas} entradas</span>
            </div>

            {/* Detecções */}
            <div className="grid grid-cols-4 gap-1 text-center">
              <Detect label="passos" n={log.detalhe?.passos ?? 0} />
              <Detect label="sono" n={log.detalhe?.sono ?? 0} />
              <Detect label="rhr" n={log.detalhe?.rhr ?? 0} />
              <Detect label="treinos" n={log.detalhe?.treinos ?? 0} />
            </div>

            {/* Métricas brutas · útil para identificar nomes não reconhecidos */}
            {log.metricas_brutas && log.metricas_brutas.length > 0 ? (
              <details className="text-[10.5px]">
                <summary className="text-faint cursor-pointer">métricas brutas ({log.metricas_brutas.length})</summary>
                <ul className="mt-1 pl-2 space-y-0.5">
                  {log.metricas_brutas.map((m, i) => (
                    <li key={i} className="text-faint tnum">· {m.nome} · {m.n} pontos</li>
                  ))}
                </ul>
              </details>
            ) : null}

            {/* Resumo das entradas processadas */}
            {log.resumo && log.resumo.length > 0 ? (
              <details className="text-[10.5px]">
                <summary className="text-faint cursor-pointer">dias processados ({log.resumo.length})</summary>
                <ul className="mt-1 pl-2 space-y-0.5">
                  {log.resumo.map((e, i) => (
                    <li key={i} className="text-faint">
                      · {e.date}:
                      {e.steps ? ` ${e.steps.toLocaleString('pt-PT')} passos` : ''}
                      {e.sonoHoras ? ` · ${e.sonoHoras}h sono` : ''}
                      {e.rhr ? ` · ${e.rhr} bpm` : ''}
                      {e.treino ? ` · ✓ ${e.treinoTipo}` : ''}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="card-solid !bg-[var(--surface-soft)] text-[11px] text-soft space-y-2 leading-relaxed">
        <p><strong>Como usar:</strong></p>
        <p>· se um envio não chegar aqui · a automação falhou ou nem disparou</p>
        <p>· se chegou mas <strong>0 detecções</strong> numa categoria · vê as métricas brutas para identificar o nome (ex: &ldquo;HKQuantityTypeIdentifier...&rdquo;) e diz-me que adiciono ao parser</p>
        <p>· datas processadas devem corresponder aos dias reais · se desfasarem 1 dia · problema de timezone</p>
      </div>
    </div>
  )
}

function Detect({ label, n }: { label: string; n: number }) {
  return (
    <div className={`rounded-md p-1.5 ${n > 0 ? 'bg-oliva/10' : 'bg-[var(--surface-soft)]'}`}>
      <p className={`font-serif text-[16px] tnum ${n > 0 ? 'text-oliva' : 'text-faint'}`}>
        {n > 0 ? <Check size={11} strokeWidth={2} className="inline mr-1" /> : ''}{n}
      </p>
      <p className="text-faint text-[9.5px] uppercase tracking-cap">{label}</p>
    </div>
  )
}
