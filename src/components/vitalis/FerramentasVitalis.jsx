/**
 * FerramentasVitalis — barra de ferramentas do Vitalis.
 * Página dedicada de navegação, organizada em 5 buckets semânticos.
 * Liberta a /vitalis/dashboard para ser uma "página hoje" pura.
 */

import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import {
  ClipboardList, CheckCircle2, UtensilsCrossed, Scale, Droplet, Moon, Dumbbell, Heart as HeartIcon,
  BookOpen, Salad, ChefHat, BookHeart, Wand2, Headphones,
  TrendingUp, CalendarRange, FileBarChart, Camera, FileText,
  MessageCircle, Target, Users, Wind,
  Bell, Palette, User2, Sparkles
} from 'lucide-react'
import VitalisHeader from './VitalisHeader'

const BUCKETS = [
  {
    id: 'registar',
    label: 'registar',
    descricao: 'as tuas acções do dia',
    itens: [
      { to: '/vitalis/meals', icon: UtensilsCrossed, label: 'refeições', sub: 'o que comeste' },
      { to: '/vitalis/checkin', icon: CheckCircle2, label: 'check-in', sub: 'em 30 segundos' },
      { to: '/vitalis/tendencias', icon: Scale, label: 'peso e medidas', sub: 'cintura, anca' },
      { to: '/vitalis/calendario', icon: CalendarRange, label: 'menu semanal', sub: 'agenda da semana' },
      { to: '/vitalis/treinos', icon: Dumbbell, label: 'treinos', sub: 'plano semanal' },
      { to: '/vitalis/sintomas', icon: HeartIcon, label: 'adaptação', sub: 'energia, humor' }
    ]
  },
  {
    id: 'aprender',
    label: 'aprender',
    descricao: 'sabe o que está por trás',
    itens: [
      { to: '/vitalis/plano', icon: ClipboardList, label: 'plano alimentar', sub: 'a tua referência' },
      { to: '/vitalis/receitas', icon: ChefHat, label: 'receitas', sub: 'com comida moçambicana' },
      { to: '/vitalis/sugestoes', icon: Wand2, label: 'sugestões', sub: 'o que comer agora' },
      { to: '/vitalis/guia', icon: BookOpen, label: 'guia', sub: 'como usar tudo' },
      { to: '/vitalis/meditacoes', icon: Headphones, label: 'meditações', sub: 'corpo e mente' },
      { to: '/vitalis/guia-ramadao', icon: Moon, label: 'guia ramadão', sub: 'mês sagrado' }
    ]
  },
  {
    id: 'acompanhar',
    label: 'acompanhar',
    descricao: 'vê para onde caminhas',
    itens: [
      { to: '/vitalis/tendencias', icon: TrendingUp, label: 'tendências', sub: 'gráficos de peso e água' },
      { to: '/vitalis/calendario-progresso', icon: CalendarRange, label: 'diário', sub: 'dia a dia' },
      { to: '/vitalis/relatorios', icon: FileBarChart, label: 'relatórios', sub: 'semanal e mensal' },
      { to: '/vitalis/fotos-progresso', icon: Camera, label: 'fotos', sub: 'antes e depois' },
      { to: '/vitalis/compromisso', icon: FileText, label: 'compromisso', sub: 'a tua intenção' }
    ]
  },
  {
    id: 'apoio',
    label: 'apoio',
    descricao: 'não estás sozinha nisto',
    itens: [
      { to: '/vitalis/coach-ia', icon: MessageCircle, label: 'coach IA', sub: 'fala em texto · regista por ti' },
      { to: '/vitalis/chat', icon: MessageCircle, label: 'chat clássico', sub: 'conversa guiada' },
      { to: '/vitalis/objectivos', icon: Target, label: 'os meus objectivos', sub: 'define o teu foco' },
      { to: '/vitalis/espaco-retorno', icon: HeartIcon, label: 'espaço retorno', sub: 'quando cair' },
      { to: '/vitalis/desafios', icon: Target, label: 'desafios', sub: 'semana a semana' },
      { to: '/comunidade', icon: Users, label: 'comunidade', sub: 'rio · círculos' },
      { to: '/vitalis/lista-compras', icon: Salad, label: 'lista de compras', sub: 'automática do plano' }
    ]
  },
  {
    id: 'definicoes',
    label: 'definições',
    descricao: 'a app é tua, ajusta-a',
    itens: [
      { to: '/vitalis/perfil', icon: User2, label: 'perfil', sub: 'nome, avatar, dados' },
      { to: '/vitalis/notificacoes', icon: Bell, label: 'notificações', sub: 'lembretes manhã/tarde' },
      { to: '/vitalis/perfil', icon: Palette, label: 'paleta', sub: '5 atmosferas à escolha' },
      { to: '/vitalis/perfil', icon: Sparkles, label: 'conquistas', sub: 'os teus marcos' }
    ]
  }
]

export default function FerramentasVitalis() {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="fnx-theme min-h-screen pb-24 fnx-fade-in">
      <VitalisHeader
        title="ferramentas"
        subtitle="tudo o que o vitalis tem, organizado pelo que queres fazer agora"
        backTo="/vitalis/dashboard"
      />

      <main className="fnx-container pt-2 pb-6 space-y-9">
        {BUCKETS.map((bucket) => (
          <section key={bucket.id} aria-labelledby={`bucket-${bucket.id}`}>
            <header className="px-1 mb-3">
              <h2
                id={`bucket-${bucket.id}`}
                className="fnx-text-ink"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '22px',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1
                }}
              >
                {bucket.label}
              </h2>
              <p
                className="fnx-text-faint mt-1 italic"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 300,
                  fontSize: '13px',
                  lineHeight: 1.4
                }}
              >
                {bucket.descricao}
              </p>
              <div
                aria-hidden
                className="mt-2.5"
                style={{ height: '1px', width: '20px', background: 'var(--fnx-ouro)' }}
              />
            </header>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 list-none p-0">
              {bucket.itens.map(({ to, icon: Icon, label, sub }) => (
                <li key={`${bucket.id}-${label}`}>
                  <Link
                    to={to}
                    className="fnx-card-solid fnx-transition flex flex-col items-start gap-2 active:scale-95 h-full"
                    style={{ padding: '14px', minHeight: '88px' }}
                  >
                    <Icon size={16} strokeWidth={1.3} className="fnx-text-ouro" />
                    <div className="min-w-0 flex-1">
                      <p
                        className="fnx-text-ink"
                        style={{
                          fontFamily: 'var(--font-editorial)',
                          fontSize: '14.5px',
                          fontWeight: 400,
                          letterSpacing: '-0.01em',
                          lineHeight: 1.25
                        }}
                      >
                        {label}
                      </p>
                      <p className="fnx-text-faint mt-0.5" style={{ fontSize: '11.5px', lineHeight: 1.35 }}>
                        {sub}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Rodapé editorial */}
        <p
          className="fnx-text-faint text-center mt-8 px-4 italic"
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 300,
            fontSize: '12px',
            lineHeight: 1.5
          }}
        >
          a página <Link to="/vitalis/dashboard" className="fnx-text-ouro hover:opacity-80">hoje</Link> mostra-te o que importa neste momento.
          aqui encontras tudo o resto.
        </p>
      </main>
    </div>
  )
}
