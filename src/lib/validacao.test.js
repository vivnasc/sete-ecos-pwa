import { describe, it, expect } from 'vitest'
import {
  validarEmail,
  validarPassword,
  validarNome,
  validarTelefone,
  validarNumero,
  validarTexto,
  validarData,
  validarSelecao,
  validarFormulario,
  inputAriaProps,
  fieldErrorProps,
} from './validacao.js'

describe('validarEmail', () => {
  it('rejects empty email', () => {
    expect(validarEmail('')).toEqual({ valido: false, erro: 'Email é obrigatório' })
  })

  it('rejects invalid email', () => {
    expect(validarEmail('notanemail')).toEqual({ valido: false, erro: 'Email inválido' })
  })

  it('accepts valid email and lowercases it', () => {
    const result = validarEmail('User@Example.COM')
    expect(result.valido).toBe(true)
    expect(result.valor).toBe('user@example.com')
  })
})

describe('validarPassword', () => {
  it('rejects empty password', () => {
    expect(validarPassword('')).toEqual({ valido: false, erro: 'Password é obrigatória' })
  })

  it('rejects short password', () => {
    expect(validarPassword('abc')).toEqual({ valido: false, erro: 'Password deve ter pelo menos 6 caracteres' })
  })

  it('accepts valid password', () => {
    expect(validarPassword('securepass')).toEqual({ valido: true, valor: 'securepass' })
  })
})

describe('validarNome', () => {
  it('rejects empty name', () => {
    expect(validarNome('')).toEqual({ valido: false, erro: 'Nome é obrigatório' })
  })

  it('rejects XSS attempts', () => {
    expect(validarNome('<script>alert(1)</script>').valido).toBe(false)
  })

  it('accepts valid name', () => {
    expect(validarNome('Vivianne')).toEqual({ valido: true, valor: 'Vivianne' })
  })
})

describe('validarTelefone', () => {
  it('accepts empty (optional)', () => {
    expect(validarTelefone('')).toEqual({ valido: true, valor: '' })
  })

  it('rejects too short', () => {
    expect(validarTelefone('123').valido).toBe(false)
  })

  it('accepts valid phone with country code', () => {
    expect(validarTelefone('+258841234567').valido).toBe(true)
  })
})

describe('validarNumero', () => {
  it('rejects non-numeric', () => {
    expect(validarNumero('abc', { nome: 'Peso' }).valido).toBe(false)
  })

  it('rejects below min', () => {
    expect(validarNumero(5, { min: 10, nome: 'Peso' }).valido).toBe(false)
  })

  it('accepts valid number in range', () => {
    expect(validarNumero(75, { min: 30, max: 200 })).toEqual({ valido: true, valor: 75 })
  })
})

describe('validarTexto', () => {
  it('sanitizes HTML tags', () => {
    const result = validarTexto('<b>bold</b>')
    expect(result.valor).toBe('bold')
  })

  it('rejects too long text', () => {
    expect(validarTexto('a'.repeat(501), { maxLength: 500 }).valido).toBe(false)
  })
})

describe('validarData', () => {
  it('rejects invalid date', () => {
    expect(validarData('not-a-date', { obrigatorio: true }).valido).toBe(false)
  })

  it('accepts valid date', () => {
    expect(validarData('2026-01-15').valido).toBe(true)
  })
})

describe('validarSelecao', () => {
  it('rejects value not in options', () => {
    expect(validarSelecao('x', ['a', 'b', 'c']).valido).toBe(false)
  })

  it('accepts value in options', () => {
    expect(validarSelecao('b', ['a', 'b', 'c'])).toEqual({ valido: true, valor: 'b' })
  })
})

describe('validarFormulario', () => {
  it('validates multiple fields and returns errors', () => {
    const result = validarFormulario(
      { email: 'bad', nome: '' },
      { email: validarEmail, nome: validarNome }
    )
    expect(result.valido).toBe(false)
    expect(result.erros.email).toBe('Email inválido')
    expect(result.erros.nome).toBe('Nome é obrigatório')
  })

  it('returns validated data when all valid', () => {
    const result = validarFormulario(
      { email: 'user@test.com', nome: 'Maria' },
      { email: validarEmail, nome: validarNome }
    )
    expect(result.valido).toBe(true)
    expect(result.dadosValidados.email).toBe('user@test.com')
    expect(result.dadosValidados.nome).toBe('Maria')
  })
})

describe('ARIA helpers', () => {
  it('inputAriaProps returns invalid and describedby when error exists', () => {
    const props = inputAriaProps('email', 'Email invalido')
    expect(props['aria-invalid']).toBe('true')
    expect(props['aria-describedby']).toBe('email-error')
  })

  it('inputAriaProps returns undefined when no error', () => {
    const props = inputAriaProps('email', null)
    expect(props['aria-invalid']).toBeUndefined()
    expect(props['aria-describedby']).toBeUndefined()
  })

  it('fieldErrorProps returns correct id and role', () => {
    const props = fieldErrorProps('nome')
    expect(props.id).toBe('nome-error')
    expect(props.role).toBe('alert')
    expect(props['aria-live']).toBe('assertive')
  })
})
