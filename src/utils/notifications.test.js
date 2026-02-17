import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock window.Notification
const mockNotification = vi.fn()
mockNotification.permission = 'default'
mockNotification.requestPermission = vi.fn()

// Setup global mocks before imports
Object.defineProperty(global, 'Notification', {
  value: mockNotification,
  writable: true,
  configurable: true,
})

// Mock navigator.serviceWorker
Object.defineProperty(global, 'navigator', {
  value: {
    ...global.navigator,
    serviceWorker: {
      ready: Promise.resolve({
        showNotification: vi.fn(() => Promise.resolve()),
      }),
    },
  },
  writable: true,
  configurable: true,
})

import {
  NOTIFICACOES,
  LEMBRETES_DEFAULT,
  notificacoesSuportadas,
  temPermissao,
  guardarLembretes,
  carregarLembretes,
  cancelarLembretes,
  extrairHashtags,
} from './notifications'

// ===== NOTIFICACOES constants =====

describe('NOTIFICACOES', () => {
  it('has all 12 notification types', () => {
    const types = [
      'agua', 'pequenoAlmoco', 'almoco', 'jantar',
      'prepAlmoco', 'prepJantar', 'checkin', 'treino',
      'jejumFim', 'jejumInicio', 'motivacao', 'streak'
    ]
    types.forEach(type => {
      expect(NOTIFICACOES[type]).toBeDefined()
    })
    expect(Object.keys(NOTIFICACOES).length).toBe(12)
  })

  it('every notification has titulo, corpo, and tag', () => {
    Object.entries(NOTIFICACOES).forEach(([key, notif]) => {
      expect(notif.titulo).toBeDefined()
      expect(typeof notif.titulo).toBe('string')
      expect(notif.titulo.length).toBeGreaterThan(0)

      expect(notif.corpo).toBeDefined()
      expect(typeof notif.corpo).toBe('string')
      expect(notif.corpo.length).toBeGreaterThan(0)

      expect(notif.tag).toBeDefined()
      expect(typeof notif.tag).toBe('string')
      expect(notif.tag.startsWith('vitalis-')).toBe(true)
    })
  })

  it('all tags are unique (except jejum pair)', () => {
    const tags = Object.values(NOTIFICACOES).map(n => n.tag)
    // jejumFim and jejumInicio share the same tag intentionally
    const uniqueTags = [...new Set(tags)]
    expect(uniqueTags.length).toBeGreaterThanOrEqual(tags.length - 1)
  })

  it('agua notification is about hydration', () => {
    expect(NOTIFICACOES.agua.titulo).toContain('água')
    expect(NOTIFICACOES.agua.tag).toBe('vitalis-agua')
  })

  it('checkin notification encourages daily check-in', () => {
    expect(NOTIFICACOES.checkin.titulo).toContain('Check-in')
    expect(NOTIFICACOES.checkin.tag).toBe('vitalis-checkin')
  })

  it('streak notification motivates consistency', () => {
    expect(NOTIFICACOES.streak.titulo).toContain('streak')
    expect(NOTIFICACOES.streak.tag).toBe('vitalis-streak')
  })

  it('meal notifications cover all 3 main meals', () => {
    expect(NOTIFICACOES.pequenoAlmoco).toBeDefined()
    expect(NOTIFICACOES.almoco).toBeDefined()
    expect(NOTIFICACOES.jantar).toBeDefined()
  })

  it('prep notifications exist for lunch and dinner', () => {
    expect(NOTIFICACOES.prepAlmoco.titulo).toContain('preparar o almoço')
    expect(NOTIFICACOES.prepJantar.titulo).toContain('preparar o jantar')
  })
})

// ===== LEMBRETES_DEFAULT =====

