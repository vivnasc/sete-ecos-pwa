/**
 * SmartNow — bloco contextual da Home que muda conforme a hora.
 * Dá à cliente UM atalho relevante AGORA, em vez da lista toda.
 *
 * Estados:
 *   05-09 → romper o jejum (pequeno-almoço com proteína)
 *   09-12 → meio da manhã (água, lanche se houver fome)
 *   12-14 → almoço (atalho registar + receitas almoço)
 *   14-17 → tarde (lanche consciente, hidratação)
 *   17-20 → última refeição (encerrar a janela)
 *   20-23 → encerrar dia (check-in + reflexão)
 *   23-05 → noite (descansar, sem culpa)
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Sunrise, Coffee, UtensilsCrossed, Droplet, Sun, Soup, Moon, Bed, ArrowRight
} from 'lucide-react'

function estadoActual(hora, jaComeu = false) {
  if (hora >= 5 && hora < 9) {
    return {
      id: 'madrugada',
      icon: Sunrise,
      label: 'romper o jejum',
      titulo: jaComeu ? 'bom dia' : 'rompe o jejum',
      copy: jaComeu
        ? 'já tomaste o pequeno-almoço. o corpo está a acordar — bebe água e mexe-te um pouco.'
        : 'começa com proteína: ovos, iogurte com fruta, ou um restinho de ontem com folhas verdes.',
      acaoLabel: 'registar pequeno-almoço',
      acaoTo: '/vitalis/meals'
    }
  }
  if (hora >= 9 && hora < 12) {
    return {
      id: 'manha',
      icon: Coffee,
      label: 'meio da manhã',
      titulo: 'água e foco',
      copy: 'um copo grande de água. se a fome bater real, fruta com punhado de oleaginosas — não bolacha.',
      acaoLabel: 'registar lanche',
      acaoTo: '/vitalis/meals'
    }
  }
  if (hora >= 12 && hora < 14) {
    return {
      id: 'almoco',
      icon: UtensilsCrossed,
      label: 'hora do almoço',
      titulo: 'sem pressa, à mesa',
      copy: 'metade do prato em vegetais e folhas. um punho de proteína. uma colher de gordura boa. mastiga devagar.',
      acaoLabel: 'ver receitas de almoço',
      acaoTo: '/vitalis/receitas'
    }
  }
  if (hora >= 14 && hora < 17) {
    return {
      id: 'tarde',
      icon: Droplet,
      label: 'meio da tarde',
      titulo: 'hidratação',
      copy: 'a fome agora costuma ser sede. água primeiro. se persistir, chá quente sem açúcar ou um lanche pequeno.',
      acaoLabel: 'sugestões de lanche',
      acaoTo: '/vitalis/sugestoes'
    }
  }
  if (hora >= 17 && hora < 20) {
    return {
      id: 'jantar',
      icon: Sun,
      label: 'última refeição',
      titulo: 'encerrar a janela',
      copy: 'jantar cedo e leve. proteína, vegetais cozidos, um pouco de hidrato se treinaste. fecha antes das 20h se conseguires.',
      acaoLabel: 'registar jantar',
      acaoTo: '/vitalis/meals'
    }
  }
  if (hora >= 20 && hora < 23) {
    return {
      id: 'noite',
      icon: Soup,
      label: 'encerrar o dia',
      titulo: 'reflectir o dia',
      copy: 'um chá morno ajuda. e dois minutos a registar como foi o dia — vais ver padrões em duas semanas.',
      acaoLabel: 'fazer check-in',
      acaoTo: '/vitalis/checkin'
    }
  }
  return {
    id: 'madrugada-tarde',
    icon: Moon,
    label: 'noite alta',
    titulo: 'descansar',
    copy: 'dormir é alimentar. fecha a app, baixa as luzes, respira fundo. amanhã continuamos.',
    acaoLabel: 'ver guia de sono',
    acaoTo: '/vitalis/guia'
  }
}

export default function SmartNow({ jaComeuPA = false }) {
  const [hora, setHora] = useState(() => new Date().getHours())

  useEffect(() => {
    const interval = setInterval(() => {
      const h = new Date().getHours()
      setHora(prev => (prev === h ? prev : h))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const estado = estadoActual(hora, jaComeuPA)
  const Icon = estado.icon

  return (
    <section className="fnx-card-feature" aria-label={`agora · ${estado.label}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} strokeWidth={1.4} className="fnx-text-ouro shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <span className="fnx-label-cap">agora · {estado.label}</span>
          <h3
            className="fnx-text-ink mt-1"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '22px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}
          >
            {estado.titulo}
          </h3>
          <p
            className="fnx-text-soft mt-2 italic"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: '14px',
              lineHeight: 1.6
            }}
          >
            {estado.copy}
          </p>
          <div
            aria-hidden
            className="mt-3 mb-4"
            style={{ height: '1px', width: '20px', background: 'var(--fnx-ouro)' }}
          />
          <Link to={estado.acaoTo} className="fnx-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '12.5px' }}>
            <span>{estado.acaoLabel}</span>
            <ArrowRight size={13} strokeWidth={1.4} />
          </Link>
        </div>
      </div>
    </section>
  )
}
