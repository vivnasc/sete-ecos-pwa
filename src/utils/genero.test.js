import { describe, it, expect, beforeEach } from 'vitest'
import { g, gx, getSexo, setSexo } from './genero.js'

describe('getSexo', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when localStorage has no vitalis-sexo', () => {
    expect(getSexo()).toBeNull()
  })

  it('returns "masculino" when localStorage has masculino', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    expect(getSexo()).toBe('masculino')
  })

  it('returns "feminino" when localStorage has feminino', () => {
    localStorage.setItem('vitalis-sexo', 'feminino')
    expect(getSexo()).toBe('feminino')
  })
})

describe('setSexo', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores sexo in localStorage', () => {
    setSexo('masculino')
    expect(localStorage.getItem('vitalis-sexo')).toBe('masculino')
  })

  it('stores feminino in localStorage', () => {
    setSexo('feminino')
    expect(localStorage.getItem('vitalis-sexo')).toBe('feminino')
  })

  it('does not store when sexo is null', () => {
    setSexo(null)
    expect(localStorage.getItem('vitalis-sexo')).toBeNull()
  })

  it('does not store when sexo is empty string', () => {
    setSexo('')
    expect(localStorage.getItem('vitalis-sexo')).toBeNull()
  })

  it('does not store when sexo is undefined', () => {
    setSexo(undefined)
    expect(localStorage.getItem('vitalis-sexo')).toBeNull()
  })
})

describe('g (localStorage-based gender adaptation)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns feminine form when localStorage has feminino', () => {
    localStorage.setItem('vitalis-sexo', 'feminino')
    expect(g('Bem-vindo', 'Bem-vinda')).toBe('Bem-vinda')
  })

  it('returns masculine form when localStorage has masculino', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    expect(g('Bem-vindo', 'Bem-vinda')).toBe('Bem-vindo')
  })

  it('defaults to feminine when localStorage is empty (no sexo set)', () => {
    expect(g('Bem-vindo', 'Bem-vinda')).toBe('Bem-vinda')
  })

  it('defaults to feminine for unknown sexo value', () => {
    localStorage.setItem('vitalis-sexo', 'outro')
    expect(g('querido', 'querida')).toBe('querida')
  })

  it('works with common gendered words — obrigado/obrigada', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    expect(g('obrigado', 'obrigada')).toBe('obrigado')

    localStorage.setItem('vitalis-sexo', 'feminino')
    expect(g('obrigado', 'obrigada')).toBe('obrigada')
  })

  it('works with common gendered words — perfeito/perfeita', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    expect(g('perfeito', 'perfeita')).toBe('perfeito')

    localStorage.setItem('vitalis-sexo', 'feminino')
    expect(g('perfeito', 'perfeita')).toBe('perfeita')
  })

  it('works with common gendered words — activo/activa', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    expect(g('activo', 'activa')).toBe('activo')

    localStorage.setItem('vitalis-sexo', 'feminino')
    expect(g('activo', 'activa')).toBe('activa')
  })

  it('works with common gendered words — inscrito/inscrita', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    expect(g('inscrito', 'inscrita')).toBe('inscrito')

    localStorage.setItem('vitalis-sexo', 'feminino')
    expect(g('inscrito', 'inscrita')).toBe('inscrita')
  })
})

describe('gx (explicit sexo-based gender adaptation)', () => {
  it('returns masculine form when sexo is masculino', () => {
    expect(gx('masculino', 'Bem-vindo', 'Bem-vinda')).toBe('Bem-vindo')
  })

  it('returns feminine form when sexo is feminino', () => {
    expect(gx('feminino', 'Bem-vindo', 'Bem-vinda')).toBe('Bem-vinda')
  })

  it('defaults to feminine when sexo is null', () => {
    expect(gx(null, 'querido', 'querida')).toBe('querida')
  })

  it('defaults to feminine when sexo is undefined', () => {
    expect(gx(undefined, 'querido', 'querida')).toBe('querida')
  })

  it('defaults to feminine when sexo is empty string', () => {
    expect(gx('', 'cansado', 'cansada')).toBe('cansada')
  })

  it('defaults to feminine for unknown sexo value', () => {
    expect(gx('outro', 'motivado', 'motivada')).toBe('motivada')
  })

  it('works with all common gendered words', () => {
    const words = [
      ['Bem-vindo', 'Bem-vinda'],
      ['querido', 'querida'],
      ['obrigado', 'obrigada'],
      ['perfeito', 'perfeita'],
      ['cansado', 'cansada'],
      ['motivado', 'motivada'],
      ['preparado', 'preparada'],
      ['conectado', 'conectada'],
      ['activo', 'activa'],
      ['inactivo', 'inactiva'],
      ['inscrito', 'inscrita'],
      ['sozinho', 'sozinha'],
    ]

    words.forEach(([masc, fem]) => {
      expect(gx('masculino', masc, fem)).toBe(masc)
      expect(gx('feminino', masc, fem)).toBe(fem)
    })
  })

  it('is independent of localStorage (does not read it)', () => {
    localStorage.setItem('vitalis-sexo', 'masculino')
    // gx uses the explicit sexo param, not localStorage
    expect(gx('feminino', 'Bem-vindo', 'Bem-vinda')).toBe('Bem-vinda')
    expect(gx(null, 'Bem-vindo', 'Bem-vinda')).toBe('Bem-vinda')
  })
})