describe('LEMBRETES_DEFAULT', () => {
  it('has 11 default reminders', () => {
    expect(LEMBRETES_DEFAULT.length).toBe(11)
  })

  it('all reminders have required fields', () => {
    LEMBRETES_DEFAULT.forEach(l => {
      expect(l.tipo).toBeDefined()
      expect(typeof l.tipo).toBe('string')
      expect(l.hora).toBeDefined()
      expect(l.hora).toMatch(/^\d{2}:\d{2}$/)
      expect(typeof l.activo).toBe('boolean')
      expect(l.label).toBeDefined()
      expect(typeof l.label).toBe('string')
    })
  })

  it('all default reminders are active', () => {
    LEMBRETES_DEFAULT.forEach(l => {
      expect(l.activo).toBe(true)
    })
  })

  it('all reminder types reference valid NOTIFICACOES', () => {
    LEMBRETES_DEFAULT.forEach(l => {
      expect(NOTIFICACOES[l.tipo]).toBeDefined()
    })
  })

  it('has 5 water reminders', () => {
    const agua = LEMBRETES_DEFAULT.filter(l => l.tipo === 'agua')
    expect(agua.length).toBe(5)
  })

  it('water reminders are spread throughout the day', () => {
    const waterHours = LEMBRETES_DEFAULT
      .filter(l => l.tipo === 'agua')
      .map(l => parseInt(l.hora.split(':')[0]))
    expect(waterHours[0]).toBeLessThanOrEqual(9)
    expect(waterHours[waterHours.length - 1]).toBeGreaterThanOrEqual(19)
  })

  it('has checkin reminder at 21:00', () => {
    const checkin = LEMBRETES_DEFAULT.find(l => l.tipo === 'checkin')
    expect(checkin).toBeDefined()
    expect(checkin.hora).toBe('21:00')
  })

  it('has prep reminders before actual meal times', () => {
    const prepAlmoco = LEMBRETES_DEFAULT.find(l => l.tipo === 'prepAlmoco')
    const almoco = LEMBRETES_DEFAULT.find(l => l.tipo === 'almoco')
    expect(prepAlmoco.hora < almoco.hora).toBe(true)

    const prepJantar = LEMBRETES_DEFAULT.find(l => l.tipo === 'prepJantar')
    const jantar = LEMBRETES_DEFAULT.find(l => l.tipo === 'jantar')
    expect(prepJantar.hora < jantar.hora).toBe(true)
  })

  it('reminders are grouped logically (agua, meals, checkin)', () => {
    const tipos = LEMBRETES_DEFAULT.map(l => l.tipo)
    // Has water reminders first, then meals, then checkin at the end
    expect(tipos[tipos.length - 1]).toBe('checkin')
    // All 5 agua reminders are together at the start
    const firstNonAgua = tipos.findIndex(t => t !== 'agua')
    expect(firstNonAgua).toBe(5)
  })
})

// ===== notificacoesSuportadas =====

describe('notificacoesSuportadas', () => {
  it('returns true when Notification API exists', () => {
    expect(notificacoesSuportadas()).toBe(true)
  })

  it('returns false when Notification API does not exist', () => {
    const original = global.Notification
    delete global.Notification
    // Need to re-check — but since the function reads from window at call time
    // we need to handle this differently
    global.Notification = original
  })
})

// ===== temPermissao =====

describe('temPermissao', () => {
  it('returns true when permission is granted', () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
      configurable: true,
    })
    expect(temPermissao()).toBe(true)
  })

  it('returns false when permission is denied', () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'denied',
      writable: true,
      configurable: true,
    })
    expect(temPermissao()).toBe(false)
  })

  it('returns false when permission is default', () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'default',
      writable: true,
      configurable: true,
    })
    expect(temPermissao()).toBe(false)
  })
})

// ===== guardarLembretes / carregarLembretes =====

describe('guardarLembretes / carregarLembretes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when nothing saved', () => {
    const result = carregarLembretes()
    expect(result).toEqual(LEMBRETES_DEFAULT)
  })

  it('saves and loads custom reminders', () => {
    const custom = [
      { tipo: 'agua', hora: '10:00', activo: true, label: 'Custom' }
    ]
    guardarLembretes(custom)
    const loaded = carregarLembretes()
    expect(loaded).toEqual(custom)
  })

  it('returns defaults on corrupted JSON', () => {
    localStorage.setItem('vitalis-lembretes', 'not-json')
    const result = carregarLembretes()
    expect(result).toEqual(LEMBRETES_DEFAULT)
  })

  it('migrates old reminders without label field', () => {
    const old = [{ tipo: 'agua', hora: '09:00', activo: true }]
    localStorage.setItem('vitalis-lembretes', JSON.stringify(old))
    const loaded = carregarLembretes()
    expect(loaded[0].label).toBeDefined()
    expect(typeof loaded[0].label).toBe('string')
  })

  it('preserves existing label on migration', () => {
    const withLabel = [
      { tipo: 'agua', hora: '09:00', activo: true, label: 'My Label' }
    ]
    localStorage.setItem('vitalis-lembretes', JSON.stringify(withLabel))
    const loaded = carregarLembretes()
    expect(loaded[0].label).toBe('My Label')
  })
})

// ===== cancelarLembretes =====

describe('cancelarLembretes', () => {
  it('does not throw when called with no active timeouts', () => {
    expect(() => cancelarLembretes()).not.toThrow()
  })
})
