'use client'

export type Lembrete = {
  id: string
  hora: string // HH:MM
  titulo: string
  corpo: string
  ativo: boolean
}

const KEY = 'fenixfit:lembretes'

export const LEMBRETES_DEFAULT: Lembrete[] = [
  { id: 'pa', hora: '09:00', titulo: 'Pequeno-almoço', corpo: 'proteína + gordura na próxima hora.', ativo: true },
  { id: 'jantar', hora: '18:30', titulo: 'Última refeição', corpo: 'janela fecha às 19h.', ativo: true },
  { id: 'ecra', hora: '20:45', titulo: 'Ecrã off em 15min', corpo: 'carregador na cozinha.', ativo: true },
  { id: 'cama', hora: '22:15', titulo: 'Cama em 15min', corpo: 'magnésio agora.', ativo: true }
]

export function getLembretes(): Lembrete[] {
  if (typeof window === 'undefined') return LEMBRETES_DEFAULT
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return LEMBRETES_DEFAULT
    return JSON.parse(raw)
  } catch {
    return LEMBRETES_DEFAULT
  }
}

export function saveLembretes(l: Lembrete[]): void {
  localStorage.setItem(KEY, JSON.stringify(l))
}

export async function pedirPermissao(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return await Notification.requestPermission()
}

export function notificacaoSuportada(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permissaoActual(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  return Notification.permission
}

export function notificar(titulo: string, corpo: string, tag?: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(titulo, {
      body: corpo,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag,
      silent: false
    })
  } catch {
    // Some browsers require service worker for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(titulo, { body: corpo, icon: '/icon.svg', tag })
      }).catch(() => {})
    }
  }
}

let timers: number[] = []

function msAteHora(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  const agora = new Date()
  const alvo = new Date()
  alvo.setHours(h, m, 0, 0)
  if (alvo.getTime() <= agora.getTime()) {
    alvo.setDate(alvo.getDate() + 1)
  }
  return alvo.getTime() - agora.getTime()
}

export function reagendarLembretes(): void {
  timers.forEach(t => clearTimeout(t))
  timers = []

  if (typeof window === 'undefined' || Notification.permission !== 'granted') return

  const lembretes = getLembretes().filter(l => l.ativo)
  lembretes.forEach(l => {
    const ms = msAteHora(l.hora)
    const id = window.setTimeout(() => {
      notificar(l.titulo, l.corpo, l.id)
      reagendarLembretes()
    }, ms)
    timers.push(id)
  })

  localStorage.setItem('fenixfit:lembretes-agendados', new Date().toISOString())
}

export function podeMostrarBoasVindas(): boolean {
  return notificacaoSuportada() && Notification.permission === 'default'
}
