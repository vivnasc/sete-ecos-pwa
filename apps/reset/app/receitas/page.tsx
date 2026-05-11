'use client'

import { useEffect, useMemo, useState } from 'react'
import { Coffee, Utensils, Apple, Moon, Repeat, MessageCircle, Search } from 'lucide-react'
import BackButton from '@/components/BackButton'
import {
  getRefeicoes,
  addRefeicao,
  type Refeicao,
  type RefeicaoTipo
} from '@/lib/storage'
import { REFEICOES } from '@/lib/data'
import { cn } from '@/lib/utils'

type TipoFiltro = 'todos' | RefeicaoTipo

const TIPOS: { id: TipoFiltro; label: string; icon: typeof Coffee }[] = [
  { id: 'todos', label: 'todas', icon: Search },
  { id: 'pa', label: 'PA', icon: Coffee },
  { id: 'almoco', label: 'almoço', icon: Utensils },
  { id: 'snack', label: 'snack', icon: Apple },
  { id: 'jantar', label: 'jantar', icon: Moon }
]

function tipoIcon(t: RefeicaoTipo): typeof Coffee {
  return TIPOS.find(x => x.id === t)?.icon ?? Utensils
}

function tipoLabel(t: RefeicaoTipo): string {
  return ({ pa: 'PA', almoco: 'almoço', snack: 'snack', jantar: 'jantar' } as const)[t]
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

type Grupo = {
  chave: string
  descricao: string
  tipo: RefeicaoTipo
  count: number
  ultimoTimestamp: string
  proteinaG: number | null
  carboG: number | null
  gorduraG: number | null
  calorias: number | null
}

function agruparRefeicoes(lista: Refeicao[]): Grupo[] {
  const mapa = new Map<string, Grupo>()
  for (const r of lista) {
    const norm = normalizar(r.descricao)
    if (norm.length === 0) continue
    const chave = `${r.tipo}:${norm}`
    const g = mapa.get(chave)
    if (g) {
      g.count++
      if (r.timestamp > g.ultimoTimestamp) {
        g.ultimoTimestamp = r.timestamp
        g.descricao = r.descricao
        g.proteinaG = r.proteinaG
        g.carboG = r.carboG
        g.gorduraG = r.gorduraG
        g.calorias = r.calorias
      }
    } else {
      mapa.set(chave, {
        chave,
        descricao: r.descricao,
        tipo: r.tipo,
        count: 1,
        ultimoTimestamp: r.timestamp,
        proteinaG: r.proteinaG,
        carboG: r.carboG,
        gorduraG: r.gorduraG,
        calorias: r.calorias
      })
    }
  }
  return Array.from(mapa.values()).sort((a, b) => b.count - a.count || b.ultimoTimestamp.localeCompare(a.ultimoTimestamp))
}

function tempoDesde(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 7) return `há ${dias}d`
  if (dias < 30) return `há ${Math.floor(dias / 7)}sem`
  return `há ${Math.floor(dias / 30)}m`
}

