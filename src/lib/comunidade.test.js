import { describe, it, expect, vi } from 'vitest'

// Mock supabase before imports
vi.mock('./supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          in: () => Promise.resolve({ data: [], error: null }),
          order: () => ({
            range: () => Promise.resolve({ data: [], error: null }),
            limit: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
        or: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => ({
          range: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
      upsert: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'test/path.jpg' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/test.jpg' } }),
      }),
    },
  },
}))

import {
  ECOS_INFO,
  PROMPTS_REFLEXAO,
  TEMAS_REFLEXAO,
  RESSONANCIA_TIPOS,
  ESPELHO_STARTERS,
  SUSSURRO_MODELOS,
  tempoRelativo,
  extrairHashtags,
  getPromptDoDia,
  getPromptPorTema,
  getPromptsParaEco,
} from './comunidade'

// ===== ECOS_INFO =====

describe('ECOS_INFO', () => {
  it('contains 8 eco entries', () => {
    expect(Object.keys(ECOS_INFO).length).toBe(8)
  })

  it('has all expected ecos', () => {
    const expected = ['vitalis', 'aurea', 'lumina', 'serena', 'ignis', 'ventis', 'ecoa', 'geral']
    expected.forEach(eco => {
      expect(ECOS_INFO[eco]).toBeDefined()
    })
  })

  it('every eco has label, cor, emoji, and elemento', () => {
    Object.entries(ECOS_INFO).forEach(([key, info]) => {
      expect(info.label).toBeDefined()
      expect(typeof info.label).toBe('string')

      expect(info.cor).toBeDefined()
      expect(info.cor).toMatch(/^#[0-9A-Fa-f]{6}$/)

      expect(info.emoji).toBeDefined()
      expect(typeof info.emoji).toBe('string')

      expect(info.elemento).toBeDefined()
      expect(typeof info.elemento).toBe('string')
    })
  })

  it('vitalis has correct properties', () => {
    expect(ECOS_INFO.vitalis.label).toBe('Vitalis')
    expect(ECOS_INFO.vitalis.cor).toBe('#7C8B6F')
    expect(ECOS_INFO.vitalis.elemento).toBe('Terra')
  })

  it('each eco has a unique color', () => {
    const colors = Object.values(ECOS_INFO).map(info => info.cor)
    const unique = [...new Set(colors)]
    expect(unique.length).toBe(colors.length)
  })

  it('each eco has a unique element', () => {
    const elements = Object.values(ECOS_INFO).map(info => info.elemento)
    const unique = [...new Set(elements)]
    expect(unique.length).toBe(elements.length)
  })
})

// ===== PROMPTS_REFLEXAO =====

describe('PROMPTS_REFLEXAO', () => {
  it('has more than 25 prompts', () => {
    expect(PROMPTS_REFLEXAO.length).toBeGreaterThan(25)
  })

  it('every prompt has id, eco, tema, texto, and emoji', () => {
    PROMPTS_REFLEXAO.forEach(prompt => {
      expect(prompt.id).toBeDefined()
      expect(typeof prompt.id).toBe('string')
      expect(prompt.eco).toBeDefined()
      expect(typeof prompt.eco).toBe('string')
      expect(prompt.tema).toBeDefined()
      expect(typeof prompt.tema).toBe('string')
      expect(prompt.texto).toBeDefined()
      expect(typeof prompt.texto).toBe('string')
      expect(prompt.emoji).toBeDefined()
    })
  })

  it('all prompt ids are unique', () => {
    const ids = PROMPTS_REFLEXAO.map(p => p.id)
    const unique = [...new Set(ids)]
    expect(unique.length).toBe(ids.length)
  })

  it('has prompts for geral eco', () => {
    const geral = PROMPTS_REFLEXAO.filter(p => p.eco === 'geral')
    expect(geral.length).toBeGreaterThan(10)
  })

  it('has eco-specific prompts for vitalis', () => {
    const vitalis = PROMPTS_REFLEXAO.filter(p => p.eco === 'vitalis')
    expect(vitalis.length).toBeGreaterThan(0)
  })

  it('has eco-specific prompts for aurea', () => {
    const aurea = PROMPTS_REFLEXAO.filter(p => p.eco === 'aurea')
    expect(aurea.length).toBeGreaterThan(0)
  })

  it('has eco-specific prompts for serena', () => {
    const serena = PROMPTS_REFLEXAO.filter(p => p.eco === 'serena')
    expect(serena.length).toBeGreaterThan(0)
  })

  it('all temas reference valid TEMAS_REFLEXAO keys', () => {
    PROMPTS_REFLEXAO.forEach(prompt => {
      expect(TEMAS_REFLEXAO[prompt.tema]).toBeDefined()
    })
  })

  it('all texts are non-empty Portuguese strings', () => {
    PROMPTS_REFLEXAO.forEach(prompt => {
      expect(prompt.texto.length).toBeGreaterThan(10)
    })
  })
})

// ===== TEMAS_REFLEXAO =====

describe('TEMAS_REFLEXAO', () => {
  it('has at least 10 themes', () => {
    expect(Object.keys(TEMAS_REFLEXAO).length).toBeGreaterThanOrEqual(10)
  })

  it('every theme has label, emoji, and cor', () => {
    Object.entries(TEMAS_REFLEXAO).forEach(([key, tema]) => {
      expect(tema.label).toBeDefined()
      expect(typeof tema.label).toBe('string')

      expect(tema.emoji).toBeDefined()
      expect(typeof tema.emoji).toBe('string')

      expect(tema.cor).toBeDefined()
      expect(tema.cor).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('includes gratidao theme', () => {
    expect(TEMAS_REFLEXAO.gratidao).toBeDefined()
    expect(TEMAS_REFLEXAO.gratidao.label).toBe('Gratidão')
  })

  it('includes livre (free-form) theme', () => {
    expect(TEMAS_REFLEXAO.livre).toBeDefined()
    expect(TEMAS_REFLEXAO.livre.label).toBe('Livre')
  })

  it('includes eco-specific themes', () => {
    expect(TEMAS_REFLEXAO.corpo).toBeDefined()
    expect(TEMAS_REFLEXAO.valor).toBeDefined()
    expect(TEMAS_REFLEXAO.emocao).toBeDefined()
    expect(TEMAS_REFLEXAO.vontade).toBeDefined()
  })
})

// ===== RESSONANCIA_TIPOS =====

describe('RESSONANCIA_TIPOS', () => {
  it('has 5 resonance types', () => {
    expect(Object.keys(RESSONANCIA_TIPOS).length).toBe(5)
  })

  it('has all expected types', () => {
    const expected = ['ressoo', 'luz', 'forca', 'espelho', 'raiz']
    expected.forEach(tipo => {
      expect(RESSONANCIA_TIPOS[tipo]).toBeDefined()
    })
  })

  it('every type has emoji, label, and descricao', () => {
    Object.entries(RESSONANCIA_TIPOS).forEach(([key, tipo]) => {
      expect(tipo.emoji).toBeDefined()
      expect(tipo.label).toBeDefined()
      expect(tipo.descricao).toBeDefined()
      expect(typeof tipo.label).toBe('string')
      expect(typeof tipo.descricao).toBe('string')
    })
  })
})

// ===== ESPELHO_STARTERS =====

describe('ESPELHO_STARTERS', () => {
  it('has at least 5 conversation starters', () => {
    expect(ESPELHO_STARTERS.length).toBeGreaterThanOrEqual(5)
  })

  it('all starters are non-empty strings', () => {
    ESPELHO_STARTERS.forEach(starter => {
      expect(typeof starter).toBe('string')
      expect(starter.length).toBeGreaterThan(5)
    })
  })

  it('all starters end with ...', () => {
    ESPELHO_STARTERS.forEach(starter => {
      expect(starter.endsWith('...')).toBe(true)
    })
  })
})

// ===== SUSSURRO_MODELOS =====

describe('SUSSURRO_MODELOS', () => {
  it('has at least 5 support message models', () => {
    expect(SUSSURRO_MODELOS.length).toBeGreaterThanOrEqual(5)
  })

  it('every model has texto and tipo', () => {
    SUSSURRO_MODELOS.forEach(modelo => {
      expect(modelo.texto).toBeDefined()
      expect(typeof modelo.texto).toBe('string')
      expect(modelo.texto.length).toBeGreaterThan(5)

      expect(modelo.tipo).toBeDefined()
      expect(typeof modelo.tipo).toBe('string')
    })
  })

  it('has unique tipos', () => {
    const tipos = SUSSURRO_MODELOS.map(m => m.tipo)
    const unique = [...new Set(tipos)]
    expect(unique.length).toBe(tipos.length)
  })

  it('includes apoio (support) type', () => {
    const apoio = SUSSURRO_MODELOS.find(m => m.tipo === 'apoio')
    expect(apoio).toBeDefined()
  })
})

// ===== tempoRelativo =====

describe('tempoRelativo', () => {
  it('returns "agora" for current timestamp', () => {
    const now = new Date().toISOString()
    expect(tempoRelativo(now)).toBe('agora')
  })

  it('returns minutes for recent past', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString()
    const result = tempoRelativo(fiveMinAgo)
    expect(result).toMatch(/^\d+min$/)
  })

  it('returns hours for today', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString()
    const result = tempoRelativo(twoHoursAgo)
    expect(result).toMatch(/^\d+h$/)
  })

  it('returns days for this week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()
    const result = tempoRelativo(threeDaysAgo)
    expect(result).toMatch(/^\d+d$/)
  })

  it('returns weeks for this month', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString()
    const result = tempoRelativo(twoWeeksAgo)
    expect(result).toMatch(/^\d+sem$/)
  })

  it('returns formatted date for old dates', () => {
    const oldDate = new Date(Date.now() - 60 * 86400000).toISOString()
    const result = tempoRelativo(oldDate)
    // Should return something like "15 jan" (date formatted)
    expect(result).not.toMatch(/^\d+(min|h|d|sem)$/)
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles exact boundary at 1 minute', () => {
    const oneMinAgo = new Date(Date.now() - 60000).toISOString()
    const result = tempoRelativo(oneMinAgo)
    expect(result).toMatch(/^1min$/)
  })

  it('handles exact boundary at 1 hour', () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const result = tempoRelativo(oneHourAgo)
    expect(result).toBe('1h')
  })

  it('handles exact boundary at 1 day', () => {
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString()
    const result = tempoRelativo(oneDayAgo)
    expect(result).toBe('1d')
  })
})

