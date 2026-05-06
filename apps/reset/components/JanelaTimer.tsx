'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock, Sun, Moon } from 'lucide-react'
import {
  janelaRecomendada,
  janelaAbertaAgora,
  tempoAteJanelaAbrir,
  tempoAteJanelaFechar
} from '@/lib/janela'
import { jejumActualHoras } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function JanelaTimer() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(i)
  }, [])

  const janela = janelaRecomendada()
  const aberta = janelaAbertaAgora()
  const ateAbrir = tempoAteJanelaAbrir()
  const ateFechar = tempoAteJanelaFechar()
  const jejumCurso = jejumActualHoras()

  const fonte = {
    ultima_refeicao: 'última refeição registada',
    perfil: 'baseado em acordares às',
    default: 'padrão'
  }[janela.fonte]

  return (
    <Link href="/jejum" className="card-feature block transition-elegant hover:shadow-ink">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          {aberta ? (
            <Sun size={14} strokeWidth={1.4} className="text-ouro" />
          ) : (
            <Moon size={14} strokeWidth={1.4} className="text-tinta dark:text-ouro" />
          )}
          <span className="label-cap">{aberta ? 'janela aberta' : 'em jejum'}</span>
        </div>
        <span className="label-soft tnum">
          {janela.inicio} – {janela.fim}
        </span>
      </div>

      {jejumCurso && !aberta ? (
        <div className="mt-4 flex items-baseline gap-2">
          <p className={cn(
            'editorial-num text-[60px] leading-none tnum',
            jejumCurso.horas >= janela.metaJejum ? 'text-oliva' : 'text-tinta dark:text-creme'
          )}>
            {Math.floor(jejumCurso.horas)}
          </p>
          <span className="text-faint text-[16px]">
            h{String(Math.round((jejumCurso.horas % 1) * 60)).padStart(2, '0')}
          </span>
          <span className="ml-auto text-faint text-[12px]">
            de {janela.metaJejum}h
          </span>
        </div>
      ) : aberta ? (
        <div className="mt-4">
          <p className="editorial-num text-[44px] leading-none">
            {ateFechar ? `${ateFechar.horas}h${String(ateFechar.minutos).padStart(2, '0')}` : '—'}
          </p>
          <p className="text-faint text-[12px] mt-1">até fechar a janela</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="editorial-num text-[44px] leading-none">
            {ateAbrir ? `${ateAbrir.horas}h${String(ateAbrir.minutos).padStart(2, '0')}` : '—'}
          </p>
          <p className="text-faint text-[12px] mt-1">até abrir a janela</p>
        </div>
      )}

      {/* Barra de progresso */}
      {jejumCurso && !aberta ? (
        <div className="mt-4 h-px w-full bg-[var(--hair)] overflow-hidden">
          <div
            className="h-px bg-ouro transition-all duration-500"
            style={{ width: `${Math.min(100, (jejumCurso.horas / janela.metaJejum) * 100)}%` }}
          />
        </div>
      ) : null}

      <p className="text-faint mt-4 text-[10px] uppercase tracking-cap">{fonte}</p>
    </Link>
  )
}
