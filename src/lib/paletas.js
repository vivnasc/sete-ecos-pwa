/**
 * paletas.js — 5 paletas editoriais para o Vitalis (e futuras Ecos).
 * Espelho de apps/reset/lib/palettes.ts.
 *
 * Aplica via setProperty às CSS vars --fnx-*. O selector é opt-in:
 * a paleta default ("classica") é a definida no global.css.
 */

export const PALETAS = {
  classica: {
    id: 'classica',
    nome: 'Clássica',
    descricao: 'creme + ouro · editorial',
    light: {
      bg: '#F6F1E8', bgElev: '#FBF7EE', surface: '#FFFFFF', surfaceSoft: 'rgba(255, 255, 255, 0.55)',
      ink: '#1F1814', inkSoft: 'rgba(31, 24, 20, 0.7)', inkFaint: 'rgba(31, 24, 20, 0.5)',
      ouro: '#B8924A', hair: 'rgba(184, 146, 74, 0.18)', hairStrong: 'rgba(184, 146, 74, 0.32)',
      themeColor: '#F6F1E8'
    },
    dark: {
      bg: '#14110D', bgElev: '#1B1813', surface: '#221E18', surfaceSoft: 'rgba(34, 30, 24, 0.6)',
      ink: '#EDE5D2', inkSoft: 'rgba(237, 229, 210, 0.75)', inkFaint: 'rgba(237, 229, 210, 0.5)',
      ouro: '#C9A961', hair: 'rgba(201, 169, 97, 0.16)', hairStrong: 'rgba(201, 169, 97, 0.3)',
      themeColor: '#14110D'
    }
  },
  rosa: {
    id: 'rosa',
    nome: 'Rosa Quente',
    descricao: 'champagne rosado · feminino',
    light: {
      bg: '#FAEEEC', bgElev: '#FDF5F3', surface: '#FFFFFF', surfaceSoft: 'rgba(255, 255, 255, 0.6)',
      ink: '#3D1E25', inkSoft: 'rgba(61, 30, 37, 0.72)', inkFaint: 'rgba(61, 30, 37, 0.5)',
      ouro: '#B85F6B', hair: 'rgba(184, 95, 107, 0.18)', hairStrong: 'rgba(184, 95, 107, 0.32)',
      themeColor: '#FAEEEC'
    },
    dark: {
      bg: '#1F1015', bgElev: '#28161C', surface: '#301A21', surfaceSoft: 'rgba(48, 26, 33, 0.6)',
      ink: '#F0DCDF', inkSoft: 'rgba(240, 220, 223, 0.75)', inkFaint: 'rgba(240, 220, 223, 0.5)',
      ouro: '#D88090', hair: 'rgba(216, 128, 144, 0.18)', hairStrong: 'rgba(216, 128, 144, 0.32)',
      themeColor: '#1F1015'
    }
  },
  azul: {
    id: 'azul',
    nome: 'Azul Noite',
    descricao: 'azul profundo · contemplativo',
    light: {
      bg: '#EDF0F5', bgElev: '#F4F6FA', surface: '#FFFFFF', surfaceSoft: 'rgba(255, 255, 255, 0.6)',
      ink: '#1A2438', inkSoft: 'rgba(26, 36, 56, 0.72)', inkFaint: 'rgba(26, 36, 56, 0.5)',
      ouro: '#5C7A99', hair: 'rgba(92, 122, 153, 0.18)', hairStrong: 'rgba(92, 122, 153, 0.32)',
      themeColor: '#EDF0F5'
    },
    dark: {
      bg: '#0F1320', bgElev: '#161B2B', surface: '#1C2235', surfaceSoft: 'rgba(28, 34, 53, 0.6)',
      ink: '#DDE5F0', inkSoft: 'rgba(221, 229, 240, 0.75)', inkFaint: 'rgba(221, 229, 240, 0.5)',
      ouro: '#8AA4C0', hair: 'rgba(138, 164, 192, 0.18)', hairStrong: 'rgba(138, 164, 192, 0.32)',
      themeColor: '#0F1320'
    }
  },
  ouro: {
    id: 'ouro',
    nome: 'Ouro Quente',
    descricao: 'âmbar · mel · presença',
    light: {
      bg: '#F8EDD9', bgElev: '#FBF3E2', surface: '#FFFAEF', surfaceSoft: 'rgba(255, 250, 239, 0.6)',
      ink: '#2B1F0F', inkSoft: 'rgba(43, 31, 15, 0.72)', inkFaint: 'rgba(43, 31, 15, 0.5)',
      ouro: '#C97D2A', hair: 'rgba(201, 125, 42, 0.2)', hairStrong: 'rgba(201, 125, 42, 0.35)',
      themeColor: '#F8EDD9'
    },
    dark: {
      bg: '#1A1308', bgElev: '#221A0E', surface: '#2B2014', surfaceSoft: 'rgba(43, 32, 20, 0.6)',
      ink: '#EFDCB7', inkSoft: 'rgba(239, 220, 183, 0.75)', inkFaint: 'rgba(239, 220, 183, 0.5)',
      ouro: '#E0A052', hair: 'rgba(224, 160, 82, 0.18)', hairStrong: 'rgba(224, 160, 82, 0.32)',
      themeColor: '#1A1308'
    }
  },
  verde: {
    id: 'verde',
    nome: 'Verde Selva',
    descricao: 'sálvia · oliveira · raíz',
    light: {
      bg: '#ECF0E5', bgElev: '#F3F6ED', surface: '#FFFFFF', surfaceSoft: 'rgba(255, 255, 255, 0.6)',
      ink: '#1F2A18', inkSoft: 'rgba(31, 42, 24, 0.72)', inkFaint: 'rgba(31, 42, 24, 0.5)',
      ouro: '#6B8050', hair: 'rgba(107, 128, 80, 0.18)', hairStrong: 'rgba(107, 128, 80, 0.32)',
      themeColor: '#ECF0E5'
    },
    dark: {
      bg: '#101410', bgElev: '#171C16', surface: '#1E251D', surfaceSoft: 'rgba(30, 37, 29, 0.6)',
      ink: '#DFE5D5', inkSoft: 'rgba(223, 229, 213, 0.75)', inkFaint: 'rgba(223, 229, 213, 0.5)',
      ouro: '#9AB07A', hair: 'rgba(154, 176, 122, 0.18)', hairStrong: 'rgba(154, 176, 122, 0.32)',
      themeColor: '#101410'
    }
  }
}

