'use client'

import { useState } from 'react'
import { REFEICOES, COMPRAS } from '@/lib/data'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'comer', label: 'comer' },
  { id: 'compras', label: 'compras' }
] as const

type Tab = (typeof TABS)[number]['id']

export default function ReceitasPage() {
  const [tab, setTab] = useState<Tab>('comer')

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">comer</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">keto cíclico</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">janela 9h–19h · proteína primeiro</p>
      </header>

      <div className="flex gap-1 rounded-full p-1 shadow-hair">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-full px-4 py-2 text-[12px] uppercase tracking-cap transition-elegant',
              tab === t.id
                ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta'
                : 'text-faint hover:text-soft'
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
    <div className="space-y-6">
      <Bloco titulo="Pequeno-almoço" subtitulo="9h · primeira hora">
        {REFEICOES.pequenoAlmoco.map((r, i) => <Receita key={i} {...r} />)}
      </Bloco>

      <Bloco titulo="Almoço" subtitulo="13h–14h">
        {REFEICOES.almoco.map((r, i) => <Receita key={i} {...r} />)}
      </Bloco>

      <Bloco titulo="Jantar" subtitulo="até às 19h · leve">
        {REFEICOES.jantar.map((r, i) => <Receita key={i} {...r} />)}
      </Bloco>

      <Bloco titulo="Snacks" subtitulo="só se necessário">
        {REFEICOES.snacks.map((r, i) => <Receita key={i} {...r} />)}
      </Bloco>

      <section>
        <header className="mb-2 flex items-baseline justify-between">
          <span className="font-serif text-[20px] tracking-editorial text-terracota">Evitar</span>
          <span className="text-faint text-[10px] tracking-cap">60 dias</span>
        </header>
        <ul className="card-solid space-y-1.5">
          {REFEICOES.evitar.map((e, i) => (
            <li key={i} className="text-soft text-[13.5px] leading-relaxed">· {e}</li>
          ))}
        </ul>
      </section>

      <section className="card-solid space-y-2">
        <span className="label-cap">Refeed · sábado à noite</span>
        <p className="text-soft text-[13.5px] leading-relaxed">1 chávena batata-doce ou arroz integral, com proteína + folhas.</p>
        <p className="text-faint text-[11.5px]">repõe glicogénio · alimenta tiróide · não estraga keto.</p>
      </section>

      <section className="card-solid space-y-2">
        <span className="label-cap">Eletrólitos diários</span>
        <div className="space-y-1 text-[13px]">
          <p><span className="text-faint">manhã:</span> <span className="text-soft">2 dedos de água com sal grosso</span></p>
          <p><span className="text-faint">noite:</span> <span className="text-soft">magnésio bisglicinato 400mg</span></p>
        </div>
      </section>
    </div>
  )
}

function Receita({ nome, macros }: { nome: string; macros: string }) {
  return (
    <div className="border-b border-[var(--hair)] py-2.5 last:border-0">
      <p className="text-[14px]">{nome}</p>
      <p className="text-faint mt-0.5 text-[11px] tracking-wide">{macros}</p>
    </div>
  )
}

function Bloco({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <section>
      <header className="mb-2 flex items-baseline justify-between">
        <span className="font-serif text-[20px] tracking-editorial">{titulo}</span>
        <span className="text-faint text-[10px] tracking-cap">{subtitulo}</span>
      </header>
      <div className="card-solid !py-0">{children}</div>
    </section>
  )
}

function ComprasTab() {
  return (
    <div className="space-y-5">
      <p className="text-faint text-center text-[12px]">sábado de manhã · prep no domingo à noite</p>
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
    <section>
      <span className="label-cap mb-2 block">{titulo}</span>
      <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
        {itens.map(item => (
          <li key={item}>
            <button
              onClick={() => setFeitos(f => ({ ...f, [item]: !f[item] }))}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[13.5px] transition-elegant active:scale-[0.99] hover:bg-[var(--surface-soft)]"
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-elegant',
                  feitos[item] ? 'border-oliva bg-oliva text-creme' : 'border-[var(--hair-strong)]'
                )}
                aria-hidden
              >
                {feitos[item] ? <span className="text-[9px]">✓</span> : null}
              </span>
              <span className={cn(feitos[item] && 'text-faint line-through')}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
