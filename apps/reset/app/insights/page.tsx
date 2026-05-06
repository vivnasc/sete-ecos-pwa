'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCcw } from 'lucide-react'
import { ANCORAS } from '@/lib/data'
import { isoDate, fromIso, formatarData } from '@/lib/dates'
import {
  getTodosDias,
  getAlcoolRegistos,
  getMedidas,
  getInsightCache,
  saveInsightCache
} from '@/lib/storage'

function inicioSemana(d: Date = new Date()): string {
  const dia = d.getDay()
  const diff = (dia + 6) % 7
  const seg = new Date(d)
  seg.setDate(d.getDate() - diff)
  return isoDate(seg)
}

export default function InsightsPage() {
  const [insight, setInsight] = useState<string | null>(null)
  const [geradoEm, setGeradoEm] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const semanaInicio = inicioSemana()

  useEffect(() => {
    const cached = getInsightCache(semanaInicio)
    if (cached) {
      setInsight(cached.texto)
      setGeradoEm(cached.geradoEm)
    }
  }, [semanaInicio])

  const gerar = async () => {
    setCarregando(true)
    setErro(null)

    const todosDias = getTodosDias()
    const inicioDate = fromIso(semanaInicio)
    const fimDate = new Date(inicioDate)
    fimDate.setDate(fimDate.getDate() + 6)

    const diasSemana = todosDias.filter(d => {
      const data = fromIso(d.date)
      return data >= inicioDate && data <= fimDate
    })

    if (diasSemana.length === 0) {
      setErro('sem dados da semana ainda. preenche pelo menos um dia.')
      setCarregando(false)
      return
    }

    const alcool = getAlcoolRegistos().filter(r => {
      const data = new Date(r.timestamp)
      return data >= inicioDate && data <= new Date(fimDate.getTime() + 86400000)
    })

    const medidas = getMedidas().filter(m => {
      const data = fromIso(m.date)
      return data >= inicioDate && data <= fimDate
    })

    const dados = {
      weekStart: semanaInicio,
      dias: diasSemana.map(d => ({
        date: d.date,
        ancorasCumpridas: ANCORAS.filter(a => d.ancoras[a.id]).length,
        treinoFeito: !!d.ancoras['treino_feito'],
        sonoHoras: d.sonoHoras,
        energia: d.energia,
        humor: d.humor,
        notas: d.notas
      })),
      alcool: alcool.map(a => ({
        timestamp: a.timestamp,
        unidades: a.unidades,
        emocao: a.emocao,
        gatilho: a.gatilho,
        decidiuBeber: a.decidiuBeber
      })),
      medidas: medidas.map(m => ({ date: m.date, cintura: m.cintura, peso: m.peso }))
    }

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
      const json = await res.json()
      if (!res.ok) {
        setErro(json.error ?? 'erro a gerar insight')
      } else {
        const novo = {
          weekStart: semanaInicio,
          texto: json.texto,
          geradoEm: new Date().toISOString()
        }
        saveInsightCache(novo)
        setInsight(novo.texto)
        setGeradoEm(novo.geradoEm)
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro de rede')
    }

    setCarregando(false)
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">insights</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">o que vejo</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">semana de {formatarData(fromIso(semanaInicio), true)}</p>
      </header>

      {insight ? (
        <article className="card-feature space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.4} className="text-ouro" />
            <span className="label-cap">leitura</span>
          </div>
          <p className="font-serif text-[17px] font-light leading-[1.55] tracking-editorial">
            {insight}
          </p>
          {geradoEm ? (
            <p className="text-faint border-t border-[var(--hair)] pt-3 text-right text-[10px] tracking-cap">
              gerado {new Date(geradoEm).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : null}
        </article>
      ) : (
        <div className="card text-center">
          <p className="text-soft text-[13.5px]">uma vez por semana, os teus dados são lidos.</p>
          <p className="text-faint mt-1 text-[12.5px]">sem julgamento — só padrões.</p>
        </div>
      )}

      {erro ? (
        <div className="rounded-lg bg-terracota/10 p-3 text-[13px] text-terracota">{erro}</div>
      ) : null}

      <button onClick={gerar} disabled={carregando} className="btn-primary w-full">
        <RefreshCcw size={14} strokeWidth={1.4} className={carregando ? 'animate-spin' : ''} />
        {carregando ? 'a ler' : insight ? 'gerar de novo' : 'gerar leitura'}
      </button>

      <p className="text-faint text-center text-[10px]">requer ANTHROPIC_API_KEY no servidor</p>
    </div>
  )
}