export const PALETA_IDS = Object.keys(PALETAS)

export function aplicarPaleta(id, escuro) {
  if (typeof window === 'undefined') return
  const paleta = PALETAS[id] || PALETAS.classica
  const t = escuro ? paleta.dark : paleta.light
  const root = document.documentElement
  root.style.setProperty('--fnx-bg', t.bg)
  root.style.setProperty('--fnx-bg-elev', t.bgElev)
  root.style.setProperty('--fnx-surface', t.surface)
  root.style.setProperty('--fnx-surface-soft', t.surfaceSoft)
  root.style.setProperty('--fnx-ink', t.ink)
  root.style.setProperty('--fnx-ink-soft', t.inkSoft)
  root.style.setProperty('--fnx-ink-faint', t.inkFaint)
  root.style.setProperty('--fnx-ouro', t.ouro)
  root.style.setProperty('--fnx-hair', t.hair)
  root.style.setProperty('--fnx-hair-strong', t.hairStrong)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t.themeColor)
}

export function reporPaletaDefault() {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  const props = [
    '--fnx-bg', '--fnx-bg-elev', '--fnx-surface', '--fnx-surface-soft',
    '--fnx-ink', '--fnx-ink-soft', '--fnx-ink-faint',
    '--fnx-ouro', '--fnx-hair', '--fnx-hair-strong'
  ]
  props.forEach(p => root.style.removeProperty(p))
}