// ===== extrairHashtags =====

describe('extrairHashtags', () => {
  it('extracts single hashtag', () => {
    expect(extrairHashtags('Hoje #gratidao')).toEqual(['gratidao'])
  })

  it('extracts multiple hashtags', () => {
    const result = extrairHashtags('Sinto-me #grata e #feliz com a #vida')
    expect(result).toEqual(['grata', 'feliz', 'vida'])
  })

  it('returns empty array when no hashtags', () => {
    expect(extrairHashtags('Texto sem hashtags')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(extrairHashtags('')).toEqual([])
  })

  it('lowercases hashtags', () => {
    expect(extrairHashtags('#MAIUSCULO')).toEqual(['maiusculo'])
  })

  it('handles Portuguese accented characters', () => {
    const result = extrairHashtags('#gratidão #emoção #conexão')
    expect(result).toEqual(['gratidão', 'emoção', 'conexão'])
  })

  it('handles hashtag at start of text', () => {
    expect(extrairHashtags('#inicio do texto')).toEqual(['inicio'])
  })

  it('handles consecutive hashtags', () => {
    const result = extrairHashtags('#um #dois #tres')
    expect(result).toEqual(['um', 'dois', 'tres'])
  })
})

// ===== getPromptDoDia =====

describe('getPromptDoDia', () => {
  it('returns a prompt object', () => {
    const prompt = getPromptDoDia()
    expect(prompt).toBeDefined()
    expect(prompt.id).toBeDefined()
    expect(prompt.texto).toBeDefined()
    expect(prompt.emoji).toBeDefined()
  })

  it('returns consistent result for same day', () => {
    const prompt1 = getPromptDoDia()
    const prompt2 = getPromptDoDia()
    expect(prompt1.id).toBe(prompt2.id)
  })

  it('filters by eco when provided', () => {
    const prompt = getPromptDoDia('vitalis')
    expect(prompt).toBeDefined()
    // Should be either vitalis-specific or geral
    expect(['vitalis', 'geral']).toContain(prompt.eco)
  })

  it('returns geral prompts when no eco specified', () => {
    const prompt = getPromptDoDia()
    expect(prompt).toBeDefined()
    // Could be any eco
    expect(PROMPTS_REFLEXAO.some(p => p.id === prompt.id)).toBe(true)
  })

  it('returns geral prompts when eco is null', () => {
    const prompt = getPromptDoDia(null)
    expect(prompt).toBeDefined()
  })
})

// ===== getPromptPorTema =====

describe('getPromptPorTema', () => {
  it('returns a prompt matching the theme', () => {
    const prompt = getPromptPorTema('gratidao')
    expect(prompt).toBeDefined()
    expect(prompt.tema).toBe('gratidao')
  })

  it('returns first prompt if theme not found', () => {
    const prompt = getPromptPorTema('nonexistent')
    expect(prompt).toBeDefined()
    expect(prompt.id).toBe(PROMPTS_REFLEXAO[0].id)
  })

  it('returns valid prompt for all known themes', () => {
    const themes = ['gratidao', 'desafio', 'descoberta', 'intencao', 'transformacao', 'conexao', 'corpo', 'valor']
    themes.forEach(tema => {
      const prompt = getPromptPorTema(tema)
      expect(prompt).toBeDefined()
      expect(prompt.tema).toBe(tema)
    })
  })
})

// ===== getPromptsParaEco =====

describe('getPromptsParaEco', () => {
  it('returns prompts for vitalis eco (specific + geral)', () => {
    const prompts = getPromptsParaEco('vitalis')
    expect(prompts.length).toBeGreaterThan(0)
    prompts.forEach(p => {
      expect(['vitalis', 'geral']).toContain(p.eco)
    })
  })

  it('includes geral prompts in results', () => {
    const prompts = getPromptsParaEco('vitalis')
    const geralPrompts = prompts.filter(p => p.eco === 'geral')
    expect(geralPrompts.length).toBeGreaterThan(0)
  })

  it('returns only geral prompts for unknown eco', () => {
    const prompts = getPromptsParaEco('nonexistent')
    prompts.forEach(p => {
      expect(p.eco).toBe('geral')
    })
  })

  it('returns prompts for all known ecos', () => {
    const ecos = ['vitalis', 'aurea', 'serena', 'ignis']
    ecos.forEach(eco => {
      const prompts = getPromptsParaEco(eco)
      expect(prompts.length).toBeGreaterThan(0)
    })
  })
})
