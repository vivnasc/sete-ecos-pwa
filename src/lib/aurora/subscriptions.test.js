import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before imports
vi.mock('../supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      upsert: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}))

vi.mock('../coach', () => ({
  isCoach: () => false,
}))

import { AURORA_CONFIG, SUBSCRIPTION_STATUS } from './subscriptions'

// ===== AURORA_CONFIG =====

describe('AURORA_CONFIG', () => {
  it('has the correct table name', () => {
    expect(AURORA_CONFIG.TABLE).toBe('aurora_clients')
  })

  it('requires 7 ecos to unlock', () => {
    expect(AURORA_CONFIG.ECOS_REQUIRED).toBe(7)
  })

  it('lists all 7 required ecos', () => {
    expect(AURORA_CONFIG.REQUIRED_ECOS).toEqual([
      'vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago'
    ])
  })

  it('does not include aurora in required ecos', () => {
    expect(AURORA_CONFIG.REQUIRED_ECOS).not.toContain('aurora')
  })

  it('does not include lumina in required ecos', () => {
    expect(AURORA_CONFIG.REQUIRED_ECOS).not.toContain('lumina')
  })

  it('required ecos count matches ECOS_REQUIRED', () => {
    expect(AURORA_CONFIG.REQUIRED_ECOS.length).toBe(AURORA_CONFIG.ECOS_REQUIRED)
  })

  it('all required ecos are unique', () => {
    const unique = [...new Set(AURORA_CONFIG.REQUIRED_ECOS)]
    expect(unique.length).toBe(AURORA_CONFIG.REQUIRED_ECOS.length)
  })
})

// ===== SUBSCRIPTION_STATUS (re-exported from shared) =====

describe('SUBSCRIPTION_STATUS (re-exported)', () => {
  it('has all expected statuses', () => {
    expect(SUBSCRIPTION_STATUS.TESTER).toBe('tester')
    expect(SUBSCRIPTION_STATUS.TRIAL).toBe('trial')
    expect(SUBSCRIPTION_STATUS.ACTIVE).toBe('active')
    expect(SUBSCRIPTION_STATUS.PENDING).toBe('pending')
    expect(SUBSCRIPTION_STATUS.EXPIRED).toBe('expired')
    expect(SUBSCRIPTION_STATUS.CANCELLED).toBe('cancelled')
    expect(SUBSCRIPTION_STATUS.NONE).toBeNull()
  })

  it('exports 7 status values', () => {
    expect(Object.keys(SUBSCRIPTION_STATUS).length).toBe(7)
  })
})

// ===== Aurora free access model =====

describe('Aurora free access model', () => {
  it('aurora is not listed in its own required ecos', () => {
    expect(AURORA_CONFIG.REQUIRED_ECOS.includes('aurora')).toBe(false)
  })

  it('all required ecos are lowercase strings', () => {
    AURORA_CONFIG.REQUIRED_ECOS.forEach(eco => {
      expect(typeof eco).toBe('string')
      expect(eco).toBe(eco.toLowerCase())
    })
  })

  it('required ecos include both premium tiers (vitalis and imago)', () => {
    expect(AURORA_CONFIG.REQUIRED_ECOS).toContain('vitalis')
    expect(AURORA_CONFIG.REQUIRED_ECOS).toContain('imago')
  })

  it('required ecos include all mid-tier ecos', () => {
    const midTier = ['serena', 'ignis', 'ventis', 'ecoa']
    midTier.forEach(eco => {
      expect(AURORA_CONFIG.REQUIRED_ECOS).toContain(eco)
    })
  })
})
