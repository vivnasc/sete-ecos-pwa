'use client'

import { useState } from 'react'
import { Coffee, Sun, Moon, Cookie, Ban } from 'lucide-react'
import { REFEICOES, COMPRAS } from '@/lib/data'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'comer', label: 'Comer', icon: Sun },
  { id: 'compras', label: 'Compras', icon: Cookie }
] as const

type Tab = (typeof TABS)[number]['id']

export default function ReceitasPage() {
  const [tab, setTab] = useState<Tab>('comer')

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Comer</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">keto cíclico</h1>
        <p className="text-sm text-cinza">janela 9h–19h · proteína primeiro</p>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      <div className="flex gap-1 rounded-full bg-creme-escuro/40 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-full px-4 py-2 text-sm transition',
              tab === t.id ? 'bg-castanho text-creme' : 'text-castanho/60'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'comer' ? <ComerTab /> : <ComprasTab />}
    </div>
  )
}

function ComerTab() {
  return (
    <div className="space-y-5">
      <Bloco titulo="Pequeno-almoço" subtitulo="9h · primeira hora após acordar" Icone={Coffee}>
        {REFEICOES.pequenoAlmoco.map((r, i) => (
          <Receita key={i} {...r} />
        ))}
      </Bloco>

      <Bloco titulo="Almoço" subtitulo="13h-14h" Icone={Sun}>
        {REFEICOES.almoco.map((r, i) => (
          <Receita key={i} {...r} />
        ))}
      </Bloco>

      <Bloco titulo="Jantar" subtitulo="até às 19h · leve" Icone={Moon}>
        {REFEICOES.jantar.map((r, i) => (
          <Receita key={i} {...r} />
        ))}
      </Bloco>

      <Bloco titulo="Snacks" subtitulo="só se necessário" Icone={Cookie}>
        {REFEICOES.snacks.map((r, i) => (
          <Receita key={i} {...r} />
        ))}
      </Bloco>

      <Bloco titulo="Evitar" subtitulo="durante 60 dias" Icone={Ban} tone="terracota">
        <ul className="space-y-1 text-sm">
          {REFEICOES.evitar.map((e, i) => (
            <li key={i} className="text-castanho/70">
              · {e}
            </li>
          ))}
        </ul>
      </Bloco>

      <div className="card-solid space-y-2">
        <span className="label-cap text-ouro">Refeed · sábado à noite</span>
        <p className="text-sm text-castanho/80">1 chávena de batata-doce ou arroz integral, com proteína + folhas.</p>
        <p className="text-xs text-cinza">repõe glicogénio · alimenta tiróide · não estraga keto.</p>
      </div>

      <div className="card-solid space-y-2">
        <span className="label-cap text-oliva">Eletrólitos diários</span>
        <p className="text-sm">
          <span className="font-medium">manhã:</span> <span className="text-castanho/80">2 dedos de água com sal grosso</span>
        </p>
        <p className="text-sm">
          <span className="font-medium">noite:</span> <span className="text-castanho/80">magnésio bisglicinato 400mg</span>
        </p>
      </div>
    </div>
  )
}

function Receita({ nome, macros }: { nome: string; macros: string }) {
  return (
    <div className="rounded-xl bg-white/60 p-3 ring-1 ring-ouro/15">
      <p className="text-sm text-castanho">{nome}</p>
      <p className="mt-0.5 text-xs text-cinza">{macros}</p>
    </div>
  )
}

function ComprasTab() {
  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-cinza">faz no sábado de manhã · prepara proteínas no domingo à noite</p>
      <ListaCompras titulo="Proteínas" itens={COMPRAS.proteinas} />
      <ListaCompras titulo="Vegetais" itens={COMPRAS.vegetais} />
      <ListaCompras titulo="Gorduras boas" itens={COMPRAS.gorduras} />
      <ListaCompras titulo="Outros" itens={COMPRAS.outros} />
      <ListaCompras titulo="Fim de semana" itens={COMPRAS.fimSemana} />
    </div>
  )
}

function ListaCompras({ titulo, itens }: { titulo: string; itens: string[] }) {
  const [feitos, setFeitos] = useState<Record<string, boolean>>({})
  return (
    <div className="card-solid">
      <span className="label-cap mb-2 block">{titulo}</span>
      <ul className="space-y-1.5">
        {itens.map(item => (
          <li key={item}>
            <button
              onClick={() => setFeitos(f => ({ ...f, [item]: !f[item] }))}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition active:scale-[0.99]"
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
                  feitos[item] ? 'border-oliva bg-oliva text-creme' : 'border-castanho/30'
                )}
                aria-hidden
              >
                {feitos[item] ? '✓' : ''}
              </span>
              <span className={cn(feitos[item] && 'text-cinza line-through')}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bloco({
  titulo,
  subtitulo,
  Icone,
  tone = 'castanho',
  children
}: {
  titulo: string
  subtitulo: string
  Icone: typeof Coffee
  tone?: 'castanho' | 'terracota'
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="mb-2 flex items-center gap-2">
        <Icone size={18} strokeWidth={1.5} className={tone === 'terracota' ? 'text-terracota' : 'text-ouro'} />
        <div>
          <p className="font-serif text-lg text-castanho">{titulo}</p>
          <p className="text-xs text-cinza">{subtitulo}</p>
        </div>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
