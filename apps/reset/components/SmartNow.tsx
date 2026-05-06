'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wine, Moon, Sunrise, Sun, CloudMoon, Coffee, Dumbbell } from 'lucide-react'
import { TREINO_SEMANAL } from '@/lib/data'
import { diaSemana, statusDoDia, diaDoPlano } from '@/lib/dates'
import { getDia, type DiaLog } from '@/lib/storage'
import { getProfile } from '@/lib/profile'

type Janela = {
  saudacao: string
  contexto: string
  acaoPrincipal: { titulo: string; subtitulo: string; href: string; tone: 'ouro' | 'ink' | 'oliva' | 'terracota' }
  Icone: typeof Sunrise
}

function determinarJanela(hora: number, dow: string, log: DiaLog): Janela {
  const treino = TREINO_SEMANAL[dow as keyof typeof TREINO_SEMANAL]
  const treinoFeito = log.ancoras['treino_feito'] || log.treinoFeito
  const paFeito = log.ancoras['pa_proteina']

  // 22h - 5h: tarde demais
  if (hora >= 22 || hora < 5) {
    return {
      saudacao: 'noite',
      contexto: 'devias estar a dormir',
      acaoPrincipal: {
        titulo: 'pousa o telemóvel',
        subtitulo: 'amanhã o corpo agradece',
        href: '/diario',
        tone: 'ink'
      },
      Icone: Moon
    }
  }

  // 5h - 8h: madrugada / treino window
  if (hora >= 5 && hora < 8) {
    if (treino.descanso) {
      return {
        saudacao: 'manhã cedo',
        contexto: dow === 'Domingo' ? 'descanso total · sem culpa' : 'descanso · caminhada se apetecer',
        acaoPrincipal: { titulo: 'água com sal', subtitulo: 'eletrólitos antes do PA', href: '/', tone: 'oliva' },
        Icone: Sunrise
      }
    }
    return {
      saudacao: 'manhã cedo',
      contexto: 'janela ideal de treino · jejum curto',
      acaoPrincipal: {
        titulo: treinoFeito ? 'treino feito ✓' : treino.tipo.toLowerCase(),
        subtitulo: treinoFeito ? 'PA na próxima hora' : `${treino.descricao}`,
        href: '/treino',
        tone: treinoFeito ? 'oliva' : 'ouro'
      },
      Icone: Dumbbell
    }
  }

  // 8h - 11h: PA window
  if (hora >= 8 && hora < 11) {
    return {
      saudacao: 'manhã',
      contexto: 'janela alimentar abre às 9h',
      acaoPrincipal: {
        titulo: paFeito ? 'PA registado ✓' : 'pequeno-almoço',
        subtitulo: paFeito ? 'janela aberta · 14h jejum cumpridas' : 'às 9h · proteína + gordura · sem carbo',
        href: paFeito ? '/diario' : '/receitas',
        tone: paFeito ? 'oliva' : 'ouro'
      },
      Icone: Coffee
    }
  }

  // 11h - 17h: foco
  if (hora >= 11 && hora < 17) {
    return {
      saudacao: 'tarde',
      contexto: dow === 'Sábado' ? 'sábado · refeed à noite' : 'janela aberta · proteína primeiro',
      acaoPrincipal: {
        titulo: 'almoço com proteína',
        subtitulo: dow === 'Sábado' ? 'limpa hoje · refeed só ao jantar' : 'sem cinzentos · folhas',
        href: '/receitas',
        tone: 'ink'
      },
      Icone: Sun
    }
  }

  // 17h - 19h: ultima refeicao
  if (hora >= 17 && hora < 19) {
    return {
      saudacao: 'fim de tarde',
      contexto: 'janela fecha às 19h',
      acaoPrincipal: {
        titulo: 'última refeição',
        subtitulo: 'leve · sopa + ovo · sem doces',
        href: '/receitas',
        tone: 'ouro'
      },
      Icone: Sun
    }
  }

  // 19h - 21h: encerrar dia + zona de risco para álcool
  if (hora >= 19 && hora < 21) {
    return {
      saudacao: 'noite',
      contexto: 'a hora dos teus gatilhos',
      acaoPrincipal: {
        titulo: 'caderno antes do copo',
        subtitulo: 'primeiro escreves · depois decides',
        href: '/alcool',
        tone: 'terracota'
      },
      Icone: Wine
    }
  }

  // 21h - 22h: ecra off
  return {
    saudacao: 'noite',
    contexto: 'âncora-mãe · ecrã off às 21h',
    acaoPrincipal: {
      titulo: 'encerrar o dia',
      subtitulo: 'magnésio · cama 22h30',
      href: '/diario',
      tone: 'ink'
    },
    Icone: CloudMoon
  }
}

export default function SmartNow() {
  const [agora, setAgora] = useState<Date | null>(null)
  const [log, setLog] = useState<DiaLog | null>(null)
  const [nome, setNome] = useState<string>('')

  useEffect(() => {
    setAgora(new Date())
    setLog(getDia())
    setNome(getProfile().nome)
    const refresh = () => setLog(getDia())
    window.addEventListener('fenixfit:storage', refresh)
    const tick = setInterval(() => setAgora(new Date()), 60000)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      clearInterval(tick)
    }
  }, [])

  if (!agora || !log) return <div className="card-feature h-44 animate-breathe" aria-hidden />

  const status = statusDoDia(agora)
  if (status === 'antes') return null

  const dow = diaSemana(agora)
  const janela = determinarJanela(agora.getHours(), dow, log)
  const Icone = janela.Icone

  const toneClasses = {
    ouro: 'text-ouro',
    ink: 'text-tinta dark:text-creme-escuro',
    oliva: 'text-oliva',
    terracota: 'text-terracota'
  }

  return (
    <Link href={janela.acaoPrincipal.href} className="card-feature block animate-fade-in transition-elegant hover:shadow-ink">
      <div className="flex items-center gap-2">
        <Icone size={14} strokeWidth={1.4} className={toneClasses[janela.acaoPrincipal.tone]} />
        <span className="label-cap">{janela.saudacao} · {janela.contexto}</span>
      </div>
      <p className="mt-4 font-serif text-[28px] font-light leading-[1.15] tracking-editorial sm:text-[32px]">
        {janela.acaoPrincipal.titulo}
      </p>
      <p className="text-soft mt-2 text-[14px]">{janela.acaoPrincipal.subtitulo}</p>
      <div className="mt-4 h-px w-8 bg-ouro" aria-hidden />
    </Link>
  )
}
