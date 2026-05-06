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
  const dia = d.getDay() // 0 = domingo, 1 = segunda
  const diff = (dia + 6) % 7 // dias desde segunda
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
      setErro('sem dados da semana ainda. preenche pelo menos 1 dia no diário.')
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
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Insights</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">o que os dados dizem</h1>
        <p className="text-xs text-cinza">semana de {formatarData(fromIso(semanaInicio), true)}</p>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      {insight ? (
        <article className="card-solid space-y-4">
          <div className="flex items-start gap-2">
            <Sparkles size={18} className="mt-1 shrink-0 text-ouro" strokeWidth={1.5} />
            <p className="font-serif text-base leading-relaxed text-castanho/90">{insight}</p>
          </div>
          {geradoEm ? (
            <p className="border-t border-creme-escuro pt-2 text-right text-xs text-cinza">
              gerado {new Date(geradoEm).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : null}
        </article>
      ) : (
        <div className="card text-center text-sm text-cinza">
          <p>uma vez por semana, os teus dados são lidos.</p>
          <p className="mt-1">sem julgamento — só padrões.</p>
        </div>
      )}

      {erro ? (
        <div className="rounded-xl bg-terracota/10 p-3 text-sm text-terracota">{erro}</div>
      ) : null}

      <button onClick={gerar} disabled={carregando} className="btn-ouro w-full gap-2">
        <RefreshCcw size={16} className={carregando ? 'animate-spin' : ''} />
        {carregando ? 'a ler...' : insight ? 'gerar de novo' : 'gerar insight da semana'}
      </button>

      <p className="text-center text-xs text-cinza">requer ANTHROPIC_API_KEY no servidor</p>
    </div>
  )
}