export default function ReceitasPage() {
  const [todas, setTodas] = useState<Refeicao[]>([])
  const [filtro, setFiltro] = useState<TipoFiltro>('todos')

  useEffect(() => {
    const refresh = () => setTodas(getRefeicoes())
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const grupos = useMemo(() => {
    const todos = agruparRefeicoes(todas)
    return filtro === 'todos' ? todos : todos.filter(g => g.tipo === filtro)
  }, [todas, filtro])

  const repetir = (g: Grupo) => {
    addRefeicao({
      tipo: g.tipo,
      descricao: g.descricao,
      timestamp: new Date().toISOString(),
      proteinaG: g.proteinaG,
      carboG: g.carboG,
      gorduraG: g.gorduraG,
      calorias: g.calorias,
      contexto: '',
      sentir: ''
    })
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">comer</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          Minhas Refeições
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          o que comes mais vezes · toca em &ldquo;repetir&rdquo; para registar outra vez.
        </p>
      </header>

      <div className="flex gap-1 rounded-full p-1 shadow-hair overflow-x-auto">
        {TIPOS.map(t => (
          <button
            key={t.id}
            onClick={() => setFiltro(t.id)}
            className={cn(
              'flex-1 min-w-fit rounded-full px-3.5 py-2 text-[11.5px] uppercase tracking-cap transition-elegant whitespace-nowrap',
              filtro === t.id
                ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta'
                : 'text-faint hover:text-soft'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {grupos.length === 0 ? (
        <section className="card-feature text-center py-10 space-y-3">
          <Utensils size={24} strokeWidth={1.3} className="text-ouro mx-auto" />
          <p className="font-serif text-[18px] tracking-editorial italic">
            {filtro === 'todos' ? 'sem refeições registadas' : `sem ${filtro === 'pa' ? 'pequenos-almoços' : filtro + 's'} registados`}
          </p>
          <p className="text-soft text-[12.5px] leading-relaxed max-w-xs mx-auto">
            diz à coach o que comeste · ela regista. ou vai a /refeições e adiciona manualmente.
          </p>
          <a href="/coach" className="inline-flex items-center gap-1.5 text-[12.5px] text-ouro hover:underline">
            <MessageCircle size={13} strokeWidth={1.4} /> falar com a coach
          </a>
        </section>
      ) : (
        <section className="space-y-2">
          {grupos.map(g => {
            const Icon = tipoIcon(g.tipo)
            const temMacros = g.proteinaG !== null || g.carboG !== null || g.gorduraG !== null || g.calorias !== null
            return (
              <article key={g.chave} className="card-solid space-y-2">
                <div className="flex items-start gap-3">
                  <Icon size={15} strokeWidth={1.4} className="mt-0.5 text-ouro shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="label-cap shrink-0">{tipoLabel(g.tipo)}</span>
                      <span className="text-faint text-[10.5px] tnum">{g.count}× · {tempoDesde(g.ultimoTimestamp)}</span>
                    </div>
                    <p className="font-serif text-[14.5px] leading-snug mt-1">{g.descricao}</p>
                    {temMacros ? (
                      <p className="text-faint text-[11px] tnum mt-1">
                        {g.proteinaG !== null ? `${Math.round(g.proteinaG)}g P · ` : ''}
                        {g.carboG !== null ? `${Math.round(g.carboG)}g C · ` : ''}
                        {g.gorduraG !== null ? `${Math.round(g.gorduraG)}g G` : ''}
                        {g.calorias !== null ? ` · ${g.calorias} kcal` : ''}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => repetir(g)}
                    aria-label="repetir refeição"
                    className="text-ouro hover:text-tinta dark:hover:text-creme transition-elegant active:scale-90 p-1.5 shrink-0 flex items-center gap-1 text-[10.5px]"
                  >
                    <Repeat size={13} strokeWidth={1.5} />
                    <span className="hidden sm:inline">repetir</span>
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <section className="space-y-3 pt-4">
        <span className="label-cap px-1">Notas keto</span>
        <div className="card-solid space-y-3 text-[13px] leading-relaxed">
          <div>
            <p className="label-cap mb-1">Janela alimentar</p>
            <p className="text-soft">9h–19h · jejum ≥14h · café e chá não quebram, água com sal não quebra.</p>
          </div>
          <div className="border-t border-[var(--hair)] pt-3">
            <p className="label-cap mb-1">Refeed sábado à noite</p>
            <p className="text-soft">1 chávena de batata-doce ou arroz integral, com proteína + folhas. repõe glicogénio · não estraga keto.</p>
          </div>
          <div className="border-t border-[var(--hair)] pt-3">
            <p className="label-cap mb-1">Electrólitos diários</p>
            <p className="text-soft">manhã: 2 dedos de água com sal grosso · noite: magnésio bisglicinato 400mg</p>
          </div>
          <div className="border-t border-[var(--hair)] pt-3">
            <p className="label-cap mb-1">Evitar 60 dias</p>
            <ul className="space-y-1 text-soft text-[12.5px]">
              {REFEICOES.evitar.map((e, i) => (
                <li key={i}>· {e}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-faint text-[11px] px-1 leading-relaxed">
          para lista de compras adaptada ao que comes, diz à coach &ldquo;gera lista de compras&rdquo;.
        </p>
      </section>
    </div>
  )
}
